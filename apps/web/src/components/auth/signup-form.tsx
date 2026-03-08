"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { signup } from "@/lib/auth/api";
import { persistSession } from "@/lib/auth/session";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "company">("student");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await signup({ name, email, password, role });
      persistSession(response.user, {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      router.push(`/${response.user.role}/dashboard`);
      router.refresh();
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass-panel mx-auto w-full max-w-md rounded-2xl p-6">
      <h1 className="font-display text-2xl text-white">Signup</h1>
      <p className="mt-2 text-sm text-slate-300">Create your role-based account.</p>

      <div className="mt-5 space-y-4">
        <input
          type="text"
          required
          minLength={2}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Full name"
          className="w-full rounded-lg border border-cyan-300/25 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          className="w-full rounded-lg border border-cyan-300/25 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none"
        />
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="w-full rounded-lg border border-cyan-300/25 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none"
        />
        <select
          aria-label="Select account type"
          value={role}
          onChange={(event) => setRole(event.target.value as "student" | "company")}
          className="w-full rounded-lg border border-cyan-300/25 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none"
        >
          <option value="student">Student</option>
          <option value="company">Company</option>
        </select>
      </div>

      {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}

      <button
        type="submit"
        disabled={isLoading}
        className="mt-5 w-full rounded-lg bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? "Creating account..." : "Signup"}
      </button>

      <p className="mt-4 text-center text-sm text-slate-300">
        Already have an account?{" "}
        <Link href="/login" className="text-cyan-200 hover:text-cyan-100">
          Login
        </Link>
      </p>
    </form>
  );
}
