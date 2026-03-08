"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  getCourseBySlug,
  getStudentEnrollments,
  updateCourseProgress,
} from "@/lib/courses/api";
import type { Course, CourseEnrollment } from "@/lib/courses/types";
import { GlassCard } from "../landing/glass-card";

type NormalizedModule = {
  title: string;
  duration: string;
  topics: string[];
  videoUrl?: string;
};

export function StudentCourseDetail() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        setError(null);

        const [courseResponse, enrollmentsResponse] = await Promise.all([
          getCourseBySlug(slug),
          getStudentEnrollments(),
        ]);

        const matchedEnrollment = enrollmentsResponse.enrollments.find((item) => {
          if (typeof item.courseId === "string") {
            return item.courseId === courseResponse.course._id;
          }
          return item.courseId._id === courseResponse.course._id;
        });

        if (!matchedEnrollment) {
          setError("You are not enrolled in this course.");
          setCourse(courseResponse.course);
          return;
        }

        setCourse(courseResponse.course);
        setEnrollment(matchedEnrollment);
      } catch (loadError) {
        setError((loadError as Error).message);
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) {
      load();
    }
  }, [slug]);

  const modules = useMemo<NormalizedModule[]>(() => {
    if (!course || !Array.isArray(course.modules)) {
      return [];
    }

    return course.modules.map((module, index) => ({
      title: module?.title || `Module ${index + 1}`,
      duration: module?.duration || "Self-paced",
      topics: Array.isArray(module?.topics) ? module.topics : [],
      videoUrl: module?.videoUrl,
    }));
  }, [course]);

  async function handleMarkNextModule() {
    if (!enrollment) return;

    const nextIndex = enrollment.completedModules.length;
    const totalModuleCount = modules.length;

    // If modules are not defined, mark logical first module to allow progress path.
    const updatedModules =
      totalModuleCount > 0
        ? [...enrollment.completedModules, Math.min(nextIndex, totalModuleCount - 1)]
        : [...enrollment.completedModules, nextIndex];

    try {
      setIsUpdating(true);
      const response = await updateCourseProgress(enrollment._id, Array.from(new Set(updatedModules)));
      setEnrollment(response.enrollment);
    } catch (updateError) {
      setError((updateError as Error).message);
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <p className="text-slate-300">Loading course details...</p>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <p className="text-rose-300">Course not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/student/courses"
          className="rounded-lg border border-cyan-300/40 bg-white/5 px-3 py-2 text-xs text-cyan-100 hover:bg-white/10"
        >
          Back to My Courses
        </Link>
        <Link
          href="/student/dashboard"
          className="rounded-lg border border-cyan-300/40 bg-white/5 px-3 py-2 text-xs text-cyan-100 hover:bg-white/10"
        >
          Go to Dashboard
        </Link>
      </div>

      {error ? <p className="mb-4 text-sm text-rose-300">{error}</p> : null}

      <div className="glass-panel rounded-2xl p-6">
        <div className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-100">
          {course.level}
        </div>
        <h1 className="mt-4 font-display text-3xl text-white">{course.title}</h1>
        <p className="mt-2 text-slate-300">Duration: {course.duration}</p>
        <p className="mt-4 text-slate-200">{course.description}</p>

        {enrollment ? (
          <div className="mt-6 rounded-xl border border-cyan-300/20 bg-cyan-500/10 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Your Progress</span>
              <span className="font-semibold text-cyan-200">{enrollment.progressPercent}%</span>
            </div>
            <progress
              max={100}
              value={enrollment.progressPercent}
              className="mt-2 h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-slate-800 [&::-webkit-progress-value]:bg-cyan-400 [&::-moz-progress-bar]:bg-cyan-400"
            />
            <p className="mt-3 text-xs text-slate-400">
              Completed modules: {enrollment.completedModules.length}
            </p>

            {enrollment.progressPercent < 100 ? (
              <button
                type="button"
                onClick={handleMarkNextModule}
                disabled={isUpdating}
                className="mt-4 rounded-lg bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdating ? "Updating..." : "Mark Next Module Complete"}
              </button>
            ) : (
              <p className="mt-4 text-xs font-semibold text-emerald-300">
                Course completed on {new Date(enrollment.completedAt || enrollment.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : null}

        <div className="mt-8">
          <h2 className="font-display text-xl text-white">Course Modules</h2>

          {modules.length === 0 ? (
            <GlassCard className="mt-4">
              <p className="text-sm text-slate-300">
                Detailed module list will appear here once modules are configured for this course.
              </p>
            </GlassCard>
          ) : (
            <div className="mt-4 space-y-3">
              {modules.map((module, index) => (
                <GlassCard key={`${module.title}-${index}`}>
                  <h3 className="text-lg text-white">{module.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{module.duration}</p>

                  {module.videoUrl ? (
                    <div className="mt-3 overflow-hidden rounded-lg border border-cyan-300/20">
                      <iframe
                        src={module.videoUrl}
                        title={`${module.title} video`}
                        className="h-56 w-full"
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    </div>
                  ) : null}

                  {module.topics.length > 0 ? (
                    <ul className="mt-2 space-y-1">
                      {module.topics.map((topic, topicIndex) => (
                        <li key={`${topic}-${topicIndex}`} className="text-sm text-slate-300">
                          • {topic}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-slate-400">No topics listed yet.</p>
                  )}
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
