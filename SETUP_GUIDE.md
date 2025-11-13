# MentorConnect - Setup & Run Guide

MentorConnect is a full-stack web application that connects students with mentors for tutoring sessions, featuring authentication, mentor search, session booking, and real-time chat.

## Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS, Radix UI components, TanStack Query
- **Backend**: Express.js with Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time Communication**: WebSocket (ws)
- **Authentication**: JWT with bcryptjs

---

## Prerequisites

Before running the app, make sure you have:

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
3. **Git** (optional, for cloning)

---

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

This installs all dependencies for both client and server.

### 2. Database Setup

#### Create a PostgreSQL Database

```bash
# Open PostgreSQL prompt
psql -U postgres

# Create a new database
CREATE DATABASE mentorconnect;

# Exit
\q
```

#### Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your database credentials:
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/mentorconnect
   SESSION_SECRET=your-super-secret-key-here
   PORT=5000
   NODE_ENV=development
   ```

#### Run Database Migrations

```bash
npm run db:push
```

This creates the required tables in your PostgreSQL database.

---

## Running the Application

### Development Mode (Recommended)

```bash
npm run dev
```

This starts:
- **Backend**: Express server on `http://localhost:5000` (or your `PORT` env variable)
- **Frontend**: Vite dev server (accessible through the same port)
- **WebSocket Server**: Connected to the backend for real-time chat

The app will automatically reload when you make changes.

### Type Checking

To check for TypeScript errors without running the app:

```bash
npm run check
```

### Production Build

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

---

## Project Structure

```
MentorConnect/
├── client/                    # Frontend React app
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   │   └── ui/          # Shadcn UI components
│   │   ├── lib/             # Utilities and hooks
│   │   └── main.tsx         # Entry point
│   └── index.html
├── server/                    # Backend Express app
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # API routes & WebSocket handlers
│   ├── auth.ts              # Authentication utilities
│   ├── storage.ts           # In-memory data storage
│   └── vite.ts              # Vite integration
├── shared/                    # Shared types & schemas
│   └── schema.ts            # Database schemas
├── package.json
├── vite.config.ts
├── tsconfig.json
└── drizzle.config.ts
```

---

## API Endpoints

### Authentication
- **POST** `/api/auth/register` - Register a new user
- **POST** `/api/auth/login` - Login user

### Profiles
- **GET** `/api/profile/me` - Get current user's profile
- **POST** `/api/profile` - Create/update profile
- **GET** `/api/mentors` - Get all mentors (query by subject: `?subject=Math`)
- **GET** `/api/mentors/:id` - Get specific mentor profile

### Sessions
- **POST** `/api/sessions/book` - Book a tutoring session
- **GET** `/api/sessions/me` - Get user's sessions
- **PUT** `/api/sessions/:id/confirm` - Confirm session (mentor only)
- **PUT** `/api/sessions/:id/cancel` - Cancel session

### Messages & Chat
- **GET** `/api/messages/:userId` - Get chat history with a user
- **GET** `/api/conversations` - Get list of conversation partners
- **GET** `/api/users/:id` - Get user details
- **WebSocket** `/ws` - Real-time chat connection

---

## Features

### ✅ User Authentication
- Register as Student or Mentor
- Secure password hashing with bcryptjs
- JWT-based authentication
- Persistent login with localStorage

### ✅ Mentor Search
- Browse all mentors
- Filter mentors by subject
- View mentor profiles with bio and availability

### ✅ Session Booking
- Students can book sessions with mentors
- Sessions have pending/confirmed/completed/cancelled statuses
- Mentors can confirm or reject bookings

### ✅ Real-time Chat
- WebSocket-based instant messaging
- Chat history persistence
- Conversation partner list

### ✅ Responsive UI
- Mobile-friendly design
- Tailwind CSS styling
- Radix UI components for accessibility
- Dark mode support

---

## Usage

### As a Student

1. **Register** - Create an account as a Student
2. **Search Mentors** - Find mentors by subject
3. **View Profile** - Check mentor details and availability
4. **Book Session** - Schedule a tutoring session
5. **Chat** - Message mentors in real-time
6. **Manage Sessions** - View your bookings on Dashboard

### As a Mentor

1. **Register** - Create an account as a Mentor
2. **Setup Profile** - Add bio, subjects, and availability
3. **View Requests** - See session booking requests in Dashboard
4. **Confirm Sessions** - Accept or decline student requests
5. **Chat** - Communicate with students

---

## Troubleshooting

### Port Already in Use
If port 5000 is already in use:
```bash
PORT=3000 npm run dev
```

### Database Connection Failed
- Verify PostgreSQL is running: `psql -U postgres -c "SELECT 1"`
- Check your DATABASE_URL in `.env`
- Ensure the database exists: `psql -U postgres -l | grep mentorconnect`

### Type Errors
Run type checking:
```bash
npm run check
```

### Clear Cache and Reinstall
```bash
rm -rf node_modules package-lock.json
npm install
npm run db:push
npm run dev
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Secret key for JWT signing |
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | Environment mode (default: development) |

---

## Security Notes

⚠️ **Important for Production:**
- Change `SESSION_SECRET` to a strong random string
- Use environment-specific `.env` files
- Enable HTTPS
- Set secure CORS policies
- Validate all user inputs
- Use database connection pooling
- Implement rate limiting

---

## Development Tools

- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Drizzle ORM** - Type-safe database queries
- **TanStack Query** - Data fetching and caching
- **Tailwind CSS** - Utility-first CSS framework
- **ESLint** - Code linting (if configured)

---

## Common Tasks

### Run TypeScript Check
```bash
npm run check
```

### View Database Schema
```bash
npm run db:push --dry-run
```

### Reset Database
```bash
psql -U postgres -d mentorconnect -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run db:push
```

---

## Performance Tips

1. Use Chrome DevTools to profile performance
2. Check React Query cache settings in `queryClient.ts`
3. Monitor WebSocket connections
4. Use database indexes on frequently queried fields

---

## Support & Debugging

1. **Check console logs** - Both browser and terminal
2. **Network tab** - Check API requests/responses
3. **Database logs** - Check PostgreSQL logs
4. **WebSocket connections** - Check browser DevTools Network tab

---

## License

MIT

---

## Getting Help

If you encounter issues:
1. Check this documentation
2. Review error messages in console
3. Verify all prerequisites are installed
4. Ensure `.env` file is properly configured
5. Try clearing cache and reinstalling dependencies

Happy mentoring! 🎓
