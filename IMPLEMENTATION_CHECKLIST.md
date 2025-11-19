# MentorConnect Security Implementation Checklist

## Quick Start Commands

```bash
# 1. Install security packages
npm install helmet express-rate-limit cors morgan pino pino-pretty
npm install --save-dev @types/express-rate-limit @types/pino

# 2. Create required directories
mkdir -p server/middleware server/utils server/validation server/socket

# 3. Create all files (see details below)

# 4. Run application
npm run dev

# 5. Test endpoints (see test scripts below)
bash scripts/test-security.sh
```

---

## Implementation Steps

### Step 1: Environment Validation ✅
- [ ] Add `validateEnvironment()` function to `/server/index.ts`
- [ ] Create `/server/.env.example`
- [ ] Verify .env has: SESSION_SECRET, DATABASE_URL, PORT

### Step 2: Async Password Utilities ✅
- [ ] Create `/server/utils/password.ts` with async hashPassword & comparePassword
- [ ] Update all password operations to use `await`

### Step 3: Error Handling ✅
- [ ] Create `/server/middleware/errorHandler.ts` with errorHandler + asyncHandler
- [ ] Add to `/server/index.ts` at the end: `app.use(errorHandler)`

### Step 4: Security Middlewares ✅
- [ ] Create `/server/middleware/security.ts` with helmet, CORS, rate limiting, morgan
- [ ] Configure in `/server/index.ts`
- [ ] Test: `curl -i http://localhost:5000/api/profile/me` should show security headers

### Step 5: Input Validation ✅
- [ ] Create `/server/validation/schemas.ts` with all Zod schemas
- [ ] Use schemas in route handlers to validate req.body

### Step 6: JWT & Token Refresh ✅
- [ ] Create new `/server/auth_new.ts` with generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken
- [ ] Add endpoints:
  - POST `/api/auth/refresh` - refresh access token
  - POST `/api/auth/logout` - logout
- [ ] Test: Register, get tokens, refresh, verify new token works

### Step 7: Booking Conflicts ✅
- [ ] Create `/server/utils/bookingValidator.ts` with checkBookingConflict
- [ ] Update session booking handler to check for conflicts
- [ ] Test: Try booking same time for mentor, should get 409

### Step 8: Chat Pagination ✅
- [ ] Add `/api/chat/:otherUserId?limit=20&before=<timestamp>` endpoint
- [ ] Update storage method to support limit + before parameters
- [ ] Messages return in descending order (newest first)

### Step 9: Socket Authentication ✅
- [ ] Create `/server/socket/auth.ts` with setupSocketAuth
- [ ] Update WebSocket in routes.ts:
  - Require `authenticate` message with token
  - Timeout if no auth in 5s
  - Validate senderId matches authenticated userId
- [ ] Test: Socket without token disconnects, with token works

### Step 10: Client Security ✅
- [ ] Create `/client/src/lib/secureStorage.ts` with expo-secure-store
- [ ] Update `/client/src/lib/auth.tsx` with token refresh logic
- [ ] Update socket client to send auth token
- [ ] Test: Tokens stored securely, auto-refresh on expiry

### Step 11: Logging ✅
- [ ] Create `/server/utils/logger.ts` with pino
- [ ] Replace console.log with logger in error handler
- [ ] Replace request logging with morgan

### Step 12: Documentation ✅
- [ ] Create `/server/README.md` with all endpoints and config
- [ ] Create test scripts in `/scripts/test-security.sh`
- [ ] Document all changes

---

## File Creation Summary

### Required New Files:
```
server/
├── utils/
│   ├── password.ts ................... Async password hashing
│   ├── bookingValidator.ts .......... Booking conflict detection
│   └── logger.ts .................... Structured logging
├── middleware/
│   ├── errorHandler.ts ............. Safe error handling
│   └── security.ts ................. Helmet, CORS, rate limit
├── validation/
│   └── schemas.ts .................. Zod validation schemas
├── socket/
│   └── auth.ts ..................... WebSocket authentication
├── auth_new.ts ..................... Updated auth (copy to auth.ts)
└── .env.example .................... Environment template

client/
└── src/lib/
    └── secureStorage.ts ............ Secure token storage

scripts/
├── test-security.sh ................ Integration tests
└── test-socket.js ................. WebSocket tests

docs/
└── SECURITY_IMPLEMENTATION_GUIDE.md . This implementation guide

server/
└── README.md ....................... Server documentation
```

---

## Testing Commands

### 1. Register & Get Tokens
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "mentor1",
    "email": "mentor@test.com",
    "password": "Password123!",
    "role": "mentor"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mentor@test.com",
    "password": "Password123!"
  }'
```

### 3. Refresh Token
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

### 4. Access Protected Endpoint
```bash
curl -X GET http://localhost:5000/api/profile/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Test Rate Limiting (10 auth requests in 15 min)
```bash
for i in {1..15}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "test@test.com", "password": "wrong"}'
  echo "Request $i"
  sleep 1
done
```

### 6. Book Session (Will show conflict on overlap)
```bash
curl -X POST http://localhost:5000/api/sessions/book \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mentorId": "MENTOR_ID",
    "subject": "Math",
    "scheduledTime": "2025-12-20T10:00:00Z"
  }'
```

### 7. Get Chat History with Pagination
```bash
curl -X GET "http://localhost:5000/api/chat/USER_ID?limit=20&before=2025-12-20T10:00:00Z" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 8. Test WebSocket Authentication
```javascript
const ws = new WebSocket('ws://localhost:5000/ws');
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'authenticate',
    token: 'YOUR_ACCESS_TOKEN'
  }));
};
ws.onmessage = (e) => console.log('Message:', e.data);
```

---

## Verification Checklist

### Security Headers (Helmet)
```bash
curl -I http://localhost:5000/api/profile/me | grep -i "x-content-type-options"
# Should show security headers
```

### CORS Configuration
```bash
curl -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS http://localhost:5000/api/auth/login
# Should allow origin
```

### Rate Limiting
```bash
# Make 11 rapid requests to auth endpoint
for i in {1..15}; do curl -s -X POST http://localhost:5000/api/auth/login \
  -d '{"email":"x@x.com","password":"x"}' > /dev/null; done
# 11th+ should return 429 Too Many Requests
```

### Input Validation
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"ab","email":"bad","password":"x","role":"admin"}'
# Should return validation errors
```

### Async Password Hashing
Check server logs for any bcryptSync/compareSync calls (should be none)

### Token Expiry
```bash
# Decode token and check exp claim
echo "TOKEN" | cut -d'.' -f2 | base64 -d | jq '.'
# Should show exp is ~900 seconds (15 min) from now
```

### Conflict Detection
Book two sessions at overlapping times, second should fail

### Chat Pagination
Retrieve messages with limit=5, should return max 5 messages

### Socket Auth
Connect without auth, should disconnect after 5s
Connect with valid token, should succeed

---

## Troubleshooting

### "PORT already in use"
```bash
PORT=3001 npm run dev
```

### "SESSION_SECRET is required"
Check `.env` file has `SESSION_SECRET=your-secret-key`

### Async/await issues
Ensure all password operations use `await`:
```typescript
// ✓ Correct
const hash = await hashPassword(password);

// ✗ Wrong
const hash = hashPassword(password);
```

### Socket connection fails
- Check token is valid
- Verify CLIENT_ORIGIN in .env
- Check WebSocket path is `/ws`

### Token refresh not working
- Check REFRESH_TOKEN in secure storage
- Verify /api/auth/refresh endpoint exists
- Check refresh token hasn't expired (30 days)

---

## Performance Considerations

| Feature | Impact | Notes |
|---------|--------|-------|
| Async bcrypt | ~100ms per password | Worth it for security |
| Rate limiting | ~1ms per request | Memory efficient |
| Zod validation | ~5ms per request | Catches errors early |
| Message pagination | ~10-50ms | DB query with limit |
| Socket auth | ~5s timeout | Brief delay on connect |

---

## Security Checklist for Production

- [ ] Change SESSION_SECRET to strong random string
- [ ] Set CLIENT_ORIGIN to actual frontend URL
- [ ] Enable HTTPS (use helmet with HSTS)
- [ ] Set NODE_ENV=production
- [ ] Configure DATABASE_URL for production DB
- [ ] Implement rate limiting in reverse proxy (nginx/CloudFlare)
- [ ] Add logging/monitoring (datadog, sentry)
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Use secrets manager (AWS Secrets, HashiCorp Vault)

---

## Summary

This implementation provides enterprise-grade security with:

✅ **Authentication** - Short-lived tokens with refresh flow  
✅ **Encryption** - Async bcrypt with secure storage  
✅ **Validation** - Zod schemas on all inputs  
✅ **Protection** - Helmet, CORS, rate limiting  
✅ **Reliability** - Booking conflict detection  
✅ **Persistence** - Chat messages with pagination  
✅ **Safety** - Generic error responses  
✅ **Observability** - Structured logging  

