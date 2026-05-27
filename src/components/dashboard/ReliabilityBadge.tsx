"use client";

import { useApp } from "@/components/providers/Providers";
import type { Reliability } from "@backend/queries/reliability";

/**
 * Muestra la fiabilidad de un usuario (score 0–100 + nivel) derivada de sus
 * cancelaciones tardías y ausencias. Si no tiene historial, lo indica en neutro
 * (no penaliza a quien acaba de empezar). Dark-safe.
 */
export function ReliabilityBadge({ reliability }: { reliability: Reliability }) {
  const r = useApp().t.dashboard.reliability;
  const { score, hasHistory, lateCancellations, noShows } = reliability;

  if (!hasHistory) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-mist-200 bg-mist-50 px-2.5 py-1 text-xs font-medium text-mist-500 dark:border-white/10 dark:bg-white/5">
        {r.label}: {r.noHistory}
      </span>
    );
  }

  const level = score >= 90 ? "high" : score >= 70 ? "good" : score >= 50 ? "medium" : "low";
  const tone = {
    high: "border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    good: "border-brand-100 bg-brand-50 text-brand-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-cyan-300",
    medium: "border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
    low: "border-red-100 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300",
  }[level];

  const parts: string[] = [];
  if (lateCancellations > 0) {
    parts.push(`${lateCancellations} ${lateCancellations === 1 ? r.lateOne : r.lateMany}`);
  }
  if (noShows > 0) parts.push(`${noShows} ${noShows === 1 ? r.noShowOne : r.noShowMany}`);
  const detail = parts.length ? parts.join(" · ") : r.clean;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        {r.label} {score}
        {r.scoreSuffix} · {r[level]}
      </span>
      <span className="text-xs text-mist-500">{detail}</span>
    </div>
  );
}
