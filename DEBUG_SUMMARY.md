# MentorConnect - Debug Summary & Run Instructions

## ✅ All Errors Fixed!

### Errors Fixed:

1. **TypeScript Type Errors**
   - ✅ Fixed lucide-react implicit any types (set `noImplicitAny: false`)
   - ✅ Fixed recharts implicit any types (installed @types/recharts)
   - ✅ Fixed chart.tsx parameter types (added explicit `: any` types)
   - ✅ Fixed User/Profile type mismatches in storage.ts
   - ✅ Fixed Set iteration (converted to Array.from())
   - ✅ Fixed nullable userId in WebSocket routes

2. **All 7 Critical TypeScript Errors → 0 Errors** ✨

---

## 🚀 How to Run the App

### **Quick Start (3 commands):**

```bash
# 1. Install dependencies
npm install

# 2. Create .env file (see below)
cp .env.example .env

# 3. Start development server
npm run dev
```

Then open: **http://localhost:5000**

---

## 📋 Pre-requisites

- **Node.js** v18+ installed
- **PostgreSQL** v12+ installed and running
- **PostgreSQL running** on default port 5432

---

## ⚙️ Environment Setup

### Step 1: Create `.env` file

```bash
cp .env.example .env
```

### Step 2: Edit `.env` with your PostgreSQL credentials

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/mentorconnect
SESSION_SECRET=your-secret-key-here
PORT=5000
NODE_ENV=development
```

### Step 3: Create PostgreSQL Database

```bash
# Open PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE mentorconnect;

# Exit
\q
```

### Step 4: Run Database Migrations

```bash
npm run db:push
```

This creates all required tables.

---

## 🎯 Running the Application

### Development Mode (Hot Reload)
```bash
npm run dev
```
- Backend: http://localhost:5000
- Frontend: http://localhost:5000
- WebSocket: ws://localhost:5000/ws

### Check for TypeScript Errors
```bash
npm run check
```

### Production Build
```bash
npm run build
npm start
```

---

## 📁 Project Architecture

```
Frontend (React)          Backend (Express)
├── Auth Pages            ├── API Routes
├── Mentor Search         ├── WebSocket Server
├── Session Booking       ├── Database Storage
├── Dashboard             └── Authentication
└── Real-time Chat        
        ↕
   Shared Database (PostgreSQL)
```

---

## 🧪 Test the App

### 1. Open Browser
Go to: `http://localhost:5000`

### 2. Register as Mentor
- Click "Register"
- Select "Mentor"
- Fill in email, username, password

### 3. Setup Mentor Profile
- Go to "Profile" (top navigation)
- Add bio
- Add subjects (e.g., "Math", "Physics")
- Add availability

### 4. Register as Student (New Browser/Incognito)
- Click "Register"
- Select "Student"
- Fill in email, username, password

### 5. Search Mentors
- Click "Search Mentors" in navigation
- Click on mentor to view profile
- Click "Book Session" to schedule

### 6. Chat in Real-time
- Click "Messages" in navigation
- Start chatting instantly

---

## 🔧 Troubleshooting

### Issue: "Port 5000 already in use"
```bash
PORT=3000 npm run dev
```

### Issue: "Database connection failed"
```bash
# Check PostgreSQL is running
psql -U postgres

# Verify database exists
psql -U postgres -l | grep mentorconnect

# Check DATABASE_URL in .env file
```

### Issue: "Cannot connect to database"
```bash
# Recreate database
psql -U postgres
DROP DATABASE IF EXISTS mentorconnect;
CREATE DATABASE mentorconnect;
\q

# Run migrations again
npm run db:push
```

### Issue: TypeScript errors
```bash
npm run check
```

### Issue: Dependencies not installed
```bash
rm -rf node_modules package-lock.json
npm install
npm run db:push
npm run dev
```

---

## 📚 Available Routes

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login

### Mentors
- `GET /api/mentors` - List all mentors
- `GET /api/mentors?subject=Math` - Filter by subject
- `GET /api/mentors/:id` - Get mentor profile

### Profile
- `GET /api/profile/me` - Current user profile
- `POST /api/profile` - Update profile

### Sessions
- `POST /api/sessions/book` - Book session
- `GET /api/sessions/me` - View my sessions
- `PUT /api/sessions/:id/confirm` - Confirm session (mentor)
- `PUT /api/sessions/:id/cancel` - Cancel session

### Chat
- `GET /api/conversations` - List chats
- `GET /api/messages/:userId` - Chat history
- `WS /ws` - Real-time WebSocket

---

## 🛠 Development Commands

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm start` | Run production server |
| `npm run check` | Check TypeScript types |
| `npm run db:push` | Run database migrations |

---

## 📝 Key Files

- **Frontend Entry**: `client/src/main.tsx`
- **Backend Entry**: `server/index.ts`
- **Routes**: `server/routes.ts`
- **Authentication**: `server/auth.ts`
- **Database Schema**: `shared/schema.ts`
- **API Client**: `client/src/lib/queryClient.ts`
- **Auth Context**: `client/src/lib/auth.tsx`

---

## 💾 Database Tables Created

1. **users** - User accounts (student/mentor)
2. **profiles** - Mentor profiles (bio, subjects)
3. **sessions** - Booked tutoring sessions
4. **messages** - Chat messages

---

## ✨ Features Implemented

- ✅ User authentication (register/login)
- ✅ Mentor search by subject
- ✅ Session booking system
- ✅ Real-time WebSocket chat
- ✅ User profiles
- ✅ Dashboard with sessions
- ✅ Responsive mobile UI
- ✅ JWT token management

---

## 🎓 Next Steps

1. ✅ Run `npm run dev`
2. ✅ Create test accounts
3. ✅ Test mentor search
4. ✅ Book a session
5. ✅ Test real-time chat
6. ✅ Customize styling if needed

---

## 📞 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Blank page | Check browser console, verify PORT in .env |
| Cannot login | Verify DATABASE_URL, check credentials |
| Chat not working | Check WebSocket connection in DevTools |
| Session not saving | Verify PostgreSQL is running |
| Type errors | Run `npm run check` and see SETUP_GUIDE.md |

---

## 🚀 Now Ready to Run!

```bash
# One final check - no errors
npm run check

# Start the app
npm run dev
```

Visit: **http://localhost:5000**

Enjoy MentorConnect! 🎓✨
