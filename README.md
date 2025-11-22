# MentorConnect

A mobile application that connects students with mentors for personalized learning sessions.

## Features

- **Student Registration & Profile**: Students can register and set up their learning profile
- **Mentor Registration & Profile**: Mentors can register, add subjects, and set availability
- **Find Mentors**: Students can search and filter mentors by subject
- **Book Sessions**: Students can book sessions with mentors
- **Manage Sessions**: Mentors can confirm or reject session requests
- **Real-time Messaging**: Students and mentors can communicate via messages
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites
- Node.js v24+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will run on **http://localhost:5000**

## Usage

### For Students
1. Register as a Student
2. Update your profile with your learning preferences
3. Go to "Find Mentors" to search for mentors by subject
4. Click "View Profile" to see mentor details
5. Click "Book Session" to request a session
6. View your bookings in "My Sessions"
7. Confirm session status and message mentors

### For Mentors
1. Register as a Mentor
2. Update your profile with bio, subjects, and availability
3. View incoming session requests in "My Sessions"
4. Confirm or cancel session requests
5. Message students in "Messages" to discuss session details

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Express.js, Node.js, TypeScript
- **Database**: In-memory storage (development)
- **Real-time**: WebSocket for messaging
- **Authentication**: JWT tokens

## Project Structure

```
client/
  └── src/
      ├── components/
      ├── pages/
      ├── lib/
      └── hooks/

server/
  ├── routes.ts
  ├── storage.ts
  ├── auth.ts
  └── index.ts

shared/
  └── schema.ts
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Profile
- `GET /api/profile/me` - Get current user profile
- `POST /api/profile` - Update profile

### Mentors
- `GET /api/mentors` - List all mentors
- `GET /api/mentors/:id` - Get mentor details

### Sessions
- `POST /api/sessions/book` - Book a session
- `GET /api/sessions/me` - Get user sessions
- `PUT /api/sessions/:id/confirm` - Confirm session
- `PUT /api/sessions/:id/cancel` - Cancel session

### Messages
- `GET /api/conversations` - Get conversation partners
- `GET /api/messages/:userId` - Get messages with user
- **WebSocket**: `/ws` - Real-time messaging

## Development

```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## License

MIT

## Support

For issues and questions, please refer to the documentation or contact support.
