"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { useApp } from "@/components/providers/Providers";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];
const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export type DayMark = { count: number; tone?: "brand" | "success" | "neutral" | "warning" };

/** Fecha local → "YYYY-MM-DD" (sin saltos de zona horaria). */
function ymd(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

const TONE_DOT: Record<NonNullable<DayMark["tone"]>, string> = {
  brand: "bg-brand-500",
  success: "bg-emerald-500",
  neutral: "bg-mist-400",
  warning: "bg-amber-500",
};

/**
 * Calendario mensual reutilizable (Fase 2). Pinta los días con marcas (un punto
 * + contador) y permite seleccionar un día y navegar entre meses. Es solo
 * presentacional: el contenedor decide qué mostrar para el día seleccionado.
 */
export function MonthCalendar({
  markedDates,
  selectedDate,
  onSelect,
  initialMonth,
}: {
  markedDates: Record<string, DayMark>;
  selectedDate: string | null;
  onSelect: (date: string) => void;
  initialMonth?: string;
}) {
  const calToday = useApp().t.dashboard.cal.calToday;
  const [cursor, setCursor] = useState(() => {
    const base = initialMonth ? new Date(`${initialMonth}T12:00:00`) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const todayStr = ymd(new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  // Offset para empezar la semana en lunes (getDay: 0=domingo).
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  function shiftMonth(delta: number) {
    setCursor(new Date(year, month + delta, 1));
  }

  return (
    <div className="rounded-2xl border border-mist-200 bg-white p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-ink-900">
          {MONTHS[month]} {year}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="Mes anterior"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-mist-200 text-ink-700 transition hover:bg-mist-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button
            type="button"
            onClick={() => setCursor(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
            className="inline-flex h-8 items-center rounded-lg border border-mist-200 px-2.5 text-xs font-semibold text-ink-700 transition hover:bg-mist-50"
          >
            {calToday}
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label="Mes siguiente"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-mist-200 text-ink-700 transition hover:bg-mist-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wider text-mist-400">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">{w}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;
          const ds = ymd(date);
          const mark = markedDates[ds];
          const isSelected = ds === selectedDate;
          const isToday = ds === todayStr;
          return (
            <button
              key={ds}
              type="button"
              onClick={() => onSelect(ds)}
              className={cn(
                "relative flex h-12 flex-col items-center justify-center rounded-lg border text-sm transition",
                isSelected
                  ? "border-brand-300 bg-brand-50 font-semibold text-brand-700"
                  : "border-transparent text-ink-800 hover:bg-mist-50",
                isToday && !isSelected && "font-semibold text-brand-700",
              )}
            >
              <span>{date.getDate()}</span>
              {mark && (
                <span className="mt-0.5 flex items-center gap-0.5">
                  <span className={cn("h-1.5 w-1.5 rounded-full", TONE_DOT[mark.tone ?? "brand"])} />
                  {mark.count > 1 && (
                    <span className="text-[9px] font-semibold text-mist-500">{mark.count}</span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
