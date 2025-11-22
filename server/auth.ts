import jwt, { JwtPayload } from "jsonwebtoken";
import { type Request, type Response, type NextFunction } from "express";
import { type User } from "@shared/schema";
import { hashPassword, comparePassword } from "./utils/password";
import { CustomError } from "./middleware/errorHandler";

// ==================== JWT Configuration ====================

const JWT_SECRET = process.env.SESSION_SECRET || (process.env.NODE_ENV === 'development' ? 'dev-secret-key' : undefined);
const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_EXPIRES || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRES || "30d";

if (!JWT_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required");
}

// ==================== Token Types ====================

export interface TokenPayload extends JwtPayload {
  id: string;
  email: string;
  role: "student" | "mentor";
  type: "access" | "refresh";
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
  const payload: Omit<TokenPayload, "iat" | "exp"> = {
    id: user.id,
    email: user.email,
    role: user.role as "student" | "mentor",
    type: "access",
  };

  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

/**
 * Generate a long-lived refresh token
 */
export function generateRefreshToken(user: User): string {
  const payload: Omit<TokenPayload, "iat" | "exp"> = {
    id: user.id,
    email: user.email,
    role: user.role as "student" | "mentor",
    type: "refresh",
  };

  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
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
    const decoded = jwt.verify(token, JWT_SECRET as string) as unknown as TokenPayload;
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
export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Missing or invalid authorization header" });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      res.status(401).json({ message: "Invalid or expired access token" });
      return;
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    } as User & { id: string };
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
}

/**
 * Optional auth middleware - doesn't fail if token is missing, but sets user if valid
 */
export function optionalAuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
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
