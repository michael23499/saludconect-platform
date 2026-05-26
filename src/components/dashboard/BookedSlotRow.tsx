"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { VerifiedTag } from "@/components/ui/VerifiedTag";
import { ProfessionalDetailModal } from "@/components/dashboard/ProfessionalDetailModal";
import { useApp } from "@/components/providers/Providers";
import { dayMonth, formatDateEs } from "@/lib/dates";

export type BookedSlotRowData = {
  slotId: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  status: "pending" | "booked";
  proId: string;
  proName: string;
  proAvatarUrl: string | null;
  proVerified: boolean;
  proType: "doctor" | "technician";
  specialtyName: string | null;
  proCity: string | null;
  yearsExperience: number | null;
  hourlyRate: number | null;
  bio: string | null;
  ratingAverage: number;
  ratingCount: number;
};

/**
 * Fila de "Tus reservas" (clínica): muestra fecha, técnico y estado, y al
 * pulsarla abre la ficha del profesional en el modal compartido. Distingue
 * visualmente pendiente (ámbar) de confirmada (verde).
 */
export function BookedSlotRow(data: BookedSlotRowData) {
  const c = useApp().t.dashboard.cal;
  const [open, setOpen] = useState(false);
  const { day, mon } = dayMonth(data.date);
  const isPending = data.status === "pending";
  const timeLabel = data.startTime && data.endTime ? `${data.startTime}–${data.endTime}` : c.avFullDay;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-mist-50"
      >
        <div
          className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border ${
            isPending ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"
          }`}
        >
          <div className={`text-base font-semibold leading-none ${isPending ? "text-amber-700" : "text-emerald-700"}`}>{day}</div>
          <div className={`text-[10px] uppercase tracking-wider ${isPending ? "text-amber-600" : "text-emerald-600"}`}>{mon}</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
            <Avatar name={data.proName} src={data.proAvatarUrl ?? undefined} size="xs" />
            {data.proName}
            {data.proVerified && <VerifiedTag label={c.verified} />}
          </div>
          <div className="mt-0.5 text-xs text-mist-500">
            {formatDateEs(data.date)} · {timeLabel}
            {data.proCity ? ` · ${data.proCity}` : ""}
          </div>
        </div>
        <Badge tone={isPending ? "warning" : "success"}>
          {isPending ? c.calPendingConfirm : c.calConfirmedBooking}
        </Badge>
      </button>

      <ProfessionalDetailModal
        open={open}
        onClose={() => setOpen(false)}
        detail={{
          proId: data.proId,
          proName: data.proName,
          proAvatarUrl: data.proAvatarUrl,
          proVerified: data.proVerified,
          proType: data.proType,
          specialtyName: data.specialtyName,
          proCity: data.proCity,
          yearsExperience: data.yearsExperience,
          hourlyRate: data.hourlyRate,
          bio: data.bio,
          ratingAverage: data.ratingAverage,
          ratingCount: data.ratingCount,
        }}
      />
    </>
  );
}
