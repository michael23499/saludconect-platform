"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { useApp } from "@/components/providers/Providers";
import { formatDateEs } from "@/lib/dates";
import { ReviewModal, type ReviewTarget } from "./ReviewModal";

export type PendingReviewItem = {
  contextType: "surgery" | "slot";
  contextId: string;
  ratedId: string;
  ratedName: string;
  ratedAvatarUrl: string | null;
  title: string | null;
  date: string;
};

/**
 * Sección "Valoraciones pendientes": lista los trabajos terminados que el
 * usuario aún puede valorar y abre el modal de valoración. Se oculta cuando no
 * queda ninguno (incluidos los recién valorados en esta sesión).
 */
export function PendingReviews({ items }: { items: PendingReviewItem[] }) {
  const r = useApp().t.dashboard.reviews;
  const [active, setActive] = useState<ReviewTarget | null>(null);
  const [done, setDone] = useState<string[]>([]);

  const keyOf = (it: { contextType: string; contextId: string; ratedId: string }) =>
    `${it.contextType}:${it.contextId}:${it.ratedId}`;
  const visible = items.filter((it) => !done.includes(keyOf(it)));
  if (visible.length === 0) return null;

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/50">
      <div className="border-b border-amber-200/60 p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.3l2.95 5.98 6.6.96-4.77 4.65 1.13 6.57L12 17.98l-5.91 3.11 1.13-6.57L2.45 9.24l6.6-.96z" /></svg>
          {r.pendingTitle}
        </div>
        <div className="mt-0.5 text-sm text-ink-700">{r.pendingSub}</div>
      </div>
      <ul className="divide-y divide-amber-200/50">
        {visible.map((it) => {
          const workLabel =
            it.contextType === "surgery" ? it.title ?? r.surgeryWork : r.slotWork;
          return (
            <li key={keyOf(it)} className="flex items-center gap-3 p-4">
              <Avatar name={it.ratedName} src={it.ratedAvatarUrl ?? undefined} size="sm" ring="" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-ink-900">{it.ratedName}</div>
                <div className="mt-0.5 text-xs text-mist-600">
                  {workLabel} · {formatDateEs(it.date)}
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setActive({
                    ratedId: it.ratedId,
                    ratedName: it.ratedName,
                    ratedAvatarUrl: it.ratedAvatarUrl,
                    contextType: it.contextType,
                    contextId: it.contextId,
                    workLabel,
                  })
                }
                className="inline-flex h-9 items-center gap-1.5 rounded-sm bg-amber-500 px-4 text-sm font-semibold text-white transition hover:bg-amber-600"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.3l2.95 5.98 6.6.96-4.77 4.65 1.13 6.57L12 17.98l-5.91 3.11 1.13-6.57L2.45 9.24l6.6-.96z" /></svg>
                {r.rate}
              </button>
            </li>
          );
        })}
      </ul>

      {active && (
        <ReviewModal
          target={active}
          onClose={(d) => {
            if (d) setDone((prev) => [...prev, keyOf(active)]);
            setActive(null);
          }}
        />
      )}
    </section>
  );
}
