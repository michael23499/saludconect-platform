"use client";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useApp } from "@/components/providers/Providers";

type Role = "clinic" | "professional";

type Step = {
  n: number;
  title: string;
  desc: string;
  time: string;
  icon: ReactNode;
  bullets: string[];
};

const ICONS_CLINIC = [<IconBuilding key="b" />, <IconBroadcast key="br" />, <IconUsers key="u" />, <IconChat key="c" />, <IconCheck key="ch" />];
const ICONS_PRO = [<IconUser key="u" />, <IconShieldCheck key="s" />, <IconCalendar key="cal" />, <IconInbox key="i" />, <IconWallet key="w" />];

export function JourneyTabs() {
  const { t } = useApp();
  const j = t.sections.journey;
  const [role, setRole] = useState<Role>("clinic");
  const [active, setActive] = useState<number>(1);

  const icons = role === "clinic" ? ICONS_CLINIC : ICONS_PRO;
  const rawSteps = role === "clinic" ? j.stepsClinic : j.stepsPro;
  const steps: Step[] = rawSteps.map((s, i) => ({
    n: i + 1,
    title: s.title,
    desc: s.desc,
    time: s.time,
    icon: icons[i],
    bullets: s.bullets,
  }));
  const summary = role === "clinic" ? j.summaryClinic : j.summaryPro;

  const switchRole = (r: Role) => {
    setRole(r);
    setActive(1);
  };

  return (
    <div>
      {/* Role tabs — equal-width, role-tinted thumb */}
      <div className="mx-auto max-w-md">
        <div className="relative flex items-center rounded-full border border-mist-200 bg-white p-1 shadow-[var(--shadow-soft)]">
          <span
            aria-hidden
            className={cn(
              "absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full shadow-[0_10px_22px_-10px_rgba(37,99,235,0.6)] transition-all duration-300 ease-[cubic-bezier(.22,.61,.36,1)]",
              role === "clinic"
                ? "translate-x-0 bg-gradient-to-br from-brand-600 to-brand-500"
                : "translate-x-full bg-gradient-to-br from-cyan-500 to-brand-600"
            )}
          />
          <RoleTab active={role === "clinic"} onClick={() => switchRole("clinic")} icon={<IconBuilding />} label={j.tabClinic} />
          <RoleTab active={role === "professional"} onClick={() => switchRole("professional")} icon={<IconStethoscope />} label={j.tabPro} />
        </div>
        <p className="mt-3 text-center text-[12px] text-mist-500">
          {role === "clinic" ? j.hintClinic : j.hintPro}
        </p>
      </div>

      {/* Summary banner — tinted by role */}
      <div
        key={`banner-${role}`}
        className={cn(
          "reveal-up mt-8 grid gap-4 rounded-3xl border p-5 sm:flex sm:items-center sm:justify-between md:p-6",
          role === "clinic"
            ? "border-brand-100 bg-gradient-to-br from-brand-50/80 via-white to-cyan-50/40 dark:from-brand-500/15 dark:via-transparent dark:to-cyan-500/10"
            : "border-cyan-100 bg-gradient-to-br from-cyan-50/80 via-white to-brand-50/40 dark:from-cyan-500/15 dark:via-transparent dark:to-brand-500/10"
        )}
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md",
              role === "clinic"
                ? "bg-gradient-to-br from-brand-500 to-brand-700"
                : "bg-gradient-to-br from-cyan-400 to-brand-600"
            )}
          >
            <IconBolt />
          </span>
          <div>
            <div className={cn(
              "text-[10px] font-semibold uppercase tracking-wider",
              role === "clinic" ? "text-brand-700" : "text-cyan-700"
            )}>
              {role === "clinic" ? j.flowClinic : j.flowPro}
            </div>
            <div className="text-base font-semibold tracking-tight text-ink-900 md:text-lg">{summary.headline}</div>
            <div className="text-[12px] text-mist-500">{summary.sub}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 ring-1 ring-mist-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {j.badge}
          </span>
        </div>
      </div>

      {/* Stepper progress (desktop) */}
      <div className="mt-8 hidden md:block">
        <div className="relative">
          {/* Las líneas van de CENTRO a CENTRO de los círculos extremos (cada
              círculo está centrado en su columna del grid de 5 → el primero a
              media columna del borde = 100%/5/2 = 10%). Así la línea de progreso
              termina justo en el círculo activo, sin quedarse corta. */}
          <div className="absolute top-5 h-px bg-mist-200" style={{ left: `${50 / steps.length}%`, right: `${50 / steps.length}%` }} />
          <div
            className="absolute top-5 h-[2px] bg-gradient-to-r from-brand-500 to-cyan-400 transition-[width] duration-500"
            style={{
              left: `${50 / steps.length}%`,
              width: `${((active - 1) / (steps.length - 1)) * (100 - 100 / steps.length)}%`,
            }}
          />
          <ol className="relative grid grid-cols-5 gap-2">
            {steps.map((s) => (
              <li key={s.n} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setActive(s.n)}
                  className={cn(
                    "relative inline-flex h-10 w-10 items-center justify-center rounded-full border text-xs font-bold transition-all",
                    s.n < active && "border-brand-500 bg-brand-500 text-white shadow-[0_8px_18px_-8px_rgba(37,99,235,0.55)]",
                    s.n === active && "border-brand-600 bg-white text-brand-700 ring-4 ring-brand-200",
                    s.n > active && "border-mist-200 bg-white text-mist-500 hover:border-brand-300 hover:text-brand-700"
                  )}
                  aria-label={`${j.stepAriaPre} ${s.n}`}
                >
                  {s.n < active ? (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 12l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    s.n
                  )}
                </button>
                <span
                  className={cn(
                    "mt-3 line-clamp-2 px-1 text-center text-[11px] font-medium transition-colors",
                    s.n === active ? "text-ink-900" : "text-mist-500"
                  )}
                >
                  {s.title}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Step cards */}
      <div key={role} className="mt-10 space-y-4 md:mt-12">
        {steps.map((s) => {
          const isActive = s.n === active;
          return (
            <button
              key={s.n}
              type="button"
              onClick={() => setActive(s.n)}
              className={cn(
                "reveal-up block w-full overflow-hidden rounded-3xl border bg-white p-5 text-left transition-all md:p-7",
                isActive
                  ? "border-brand-300 bg-gradient-to-br from-white via-white to-brand-50/40 shadow-[var(--shadow-card)] dark:from-transparent dark:via-transparent dark:to-brand-500/10"
                  : "border-mist-200 hover:border-brand-200 hover:bg-mist-50/40"
              )}
              style={{ animationDelay: `${(s.n - 1) * 60}ms` }}
              aria-expanded={isActive}
            >
              <div className="grid items-start gap-5 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-7">
                {/* Icon + number */}
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      "relative inline-flex h-14 w-14 items-center justify-center rounded-2xl text-white transition-all md:h-16 md:w-16",
                      isActive
                        ? "bg-gradient-to-br from-ink-900 via-brand-700 to-brand-500 shadow-[0_14px_30px_-12px_rgba(37,99,235,0.6)]"
                        : "bg-mist-100 text-mist-500"
                    )}
                  >
                    {s.icon}
                    <span className="absolute -right-1.5 -top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-white text-[10px] font-bold text-ink-900 shadow-sm">
                      {s.n}
                    </span>
                  </span>
                </div>

                {/* Text */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold tracking-tight text-ink-900 md:text-xl">{s.title}</h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                      <span className="h-1 w-1 rounded-full bg-brand-500" />
                      {s.time}
                    </span>
                  </div>
                  <p className="mt-2 text-[15px] leading-relaxed text-mist-500">{s.desc}</p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {s.bullets.map((b) => (
                      <li
                        key={b}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition",
                          isActive ? "border-brand-200 bg-white text-ink-900" : "border-mist-200 bg-mist-50/40 text-mist-600"
                        )}
                      >
                        <svg viewBox="0 0 24 24" className={cn("h-3 w-3", isActive ? "text-brand-600" : "text-mist-400")} fill="none" stroke="currentColor" strokeWidth="2.8">
                          <path d="M5 12l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Arrow */}
                <div className="hidden md:block">
                  <span
                    className={cn(
                      "inline-flex h-10 w-10 items-center justify-center rounded-full transition",
                      isActive ? "bg-brand-600 text-white" : "bg-mist-100 text-mist-400"
                    )}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Step pager (mobile + desktop fallback) */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setActive((a) => Math.max(1, a - 1))}
          disabled={active === 1}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-mist-200 bg-white px-4 text-sm font-medium text-ink-800 transition hover:bg-mist-50 disabled:opacity-40"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M15 18l-6-6 6-6" /></svg>
          {j.prev}
        </button>
        <span className="text-xs font-medium text-mist-500">
          {j.stepLabel} <span className="font-semibold text-ink-900">{active}</span> {j.stepOf} {steps.length}
        </span>
        <button
          type="button"
          onClick={() => setActive((a) => Math.min(steps.length, a + 1))}
          disabled={active === steps.length}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white shadow-[0_10px_22px_-10px_rgba(37,99,235,0.6)] transition hover:bg-brand-700 disabled:opacity-40"
        >
          {j.next}
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>
    </div>
  );
}

function RoleTab({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        // flex-1 → cada pestaña ocupa exactamente el 50% del contenedor, de modo
        // que la píldora deslizante (w-[calc(50%-4px)] + translate-x-full) encaje
        // justo sobre cada una en vez de desbordarse.
        "relative z-10 inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full px-4 text-[13px] font-semibold transition-colors md:h-11 md:px-5 md:text-sm",
        active ? "text-white" : "text-ink-700 hover:text-ink-900"
      )}
    >
      <span className={cn("inline-flex h-5 w-5 items-center justify-center", active ? "text-white" : "text-mist-500")}>
        {icon}
      </span>
      {label}
    </button>
  );
}

/* Icons */
function IconBuilding() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 21V8l8-5 8 5v13" strokeLinejoin="round" />
      <path d="M9 21v-7h6v7" strokeLinejoin="round" />
    </svg>
  );
}
function IconStethoscope() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 3v6a4 4 0 008 0V3" strokeLinecap="round" />
      <path d="M10 17a4 4 0 008 0v-3" strokeLinecap="round" />
      <circle cx="18" cy="11" r="2.5" />
    </svg>
  );
}
function IconBroadcast() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="2.5" />
      <path d="M7.5 7.5a6 6 0 000 9M16.5 7.5a6 6 0 010 9M4.5 4.5a10 10 0 000 15M19.5 4.5a10 10 0 010 15" strokeLinecap="round" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="9" r="3.5" />
      <path d="M3 20a6 6 0 0112 0" strokeLinecap="round" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M14 20a4 4 0 018 0" strokeLinecap="round" />
    </svg>
  );
}
function IconChat() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12c0 4.4-4 8-9 8-1.4 0-2.7-.2-3.9-.7L3 21l1.7-4.6C3.6 15 3 13.6 3 12c0-4.4 4-8 9-8s9 3.6 9 8z" strokeLinejoin="round" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.4">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21a7 7 0 0114 0" strokeLinecap="round" />
    </svg>
  );
}
function IconShieldCheck() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" strokeLinejoin="round" />
      <path d="M8 12.5l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}
function IconInbox() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12l3-7h12l3 7v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z" strokeLinejoin="round" />
      <path d="M3 12h6l2 3h2l2-3h6" strokeLinejoin="round" />
    </svg>
  );
}
function IconWallet() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <circle cx="16" cy="14.5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconBolt() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
    </svg>
  );
}
