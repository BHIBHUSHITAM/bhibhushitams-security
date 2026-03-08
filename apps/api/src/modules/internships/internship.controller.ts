import type { Request, Response } from "express";
import {
  applyInternshipSchema,
  createInternshipSchema,
  updateApplicationStatusSchema,
} from "./internship.validation";
import * as internshipService from "./internship.service";

function normalizeParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

export async function createInternship(req: Request, res: Response) {
  const parsed = createInternshipSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid internship payload", errors: parsed.error.flatten() });
  }

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const internship = await internshipService.createInternship(req.user.id, parsed.data);
    return res.status(201).json({ internship });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function listInternships(_req: Request, res: Response) {
  const internships = await internshipService.getInternships();
  return res.status(200).json({ internships });
}

export async function getInternship(req: Request, res: Response) {
  const internshipId = normalizeParam(req.params.id);
  const internship = await internshipService.getInternshipById(internshipId);
  if (!internship) {
    return res.status(404).json({ message: "Internship not found" });
  }

  return res.status(200).json({ internship });
}

export async function applyToInternship(req: Request, res: Response) {
  const parsed = applyInternshipSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid application payload", errors: parsed.error.flatten() });
  }

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const internshipId = normalizeParam(req.params.id);
    const application = await internshipService.applyToInternship(
      internshipId,
      req.user.id,
      parsed.data
    );
    return res.status(201).json({ application });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function listStudentApplications(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const applications = await internshipService.getStudentApplications(req.user.id);
  return res.status(200).json({ applications });
}

export async function listAdminInternships(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const internships = await internshipService.getInternshipsByAdmin(req.user.id);
  return res.status(200).json({ internships });
}

export async function listInternshipApplicants(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const internshipId = normalizeParam(req.params.id);
    const applicants = await internshipService.getInternshipApplicants(internshipId, req.user.id);
    return res.status(200).json({ applicants });
  } catch (error) {
    return res.status(403).json({ message: (error as Error).message });
  }
}

export async function updateApplicantStatus(req: Request, res: Response) {
  const parsed = updateApplicationStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid status payload", errors: parsed.error.flatten() });
  }

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const applicationId = normalizeParam(req.params.applicationId);
    const application = await internshipService.updateApplicationStatus(
      applicationId,
      req.user.id,
      parsed.data.status
    );

    return res.status(200).json({ application });
  } catch (error) {
    return res.status(403).json({ message: (error as Error).message });
  }
}
