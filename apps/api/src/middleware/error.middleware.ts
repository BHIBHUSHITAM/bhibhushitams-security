import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
import { env } from "../config/env";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ 
    message: "Route not found",
    success: false 
  });
}

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Log error details in development
  if (env.nodeEnv === "development") {
    console.error("Error:", error);
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Validation error",
      success: false,
      errors: error.flatten().fieldErrors,
    });
  }

  // MongoDB duplicate key error
  if ((error as any).code === 11000) {
    const field = Object.keys((error as any).keyPattern || {})[0];
    return res.status(409).json({
      message: `A record with that ${field} already exists`,
      success: false,
    });
  }

  // MongoDB cast error (invalid ObjectId)
  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      message: "Invalid ID format",
      success: false,
    });
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      message: "Invalid token",
      success: false,
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      message: "Token expired",
      success: false,
    });
  }

  // Default internal server error
  const statusCode = (error as any).statusCode || 500;
  res.status(statusCode).json({
    message: env.nodeEnv === "production" ? "Internal server error" : error.message,
    success: false,
    ...(env.nodeEnv === "development" && { stack: error.stack }),
  });
}
