# MentorConnect

A mobile-responsive web application connecting students with volunteer mentors for free learning sessions.

## Project Overview
MentorConnect enables students to find mentors by subject, book learning sessions, and communicate in real-time via chat. Mentors can manage their profiles, availability, and confirm session requests.

## Tech Stack
- **Frontend**: React with TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Node.js with Express
- **Real-time**: WebSocket (ws library)
- **Authentication**: JWT with bcrypt password hashing
- **Storage**: In-memory storage (MemStorage)
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)

## Key Features
1. **User Authentication**: Register and login with JWT tokens, role-based access (student/mentor)
2. **Mentor Profiles**: Bio, subjects taught, availability information
3. **Mentor Search**: Filter mentors by subject expertise
4. **Session Booking**: Students book sessions, mentors confirm/cancel
5. **Real-time Chat**: WebSocket-based messaging between students and mentors
6. **Responsive Design**: Mobile-first design with bottom tab navigation on mobile, top navbar on desktop

## Architecture

### Data Models (shared/schema.ts)
- **User**: id, username, email, password (hashed), role (student|mentor)
- **Profile**: id, userId, bio, subjects[], availability
- **Session**: id, studentId, mentorId, subject, scheduledTime, status (pending|confirmed|completed|cancelled)
- **Message**: id, senderId, receiverId, content, timestamp

### API Endpoints (server/routes.ts)
**Authentication:**
- POST /api/auth/register - Create new user account
- POST /api/auth/login - Authenticate and receive JWT token

**Profiles:**
- GET /api/profile/me - Get current user's profile
- POST /api/profile - Create or update profile

**Mentors:**
- GET /api/mentors - List all mentors (optional ?subject query param)
- GET /api/mentors/:id - Get specific mentor profile

**Sessions:**
- POST /api/sessions/book - Book a session (students only)
- PUT /api/sessions/:id/confirm - Confirm session (mentors only)
- PUT /api/sessions/:id/cancel - Cancel session
- GET /api/sessions/me - Get user's sessions

**Messages:**
- GET /api/messages/:userId - Get message history with a user
- GET /api/conversations - Get list of conversation partners
- GET /api/users/:id - Get user details

**WebSocket:**
- WS /ws - Real-time chat connection

### Frontend Structure
**Pages:**
- Home - Landing page with hero section
- Auth - Login/Register with role selection
- MentorSearch - Search and filter mentors
- MentorProfile - View mentor details and book sessions
- Dashboard - View upcoming and past sessions
- Profile - Edit user profile
- ChatList - List of conversations
- Chat - Real-time messaging interface

**Components:**
- MentorCard - Display mentor info in search results
- SessionCard - Display session details with actions
- DesktopNav - Top navigation bar for desktop
- MobileNav - Bottom tab navigation for mobile

### Authentication Flow
1. User registers or logs in via /api/auth endpoints
2. Server returns JWT token and user object
3. Token stored in localStorage
4. All protected API requests include "Authorization: Bearer {token}" header
5. Auth middleware validates token on server

### Real-time Chat
1. Client connects to WebSocket at /ws
2. Sends {type: "join", userId} to join their room
3. Sends {type: "sendMessage", senderId, receiverId, content} to send messages
4. Server stores message and broadcasts to both sender and receiver
5. Messages persisted in storage for history

## Design System
- **Font**: Inter
- **Colors**: Material Design with LinkedIn-inspired professional aesthetics
- **Primary Color**: Blue (217 91% 60%)
- **Spacing**: Tailwind spacing units (2, 4, 6, 8, 12, 16)
- **Components**: Shadcn UI library
- **Responsive**: Mobile-first with breakpoints at md (768px) and lg (1024px)

## Development Notes

### Current Status (November 11, 2024)
- ✅ All data models defined
- ✅ Complete backend API implementation
- ✅ JWT authentication with password hashing
- ✅ WebSocket server for real-time chat
- ✅ All frontend components built
- ✅ Mobile-responsive design
- ✅ Protected routes with authentication
- ✅ Integration complete

### Known Issues
- Vite HMR WebSocket shows harmless error in console (unrelated to app WebSocket)
- PostCSS warning (harmless, related to Tailwind)

### Environment Variables
- SESSION_SECRET - JWT signing secret (required)

## Running the Application
The "Start application" workflow runs `npm run dev` which starts both:
- Express server on port 5000
- Vite dev server (served through Express)

Access the app at the Replit webview URL.

## Future Enhancements
- Persistent database (PostgreSQL) instead of in-memory storage
- Message history pagination
- Notification system for new messages and bookings
- Mentor availability calendar with time slot selection
- User profile pictures
- Rating and review system for mentors
- Email notifications
