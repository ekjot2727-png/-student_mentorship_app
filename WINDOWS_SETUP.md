# MentorConnect - Windows Setup Guide

## ✅ Server is Running!

The app is now running on **http://localhost:5000**

---

## 🚀 What Was Fixed for Windows

1. **Fixed NODE_ENV error** - Installed `cross-env` to handle environment variables on Windows
2. **Fixed socket error** - Changed host from `0.0.0.0` to `127.0.0.1` for Windows compatibility
3. **Fixed reusePort option** - Disabled on Windows (not supported)

---

## 📋 Setup Prerequisites

Before using the app, you need to set up the database.

### Option A: Using PostgreSQL (Recommended)

If you have PostgreSQL installed:

1. **Create the database:**
   ```powershell
   psql -U postgres
   ```
   
   Then in PostgreSQL prompt:
   ```sql
   CREATE DATABASE mentorconnect;
   \q
   ```

2. **Update .env file** with your PostgreSQL password:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/mentorconnect
   ```

3. **Run migrations:**
   ```powershell
   npm run db:push
   ```

### Option B: Using In-Memory Storage (No Database Required)

The app currently uses **in-memory storage** from `server/storage.ts`, so it will work without PostgreSQL, but data will be lost when the server restarts.

---

## 🌐 Access the App

Open your browser and go to:

```
http://localhost:5000
```

---

## 🧪 Test the App

### 1. Register as Mentor
- Click "Register"
- Select "Mentor"
- Email: `mentor@example.com`
- Username: `mentor1`
- Password: `password123`
- Click "Create account"

### 2. Setup Mentor Profile
- Click "Profile" in navigation
- Add Bio: "I teach Math and Physics"
- Add Subjects: `Math`, `Physics` (comma-separated)
- Add Availability: `Mon-Fri 5PM-7PM`
- Click "Save Profile"

### 3. Register as Student (New Tab)
- Open new browser tab
- Go to http://localhost:5000
- Click "Register"
- Select "Student"
- Email: `student@example.com`
- Username: `student1`
- Password: `password123`
- Click "Create account"

### 4. Search & Book
- Click "Search Mentors" in navigation
- You should see your mentor listed
- Click on mentor card to view profile
- Click "Book Session" button
- Select date/time and click "Book"

### 5. Test Chat
- Click "Messages" in navigation
- Click on the mentor to start chatting
- Type a message and send
- Messages appear in real-time

---

## 🛑 Stopping the Server

Press `Ctrl+C` in the terminal to stop the server.

---

## 🔄 Restarting the Server

```powershell
npm run dev
```

---

## 📝 Available Commands

```powershell
# Start development server (HOT RELOAD)
npm run dev

# Check TypeScript errors
npm run check

# Build for production
npm run build

# Run production server (after build)
npm start

# Run database migrations
npm run db:push
```

---

## 📂 Project Structure

```
Frontend (React)
├── Pages: Auth, MentorSearch, MentorProfile, Dashboard, Chat
├── Components: MentorCard, SessionCard, Navigation
└── UI: Buttons, Forms, Modals (from Radix UI)

Backend (Express)
├── API Routes: /api/auth, /api/mentors, /api/sessions, /api/messages
├── WebSocket: /ws for real-time chat
└── Storage: In-memory (can be replaced with PostgreSQL)

Database (Optional PostgreSQL)
├── users table
├── profiles table
├── sessions table
└── messages table
```

---

## 🔐 Features

✅ **User Authentication**
- Register as Student or Mentor
- Secure login with JWT tokens
- Session persistence

✅ **Mentor System**
- Create and edit mentor profiles
- Add subjects and availability
- Search mentors by subject

✅ **Session Booking**
- Students book sessions with mentors
- Sessions have status (pending, confirmed, cancelled, completed)
- Dashboard shows all sessions

✅ **Real-time Chat**
- WebSocket-based messaging
- Instant message delivery
- Chat history (while server is running)

✅ **Responsive Design**
- Mobile-friendly interface
- Dark/light mode support
- Touch-friendly buttons and forms

---

## 🐛 Troubleshooting

### Server won't start

**Error: "Port 5000 already in use"**
```powershell
# Use a different port
$env:PORT=3000
npm run dev
```

**Error: "DATABASE_URL not set"**
- The app uses in-memory storage by default
- If you want PostgreSQL, edit `.env` and set DATABASE_URL
- Then run `npm run db:push`

### Can't access http://localhost:5000

- Verify the server is running (check terminal)
- Try `http://127.0.0.1:5000` instead
- Check if port 5000 is blocked by firewall
- Try a different port: `PORT=3000 npm run dev`

### Chat not working

- Make sure you're on the same server instance
- Check browser DevTools → Network → WS (WebSocket)
- Try restarting the server

### Data not saving

- Currently using in-memory storage
- All data resets when server restarts
- To persist data, set up PostgreSQL and run `npm run db:push`

---

## 💾 Enabling PostgreSQL (Optional)

1. Install PostgreSQL: https://www.postgresql.org/download/

2. Create database:
   ```powershell
   psql -U postgres
   CREATE DATABASE mentorconnect;
   \q
   ```

3. Update `.env`:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/mentorconnect
   ```

4. Run migrations:
   ```powershell
   npm run db:push
   ```

5. Restart server:
   ```powershell
   npm run dev
   ```

---

## 🎯 Next Steps

1. ✅ Server is running on http://localhost:5000
2. ✅ Register test accounts (mentor and student)
3. ✅ Test mentor search
4. ✅ Test session booking
5. ✅ Test real-time chat
6. (Optional) Set up PostgreSQL for data persistence

---

## 📞 Support

| Issue | Solution |
|-------|----------|
| Port in use | `$env:PORT=3000; npm run dev` |
| Page blank | Check browser console for errors |
| Can't login | Verify user was created successfully |
| Chat stuck | Refresh page or restart server |
| TypeScript errors | Run `npm run check` |

---

## 🎉 You're All Set!

The MentorConnect app is ready to use!

🌐 Open: http://localhost:5000
🛑 Stop: Press Ctrl+C in terminal
🔄 Restart: npm run dev

Happy Mentoring! 🎓
