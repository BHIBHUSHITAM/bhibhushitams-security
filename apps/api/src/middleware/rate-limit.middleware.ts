import type { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum number of requests per window
  message?: string;
  keyGenerator?: (req: Request) => string;
}

function getClientIp(req: Request): string {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  return req.ip || req.socket.remoteAddress || "unknown";
}

/**
 * Simple in-memory rate limiter middleware
 * For production, use redis-based rate limiting (e.g., express-rate-limit with Redis)
 */
export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, message = "Too many requests, please try again later", keyGenerator } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator ? keyGenerator(req) : getClientIp(req);
    const now = Date.now();

    // Initialize or reset if window has passed
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    // Increment request count
    store[key].count++;

    // Check if limit exceeded
    if (store[key].count > maxRequests) {
      return res.status(429).json({
        message,
        success: false,
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000), // seconds
      });
    }

    next();
  };
}

// Cleanup old entries periodically (runs every 10 minutes)
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 10 * 60 * 1000);
