import { Router } from "express";
import * as authController from "./auth.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { rateLimit } from "../../middleware/rate-limit.middleware";

export const authRouter = Router();

// Rate limiting for auth endpoints to prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 requests per window
  message: "Too many authentication attempts, please try again later",
});

authRouter.post("/signup", authLimiter, authController.signup);
authRouter.post("/login", authLimiter, authController.login);
authRouter.post("/refresh", authController.refreshToken);
authRouter.post("/logout", requireAuth, authController.logout);
authRouter.get("/me", requireAuth, authController.me);
authRouter.get("/users", requireAuth, requireRole(['admin']), authController.getAllUsers);
