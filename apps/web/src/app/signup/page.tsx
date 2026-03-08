import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 md:px-8">
      <nav className="mb-10 rounded-xl border border-cyan-400/20 bg-slate-900/60 p-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className="rounded-lg border border-cyan-300/30 bg-white/5 px-3 py-2 text-xs font-medium text-cyan-100 hover:bg-white/10"
          >
            Home
          </Link>
          <Link
            href="/courses"
            className="rounded-lg border border-cyan-300/30 bg-white/5 px-3 py-2 text-xs font-medium text-cyan-100 hover:bg-white/10"
          >
            Courses
          </Link>
          <Link
            href="/events"
            className="rounded-lg border border-cyan-300/30 bg-white/5 px-3 py-2 text-xs font-medium text-cyan-100 hover:bg-white/10"
          >
            Events
          </Link>
          <Link
            href="/verify"
            className="rounded-lg border border-cyan-300/30 bg-white/5 px-3 py-2 text-xs font-medium text-cyan-100 hover:bg-white/10"
          >
            Verify Certificate
          </Link>
          <Link
            href="/login"
            className="ml-auto rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-300"
          >
            Login
          </Link>
        </div>
      </nav>

      <div className="flex items-center justify-center">
        <SignupForm />
      </div>
    </main>
  );
}
