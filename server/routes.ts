import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import {
  hashPassword,
  comparePassword,
  generateToken,
  authMiddleware,
  type AuthRequest,
} from "./auth";
import { insertUserSchema, insertProfileSchema, insertSessionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password, role } = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const hashedPassword = hashPassword(password);
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        role: role as "student" | "mentor",
      });

      const token = generateToken(user);
      const { password: _, ...userWithoutPassword } = user;

      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user || !comparePassword(password, user.password)) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = generateToken(user);
      const { password: _, ...userWithoutPassword } = user;

      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.get("/api/profile/me", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.id);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/profile", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { bio, subjects, availability } = req.body;
      const profile = await storage.createOrUpdateProfile({
        userId: req.user!.id,
        bio,
        subjects,
        availability,
      });
      res.json(profile);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.get("/api/mentors", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { subject } = req.query;
      let mentors;

      if (subject && typeof subject === "string") {
        mentors = await storage.getMentorsBySubject(subject);
      } else {
        mentors = await storage.getAllMentors();
      }

      const mentorsWithProfiles = await Promise.all(
        mentors.map(async (mentor) => {
          const profile = await storage.getProfile(mentor.id);
          const { password: _, ...mentorWithoutPassword } = mentor;
          return { ...mentorWithoutPassword, profile };
        })
      );

      res.json(mentorsWithProfiles);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/mentors/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const mentor = await storage.getUser(req.params.id);
      if (!mentor || mentor.role !== "mentor") {
        return res.status(404).json({ error: "Mentor not found" });
      }

      const profile = await storage.getProfile(mentor.id);
      const { password: _, ...mentorWithoutPassword } = mentor;
      res.json({ ...mentorWithoutPassword, profile });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/sessions/book", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { mentorId, subject, scheduledTime } = req.body;

      if (req.user!.role !== "student") {
        return res.status(403).json({ error: "Only students can book sessions" });
      }

      const session = await storage.createSession({
        studentId: req.user!.id,
        mentorId,
        subject,
        scheduledTime: new Date(scheduledTime),
      });

      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.put("/api/sessions/:id/confirm", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      if (session.mentorId !== req.user!.id) {
        return res.status(403).json({ error: "Only the mentor can confirm this session" });
      }

      const updated = await storage.updateSessionStatus(req.params.id, "confirmed");
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.put("/api/sessions/:id/cancel", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      if (session.studentId !== req.user!.id && session.mentorId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const updated = await storage.updateSessionStatus(req.params.id, "cancelled");
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.get("/api/sessions/me", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const sessions = await storage.getUserSessions(req.user!.id);
      
      const sessionsWithUsers = await Promise.all(
        sessions.map(async (session) => {
          const student = await storage.getUser(session.studentId);
          const mentor = await storage.getUser(session.mentorId);
          
          const studentWithoutPassword = student ? (({ password, ...rest }) => rest)(student) : undefined;
          const mentorWithoutPassword = mentor ? (({ password, ...rest }) => rest)(mentor) : undefined;
          
          return {
            ...session,
            student: studentWithoutPassword,
            mentor: mentorWithoutPassword,
          };
        })
      );

      res.json(sessionsWithUsers);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/messages/:userId", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const messages = await storage.getMessagesBetweenUsers(
        req.user!.id,
        req.params.userId
      );
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/conversations", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const partners = await storage.getConversationPartners(req.user!.id);
      const partnersWithoutPasswords = partners.map(({ password, ...rest }) => rest);
      res.json(partnersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/users/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  const httpServer = createServer(app);

  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const userConnections = new Map<string, WebSocket>();

  wss.on('connection', (ws: WebSocket) => {
    let userId: string | null = null;

    ws.on('message', async (data: string) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'join') {
          userId = message.userId;
          userConnections.set(userId, ws);
        } else if (message.type === 'sendMessage') {
          const { senderId, receiverId, content } = message;

          const savedMessage = await storage.createMessage({
            senderId,
            receiverId,
            content,
          });

          const senderWs = userConnections.get(senderId);
          if (senderWs && senderWs.readyState === WebSocket.OPEN) {
            senderWs.send(JSON.stringify({
              type: 'message',
              message: savedMessage,
            }));
          }

          const receiverWs = userConnections.get(receiverId);
          if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
            receiverWs.send(JSON.stringify({
              type: 'message',
              message: savedMessage,
            }));
          }
        }
      } catch (error) {
        console.error('WebSocket error:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        userConnections.delete(userId);
      }
    });
  });

  return httpServer;
}
