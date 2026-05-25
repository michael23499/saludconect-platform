"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/components/providers/Providers";

/**
 * Estado vacío reutilizable para las vistas del dashboard. Se usa tanto para
 * "todavía no tienes datos" como para "esta sección llegará pronto" (con
 * `comingSoon`), de forma honesta: no inventamos datos de demo. Dark-safe.
 */
export function EmptyState({
  icon,
  title,
  text,
  action,
  comingSoon,
}: {
  icon?: ReactNode;
  title: string;
  text?: string;
  action?: { href: string; label: string };
  comingSoon?: boolean;
}) {
  const m = useApp().t.dashboard.misc;
  return (
    <div className="rounded-2xl border border-dashed border-mist-300 bg-white p-10 text-center dark:border-white/15 dark:bg-white/5">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-cyan-300">
        {icon ?? (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
        )}
      </div>
      {comingSoon && (
        <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-brand-700 dark:bg-brand-500/15 dark:text-cyan-300">
          {m.comingSoon}
        </span>
      )}
      <div className="text-sm font-semibold text-ink-900">{title}</div>
      {text && <p className="mx-auto mt-1 max-w-md text-sm text-mist-500">{text}</p>}
      {action && (
        <div className="mt-4">
          <Button href={action.href} size="sm">{action.label}</Button>
        </div>
      )}
    </div>
  );
}
