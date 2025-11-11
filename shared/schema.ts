import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().$type<"student" | "mentor">(),
});

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  bio: text("bio"),
  subjects: text("subjects").array(),
  availability: text("availability"),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull(),
  mentorId: varchar("mentor_id").notNull(),
  subject: text("subject").notNull(),
  scheduledTime: timestamp("scheduled_time").notNull(),
  status: text("status").notNull().$type<"pending" | "confirmed" | "completed" | "cancelled">().default("pending"),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull(),
  receiverId: varchar("receiver_id").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true });
export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true, status: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, timestamp: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
