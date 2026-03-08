"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getStudentEnrollments, updateCourseProgress } from "@/lib/courses/api";
import type { CourseEnrollment } from "@/lib/courses/types";
import { GlassCard } from "../landing/glass-card";

export function StudentCoursesPanel() {
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function loadEnrollments() {
    try {
      const response = await getStudentEnrollments();
      setEnrollments(response.enrollments);
    } catch (loadError) {
      setError((loadError as Error).message);
    }
  }

  useEffect(() => {
    loadEnrollments();
  }, []);

  async function handleProgressUpdate(enrollmentId: string, completedModules: number[]) {
    try {
      await updateCourseProgress(enrollmentId, completedModules);
      await loadEnrollments();
    } catch (updateError) {
      setError((updateError as Error).message);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <h1 className="font-display text-3xl text-white">My Courses</h1>
      <p className="mt-2 text-slate-300">Track your learning progress.</p>

      <div className="mt-4">
        <Link
          href="/student/dashboard"
          className="inline-block rounded-lg border border-cyan-300/40 bg-white/5 px-3 py-2 text-xs text-cyan-100 hover:bg-white/10"
        >
          Go to Dashboard
        </Link>
      </div>

      {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {enrollments.map((enrollment) => {
          const course = typeof enrollment.courseId === "string" ? null : enrollment.courseId;

          return (
            <GlassCard key={enrollment._id}>
              <h2 className="font-display text-xl text-white">{course?.title ?? "Course"}</h2>
              <p className="mt-1 text-sm text-cyan-200">{course?.level ?? "-"}</p>
              <p className="mt-2 text-sm text-slate-300">Duration: {course?.duration ?? "-"}</p>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Progress</span>
                  <span className="font-semibold text-cyan-200">{enrollment.progressPercent}%</span>
                </div>
                <progress
                  max={100}
                  value={enrollment.progressPercent}
                  className="mt-2 h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-slate-800 [&::-webkit-progress-value]:bg-cyan-400 [&::-moz-progress-bar]:bg-cyan-400"
                />
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Completed modules: {enrollment.completedModules.length}
              </p>

              {enrollment.completedAt ? (
                <p className="mt-2 text-xs text-emerald-300">
                  Completed on {new Date(enrollment.completedAt).toLocaleDateString()}
                </p>
              ) : null}

              <div className="mt-4 flex gap-2">
                <Link
                  href={`/student/courses/${course?.slug}`}
                  className="rounded-lg border border-cyan-300/40 bg-white/5 px-3 py-2 text-xs text-cyan-100 hover:bg-white/10"
                >
                  View Course
                </Link>
                {enrollment.progressPercent < 100 ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleProgressUpdate(enrollment._id, [
                        ...enrollment.completedModules,
                        enrollment.completedModules.length,
                      ])
                    }
                    className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950"
                  >
                    Mark Next Module Complete
                  </button>
                ) : null}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {enrollments.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-500/10 p-5">
          <p className="text-sm text-slate-200">No enrollments yet.</p>
          <Link
            href="/courses"
            className="mt-3 inline-block rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950"
          >
            Browse Courses
          </Link>
        </div>
      ) : null}
    </main>
  );
}
