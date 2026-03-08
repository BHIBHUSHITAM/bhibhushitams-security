import { Router } from "express";
import * as authController from "./auth.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { rateLimit } from "../../middleware/rate-limit.middleware";

export const authRouter = Router();

// Rate limiting for auth endpoints to prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 20, // 20 requests per window (more reasonable for testing/normal use)
  message: "Too many authentication attempts, please try again later",
  keyGenerator: (req) => {
    const forwardedFor = req.headers["x-forwarded-for"];
    const forwardedIp = typeof forwardedFor === "string" ? forwardedFor.split(",")[0]?.trim() : "";
    const clientIp = forwardedIp || req.ip || req.socket.remoteAddress || "unknown";

    const rawIdentifier =
      typeof req.body?.email === "string"
        ? req.body.email
        : typeof req.body?.phone === "string"
          ? req.body.phone
          : typeof req.body?.username === "string"
            ? req.body.username
            : "anonymous";

    const identifier = rawIdentifier.trim().toLowerCase();
    return `${clientIp}:${req.path}:${identifier}`;
  },
});

authRouter.post("/signup", authLimiter, authController.signup);
authRouter.post("/login", authLimiter, authController.login);
authRouter.post("/refresh", authController.refreshToken);
authRouter.post("/logout", requireAuth, authController.logout);
authRouter.get("/me", requireAuth, authController.me);
authRouter.get("/users", requireAuth, requireRole(['admin']), authController.getAllUsers);
