"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/auth/session";
import { logout } from "@/lib/auth/api";

type DashboardShellProps = {
  role: "student" | "company" | "admin";
  title: string;
  description: string;
};

export function DashboardShell({ role, title, description }: DashboardShellProps) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // Keep local cleanup even if API logout fails.
    } finally {
      clearSession();
      router.push("/login");
      router.refresh();
    }
  }

  const roleLinks: Record<DashboardShellProps["role"], { href: string; label: string }[]> = {
    student: [
      { href: "/student/courses", label: "My Courses" },
      { href: "/student/internships", label: "Browse & Apply Internships" },
      { href: "/student/internship-applications", label: "Track Internship Applications" },
      { href: "/student/job-applications", label: "My Job Applications" },
      { href: "/student/events", label: "My Event Registrations" },
      { href: "/student/certificates", label: "My Certificates" },
    ],
    company: [
      { href: "/company/jobs", label: "Manage Job Postings" },
    ],
    admin: [
      { href: "/admin/internships", label: "Manage Internship Listings" },
      { href: "/admin/events", label: "Manage Events" },
      { href: "/admin/certificates", label: "Issue Certificates" },
    ],
  };

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-10 md:px-8">
      <div className="glass-panel rounded-2xl p-6">
        <p className="mb-2 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
          {role} dashboard
        </p>
        <h1 className="font-display text-3xl text-white">{title}</h1>
        <p className="mt-3 text-slate-300">{description}</p>

        {roleLinks[role].length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-3">
            {roleLinks[role].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg border border-cyan-300/40 bg-white/5 px-4 py-2 text-sm text-cyan-100 hover:bg-white/10"
              >
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 rounded-lg border border-cyan-300/40 bg-white/5 px-4 py-2 text-sm text-cyan-100 hover:bg-white/10"
        >
          Logout
        </button>
      </div>
    </main>
  );
}
