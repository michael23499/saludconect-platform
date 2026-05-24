"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Lang } from "@/lib/i18n";

type AdminDict = Record<string, string>;

/* ---------- helpers de fecha (horario local) ---------- */
function iso(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
function parseISO(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}
function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function daysAgo(n: number): Date {
  const d = today();
  d.setDate(d.getDate() - n);
  return d;
}

/* ---------- cerrar al hacer click fuera ---------- */
function useClickOutside<T extends HTMLElement>(active: boolean, onOutside: () => void) {
  const ref = useRef<T>(null);
  const cb = useRef(onOutside);
  useEffect(() => {
    cb.current = onOutside;
  });
  useEffect(() => {
    if (!active) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) cb.current();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [active]);
  return ref;
}

const FIELD =
  "flex h-11 items-center gap-2 rounded-lg border border-mist-200 bg-white px-3 text-sm text-ink-800 transition hover:border-mist-300 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";
const LABEL = "mb-2 block text-[11px] font-semibold uppercase tracking-wide text-mist-500";

export function UsersFilters({ d, lang }: { d: AdminDict; lang: Lang }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const role = params.get("role") ?? "";
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const [q, setQ] = useState(params.get("q") ?? "");
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function pushParams(updates: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function onSearch(value: string) {
    setQ(value);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => pushParams({ q: value.trim() }), 400);
  }

  const roleOptions = [
    { value: "", label: d.allRoles },
    { value: "professional", label: d.roleProfessional },
    { value: "clinic", label: d.roleClinic },
    { value: "admin", label: d.roleAdmin },
  ];

  return (
    <div className="mb-5 rounded-xl border border-mist-200 bg-white p-5 shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-end gap-4">
        {/* Búsqueda */}
        <div style={{ width: 320 }}>
          <label className={LABEL} htmlFor="f-q">{lang === "es" ? "Buscar" : "Search"}</label>
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
            <input
              id="f-q"
              type="search"
              value={q}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={d.searchUsers}
              className="h-11 w-full rounded-lg border border-mist-200 bg-white pl-9 pr-3 text-sm text-ink-800 transition placeholder:text-mist-400 hover:border-mist-300 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>

        {/* Rol */}
        <div>
          <span className={LABEL}>{d.colRole}</span>
          <RoleSelect value={role} options={roleOptions} onChange={(v) => pushParams({ role: v })} />
        </div>

        {/* Fecha de alta (rango) */}
        <div>
          <span className={LABEL}>{d.colJoined}</span>
          <DateRangePicker
            d={d}
            lang={lang}
            from={from}
            to={to}
            onApply={(f, t) => pushParams({ from: f, to: t })}
          />
        </div>

      </div>
    </div>
  );
}

/* ---------- Desplegable de rol ---------- */
function RoleSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false));
  const current = options.find((o) => o.value === value) ?? options[0];

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)} className={`${FIELD} justify-between`} style={{ width: 180 }}>
        <span className={value ? "text-ink-800" : "text-mist-500"}>{current.label}</span>
        <svg className={`h-4 w-4 shrink-0 text-mist-400 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-mist-200 bg-white p-1.5 shadow-[var(--shadow-card)]" style={{ width: 240 }}>
          {options.map((o) => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={
                  "flex w-full items-center justify-between gap-6 rounded-lg px-3.5 py-2.5 text-left text-sm transition " +
                  (active ? "bg-brand-50 font-medium text-brand-700" : "text-ink-800 hover:bg-mist-50")
                }
              >
                {o.label}
                {active && (
                  <svg className="h-4 w-4 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12l4.5 4.5L19 7" /></svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- Selector de rango de fechas (un solo botón + calendario) ---------- */
function DateRangePicker({
  d,
  lang,
  from,
  to,
  onApply,
}: {
  d: AdminDict;
  lang: Lang;
  from: string;
  to: string;
  onApply: (from: string, to: string) => void;
}) {
  const locale = lang === "es" ? "es-ES" : "en-US";
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false));

  const [draftFrom, setDraftFrom] = useState<Date | null>(() => parseISO(from));
  const [draftTo, setDraftTo] = useState<Date | null>(() => parseISO(to));
  const [view, setView] = useState<Date>(() => parseISO(from) ?? today());

  function openPicker() {
    setDraftFrom(parseISO(from));
    setDraftTo(parseISO(to));
    setView(parseISO(from) ?? today());
    setOpen(true);
  }

  const weekdays = useMemo(() => {
    const base = new Date(2024, 0, 1); // un lunes
    return Array.from({ length: 7 }, (_, i) => {
      const dd = new Date(base);
      dd.setDate(base.getDate() + i);
      return new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(dd);
    });
  }, [locale]);

  const grid = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7; // semana empieza en lunes
    const start = new Date(first);
    start.setDate(1 - offset);
    return Array.from({ length: 42 }, (_, i) => {
      const dd = new Date(start);
      dd.setDate(start.getDate() + i);
      return dd;
    });
  }, [view]);

  const max = today().getTime();

  function pick(day: Date) {
    if (day.getTime() > max) return;
    if (!draftFrom || (draftFrom && draftTo)) {
      setDraftFrom(day);
      setDraftTo(null);
    } else if (day.getTime() < draftFrom.getTime()) {
      setDraftFrom(day);
    } else {
      setDraftTo(day);
    }
  }

  function applyPreset(n: number) {
    setDraftFrom(daysAgo(n));
    setDraftTo(today());
  }

  function apply() {
    onApply(draftFrom ? iso(draftFrom) : "", draftTo ? iso(draftTo) : "");
    setOpen(false);
  }

  const fmt = (s: string) => {
    const dt = parseISO(s);
    return dt ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(dt) : "";
  };
  let triggerLabel = d.anyDate;
  if (from && to) triggerLabel = `${fmt(from)} – ${fmt(to)}`;
  else if (from) triggerLabel = `${d.dateFrom} ${fmt(from)}`;
  else if (to) triggerLabel = `${d.dateTo} ${fmt(to)}`;
  const hasValue = Boolean(from || to);

  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(view);

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => (open ? setOpen(false) : openPicker())} className={`${FIELD} justify-between`} style={{ width: 232 }}>
        <span className="inline-flex min-w-0 items-center gap-2">
          <svg className="h-4 w-4 shrink-0 text-mist-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /></svg>
          <span className={`truncate ${hasValue ? "text-ink-800" : "text-mist-500"}`}>{triggerLabel}</span>
        </span>
        <svg className={`h-4 w-4 shrink-0 text-mist-400 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9l6 6 6-6" /></svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 rounded-xl border border-mist-200 bg-white p-3 shadow-[var(--shadow-card)]" style={{ width: 468 }}>
          <div className="flex gap-3">
            {/* Calendario (izquierda) */}
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between">
                <button type="button" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-mist-500 transition hover:bg-mist-100 hover:text-ink-800" aria-label="Mes anterior">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <span className="text-sm font-semibold capitalize text-ink-900 first-letter:uppercase">{monthLabel}</span>
                <button type="button" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-mist-500 transition hover:bg-mist-100 hover:text-ink-800" aria-label="Mes siguiente">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 18l6-6-6-6" /></svg>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-0.5 text-center text-[11px] font-semibold uppercase text-mist-400">
                {weekdays.map((w, i) => <div key={i} className="py-1">{w}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {grid.map((day, i) => {
                  const t = day.getTime();
                  const inMonth = day.getMonth() === view.getMonth();
                  const future = t > max;
                  const fromT = draftFrom?.getTime();
                  const toT = draftTo?.getTime();
                  const selected = fromT === t || toT === t;
                  const inRange = fromT != null && toT != null && t > fromT && t < toT;
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={future}
                      onClick={() => pick(day)}
                      className={
                        "h-8 rounded-lg text-[13px] transition " +
                        (future
                          ? "cursor-not-allowed text-mist-300"
                          : selected
                            ? "bg-brand-600 font-semibold text-white"
                            : inRange
                              ? "bg-brand-50 text-brand-700"
                              : inMonth
                                ? "text-ink-800 hover:bg-mist-100"
                                : "text-mist-300 hover:bg-mist-50")
                      }
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Atajos + acción (columna derecha) */}
            <div className="flex flex-col border-l border-mist-100 pl-3" style={{ width: 150 }}>
              <div className="mb-2 px-2.5 text-[11px] font-semibold uppercase tracking-wide text-mist-400">{d.colJoined}</div>
              <div className="flex flex-col gap-1">
                <button type="button" onClick={() => { setDraftFrom(null); setDraftTo(null); }} className="rounded-lg px-2.5 py-1.5 text-left text-[13px] font-medium text-mist-600 transition hover:bg-mist-50 hover:text-brand-700">
                  {d.anyDate}
                </button>
                {[{ l: d.last7, n: 7 }, { l: d.last30, n: 30 }, { l: d.last90, n: 90 }].map((p) => (
                  <button key={p.n} type="button" onClick={() => applyPreset(p.n)} className="rounded-lg px-2.5 py-1.5 text-left text-[13px] font-medium text-mist-600 transition hover:bg-mist-50 hover:text-brand-700">
                    {p.l}
                  </button>
                ))}
              </div>
              <button type="button" onClick={apply} className="mt-auto rounded-lg bg-brand-600 px-3 py-1.5 text-[13px] font-semibold text-white transition hover:bg-brand-700">
                {d.apply}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
