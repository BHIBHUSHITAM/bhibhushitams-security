import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { userController } from "./user.controller";

export const userRouter = Router();

// Test routes (kept for backward compatibility)
userRouter.get("/student", requireAuth, requireRole(["student", "admin"]), userController.testStudentRoute.bind(userController));
userRouter.get("/company", requireAuth, requireRole(["company", "admin"]), userController.testCompanyRoute.bind(userController));
userRouter.get("/admin", requireAuth, requireRole(["admin"]), userController.testAdminRoute.bind(userController));

// User profile routes
userRouter.get("/profile", requireAuth, userController.getMyProfile.bind(userController));
userRouter.put("/profile", requireAuth, userController.updateMyProfile.bind(userController));

// Admin user management routes
userRouter.get("/users", requireAuth, requireRole(["admin"]), userController.getAllUsers.bind(userController));
userRouter.get("/users/statistics", requireAuth, requireRole(["admin"]), userController.getUserStatistics.bind(userController));
userRouter.get("/users/:userId", requireAuth, requireRole(["admin"]), userController.getUserById.bind(userController));
userRouter.patch("/users/:userId/role", requireAuth, requireRole(["admin"]), userController.updateUserRole.bind(userController));
userRouter.patch("/users/:userId/deactivate", requireAuth, requireRole(["admin"]), userController.deactivateUser.bind(userController));
userRouter.patch("/users/:userId/activate", requireAuth, requireRole(["admin"]), userController.activateUser.bind(userController));
userRouter.delete("/users/:userId", requireAuth, requireRole(["admin"]), userController.deleteUser.bind(userController));
