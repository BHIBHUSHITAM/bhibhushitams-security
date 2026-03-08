import type { Types } from "mongoose";
import { CourseEnrollmentModel } from "./course-enrollment.model";
import { CourseModel } from "./course.model";
import type { CreateCourseInput } from "./course.validation";

export async function createCourse(payload: CreateCourseInput) {
  return CourseModel.create({
    ...payload,
    isPublished: payload.isPublished ?? true,
  });
}

export async function getCourses() {
  return CourseModel.find({ isPublished: true }).sort({ createdAt: -1 });
}

export async function getCourseBySlug(slug: string) {
  return CourseModel.findOne({ slug, isPublished: true });
}

export async function getCourseById(courseId: string) {
  return CourseModel.findById(courseId);
}

export async function enrollInCourse(courseId: string, studentId: string) {
  const course = await CourseModel.findById(courseId);
  if (!course || !course.isPublished) {
    throw new Error("Course not available for enrollment");
  }

  const existingEnrollment = await CourseEnrollmentModel.findOne({
    courseId,
    studentId,
  });

  if (existingEnrollment) {
    throw new Error("You are already enrolled in this course");
  }

  return CourseEnrollmentModel.create({
    courseId,
    studentId,
    progressPercent: 0,
    completedModules: [],
    startedAt: new Date(),
  });
}

export async function getStudentEnrollments(studentId: string) {
  return CourseEnrollmentModel.find({ studentId })
    .populate("courseId", "title slug level duration thumbnail")
    .sort({ createdAt: -1 });
}

export async function updateCourseProgress(
  enrollmentId: string,
  studentId: string,
  completedModules: number[]
) {
  const enrollment = await CourseEnrollmentModel.findById(enrollmentId).populate<{
    courseId: { modules: unknown[] };
  }>("courseId", "modules");

  if (!enrollment) {
    throw new Error("Enrollment not found");
  }

  if (enrollment.studentId.toString() !== studentId) {
    throw new Error("Unauthorized");
  }

  const totalModules = enrollment.courseId.modules.length;
  const progressPercent =
    totalModules > 0 ? Math.round((completedModules.length / totalModules) * 100) : 0;

  enrollment.completedModules = completedModules;
  enrollment.progressPercent = progressPercent;

  if (progressPercent === 100 && !enrollment.completedAt) {
    enrollment.completedAt = new Date();
  }

  await enrollment.save();
  return enrollment;
}
