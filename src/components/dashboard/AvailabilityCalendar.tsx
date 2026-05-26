"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { BookSlotButton } from "@/components/dashboard/BookSlotButton";
import { useApp } from "@/components/providers/Providers";
import { formatDateEs } from "@/lib/dates";

export type CalendarSlot = {
  id: string;
  date: string; // "YYYY-MM-DD"
  startTime: string | null;
  endTime: string | null;
  note: string | null;
};

/**
 * Disponibilidad del técnico como CALENDARIO mensual en vez de una lista larga:
 * los días con huecos se resaltan y, al elegir uno, se muestran abajo solo sus
 * franjas con el botón de reservar. Textos vía i18n; meses según el idioma.
 */
export function AvailabilityCalendar({
  slots,
  proName,
  isAdmin = false,
}: {
  slots: CalendarSlot[];
  proName: string;
  isAdmin?: boolean;
}) {
  const app = useApp();
  const t = app.t.directory;
  const c = app.t.dashboard.cal;
  const locale = app.lang === "en" ? "en-US" : "es-ES";

  // Agrupa franjas por día. Un mismo día puede tener varias (p.ej. mañana + día completo).
  const byDate = useMemo(() => {
    const m = new Map<string, CalendarSlot[]>();
    for (const s of slots) {
      const arr = m.get(s.date) ?? [];
      arr.push(s);
      m.set(s.date, arr);
    }
    return m;
  }, [slots]);

  const firstDate = slots.length ? slots[0].date : isoLocal(today());
  const [view, setView] = useState<Date>(() => firstOfMonth(parseISO(firstDate) ?? today()));
  const [selected, setSelected] = useState<string>(firstDate);

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

  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(view);
  const selectedSlots = byDate.get(selected) ?? [];
  const slotTime = (s: CalendarSlot) =>
    s.startTime && s.endTime ? `${s.startTime}–${s.endTime}` : t.fullDay;

  return (
    <div className="p-5">
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* Calendario */}
        <div className="rounded-2xl border border-mist-200 bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-mist-500 transition hover:bg-mist-100 hover:text-ink-800"
              aria-label={t.prevMonth}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <span className="text-sm font-semibold capitalize text-ink-900">{monthLabel}</span>
            <button
              type="button"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-mist-500 transition hover:bg-mist-100 hover:text-ink-800"
              aria-label={t.nextMonth}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center text-[11px] font-semibold uppercase text-mist-400">
            {weekdays.map((w, i) => <div key={i} className="py-1">{w}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {grid.map((day, i) => {
              const inMonth = day.getMonth() === view.getMonth();
              const key = isoLocal(day);
              const has = byDate.has(key);
              const isSel = key === selected;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={!has}
                  onClick={() => has && setSelected(key)}
                  className={
                    "relative flex h-10 flex-col items-center justify-center rounded-lg text-[13px] transition " +
                    (isSel
                      ? "bg-brand-600 font-semibold text-white"
                      : has
                        ? "bg-brand-50 font-semibold text-brand-700 hover:bg-brand-100"
                        : inMonth
                          ? "cursor-not-allowed text-mist-400"
                          : "cursor-not-allowed text-mist-300")
                  }
                >
                  {day.getDate()}
                  {has && (
                    <span
                      className={`absolute bottom-1 h-1 w-1 rounded-full ${isSel ? "bg-white" : "bg-brand-500"}`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <p className="mt-2 flex items-center gap-1.5 border-t border-mist-100 pt-2 text-[11px] text-mist-500">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-500" />
            {t.daysWithAvailability}
          </p>
        </div>

        {/* Franjas del día seleccionado */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">
            {selectedSlots.length > 0 ? formatDateEs(selected) : t.selectDay}
          </div>
          {selectedSlots.length === 0 ? (
            <p className="mt-2 text-sm text-mist-500">{t.selectDayHint}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {selectedSlots.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-mist-200 bg-white p-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink-900">{slotTime(s)}</div>
                    {s.note && <div className="mt-0.5 text-xs text-mist-500">{s.note}</div>}
                  </div>
                  {isAdmin ? (
                    <Badge tone="brand">{c.avAvailable}</Badge>
                  ) : (
                    <BookSlotButton slotId={s.id} proName={proName} dateLabel={formatDateEs(s.date)} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers de fecha (horario local) ---------- */
function isoLocal(d: Date): string {
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
function firstOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
