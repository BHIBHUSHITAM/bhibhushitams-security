"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BriefcaseBusiness,
  CalendarCheck2,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { AnimatedSection } from "@/components/landing/animated-section";
import { GlassCard } from "@/components/landing/glass-card";
import { SectionHeading } from "@/components/landing/section-heading";

const internshipPrograms = [
  {
    title: "SOC Analyst Internship",
    duration: "12 weeks",
    mode: "Remote + Mentor-led",
    tag: "Most popular",
  },
  {
    title: "Threat Intelligence Internship",
    duration: "10 weeks",
    mode: "Hybrid",
    tag: "Advanced",
  },
  {
    title: "Incident Response Internship",
    duration: "8 weeks",
    mode: "Remote",
    tag: "Fast track",
  },
];

const courses = [
  "Ethical Hacking",
  "Web Application Security",
  "Penetration Testing",
  "Bug Bounty",
];

const stats = [
  { label: "Active learners", value: "Growing" },
  { label: "Live Programs", value: "Available" },
  { label: "Platform Status", value: "Active" },
  { label: "Support", value: "24/7" },
];

export default function Home() {
  return (
    <main className="relative overflow-x-clip">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[10%] top-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-[8%] top-52 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-8 md:px-8 md:pt-12">
        <nav className="glass-panel cyber-ring mb-10 flex items-center justify-between rounded-2xl px-5 py-4">
          <div>
            <p className="font-display text-base font-semibold tracking-[0.2em] text-cyan-200 md:text-lg">
              BHIBHUSHITAMS SECURITY
            </p>
          </div>
          <div className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#internships">Internships</a>
            <a href="#courses">Courses</a>
            <a href="/jobs">Jobs</a>
            <a href="/events">Events</a>
            <a href="#verify">Verify</a>
          </div>
          <Link href="/signup" className="rounded-lg border border-cyan-300/40 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20">
            Get Started
          </Link>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="grid items-center gap-10 md:grid-cols-2"
        >
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              <ShieldCheck size={14} />
              Cyber Career Command Center
            </p>
            <h1 className="font-display text-4xl font-semibold leading-tight text-white md:text-6xl">
              Premium Cybersecurity Platform for Learning, Careers, and Verified Credentials.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 md:text-base">
              Build your cybersecurity career with internships, industry-ready courses,
              QR-verified certificates, placement support, and a recruitment ecosystem in one
              secure SaaS platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/courses" className="rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                Explore Programs
              </Link>
              <a href="#verify" className="rounded-lg border border-blue-300/40 bg-white/5 px-5 py-3 text-sm font-semibold text-blue-100 transition hover:bg-white/10">
                Verify Certificate
              </a>
            </div>
          </div>

          <GlassCard className="relative overflow-hidden">
            <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-cyan-400/30 blur-2xl" />
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Live platform status</p>
            <div className="mt-5 space-y-4">
              {[
                "Internship applications protected with role-based access",
                "QR certificate verification available globally",
                "Recruitment and placement workflows active",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-xl border border-cyan-400/20 bg-slate-900/60 p-3">
                  <CheckCircle2 className="mt-0.5 text-cyan-300" size={18} />
                  <p className="text-sm text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </section>

      <AnimatedSection className="mx-auto max-w-7xl px-4 py-10 md:px-8" delay={0.05}>
        <SectionHeading
          eyebrow="Trusted by students"
          title="Built for ambitious learners and modern cyber teams"
          description="From tier-1 colleges to growing startups, Bhibhushitams Security powers practical cybersecurity growth across internships, learning, and hiring."
        />
        <div className="grid gap-4 md:grid-cols-4">
          {["IIT Cells", "NIT Chapters", "Startup SOC Teams", "Enterprise Partners"].map((name) => (
            <GlassCard key={name} className="text-center">
              <p className="font-display text-lg text-cyan-100">{name}</p>
            </GlassCard>
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection id="internships" className="mx-auto max-w-7xl px-4 py-10 md:px-8" delay={0.1}>
        <SectionHeading
          eyebrow="Internship programs"
          title="Hands-on training with mentor reviews"
          description="Practical cybersecurity internships designed to build portfolio-ready skills and placement confidence."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {internshipPrograms.map((item) => (
            <GlassCard key={item.title}>
              <p className="mb-4 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-xs text-cyan-100">
                {item.tag}
              </p>
              <h3 className="font-display text-xl text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{item.duration}</p>
              <p className="text-sm text-slate-400">{item.mode}</p>
            </GlassCard>
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection id="courses" className="mx-auto max-w-7xl px-4 py-10 md:px-8" delay={0.12}>
        <SectionHeading
          eyebrow="Cybersecurity courses"
          title="Industry-grade curriculum"
          description="Structured learning tracks designed with offensive, defensive, and application security pathways."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course) => (
            <GlassCard key={course} className="group">
              <GraduationCap className="text-cyan-300" />
              <h3 className="mt-4 font-display text-lg text-white">{course}</h3>
              <p className="mt-2 text-sm text-slate-300">Learn with labs, capstones, and mentor sessions.</p>
            </GlassCard>
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection id="verify" className="mx-auto max-w-7xl px-4 py-10 md:px-8" delay={0.16}>
        <GlassCard className="cyber-ring">
          <SectionHeading
            eyebrow="Certificate verification"
            title="Instant QR and ID-based certificate check"
            description="Enter certificate ID to verify authenticity or scan QR for public verification details."
          />
          <form className="flex flex-col gap-3 sm:flex-row">
            <input
              placeholder="Enter certificate ID (e.g. BHS-2026-001245)"
              className="w-full rounded-lg border border-cyan-300/25 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
            />
            <button
              type="button"
              className="rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Verify Now
            </button>
          </form>
        </GlassCard>
      </AnimatedSection>

      <AnimatedSection id="jobs" className="mx-auto max-w-7xl px-4 py-10 md:px-8" delay={0.2}>
        <SectionHeading
          eyebrow="Job opportunities"
          title="Recruitment ecosystem like modern job portals"
          description="Companies post roles and students apply with profile, resume, and tracked status updates."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            "SOC Analyst - Pune - 4.2 LPA",
            "VAPT Trainee - Remote - 3.8 LPA",
            "Application Security Intern - Bengaluru - 5.1 LPA",
          ].map((job) => (
            <GlassCard key={job}>
              <BriefcaseBusiness className="text-cyan-300" />
              <p className="mt-3 text-sm text-slate-200">{job}</p>
            </GlassCard>
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection className="mx-auto max-w-7xl px-4 py-10 md:px-8" delay={0.24}>
        <SectionHeading
          eyebrow="Platform statistics"
          title="Measured outcomes"
          description="Transparent metrics for learners, placements, and certifications."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <GlassCard key={item.label}>
              <p className="font-display text-3xl text-cyan-200">{item.value}</p>
              <p className="mt-2 text-sm text-slate-300">{item.label}</p>
            </GlassCard>
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection className="mx-auto max-w-7xl px-4 py-10 md:px-8" delay={0.32}>
        <GlassCard className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 text-cyan-200">
              <Sparkles size={16} /> Start your cyber journey now
            </p>
            <h3 className="font-display text-2xl text-white md:text-3xl">
              Join Bhibhushitams Security and build a placement-ready profile.
            </h3>
          </div>
          <Link href="/signup" className="rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
            Create Account
          </Link>
        </GlassCard>
      </AnimatedSection>

      <footer className="mx-auto mt-4 max-w-7xl border-t border-cyan-400/20 px-4 py-8 text-sm text-slate-400 md:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row">
          <p className="font-display tracking-[0.15em] text-cyan-200">BHIBHUSHITAMS SECURITY</p>
          <div className="flex flex-wrap gap-4">
            <span className="inline-flex items-center gap-1">
              <Users size={14} /> Community
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarCheck2 size={14} /> Events
            </span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck size={14} /> Verified Certificates
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
