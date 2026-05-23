"use client";
import { Avatar } from "@/components/ui/Avatar";
import { LevelChip, BadgeChip, StarRow } from "@/components/reputation/ReputationBadge";
import { useApp } from "@/components/providers/Providers";
import { LEVELS } from "@/lib/reputation";
import type { Professional } from "@/lib/mock-professionals";
import { cn } from "@/lib/cn";

const T = {
  es: {
    available: "Disponible ahora",
    busy: "Ocupado",
    bookings: "reservas",
    response: "Responde en",
    successRate: "Tasa de éxito",
    rate: "Rango de tarifa",
    seeProfile: "Ver perfil",
    book: "Reservar",
    yrs: "años exp.",
    verified: "Verificado",
  },
  en: {
    available: "Available now",
    busy: "Busy",
    bookings: "bookings",
    response: "Replies in",
    successRate: "Success rate",
    rate: "Rate range",
    seeProfile: "View profile",
    book: "Book",
    yrs: "yrs exp.",
    verified: "Verified",
  },
};

export function ProfessionalCard({ p }: { p: Professional }) {
  const { lang } = useApp();
  const tr = T[lang];
  const lvl = LEVELS[p.rep.level];

  return (
    <div className="card-hover relative overflow-hidden rounded-2xl border border-mist-200 bg-white p-5">
      {/* Level ribbon */}
      {(p.rep.level === "elite" || p.rep.level === "expert") && (
        <div className="pointer-events-none absolute -right-12 top-4 rotate-45 bg-gradient-to-r from-indigo-600 to-cyan-500 px-12 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
          {lvl.label[lang]}
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className={cn("rounded-full ring-2", lvl.ring)}>
          <Avatar name={p.name} size="lg" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="truncate text-[16px] font-semibold tracking-tight text-ink-900">{p.name}</div>
            {p.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden>
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                </svg>
                {tr.verified}
              </span>
            )}
          </div>
          <div className="text-sm text-mist-500">
            {p.specialty} · {p.profession}
          </div>
          <div className="mt-0.5 text-xs text-mist-500">
            {p.city} · {p.experience} {tr.yrs}
          </div>

          <div className="mt-2 flex items-center gap-2">
            <LevelChip level={p.rep.level} />
            <div className="flex items-center gap-1.5">
              <StarRow value={p.rep.rating} />
              <span className="text-xs font-semibold text-ink-800">{p.rep.rating.toFixed(1)}</span>
              <span className="text-xs text-mist-500">· {p.rep.reviews}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      {p.rep.badges.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {p.rep.badges.slice(0, 5).map((b) => (
            <BadgeChip key={b} b={b} />
          ))}
        </div>
      )}

      {/* Reputation metrics */}
      <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-mist-100 bg-mist-50/50 p-3 text-center">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">{tr.bookings}</div>
          <div className="mt-0.5 text-sm font-semibold text-ink-900">{p.rep.completed}</div>
        </div>
        <div className="border-x border-mist-100">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">{tr.response}</div>
          <div className="mt-0.5 text-sm font-semibold text-ink-900">{p.rep.responseTime}</div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">{tr.successRate}</div>
          <div className="mt-0.5 text-sm font-semibold text-ink-900">{p.rep.successRate}%</div>
        </div>
      </div>

      {/* Rate range */}
      <div className="mt-3 flex items-center justify-between rounded-xl border border-mist-200 bg-white px-3 py-2.5">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">{tr.rate}</div>
          <div className="text-xs font-medium text-ink-800">{p.rateLabel}</div>
        </div>
        <div className="flex gap-0.5 text-base font-bold tracking-tighter">
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                i < p.rateRange.length ? "text-brand-700" : "text-mist-300"
              )}
            >
              €
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
            p.available ? "bg-emerald-50 text-emerald-700" : "bg-mist-100 text-mist-500"
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", p.available ? "bg-emerald-500" : "bg-mist-400")} />
          {p.available ? tr.available : tr.busy}
        </span>
        <div className="flex gap-2">
          <button className="rounded-lg border border-mist-200 px-3 py-1.5 text-xs font-medium text-ink-800 hover:bg-mist-50">{tr.seeProfile}</button>
          <button className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">{tr.book}</button>
        </div>
      </div>
    </div>
  );
}
