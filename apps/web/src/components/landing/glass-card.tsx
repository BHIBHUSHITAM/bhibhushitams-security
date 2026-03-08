import type { PropsWithChildren } from "react";

type GlassCardProps = PropsWithChildren<{
  className?: string;
}>;

export function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div
      className={`rounded-2xl border border-cyan-400/20 bg-white/5 p-6 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.09)] ${className}`}
    >
      {children}
    </div>
  );
}
