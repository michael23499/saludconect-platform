"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { CancelSlotButton } from "./CancelSlotButton";
import { BookingDecisionButtons } from "./BookingDecisionButtons";
import { MonthCalendar, type DayMark } from "./MonthCalendar";
import { useApp } from "@/components/providers/Providers";
import { formatDateEs } from "@/lib/dates";

export type ProSlot = {
  id: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  city: string | null;
  note: string | null;
  status: "open" | "pending" | "booked" | "cancelled";
  /** Nombre de la clínica que solicitó/reservó (en pending y booked). */
  bookedByName: string | null;
};

export type ProSurgery = {
  id: string;
  date: string;
  title: string;
  clinicName: string;
  startTime: string | null;
  endTime: string | null;
};

const TONE: Record<ProSlot["status"], "brand" | "success" | "neutral" | "warning"> = {
  open: "brand",
  pending: "warning",
  booked: "success",
  cancelled: "neutral",
};

/**
 * Calendario del técnico: combina su disponibilidad publicada (slots) con las
 * cirugías a las que fue aceptado (confirmadas). Las jornadas confirmadas se
 * marcan en verde y son clicables hacia el detalle de la cirugía.
 */
export function ProAvailabilityCalendar({ slots, surgeries = [] }: { slots: ProSlot[]; surgeries?: ProSurgery[] }) {
  const c = useApp().t.dashboard.cal;
  const statusLabel: Record<ProSlot["status"], string> = {
    open: c.avStatusOpen,
    pending: c.avStatusPending,
    booked: c.avStatusBooked,
    cancelled: c.avStatusCancelled,
  };
  const timeOf = (s: { startTime: string | null; endTime: string | null }) =>
    s.startTime && s.endTime ? `${s.startTime}–${s.endTime}` : c.avFullDay;

  // Marcas del mes: disponibilidad (brand/success) + cirugías confirmadas (success).
  const marks: Record<string, DayMark> = {};
  for (const s of slots) {
    if (s.status === "cancelled") continue;
    const tone: DayMark["tone"] =
      s.status === "booked" ? "success" : s.status === "pending" ? "warning" : "brand";
    const existing = marks[s.date];
    if (!existing) marks[s.date] = { count: 1, tone };
    else {
      existing.count += 1;
      if (tone === "brand") existing.tone = "brand";
    }
  }
  for (const sg of surgeries) {
    const existing = marks[sg.date];
    if (!existing) marks[sg.date] = { count: 1, tone: "success" };
    else {
      existing.count += 1;
      existing.tone = "success"; // una jornada confirmada prima visualmente
    }
  }

  // Día inicial: la jornada confirmada más próxima o, si no hay, el primer slot activo.
  const firstSurgery = surgeries[0]?.date ?? null;
  const firstSlot = slots.find((s) => s.status !== "cancelled")?.date ?? null;
  const firstActive = firstSurgery ?? firstSlot;

  const [selected, setSelected] = useState<string | null>(firstActive);
  const daySlots = selected ? slots.filter((s) => s.date === selected) : [];
  const daySurgeries = selected ? surgeries.filter((s) => s.date === selected) : [];
  const dayEmpty = daySlots.length === 0 && daySurgeries.length === 0;

  return (
    <div className="space-y-4">
      <MonthCalendar
        markedDates={marks}
        selectedDate={selected}
        onSelect={setSelected}
        initialMonth={firstActive ?? undefined}
      />

      <div className="rounded-2xl border border-mist-200 bg-white">
        <div className="border-b border-mist-100 p-4 text-sm font-semibold text-ink-900">
          {selected ? formatDateEs(selected) : c.avSelectDay}
        </div>
        {!selected || dayEmpty ? (
          <div className="p-6 text-center text-sm text-mist-500">{c.avEmptyDay}</div>
        ) : (
          <ul className="divide-y divide-mist-100">
            {/* Jornadas confirmadas (cirugías) — clicables al detalle */}
            {daySurgeries.map((sg) => (
              <li key={sg.id}>
                <Link
                  href={`/dashboard/professional/surgeries/${sg.id}`}
                  className="flex items-center gap-3 p-4 transition hover:bg-mist-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-semibold text-ink-900">{sg.title}</span>
                      <Badge tone="success">{c.avConfirmed}</Badge>
                    </div>
                    <div className="mt-0.5 text-xs text-mist-500">
                      {sg.clinicName} · {timeOf(sg)}
                    </div>
                  </div>
                  <svg className="h-4 w-4 shrink-0 text-mist-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
                </Link>
              </li>
            ))}

            {/* Disponibilidad publicada */}
            {daySlots.map((s) => (
              <li key={s.id} className="flex items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-ink-900">{timeOf(s)}</span>
                    <Badge tone={TONE[s.status]}>{statusLabel[s.status]}</Badge>
                    {s.city && <span className="text-xs text-mist-500">· {s.city}</span>}
                  </div>
                  {s.status === "pending" && s.bookedByName && (
                    <div className="mt-0.5 text-xs text-amber-700">
                      <span className="font-semibold">{s.bookedByName}</span> {c.avWantsToBook}
                    </div>
                  )}
                  {s.status === "booked" && s.bookedByName && (
                    <div className="mt-0.5 text-xs text-mist-500">{s.bookedByName}</div>
                  )}
                  {s.note && <div className="mt-0.5 text-xs text-mist-500">{s.note}</div>}
                </div>
                {s.status === "pending" ? (
                  <BookingDecisionButtons slotId={s.id} />
                ) : s.status !== "cancelled" ? (
                  <CancelSlotButton slotId={s.id} booked={s.status === "booked"} />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
