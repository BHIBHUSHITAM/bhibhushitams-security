"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCourses } from "@/lib/courses/api";
import type { Course } from "@/lib/courses/types";
import { GlassCard } from "../landing/glass-card";

export function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await getCourses();
        setCourses(response.courses);
      } catch (loadError) {
        setError((loadError as Error).message);
      }
    }

    load();
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <h1 className="font-display text-3xl text-white">Cybersecurity Courses</h1>
      <p className="mt-3 text-slate-300">
        Industry-grade curriculum with labs, capstones, and mentor sessions.
      </p>

      {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <GlassCard key={course._id}>
            <div className="mb-3 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-xs text-cyan-100">
              {course.level}
            </div>
            <h2 className="font-display text-xl text-white">{course.title}</h2>
            <p className="mt-2 text-sm text-slate-300">{course.duration}</p>
            <p className="mt-2 line-clamp-3 text-sm text-slate-400">{course.description}</p>
            <p className="mt-3 text-sm font-semibold text-cyan-200">
              {course.price > 0 ? `₹${course.price}` : "Free"}
            </p>
            <Link
              href={`/courses/${course.slug}`}
              className="mt-4 inline-block rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
            >
              View Course
            </Link>
          </GlassCard>
        ))}
      </div>
    </main>
  );
}
