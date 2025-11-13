# Quick Start (5 minutes)

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Setup Database
Make sure PostgreSQL is running, then:

```bash
# Create database (in PostgreSQL prompt)
psql -U postgres
CREATE DATABASE mentorconnect;
\q
```

## Step 3: Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your PostgreSQL credentials:
# DATABASE_URL=postgresql://postgres:your_password@localhost:5432/mentorconnect
```

## Step 4: Run Migrations
```bash
npm run db:push
```

## Step 5: Start Development Server
```bash
npm run dev
```

Open browser to: **http://localhost:5000**

---

## Default Access

The app will be running on `http://localhost:5000`

### Create Test Accounts:

**As Student:**
- Click "Register" → "Student"
- Fill in credentials

**As Mentor:**
- Click "Register" → "Mentor"
- Fill in credentials
- Go to Profile page to add subjects and availability

---

## Next Steps

1. Test registration & login
2. Create a mentor account and set up profile
3. Create a student account and search for mentors
4. Book a session
5. Test real-time chat

---

## Stopping the Server

Press `Ctrl+C` in the terminal

---

## Troubleshooting

**Port 5000 in use?**
```bash
PORT=3000 npm run dev
```

**PostgreSQL not running?**
```bash
# macOS
brew services start postgresql

# Windows - Start PostgreSQL service from Services

# Linux
sudo systemctl start postgresql
```

**Database connection failed?**
- Verify DATABASE_URL in `.env`
- Check PostgreSQL is running: `psql -U postgres`
- Database exists: `psql -U postgres -l | grep mentorconnect`

**TypeScript errors?**
```bash
npm run check
```

---

## For Full Setup Guide
See `SETUP_GUIDE.md` for detailed configuration and features.
