"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  createInternship,
  getAdminInternships,
  getInternshipApplicants,
  updateInternshipApplicationStatus,
} from "@/lib/internships/api";
import type {
  ApplicationStatus,
  Internship,
  InternshipApplication,
  InternshipMode,
} from "@/lib/internships/types";

const statusOptions: ApplicationStatus[] = [
  "applied",
  "under-review",
  "shortlisted",
  "rejected",
  "selected",
];

export function AdminInternshipsPanel() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState<string>("");
  const [applicants, setApplicants] = useState<InternshipApplication[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [mode, setMode] = useState<InternshipMode>("remote");
  const [stipend, setStipend] = useState("");
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");

  async function loadInternships() {
    try {
      const response = await getAdminInternships();
      setInternships(response.internships);

      if (response.internships.length > 0) {
        const currentId = selectedInternshipId || response.internships[0]._id;
        setSelectedInternshipId(currentId);
        await loadApplicants(currentId);
      } else {
        setApplicants([]);
      }
    } catch (loadError) {
      setError((loadError as Error).message);
    }
  }

  async function loadApplicants(internshipId: string) {
    try {
      const response = await getInternshipApplicants(internshipId);
      setApplicants(response.applicants);
    } catch (loadError) {
      setError((loadError as Error).message);
    }
  }

  useEffect(() => {
    loadInternships();
  }, []);

  async function onCreateInternship(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await createInternship({
        title,
        companyName,
        location,
        mode,
        stipend,
        durationWeeks,
        skills: skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        description,
      });

      setSuccess("Internship listing created.");
      setTitle("");
      setCompanyName("");
      setLocation("");
      setMode("remote");
      setStipend("");
      setDurationWeeks(8);
      setSkills("");
      setDescription("");
      await loadInternships();
    } catch (submitError) {
      setError((submitError as Error).message);
    }
  }

  async function handleStatusChange(applicationId: string, status: ApplicationStatus) {
    setError(null);
    try {
      await updateInternshipApplicationStatus({ applicationId, status });
      if (selectedInternshipId) {
        await loadApplicants(selectedInternshipId);
      }
    } catch (updateError) {
      setError((updateError as Error).message);
    }
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-2 md:px-8">
      <section className="glass-panel rounded-2xl p-5">
        <h1 className="font-display text-2xl text-white">Create Internship Listing</h1>
        <form className="mt-4 space-y-3" onSubmit={onCreateInternship}>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full rounded-lg border border-cyan-300/25 bg-slate-950/80 px-3 py-2 text-sm text-slate-100" />
          <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company name" className="w-full rounded-lg border border-cyan-300/25 bg-slate-950/80 px-3 py-2 text-sm text-slate-100" />
          <input required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="w-full rounded-lg border border-cyan-300/25 bg-slate-950/80 px-3 py-2 text-sm text-slate-100" />
          <select value={mode} onChange={(e) => setMode(e.target.value as InternshipMode)} className="w-full rounded-lg border border-cyan-300/25 bg-slate-950/80 px-3 py-2 text-sm text-slate-100">
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </select>
          <input required value={stipend} onChange={(e) => setStipend(e.target.value)} placeholder="Stipend" className="w-full rounded-lg border border-cyan-300/25 bg-slate-950/80 px-3 py-2 text-sm text-slate-100" />
          <input required type="number" min={1} value={durationWeeks} onChange={(e) => setDurationWeeks(Number(e.target.value))} placeholder="Duration in weeks" className="w-full rounded-lg border border-cyan-300/25 bg-slate-950/80 px-3 py-2 text-sm text-slate-100" />
          <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Skills (comma separated)" className="w-full rounded-lg border border-cyan-300/25 bg-slate-950/80 px-3 py-2 text-sm text-slate-100" />
          <textarea required minLength={20} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={4} className="w-full rounded-lg border border-cyan-300/25 bg-slate-950/80 px-3 py-2 text-sm text-slate-100" />

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-300">{success}</p> : null}

          <button type="submit" className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950">
            Create Listing
          </button>
        </form>
      </section>

      <section className="glass-panel rounded-2xl p-5">
        <h2 className="font-display text-2xl text-white">View Applicants</h2>

        <select
          value={selectedInternshipId}
          onChange={async (event) => {
            const internshipId = event.target.value;
            setSelectedInternshipId(internshipId);
            await loadApplicants(internshipId);
          }}
          className="mt-4 w-full rounded-lg border border-cyan-300/25 bg-slate-950/80 px-3 py-2 text-sm text-slate-100"
        >
          {internships.map((internship) => (
            <option key={internship._id} value={internship._id}>
              {internship.title} - {internship.companyName}
            </option>
          ))}
        </select>

        <div className="mt-4 space-y-3">
          {applicants.map((applicant) => {
            const student = typeof applicant.studentId === "string" ? null : applicant.studentId;

            return (
              <article key={applicant._id} className="rounded-xl border border-cyan-300/20 bg-slate-900/70 p-4">
                <p className="text-sm text-white">{student?.name ?? "Student"}</p>
                <p className="text-xs text-slate-400">{student?.email ?? "-"}</p>
                <a href={applicant.resumeUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-cyan-200">
                  Resume Link
                </a>
                <div className="mt-3 flex items-center gap-2">
                  <select
                    value={applicant.status}
                    onChange={(event) =>
                      handleStatusChange(applicant._id, event.target.value as ApplicationStatus)
                    }
                    className="rounded-lg border border-cyan-300/25 bg-slate-950/80 px-2 py-1 text-xs text-slate-100"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
