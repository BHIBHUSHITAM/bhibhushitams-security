"use client";

import { useEffect, useState } from "react";
import { getStudentInternshipApplications } from "@/lib/internships/api";
import type { InternshipApplication } from "@/lib/internships/types";

export function StudentApplicationsPanel() {
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await getStudentInternshipApplications();
        setApplications(response.applications);
      } catch (loadError) {
        setError((loadError as Error).message);
      }
    }

    load();
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <h1 className="font-display text-3xl text-white">My Internship Applications</h1>
      <p className="mt-2 text-slate-300">Track your application statuses in one place.</p>

      {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

      <div className="mt-6 grid gap-4">
        {applications.map((application) => {
          const internship =
            typeof application.internshipId === "string" ? null : application.internshipId;

          return (
            <article key={application._id} className="glass-panel rounded-2xl p-5">
              <h2 className="font-display text-xl text-white">{internship?.title ?? "Internship"}</h2>
              <p className="mt-1 text-sm text-cyan-200">{internship?.companyName ?? "-"}</p>
              <p className="mt-2 text-sm text-slate-300">Status: {application.status}</p>
              <p className="text-sm text-slate-400">Applied on: {new Date(application.createdAt).toLocaleDateString()}</p>
              <a
                href={application.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm text-cyan-200 hover:text-cyan-100"
              >
                View Submitted Resume
              </a>
            </article>
          );
        })}
      </div>
    </main>
  );
}
