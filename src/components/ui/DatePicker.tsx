"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "@/components/providers/Providers";

// Etiquetas del calendario por idioma (los meses/días los formatea Intl con el
// locale; esto solo cubre los textos propios del componente).
const LBL = {
  es: { ph: "Selecciona una fecha", prev: "Mes anterior", next: "Mes siguiente", today: "Hoy", clear: "Limpiar" },
  en: { ph: "Select a date", prev: "Previous month", next: "Next month", today: "Today", clear: "Clear" },
};

/**
 * Selector de UNA fecha con calendario popover. Mismo lenguaje visual que el
 * filtro de fechas del panel de Usuarios (admin). Reutilizable: pásale value
 * ("YYYY-MM-DD" o ""), onChange, y opcionalmente `name` para emitir un
 * <input type="hidden"> y que funcione dentro de un <form> con FormData.
 *
 * `minToday` deshabilita las fechas pasadas (útil para agendar a futuro);
 * `maxToday` deshabilita las futuras (útil para filtros de histórico).
 */
export function DatePicker({
  value,
  onChange,
  name,
  minToday = false,
  maxToday = false,
  placeholder,
  locale,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  name?: string;
  minToday?: boolean;
  maxToday?: boolean;
  placeholder?: string;
  locale?: string;
  className?: string;
}) {
  const { lang } = useApp();
  const L = LBL[lang];
  const loc = locale ?? (lang === "en" ? "en-GB" : "es-ES");
  const ph = placeholder ?? L.ph;
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false));
  const selected = parseISO(value);
  const [view, setView] = useState<Date>(() => selected ?? today());

  useEffect(() => {
    // Al abrir, posiciona el calendario en el mes del valor seleccionado.
    // setState puntual de apertura (no cascada): falso positivo de la regla.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setView(parseISO(value) ?? today());
  }, [open, value]);

  const weekdays = useMemo(() => {
    const base = new Date(2024, 0, 1); // un lunes
    return Array.from({ length: 7 }, (_, i) => {
      const dd = new Date(base);
      dd.setDate(base.getDate() + i);
      return new Intl.DateTimeFormat(loc, { weekday: "narrow" }).format(dd);
    });
  }, [loc]);

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

  const todayT = today().getTime();

  function disabled(day: Date): boolean {
    const t = day.getTime();
    if (minToday && t < todayT) return true;
    if (maxToday && t > todayT) return true;
    return false;
  }

  function pick(day: Date) {
    if (disabled(day)) return;
    onChange(iso(day));
    setOpen(false);
  }

  const triggerLabel = selected
    ? new Intl.DateTimeFormat(loc, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(selected)
    : ph;
  const monthLabel = new Intl.DateTimeFormat(loc, { month: "long", year: "numeric" }).format(view);

  return (
    <div className={`relative ${className ?? ""}`} ref={ref}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-mist-200 bg-white px-3 text-sm transition hover:border-mist-300 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
      >
        <span className="inline-flex min-w-0 items-center gap-2">
          <svg className="h-4 w-4 shrink-0 text-mist-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /></svg>
          <span className={`truncate capitalize ${selected ? "text-ink-800" : "text-mist-500"}`}>{triggerLabel}</span>
        </span>
        <svg className={`h-4 w-4 shrink-0 text-mist-400 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9l6 6 6-6" /></svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-[300px] rounded-xl border border-mist-200 bg-white p-3 shadow-[var(--shadow-card)]">
          <div className="mb-2 flex items-center justify-between">
            <button type="button" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-mist-500 transition hover:bg-mist-100 hover:text-ink-800" aria-label={L.prev}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <span className="text-sm font-semibold capitalize text-ink-900">{monthLabel}</span>
            <button type="button" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-mist-500 transition hover:bg-mist-100 hover:text-ink-800" aria-label={L.next}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center text-[11px] font-semibold uppercase text-mist-400">
            {weekdays.map((w, i) => <div key={i} className="py-1">{w}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {grid.map((day, i) => {
              const inMonth = day.getMonth() === view.getMonth();
              const isSel = selected?.getTime() === day.getTime();
              const isToday = day.getTime() === todayT;
              const off = disabled(day);
              return (
                <button
                  key={i}
                  type="button"
                  disabled={off}
                  onClick={() => pick(day)}
                  className={
                    "h-9 rounded-lg text-[13px] transition " +
                    (off
                      ? "cursor-not-allowed text-mist-300"
                      : isSel
                        ? "bg-brand-600 font-semibold text-white"
                        : isToday
                          ? "bg-brand-50 font-semibold text-brand-700 hover:bg-brand-100"
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

          <div className="mt-2 flex items-center justify-between border-t border-mist-100 pt-2">
            <button type="button" onClick={() => { onChange(iso(today())); setOpen(false); }} className="rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-brand-700 transition hover:bg-brand-50">
              {L.today}
            </button>
            {value && (
              <button type="button" onClick={() => { onChange(""); setOpen(false); }} className="rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-mist-500 transition hover:bg-mist-50">
                {L.clear}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
