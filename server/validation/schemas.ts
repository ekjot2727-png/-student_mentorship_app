import { z } from "zod";

// ==================== Auth Validation ====================

export const RegisterSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(["student", "mentor"]),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

// ==================== Profile Validation ====================

export const CreateProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  subjects: z.array(z.string()).optional(),
  availability: z.string().max(200).optional(),
});

export const UpdateProfileSchema = CreateProfileSchema;

// ==================== Session Validation ====================

export const BookSessionSchema = z.object({
  mentorId: z.string().uuid(),
  subject: z.string().min(1).max(100),
  scheduledTime: z.string().datetime(),
  description: z.string().max(500).optional(),
});

// ==================== Chat Validation ====================

export const SendMessageSchema = z.object({
  receiverId: z.string().uuid(),
  content: z.string().min(1).max(5000),
});

export const ChatQuerySchema = z.object({
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  before: z.string().datetime().optional(),
});

// Export types
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
export type CreateProfileInput = z.infer<typeof CreateProfileSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type BookSessionInput = z.infer<typeof BookSessionSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type ChatQueryInput = z.infer<typeof ChatQuerySchema>;
