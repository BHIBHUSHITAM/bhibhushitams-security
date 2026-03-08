import type { Types } from "mongoose";
import { InternshipApplicationModel } from "./internship-application.model";
import { InternshipModel } from "./internship.model";
import type {
  ApplyInternshipInput,
  CreateInternshipInput,
} from "./internship.validation";

export async function createInternship(adminId: string, payload: CreateInternshipInput) {
  return InternshipModel.create({
    ...payload,
    status: payload.status ?? "open",
    createdBy: adminId,
  });
}

export async function getInternships() {
  return InternshipModel.find({ status: "open" }).sort({ createdAt: -1 });
}

export async function getInternshipById(internshipId: string) {
  return InternshipModel.findById(internshipId);
}

export async function getInternshipsByAdmin(adminId: string) {
  return InternshipModel.find({ createdBy: adminId }).sort({ createdAt: -1 });
}

export async function applyToInternship(
  internshipId: string,
  studentId: string,
  payload: ApplyInternshipInput
) {
  const internship = await InternshipModel.findById(internshipId);
  if (!internship || internship.status !== "open") {
    throw new Error("Internship is not available for applications");
  }

  const existingApplication = await InternshipApplicationModel.findOne({
    internshipId,
    studentId,
  });

  if (existingApplication) {
    throw new Error("You have already applied for this internship");
  }

  return InternshipApplicationModel.create({
    internshipId,
    studentId,
    resumeUrl: payload.resumeUrl,
    coverLetter: payload.coverLetter,
  });
}

export async function getStudentApplications(studentId: string) {
  return InternshipApplicationModel.find({ studentId })
    .populate("internshipId", "title companyName location mode stipend durationWeeks")
    .sort({ createdAt: -1 });
}

export async function getInternshipApplicants(internshipId: string, adminId: string) {
  const internship = await InternshipModel.findById(internshipId);
  if (!internship) {
    throw new Error("Internship not found");
  }

  if (internship.createdBy.toString() !== adminId) {
    throw new Error("You are not allowed to view applicants for this internship");
  }

  return InternshipApplicationModel.find({ internshipId })
    .populate("studentId", "name email")
    .sort({ createdAt: -1 });
}

export async function updateApplicationStatus(
  applicationId: string,
  adminId: string,
  status: "applied" | "under-review" | "shortlisted" | "rejected" | "selected"
) {
  const application = await InternshipApplicationModel.findById(applicationId).populate<{
    internshipId: { createdBy: Types.ObjectId };
  }>("internshipId", "createdBy");

  if (!application) {
    throw new Error("Application not found");
  }

  if (application.internshipId.createdBy.toString() !== adminId) {
    throw new Error("You are not allowed to update this application");
  }

  application.status = status;
  await application.save();
  return application;
}
