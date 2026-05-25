"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedTag } from "@/components/ui/VerifiedTag";
import { BookSlotButton } from "./BookSlotButton";
import { MonthCalendar, type DayMark } from "./MonthCalendar";
import { useApp } from "@/components/providers/Providers";
import { formatDateEs } from "@/lib/dates";

export type ClinicSlot = {
  id: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  /** Ciudad donde el técnico estará disponible para ESTE hueco (puede diferir
   *  de la ciudad de su perfil, `proCity`). */
  city: string | null;
  note: string | null;
  proName: string;
  proCity: string | null;
  proAvatarUrl: string | null;
  proVerified: boolean;
};

/**
 * Calendario de la clínica: ve por mes los días con técnicos disponibles y
 * reserva directamente el hueco del día elegido. Si `canBook` es false (admin
 * en supervisión), muestra los huecos pero no permite reservar.
 */
export function ClinicAvailabilityCalendar({
  slots,
  canBook,
}: {
  slots: ClinicSlot[];
  canBook: boolean;
}) {
  const c = useApp().t.dashboard.cal;
  const slotTime = (s: ClinicSlot) => (s.startTime && s.endTime ? `${s.startTime}–${s.endTime}` : c.avFullDay);

  const marks: Record<string, DayMark> = {};
  for (const s of slots) {
    const existing = marks[s.date];
    if (!existing) marks[s.date] = { count: 1, tone: "brand" };
    else existing.count += 1;
  }

  const first = slots[0]?.date ?? null;
  const [selected, setSelected] = useState<string | null>(first);
  const daySlots = selected ? slots.filter((s) => s.date === selected) : [];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_1fr]">
      <MonthCalendar
        markedDates={marks}
        selectedDate={selected}
        onSelect={setSelected}
        initialMonth={first ?? undefined}
      />

      <div className="rounded-2xl border border-mist-200 bg-white">
        <div className="border-b border-mist-100 p-4 text-sm font-semibold text-ink-900">
          {selected ? `${c.avTechsDay} · ${formatDateEs(selected)}` : c.avTechsDay}
        </div>
        {slots.length === 0 ? (
          <div className="p-6 text-center text-sm text-mist-500">{c.avNoTechsAll}</div>
        ) : !selected || daySlots.length === 0 ? (
          <div className="p-6 text-center text-sm text-mist-500">{c.avNoTechsDay}</div>
        ) : (
          <ul className="divide-y divide-mist-100">
            {daySlots.map((s) => (
              <li key={s.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-ink-900">
                    <Avatar name={s.proName} src={s.proAvatarUrl ?? undefined} size="xs" />
                    {s.proName}
                    {s.proVerified && <VerifiedTag label={c.verified} />}
                  </div>
                  <div className="mt-0.5 text-xs text-mist-500">
                    {slotTime(s)}
                    {(s.city ?? s.proCity) ? ` · ${s.city ?? s.proCity}` : ""}
                    {s.note ? ` · ${s.note}` : ""}
                  </div>
                </div>
                {canBook ? (
                  <BookSlotButton slotId={s.id} proName={s.proName} dateLabel={formatDateEs(s.date)} />
                ) : (
                  <Badge tone="brand">{c.avAvailable}</Badge>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
