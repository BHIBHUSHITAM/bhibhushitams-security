import { z } from "zod";

export const createInternshipSchema = z.object({
  title: z.string().min(3),
  companyName: z.string().min(2),
  location: z.string().min(2),
  mode: z.enum(["remote", "hybrid", "onsite"]),
  stipend: z.string().min(1),
  durationWeeks: z.number().int().min(1),
  skills: z.array(z.string()).default([]),
  description: z.string().min(20),
  status: z.enum(["open", "closed"]).optional(),
});

export const applyInternshipSchema = z.object({
  resumeUrl: z.url(),
  coverLetter: z.string().max(2000).optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(["applied", "under-review", "shortlisted", "rejected", "selected"]),
});

export type CreateInternshipInput = z.infer<typeof createInternshipSchema>;
export type ApplyInternshipInput = z.infer<typeof applyInternshipSchema>;
