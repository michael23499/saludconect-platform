"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Stars } from "@/components/ui/Stars";
import { VerifiedTag } from "@/components/ui/VerifiedTag";
import { ProfessionalDetailModal } from "@/components/dashboard/ProfessionalDetailModal";
import { useApp } from "@/components/providers/Providers";

type Props = {
  proId?: string;
  proName: string;
  proAvatarUrl: string | null;
  proVerified: boolean;
  proType: "doctor" | "technician";
  specialtyName: string | null;
  proCity: string | null;
  yearsExperience: number | null;
  hourlyRate: number | null;
  headline: string | null;
  bio: string | null;
  message: string | null;
  ratingAverage: number;
  ratingCount: number;
};

/**
 * Fila de candidato (técnico postulado) que abre la ficha del profesional en un
 * MODAL, sin salir del detalle de la cirugía. El bloque nombre/avatar/meta es el
 * disparador; el modal en sí es el componente compartido ProfessionalDetailModal
 * (reutilizado también en las reservas de la clínica).
 */
export function ApplicantProfileModal(props: Props) {
  const t = useApp().t.dashboard.surgeries;
  const [open, setOpen] = useState(false);
  const {
    proName,
    proAvatarUrl,
    proVerified,
    proType,
    proCity,
    yearsExperience,
    headline,
    message,
    ratingAverage,
    ratingCount,
  } = props;

  const typeLabel = proType === "doctor" ? t.typeDoctor : t.typeTechnician;
  const meta =
    [headline, yearsExperience ? `${yearsExperience} ${t.yearsExp}` : null, proCity]
      .filter(Boolean)
      .join(" · ") || t.defaultTechnician;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex min-w-0 flex-1 items-start gap-3 text-left"
      >
        <Avatar name={proName} src={proAvatarUrl ?? undefined} size="md" ring="" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-ink-900 transition group-hover:text-brand-700 group-hover:underline">
              {proName}
            </span>
            <Badge tone={proType === "doctor" ? "brand" : "neutral"}>{typeLabel}</Badge>
            {proVerified && <VerifiedTag label={t.verified} />}
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700">
              {t.viewProfile}
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
            </span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-mist-500">
            {ratingCount > 0 && <Stars value={ratingAverage} count={ratingCount} />}
            <span>{meta}</span>
          </div>
          {message && (
            <p className="mt-2 rounded-lg bg-mist-50 px-3 py-2 text-xs text-ink-700">“{message}”</p>
          )}
        </div>
      </button>

      <ProfessionalDetailModal open={open} onClose={() => setOpen(false)} detail={props} />
    </>
  );
}
