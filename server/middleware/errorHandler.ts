import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export interface AppError extends Error {
  status?: number;
  statusCode?: number;
  errors?: any;
}

/**
 * Global error handler middleware
 * - Logs full errors server-side
 * - Returns safe error messages to clients
 * - Handles validation errors separately
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const isDevelopment = process.env.NODE_ENV === "development";
  const status = err.status || err.statusCode || 500;

  // Log full error server-side
  console.error("[ERROR]", {
    status,
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const validationErrors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    res.status(400).json({
      error: "Validation failed",
      details: validationErrors,
    });
    return;
  }

  // Return safe error responses
  if (status === 400) {
    res.status(400).json({
      error: err.message || "Bad request",
    });
  } else if (status === 401) {
    res.status(401).json({
      error: "Unauthorized",
    });
  } else if (status === 403) {
    res.status(403).json({
      error: "Forbidden",
    });
  } else if (status === 404) {
    res.status(404).json({
      error: "Not found",
    });
  } else if (status === 409) {
    res.status(409).json({
      error: err.message || "Conflict",
    });
  } else {
    // Generic 500 error - don't leak details in production
    const message = isDevelopment ? err.message : "Internal server error";
    res.status(500).json({
      error: message,
    });
  }
}

/**
 * Async error wrapper - catches errors in async route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Create an AppError with custom status code
 */
export class CustomError extends Error implements AppError {
  status: number;

  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;
    this.name = "CustomError";
  }
}
