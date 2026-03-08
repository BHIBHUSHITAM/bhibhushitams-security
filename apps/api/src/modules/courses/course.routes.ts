import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import * as courseController from "./course.controller";
import * as reviewController from "./course-review.controller";

export const courseRouter = Router();

courseRouter.get("/", courseController.listCourses);
courseRouter.get("/:slug", courseController.getCourseBySlug);

courseRouter.post(
  "/",
  requireAuth,
  requireRole(["admin"]),
  courseController.createCourse
);

courseRouter.post("/enroll", requireAuth, requireRole(["student"]), courseController.enrollInCourse);

courseRouter.get(
  "/student/enrollments",
  requireAuth,
  requireRole(["student"]),
  courseController.listStudentEnrollments
);

courseRouter.patch(
  "/enrollments/:enrollmentId/progress",
  requireAuth,
  requireRole(["student"]),
  courseController.updateProgress
);

// Review routes
courseRouter.post(
  "/reviews",
  requireAuth,
  requireRole(["student"]),
  reviewController.createReview
);

courseRouter.get(
  "/:courseId/reviews",
  reviewController.getCourseReviews
);

courseRouter.get(
  "/:courseId/reviews/stats",
  reviewController.getCourseRatingStats
);

courseRouter.get(
  "/:courseId/reviews/my-review",
  requireAuth,
  requireRole(["student"]),
  reviewController.getMyReview
);

courseRouter.patch(
  "/reviews/:reviewId",
  requireAuth,
  requireRole(["student"]),
  reviewController.updateReview
);

courseRouter.delete(
  "/reviews/:reviewId",
  requireAuth,
  requireRole(["student"]),
  reviewController.deleteReview
);

courseRouter.post(
  "/reviews/:reviewId/helpful",
  reviewController.markHelpful
);
