"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { enrollInCourse, getCourseBySlug, getStudentEnrollments } from "@/lib/courses/api";
import type { Course, CourseEnrollment } from "@/lib/courses/types";
import { GlassCard } from "../landing/glass-card";

export function CourseDetail() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [courseResponse, enrollmentsResponse] = await Promise.all([
          getCourseBySlug(slug),
          getStudentEnrollments().catch(() => ({ enrollments: [] as CourseEnrollment[] })),
        ]);

        const enrolled = enrollmentsResponse.enrollments.some((enrollment) => {
          if (typeof enrollment.courseId === "string") {
            return enrollment.courseId === courseResponse.course._id;
          }
          return enrollment.courseId._id === courseResponse.course._id;
        });

        setAlreadyEnrolled(enrolled);
        setEnrollSuccess(enrolled);
        setCourse(courseResponse.course);
      } catch (loadError) {
        setError((loadError as Error).message);
      }
    }

    if (slug) {
      load();
    }
  }, [slug]);

  async function handleEnroll() {
    if (!course) return;

    setEnrollError(null);
    setEnrollSuccess(false);
    setIsEnrolling(true);

    try {
      await enrollInCourse(course._id);
      setEnrollSuccess(true);
    } catch (enrollErr) {
      setEnrollError((enrollErr as Error).message);
    } finally {
      setIsEnrolling(false);
    }
  }

  if (error) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <p className="text-rose-300">{error}</p>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <p className="text-slate-300">Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <div className="glass-panel rounded-2xl p-6">
        <div className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-100">
          {course.level}
        </div>
        <h1 className="mt-4 font-display text-3xl text-white">{course.title}</h1>
        <p className="mt-2 text-slate-300">{course.duration}</p>
        <p className="mt-4 text-slate-200">{course.description}</p>

        <div className="mt-6">
          <h2 className="font-display text-xl text-white">Course Modules</h2>
          <div className="mt-4 space-y-3">
            {course.modules.map((module, index) => (
              <GlassCard key={index}>
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

                <ul className="mt-2 space-y-1">
                  {module.topics.map((topic, topicIndex) => (
                    <li key={topicIndex} className="text-sm text-slate-300">
                      • {topic}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-lg font-semibold text-cyan-200">
            {course.price > 0 ? `₹${course.price}` : "Free"}
          </p>
        </div>

        {enrollSuccess ? (
          <div className="mt-4 rounded-lg border border-emerald-300/30 bg-emerald-500/10 p-4">
            <p className="text-sm text-emerald-200">
              {alreadyEnrolled ? "You are already enrolled in this course." : "Enrolled successfully!"}
            </p>
            <Link
              href={`/student/courses/${course.slug}`}
              className="mt-2 inline-block text-sm text-cyan-200 hover:text-cyan-100"
            >
              Open My Course →
            </Link>
          </div>
        ) : null}

        {enrollError ? (
          <p className="mt-4 text-sm text-rose-300">{enrollError}</p>
        ) : null}

        {!alreadyEnrolled ? (
          <button
            type="button"
            onClick={handleEnroll}
            disabled={isEnrolling || enrollSuccess}
            className="mt-4 rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60 hover:bg-cyan-300"
          >
            {isEnrolling ? "Enrolling..." : enrollSuccess ? "Already Enrolled" : "Enroll Now"}
          </button>
        ) : (
          <Link
            href={`/student/courses/${course.slug}`}
            className="mt-4 inline-block rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
          >
            Open My Course
          </Link>
        )}

        <p className="mt-4 text-xs text-slate-400">
          Login as student to enroll. Not a student?{" "}
          <Link href="/signup" className="text-cyan-200">
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
}
