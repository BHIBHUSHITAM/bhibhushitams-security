import { z } from "zod";

const courseModuleSchema = z.object({
  title: z.string().min(3),
  duration: z.string(),
  topics: z.array(z.string()).default([]),
  videoUrl: z.string().url().optional(),
});

export const createCourseSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  duration: z.string(),
  thumbnail: z.string().url().optional(),
  price: z.number().min(0).default(0),
  modules: z.array(courseModuleSchema).default([]),
  description: z.string().min(20),
  isPublished: z.boolean().optional(),
});

export const enrollCourseSchema = z.object({
  courseId: z.string(),
});

export const updateProgressSchema = z.object({
  completedModules: z.array(z.number()),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
