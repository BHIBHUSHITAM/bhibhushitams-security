"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getInternships } from "@/lib/internships/api";
import type { Internship } from "@/lib/internships/types";

export function PublicInternshipList() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await getInternships();
        setInternships(response.internships);
      } catch (loadError) {
        setError((loadError as Error).message);
      }
    }

    load();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <h1 className="font-display text-3xl text-white">Internship Opportunities</h1>
      <p className="mt-3 text-slate-300">Browse active cybersecurity internships.</p>

      {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {internships.map((internship) => (
          <article key={internship._id} className="glass-panel rounded-2xl p-5">
            <h2 className="font-display text-xl text-white">{internship.title}</h2>
            <p className="mt-1 text-sm text-cyan-200">{internship.companyName}</p>
            <p className="mt-3 text-sm text-slate-300">
              {internship.location} | {internship.mode} | {internship.durationWeeks} weeks
            </p>
            <p className="text-sm text-slate-300">Stipend: {internship.stipend}</p>
            <p className="mt-3 line-clamp-3 text-sm text-slate-300">{internship.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {internship.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-xs text-cyan-100"
                >
                  {skill}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-cyan-300/20 bg-cyan-500/10 p-5">
        <p className="text-sm text-slate-200">Login as student to apply and track your status.</p>
        <div className="mt-4 flex gap-3">
          <Link href="/login" className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950">
            Login
          </Link>
          <Link href="/signup" className="rounded-lg border border-cyan-300/40 px-4 py-2 text-sm text-cyan-100">
            Signup
          </Link>
        </div>
      </div>
    </div>
  );
}
