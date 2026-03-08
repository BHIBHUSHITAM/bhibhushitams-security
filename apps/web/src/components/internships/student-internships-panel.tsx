"use client";

import { FormEvent, useEffect, useState } from "react";
import { applyToInternship, getInternships } from "@/lib/internships/api";
import type { Internship } from "@/lib/internships/types";

export function StudentInternshipsPanel() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadInternships() {
    try {
      const response = await getInternships();
      setInternships(response.internships);
      if (response.internships.length > 0 && !selectedInternshipId) {
        setSelectedInternshipId(response.internships[0]._id);
      }
    } catch (loadError) {
      setError((loadError as Error).message);
    }
  }

  useEffect(() => {
    loadInternships();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await applyToInternship({
        internshipId: selectedInternshipId,
        resumeUrl,
        coverLetter: coverLetter || undefined,
      });
      setSuccess("Application submitted successfully.");
      setResumeUrl("");
      setCoverLetter("");
    } catch (submitError) {
      setError((submitError as Error).message);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-2 md:px-8">
      <section className="glass-panel rounded-2xl p-5">
        <h1 className="font-display text-2xl text-white">Browse Internships</h1>
        <p className="mt-2 text-sm text-slate-300">Apply directly with your resume link.</p>

        <div className="mt-5 space-y-3">
          {internships.map((internship) => (
            <article key={internship._id} className="rounded-xl border border-cyan-300/20 bg-slate-900/70 p-4">
              <h2 className="font-display text-lg text-white">{internship.title}</h2>
              <p className="text-sm text-cyan-200">{internship.companyName}</p>
              <p className="mt-2 text-sm text-slate-300">
                {internship.location} | {internship.mode} | {internship.durationWeeks} weeks
              </p>
              <p className="text-sm text-slate-300">Stipend: {internship.stipend}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="glass-panel rounded-2xl p-5">
        <h2 className="font-display text-2xl text-white">Apply</h2>
        <form className="mt-4 space-y-4" onSubmit={onSubmit}>
          <select
            required
            value={selectedInternshipId}
            onChange={(event) => setSelectedInternshipId(event.target.value)}
            className="w-full rounded-lg border border-cyan-300/25 bg-slate-950/80 px-4 py-3 text-sm text-slate-100"
          >
            {internships.map((internship) => (
              <option key={internship._id} value={internship._id}>
                {internship.title} - {internship.companyName}
              </option>
            ))}
          </select>

          <input
            type="url"
            required
            value={resumeUrl}
            onChange={(event) => setResumeUrl(event.target.value)}
            placeholder="Resume URL (Drive, Dropbox, etc.)"
            className="w-full rounded-lg border border-cyan-300/25 bg-slate-950/80 px-4 py-3 text-sm text-slate-100"
          />

          <textarea
            value={coverLetter}
            onChange={(event) => setCoverLetter(event.target.value)}
            placeholder="Cover letter (optional)"
            rows={5}
            className="w-full rounded-lg border border-cyan-300/25 bg-slate-950/80 px-4 py-3 text-sm text-slate-100"
          />

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-300">{success}</p> : null}

          <button
            type="submit"
            className="rounded-lg bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950"
          >
            Submit Application
          </button>
        </form>
      </section>
    </div>
  );
}
