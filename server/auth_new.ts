import jwt from "jsonwebtoken";
import { type Request, type Response, type NextFunction } from "express";
import { type User } from "@shared/schema";
import { hashPassword, comparePassword } from "./utils/password";
import { CustomError } from "./middleware/errorHandler";

// ==================== JWT Configuration ====================

const JWT_SECRET = process.env.SESSION_SECRET;
const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_EXPIRES || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRES || "30d";

if (!JWT_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required");
}

// ==================== Token Types ====================

export interface TokenPayload {
  id: string;
  email: string;
  role: "student" | "mentor";
  type: "access" | "refresh";
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: User & { id: string };
  token?: string;
}

// ==================== Password Functions ====================

export { hashPassword, comparePassword };

// ==================== JWT Functions ====================

/**
 * Generate a short-lived access token
 */
export function generateAccessToken(user: User): string {
  const payload: TokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role as "student" | "mentor",
    type: "access",
  };

  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  } as any);
}

/**
 * Generate a long-lived refresh token
 */
export function generateRefreshToken(user: User): string {
  const payload: TokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role as "student" | "mentor",
    type: "refresh",
  };

  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  } as any);
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(user: User) {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
}

/**
 * Verify and decode a token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Verify and decode an access token specifically
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  const decoded = verifyToken(token);
  if (decoded && decoded.type === "access") {
    return decoded;
  }
  return null;
}

/**
 * Verify and decode a refresh token specifically
 */
export function verifyRefreshToken(token: string): TokenPayload | null {
  const decoded = verifyToken(token);
  if (decoded && decoded.type === "refresh") {
    return decoded;
  }
  return null;
}

// ==================== Middleware ====================

/**
 * Middleware to verify bearer token in Authorization header
 */
export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new CustomError("Missing or invalid authorization header", 401);
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      throw new CustomError("Invalid or expired access token", 401);
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    } as User & { id: string };
    req.token = token;
    next();
  } catch (error) {
    const customError = error instanceof CustomError ? error : new CustomError("Unauthorized", 401);
    next(customError);
  }
}

/**
 * Optional auth middleware - doesn't fail if token is missing, but sets user if valid
 */
export async function optionalAuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    if (decoded) {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      } as User & { id: string };
      req.token = token;
    }
  }

  next();
}
