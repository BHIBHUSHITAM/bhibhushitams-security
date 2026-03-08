import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import * as internshipController from "./internship.controller";

export const internshipRouter = Router();

internshipRouter.get("/", internshipController.listInternships);

internshipRouter.get(
  "/admin/listings",
  requireAuth,
  requireRole(["admin"]),
  internshipController.listAdminInternships
);

internshipRouter.post(
  "/:id/apply",
  requireAuth,
  requireRole(["student"]),
  internshipController.applyToInternship
);

internshipRouter.get(
  "/student/applications",
  requireAuth,
  requireRole(["student"]),
  internshipController.listStudentApplications
);

internshipRouter.get(
  "/:id/applicants",
  requireAuth,
  requireRole(["admin"]),
  internshipController.listInternshipApplicants
);

internshipRouter.post(
  "/",
  requireAuth,
  requireRole(["admin"]),
  internshipController.createInternship
);

internshipRouter.get("/:id", internshipController.getInternship);

internshipRouter.patch(
  "/applications/:applicationId/status",
  requireAuth,
  requireRole(["admin"]),
  internshipController.updateApplicantStatus
);
