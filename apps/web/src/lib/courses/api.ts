import type { Course, CourseEnrollment } from "./types";
import { authFetch, parseApiJson } from "@/lib/auth/http";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export async function getCourses() {
  const response = await authFetch(`${API_BASE_URL}/courses`, {
    method: "GET",
  });

  return parseApiJson<{ courses: Course[] }>(response);
}

export async function getCourseBySlug(slug: string) {
  const response = await authFetch(`${API_BASE_URL}/courses/${slug}`, {
    method: "GET",
  });

  return parseApiJson<{ course: Course }>(response);
}

export async function enrollInCourse(courseId: string) {
  const response = await authFetch(`${API_BASE_URL}/courses/enroll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courseId }),
  });

  return parseApiJson<{ enrollment: CourseEnrollment }>(response);
}

export async function getStudentEnrollments() {
  const response = await authFetch(`${API_BASE_URL}/courses/student/enrollments`, {
    method: "GET",
  });

  return parseApiJson<{ enrollments: CourseEnrollment[] }>(response);
}

export async function updateCourseProgress(enrollmentId: string, completedModules: number[]) {
  const response = await authFetch(`${API_BASE_URL}/courses/enrollments/${enrollmentId}/progress`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completedModules }),
  });

  return parseApiJson<{ enrollment: CourseEnrollment }>(response);
}
