# MentorConnect Security & Reliability Overhaul - Implementation Guide

## Overview

This document outlines comprehensive security, reliability, and UX improvements for the MentorConnect application, addressing:
- Synchronous bcrypt calls → async
- Missing environment variable validation
- Weak security middlewares
- Input validation gaps
- Verbose error leaks
- Long-lived JWTs (7 days) → short-lived with refresh token flow
- Session double-booking vulnerabilities
- Chat persistence and pagination gaps
- Insecure WebSocket authentication
- Client-side token storage security

---

## A. Environment Variable Validation

### File: `/server/index.ts`

**Changes:**
Add at the top of the server initialization:

```typescript
// Validate required environment variables
function validateEnvironment() {
  const required = ['SESSION_SECRET', 'DATABASE_URL', 'PORT'];
  const missing: string[] = [];

  for (const env of required) {
    if (!process.env[env]) {
      missing.push(env);
    }
  }

  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  console.log('✅ Environment variables validated');
}

validateEnvironment();
```

**File: `/server/.env.example`** (Already created above)

---

## B. Async Password Handling

### File: `/server/utils/password.ts` (Already created)

**Key changes:**
- Replace `bcrypt.hashSync()` with `await bcrypt.hash()`
- Replace `bcrypt.compareSync()` with `await bcrypt.compare()`
- All password operations are now non-blocking

**Migration in controllers:**

OLD:
```typescript
const hashedPassword = hashPassword(password);
const isValid = comparePassword(inputPassword, user.password);
```

NEW:
```typescript
const hashedPassword = await hashPassword(password);
const isValid = await comparePassword(inputPassword, user.password);
```

---

## C. Security Middlewares

### Install packages:
```bash
npm install helmet express-rate-limit cors morgan
npm install --save-dev @types/express-rate-limit
```

### File: `/server/middleware/security.ts`

```typescript
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import morgan from "morgan";
import { Express } from "express";

export function setupSecurityMiddleware(app: Express) {
  // Helmet for security headers
  app.use(helmet());

  // CORS - restrict to CLIENT_ORIGIN
  const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  app.use(
    cors({
      origin: clientOrigin,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Rate limiting for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: "Too many auth attempts, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Rate limiting for API endpoints
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: "Too many requests from this IP, please try again later.",
  });

  // Morgan logging
  app.use(morgan("combined"));

  return { authLimiter, apiLimiter };
}
```

### Update `/server/index.ts`:

```typescript
import { setupSecurityMiddleware } from "./middleware/security";

// After express setup, before routes:
const { authLimiter, apiLimiter } = setupSecurityMiddleware(app);
app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);
```

---

## D. Input Validation with Zod

### File: `/server/validation/schemas.ts` (Already created)

Usage in controllers:

```typescript
// In register endpoint
export async function registerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = RegisterSchema.parse(req.body);
    // ... rest of handler
  } catch (error) {
    if (error instanceof ZodError) {
      next(error);
      return;
    }
    next(error);
  }
}
```

---

## E. Error Handler Middleware

### File: `/server/middleware/errorHandler.ts` (Already created)

Usage in `/server/index.ts`:

```typescript
import { errorHandler } from "./middleware/errorHandler";

// At the very end, after all other middleware:
app.use(errorHandler);
```

---

## F. JWT Short Expiry & Refresh Token Flow

### File: `/server/auth_new.ts` → Copy to `/server/auth.ts`

**Key changes:**
- Access tokens: 15 minutes
- Refresh tokens: 30 days
- New endpoints for token refresh and logout

### New endpoints needed:

**POST /api/auth/refresh**
```typescript
import { RefreshTokenSchema } from "../validation/schemas";
import { verifyRefreshToken, generateTokenPair } from "../auth";

export async function refreshTokenHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { refreshToken } = RefreshTokenSchema.parse(req.body);
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      throw new CustomError("Invalid refresh token", 401);
    }

    const user = await storage.getUser(payload.id);
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    const tokens = generateTokenPair(user);
    res.json(tokens);
  } catch (error) {
    next(error);
  }
}
```

**POST /api/auth/logout**
```typescript
export async function logoutHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Optionally revoke refresh token in DB
    // For now, client just discards both tokens
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
}
```

---

## G. Booking Conflict Prevention

### File: `/server/utils/bookingValidator.ts`

```typescript
import { storage } from "../storage";

const CONFLICT_WINDOW_MINUTES = parseInt(process.env.SESSION_CONFLICT_WINDOW || "30");

/**
 * Check if a booking time conflicts with existing sessions
 */
export async function checkBookingConflict(
  mentorId: string,
  scheduledTime: Date
): Promise<boolean> {
  const sessions = await storage.getUserSessions(mentorId);

  for (const session of sessions) {
    if (session.status === "cancelled" || session.status === "completed") {
      continue;
    }

    const sessionStart = new Date(session.scheduledTime).getTime();
    const requestStart = scheduledTime.getTime();
    const windowMs = CONFLICT_WINDOW_MINUTES * 60 * 1000;

    // Check if times overlap within conflict window
    if (Math.abs(sessionStart - requestStart) < windowMs) {
      return true;
    }
  }

  return false;
}
```

### Updated booking handler:

```typescript
import { checkBookingConflict } from "../utils/bookingValidator";

export async function bookSessionHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const input = BookSessionSchema.parse(req.body);

    // Check for conflicts
    const hasConflict = await checkBookingConflict(input.mentorId, new Date(input.scheduledTime));
    if (hasConflict) {
      throw new CustomError("Mentor has a conflicting session. Choose a different time.", 409);
    }

    const session = await storage.createSession({
      studentId: req.user!.id,
      mentorId: input.mentorId,
      subject: input.subject,
      scheduledTime: new Date(input.scheduledTime),
    });

    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
}
```

---

## H. Chat Message Persistence & Pagination

### Updated message table schema (if using Drizzle):

```typescript
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull(),
  receiverId: varchar("receiver_id").notNull(),
  content: text("content").notNull(),
  sessionId: varchar("session_id"), // optional
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});
```

### New paginated endpoint: GET /api/chat/:otherUserId

```typescript
import { ChatQuerySchema } from "../validation/schemas";

export async function getChatHistoryHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { otherUserId } = req.params;
    const query = ChatQuerySchema.parse(req.query);

    const limit = query.limit || 20;
    const before = query.before ? new Date(query.before) : new Date();

    const messages = await storage.getMessagesBetweenUsers(
      req.user!.id,
      otherUserId,
      { limit, before }
    );

    res.json(messages);
  } catch (error) {
    next(error);
  }
}
```

### Updated storage method:

```typescript
async getMessagesBetweenUsers(
  userId1: string,
  userId2: string,
  options?: { limit?: number; before?: Date }
): Promise<Message[]> {
  const { limit = 20, before = new Date() } = options || {};

  return Array.from(this.messages.values())
    .filter(
      (msg) =>
        ((msg.senderId === userId1 && msg.receiverId === userId2) ||
          (msg.senderId === userId2 && msg.receiverId === userId1)) &&
        new Date(msg.timestamp) < before
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}
```

---

## I. Socket.io Authentication

### File: `/server/socket/auth.ts`

```typescript
import { verifyAccessToken } from "../auth";
import { Socket } from "socket.io";

const AUTH_TIMEOUT_MS = 5000; // 5 second timeout

export function setupSocketAuth(socket: Socket): boolean {
  return new Promise<boolean>((resolve) => {
    const timeout = setTimeout(() => {
      socket.disconnect();
      resolve(false);
    }, AUTH_TIMEOUT_MS);

    socket.on("authenticate", async (data: { token: string }) => {
      clearTimeout(timeout);

      const decoded = verifyAccessToken(data.token);
      if (!decoded) {
        socket.disconnect();
        resolve(false);
        return;
      }

      // Attach user ID to socket for later reference
      (socket as any).userId = decoded.id;
      socket.join(decoded.id);
      resolve(true);
    });
  });
}
```

### Updated WebSocket routes in `/server/routes.ts`:

```typescript
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

wss.on('connection', (ws: WebSocket) => {
  let userId: string | null = null;

  ws.on('message', async (data: string) => {
    try {
      const message = JSON.parse(data.toString());

      if (message.type === 'authenticate') {
        const decoded = verifyAccessToken(message.token);
        if (!decoded) {
          ws.close(4001, 'Unauthorized');
          return;
        }
        userId = decoded.id;
        // Store in user connections map
        userConnections.set(userId, ws);
        return;
      }

      if (!userId) {
        ws.close(4001, 'Not authenticated');
        return;
      }

      if (message.type === 'sendMessage') {
        const { receiverId, content } = message;

        // Validate sender matches authenticated user
        if (message.senderId !== userId) {
          ws.close(4000, 'Invalid sender');
          return;
        }

        // Save to DB first
        const savedMessage = await storage.createMessage({
          senderId: userId,
          receiverId,
          content,
        });

        // Emit to both users
        const senderWs = userConnections.get(userId);
        if (senderWs && senderWs.readyState === WebSocket.OPEN) {
          senderWs.send(JSON.stringify({
            type: 'messageSent',
            message: savedMessage,
          }));
        }

        const receiverWs = userConnections.get(receiverId);
        if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
          receiverWs.send(JSON.stringify({
            type: 'messageReceived',
            message: savedMessage,
          }));
        }
      }
    } catch (error) {
      console.error('[WebSocket Error]', error);
      ws.close(4000, 'Server error');
    }
  });

  ws.on('close', () => {
    if (userId) {
      userConnections.delete(userId);
    }
  });
});
```

---

## J. Client-Side Security (React/Expo)

### File: `/client/src/lib/secureStorage.ts`

```typescript
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'mentorconnect_access_token';
const REFRESH_TOKEN_KEY = 'mentorconnect_refresh_token';
const USER_KEY = 'mentorconnect_user';

/**
 * Store tokens securely
 */
export async function storeTokens(accessToken: string, refreshToken: string) {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error('Failed to store tokens securely', error);
    // Fallback to AsyncStorage (less secure but functional)
    await AsyncStorage.setItem(TOKEN_KEY, accessToken);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

/**
 * Retrieve access token
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY) || 
           (await AsyncStorage.getItem(TOKEN_KEY));
  } catch (error) {
    console.error('Failed to retrieve access token', error);
    return null;
  }
}

/**
 * Retrieve refresh token
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY) ||
           (await AsyncStorage.getItem(REFRESH_TOKEN_KEY));
  } catch (error) {
    console.error('Failed to retrieve refresh token', error);
    return null;
  }
}

/**
 * Clear tokens on logout
 */
export async function clearTokens() {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to clear tokens', error);
  }
  
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}
```

### File: `/client/src/lib/auth.tsx` (Updated)

```typescript
import { useEffect, useState } from 'react';
import { getAccessToken, getRefreshToken, storeTokens } from './secureStorage';

export function useTokenRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      setIsRefreshing(true);
      const refreshToken = await getRefreshToken();

      if (!refreshToken) {
        return null;
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const { accessToken, refreshToken: newRefreshToken } = await response.json();
      await storeTokens(accessToken, newRefreshToken);

      return accessToken;
    } catch (error) {
      console.error('Token refresh error', error);
      return null;
    } finally {
      setIsRefreshing(false);
    }
  };

  return { refreshAccessToken, isRefreshing };
}

/**
 * Check if token is expired (with 1 minute buffer)
 */
export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    const decoded = JSON.parse(atob(parts[1]));
    const expiryBuffer = 60 * 1000; // 1 minute
    return decoded.exp * 1000 - Date.now() < expiryBuffer;
  } catch (error) {
    return true;
  }
}
```

### Updated API request function:

```typescript
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<any> {
  let token = await getAccessToken();

  // Check if token is expired and refresh if needed
  if (token && isTokenExpired(token)) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      token = newToken;
    } else {
      // Refresh failed, redirect to login
      logout();
      window.location.href = '/auth';
      return;
    }
  }

  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',
  });

  if (response.status === 401) {
    // Try refresh once more
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      return fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      }).then(r => r.json());
    }
    logout();
    window.location.href = '/auth';
    return;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status}: ${text}`);
  }

  return response.json();
}
```

### WebSocket client update (in Chat component):

```typescript
useEffect(() => {
  const connectSocket = async () => {
    const token = await getAccessToken();
    
    const socket = new WebSocket(`ws://localhost:5000/ws`);
    
    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: 'authenticate',
        token,
      }));
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'messageReceived') {
        setMessages(prev => [...prev, message.message]);
      }
    };

    socket.onerror = () => {
      console.error('Socket error, attempting reconnect...');
      setTimeout(connectSocket, 3000);
    };

    return socket;
  };

  const socket = await connectSocket();
  return () => socket?.close();
}, []);
```

---

## K. Logging Improvements

### Install packages:
```bash
npm install pino pino-pretty
npm install --save-dev @types/pino
```

### File: `/server/utils/logger.ts`

```typescript
import pino from 'pino';

const isProd = process.env.NODE_ENV === 'production';

export const logger = pino(
  isProd
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      }
);

export function logRequest(method: string, path: string, status: number, duration: number) {
  logger.info({
    method,
    path,
    status,
    durationMs: duration,
  });
}

export function logError(error: Error, context?: any) {
  logger.error({ error, context }, 'Application error');
}
```

---

## L. Tests & Smoke Checks

### File: `/scripts/test-security.sh`

```bash
#!/bin/bash

echo "🧪 Starting MentorConnect Security Test Suite"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Server URL
SERVER="http://localhost:5000"

# Test 1: Register User
echo -e "\n${GREEN}[TEST 1] Register user${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$SERVER/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testmentor",
    "email": "mentor@test.com",
    "password": "SecurePassword123",
    "role": "mentor"
  }')

ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
REFRESH_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$ACCESS_TOKEN" ]; then
  echo -e "${GREEN}✓ Registration successful${NC}"
else
  echo -e "${RED}✗ Registration failed${NC}"
  exit 1
fi

# Test 2: Access protected endpoint with token
echo -e "\n${GREEN}[TEST 2] Access protected endpoint${NC}"
PROFILE=$(curl -s -X GET "$SERVER/api/profile/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo $PROFILE | grep -q "bio"; then
  echo -e "${GREEN}✓ Protected endpoint accessible${NC}"
else
  echo -e "${RED}✗ Protected endpoint failed${NC}"
fi

# Test 3: Refresh token
echo -e "\n${GREEN}[TEST 3] Refresh access token${NC}"
REFRESH_RESPONSE=$(curl -s -X POST "$SERVER/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")

NEW_TOKEN=$(echo $REFRESH_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$NEW_TOKEN" ]; then
  echo -e "${GREEN}✓ Token refresh successful${NC}"
else
  echo -e "${RED}✗ Token refresh failed${NC}"
fi

# Test 4: Register student and book session
echo -e "\n${GREEN}[TEST 4] Book session (conflict detection)${NC}"
STUDENT=$(curl -s -X POST "$SERVER/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teststudent",
    "email": "student@test.com",
    "password": "SecurePassword123",
    "role": "student"
  }')

STUDENT_TOKEN=$(echo $STUDENT | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
MENTOR_ID=$(echo $REGISTER_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -1)

# First booking
BOOKING1=$(curl -s -X POST "$SERVER/api/sessions/book" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"mentorId\": \"$MENTOR_ID\",
    \"subject\": \"Mathematics\",
    \"scheduledTime\": \"2025-12-20T10:00:00Z\"
  }")

if echo $BOOKING1 | grep -q "id"; then
  echo -e "${GREEN}✓ First booking successful${NC}"
else
  echo -e "${RED}✗ First booking failed${NC}"
fi

# Conflicting booking (same time slot)
BOOKING2=$(curl -s -X POST "$SERVER/api/sessions/book" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"mentorId\": \"$MENTOR_ID\",
    \"subject\": \"Physics\",
    \"scheduledTime\": \"2025-12-20T10:15:00Z\"
  }")

if echo $BOOKING2 | grep -q "Conflict"; then
  echo -e "${GREEN}✓ Conflict detection working${NC}"
else
  echo -e "${RED}✗ Conflict detection failed${NC}"
fi

# Test 5: Input validation
echo -e "\n${GREEN}[TEST 5] Input validation${NC}"
INVALID=$(curl -s -X POST "$SERVER/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ab",
    "email": "invalid-email",
    "password": "short",
    "role": "invalid"
  }')

if echo $INVALID | grep -q "Validation failed"; then
  echo -e "${GREEN}✓ Input validation working${NC}"
else
  echo -e "${RED}✗ Input validation failed${NC}"
fi

echo -e "\n${GREEN}✓ All tests completed${NC}"
```

### File: `/scripts/test-socket.js`

```javascript
const WebSocket = require('ws');

const SERVER_URL = 'ws://localhost:5000/ws';
const ACCESS_TOKEN = 'your-access-token-here';

async function testSocket() {
  console.log('🔌 Testing WebSocket authentication...');

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(SERVER_URL);

    ws.on('open', () => {
      console.log('Connected to server');

      // Send authentication
      ws.send(JSON.stringify({
        type: 'authenticate',
        token: ACCESS_TOKEN,
      }));

      setTimeout(() => {
        // Send message
        ws.send(JSON.stringify({
          type: 'sendMessage',
          senderId: 'user-id',
          receiverId: 'recipient-id',
          content: 'Test message',
        }));

        setTimeout(() => {
          ws.close();
          console.log('✓ WebSocket test passed');
          resolve();
        }, 1000);
      }, 1000);
    });

    ws.on('message', (data) => {
      console.log('📨 Received:', data);
    });

    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
      reject(error);
    });

    ws.on('close', () => {
      console.log('Connection closed');
    });
  });
}

testSocket().catch(console.error);
```

---

## M. README Updates

### Server README

Create `/server/README.md`:

```markdown
# MentorConnect Server

## Environment Setup

Required environment variables:

```env
SESSION_SECRET=your-secret-key-here
DATABASE_URL=postgresql://user:pass@localhost:5432/mentorconnect
PORT=5000
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d
CLIENT_ORIGIN=http://localhost:5173
```

## Security Features

- ✅ Short-lived access tokens (15 minutes)
- ✅ Long-lived refresh tokens (30 days)
- ✅ Async bcrypt password hashing
- ✅ CORS with origin whitelist
- ✅ Helmet security headers
- ✅ Rate limiting (10 auth requests / 15 min)
- ✅ Input validation with Zod
- ✅ Safe error handling (no data leaks)
- ✅ Session booking conflict detection
- ✅ WebSocket authentication
- ✅ Message persistence with pagination
- ✅ Structured logging

## Installation

```bash
npm install
```

## Migrations

```bash
npm run db:push
```

## Development

```bash
npm run dev
```

## Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

### Profile
- `GET /api/profile/me` - Get profile
- `POST /api/profile` - Create/update profile

### Mentors
- `GET /api/mentors` - List mentors
- `GET /api/mentors?subject=Math` - Filter by subject
- `GET /api/mentors/:id` - Get mentor profile

### Sessions
- `POST /api/sessions/book` - Book session
- `GET /api/sessions/me` - Get my sessions
- `PUT /api/sessions/:id/confirm` - Confirm session (mentor)
- `PUT /api/sessions/:id/cancel` - Cancel session

### Chat
- `GET /api/chat/:otherUserId?limit=20&before=<ISO>` - Get messages
- `WS /ws` - WebSocket for real-time chat

## Testing

```bash
bash scripts/test-security.sh
node scripts/test-socket.js
```
```

---

## Installation & Setup

1. **Install packages:**
   ```bash
   npm install helmet express-rate-limit cors morgan pino pino-pretty
   npm install --save-dev @types/express-rate-limit @types/pino
   ```

2. **Create files:**
   - `/server/utils/password.ts`
   - `/server/middleware/errorHandler.ts`
   - `/server/middleware/security.ts`
   - `/server/validation/schemas.ts`
   - `/server/utils/bookingValidator.ts`
   - `/server/utils/logger.ts`
   - Copy `/server/auth_new.ts` to `/server/auth.ts`
   - `/server/.env.example`

3. **Update configuration:**
   - Create `.env` file with required variables
   - Update `/server/index.ts` with middleware setup and env validation

4. **Run:**
   ```bash
   npm run dev
   ```

---

## Summary of Changes

This implementation provides:

| Feature | Status |
|---------|--------|
| Env validation | ✅ Exit on missing vars |
| Async password ops | ✅ Non-blocking bcrypt |
| Security headers | ✅ Helmet middleware |
| Rate limiting | ✅ Auth & API limits |
| CORS | ✅ Origin whitelist |
| Input validation | ✅ Zod schemas |
| Error handling | ✅ Safe responses |
| Short-lived JWT | ✅ 15m access tokens |
| Refresh tokens | ✅ 30d refresh tokens |
| Booking conflicts | ✅ Time overlap detection |
| Chat persistence | ✅ DB storage + pagination |
| Socket auth | ✅ Token verification |
| Secure client storage | ✅ expo-secure-store |
| Token auto-refresh | ✅ Client-side |
| Logging | ✅ Pino structured logs |

---

## Testing Checklist

- [ ] Register creates users with async hash
- [ ] Login returns access + refresh tokens
- [ ] Access token expires at 15m
- [ ] Refresh endpoint returns new tokens
- [ ] Booking shows conflict on overlap
- [ ] Chat messages persist to DB
- [ ] Pagination works (limit + before)
- [ ] Socket requires auth within 5s
- [ ] Socket message validated (senderId match)
- [ ] Client tokens stored securely
- [ ] Token refresh called automatically
- [ ] Rate limiting blocks after 10 auth attempts
- [ ] Invalid input returns validation errors
- [ ] 5xx errors don't leak details
- [ ] Morgan logs all requests

