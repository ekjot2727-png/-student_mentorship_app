import {
  type User,
  type InsertUser,
  type Profile,
  type InsertProfile,
  type Session,
  type InsertSession,
  type Message,
  type InsertMessage,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProfile(userId: string): Promise<Profile | undefined>;
  createOrUpdateProfile(profile: InsertProfile): Promise<Profile>;
  
  getAllMentors(): Promise<User[]>;
  getMentorsBySubject(subject: string): Promise<User[]>;
  
  createSession(session: InsertSession): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  updateSessionStatus(id: string, status: "pending" | "confirmed" | "completed" | "cancelled"): Promise<Session | undefined>;
  getUserSessions(userId: string): Promise<Session[]>;
  
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]>;
  getConversationPartners(userId: string): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private profiles: Map<string, Profile>;
  private sessions: Map<string, Session>;
  private messages: Map<string, Message>;

  constructor() {
    this.users = new Map();
    this.profiles = new Map();
    this.sessions = new Map();
    this.messages = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, role: insertUser.role as "student" | "mentor" };
    this.users.set(id, user);
    return user;
  }

  async getProfile(userId: string): Promise<Profile | undefined> {
    return Array.from(this.profiles.values()).find(
      (profile) => profile.userId === userId,
    );
  }

  async createOrUpdateProfile(insertProfile: InsertProfile): Promise<Profile> {
    const existing = await this.getProfile(insertProfile.userId);
    
    if (existing) {
      const updated: Profile = { ...existing, ...insertProfile };
      this.profiles.set(existing.id, updated);
      return updated;
    }
    
    const id = randomUUID();
    const profile: Profile = { 
      id, 
      ...insertProfile, 
      bio: insertProfile.bio || null,
      subjects: insertProfile.subjects || null,
      availability: insertProfile.availability || null,
    };
    this.profiles.set(id, profile);
    return profile;
  }

  async getAllMentors(): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.role === "mentor",
    );
  }

  async getMentorsBySubject(subject: string): Promise<User[]> {
    const mentors = await this.getAllMentors();
    const mentorsWithProfiles: User[] = [];
    
    for (const mentor of mentors) {
      const profile = await this.getProfile(mentor.id);
      if (profile?.subjects?.some(s => s.toLowerCase().includes(subject.toLowerCase()))) {
        mentorsWithProfiles.push(mentor);
      }
    }
    
    return mentorsWithProfiles;
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = randomUUID();
    const session: Session = {
      id,
      ...insertSession,
      status: "pending",
    };
    this.sessions.set(id, session);
    return session;
  }

  async getSession(id: string): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async updateSessionStatus(
    id: string,
    status: "pending" | "confirmed" | "completed" | "cancelled",
  ): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updated: Session = { ...session, status };
    this.sessions.set(id, updated);
    return updated;
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(
      (session) => session.studentId === userId || session.mentorId === userId,
    );
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      id,
      ...insertMessage,
      timestamp: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(
        (msg) =>
          (msg.senderId === userId1 && msg.receiverId === userId2) ||
          (msg.senderId === userId2 && msg.receiverId === userId1),
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async getConversationPartners(userId: string): Promise<User[]> {
    const partnerIds = new Set<string>();
    
    Array.from(this.messages.values()).forEach((msg) => {
      if (msg.senderId === userId) {
        partnerIds.add(msg.receiverId);
      } else if (msg.receiverId === userId) {
        partnerIds.add(msg.senderId);
      }
    });
    
    const partners: User[] = [];
    for (const partnerId of Array.from(partnerIds)) {
      const user = await this.getUser(partnerId);
      if (user) partners.push(user);
    }
    
    return partners;
  }
}

export const storage = new MemStorage();
