import type { Request, Response } from "express";
import {
  createCourseSchema,
  enrollCourseSchema,
  updateProgressSchema,
} from "./course.validation";
import * as courseService from "./course.service";

export async function createCourse(req: Request, res: Response) {
  const parsed = createCourseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid course payload", errors: parsed.error.flatten() });
  }

  try {
    const course = await courseService.createCourse(parsed.data);
    return res.status(201).json({ course });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function listCourses(_req: Request, res: Response) {
  const courses = await courseService.getCourses();
  return res.status(200).json({ courses });
}

export async function getCourseBySlug(req: Request, res: Response) {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const course = await courseService.getCourseBySlug(slug ?? "");

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  return res.status(200).json({ course });
}

export async function enrollInCourse(req: Request, res: Response) {
  const parsed = enrollCourseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid enrollment payload", errors: parsed.error.flatten() });
  }

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const enrollment = await courseService.enrollInCourse(parsed.data.courseId, req.user.id);
    return res.status(201).json({ enrollment });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function listStudentEnrollments(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const enrollments = await courseService.getStudentEnrollments(req.user.id);
  return res.status(200).json({ enrollments });
}

export async function updateProgress(req: Request, res: Response) {
  const parsed = updateProgressSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid progress payload", errors: parsed.error.flatten() });
  }

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const enrollmentId = Array.isArray(req.params.enrollmentId)
    ? req.params.enrollmentId[0]
    : req.params.enrollmentId;

  try {
    const enrollment = await courseService.updateCourseProgress(
      enrollmentId ?? "",
      req.user.id,
      parsed.data.completedModules
    );

    return res.status(200).json({ enrollment });
  } catch (error) {
    return res.status(403).json({ message: (error as Error).message });
  }
}
