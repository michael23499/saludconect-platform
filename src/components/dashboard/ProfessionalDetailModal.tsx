"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Stars } from "@/components/ui/Stars";
import { Modal, ModalHeader, ModalBody, ModalFooter, modalBtnSecondary } from "@/components/ui/Modal";
import { useApp } from "@/components/providers/Providers";

export type ProfessionalDetail = {
  /** Id del profesional, para enlazar a su perfil público y disponibilidad. */
  proId?: string;
  proName: string;
  proAvatarUrl: string | null;
  proVerified: boolean;
  proType: "doctor" | "technician";
  specialtyName: string | null;
  proCity: string | null;
  yearsExperience: number | null;
  hourlyRate: number | null;
  bio: string | null;
  /** Mensaje opcional (p. ej. el de la postulación); no aplica a reservas. */
  message?: string | null;
  ratingAverage: number;
  ratingCount: number;
};

/**
 * Modal con la ficha completa de un profesional (verificación, tipo, stats,
 * puntuación, bio y, si aplica, su mensaje). Reutilizable: lo usan el listado de
 * candidatos de una cirugía y el de reservas directas de la clínica. Solo el
 * modal (controlado por `open`); el disparador lo pone cada contexto.
 */
export function ProfessionalDetailModal({
  open,
  onClose,
  detail,
}: {
  open: boolean;
  onClose: () => void;
  detail: ProfessionalDetail;
}) {
  const t = useApp().t.dashboard.surgeries;
  if (!open) return null;

  const {
    proName,
    proAvatarUrl,
    proVerified,
    proType,
    specialtyName,
    proCity,
    yearsExperience,
    hourlyRate,
    bio,
    message,
    ratingAverage,
    ratingCount,
  } = detail;

  const typeLabel = proType === "doctor" ? t.typeDoctor : t.typeTechnician;
  const subtitle = [typeLabel, specialtyName ?? t.defaultTechnician, proCity]
    .filter(Boolean)
    .join(" · ");

  return (
    <Modal onClose={onClose} maxWidth={520} labelledBy="pro-detail-title">
      <ModalHeader
        icon={<Avatar name={proName} src={proAvatarUrl ?? undefined} size="lg" ring="ring-2 ring-white/30" />}
        eyebrow={t.modalApplicant}
        title={proName}
        subtitle={subtitle}
        onClose={onClose}
        titleId="pro-detail-title"
        closeLabel={t.close}
      />
      <ModalBody>
        <div
          className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium ${
            proVerified
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          {proVerified ? (
            <>
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
              </span>
              {t.verifiedFull}
            </>
          ) : (
            <>
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>
              {t.notVerified}
            </>
          )}
        </div>

        {ratingCount > 0 && (
          <div className="flex items-center gap-2">
            <Stars value={ratingAverage} count={ratingCount} size="md" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Stat label={t.modalSpecialty} value={specialtyName ?? t.defaultTechnician} />
          <Stat label={t.modalCity} value={proCity ?? "—"} />
          <Stat
            label={t.modalExperience}
            value={yearsExperience != null ? `${yearsExperience} ${t.yearsExp}` : "—"}
          />
          <Stat
            label={t.modalRate}
            value={hourlyRate != null ? `${hourlyRate} €/h` : t.rateTBD}
            brand
          />
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-mist-500">
            {t.modalAbout}
          </div>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink-800">
            {bio || t.modalNoBio}
          </p>
        </div>

        {message && (
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-mist-500">
              {t.modalMessage}
            </div>
            <p className="mt-1 rounded-lg bg-mist-50 px-3 py-2 text-sm text-ink-700">“{message}”</p>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        {detail.proId && (
          <Link href={`/professionals/${detail.proId}`} className={modalBtnSecondary}>
            {t.viewProfile}
          </Link>
        )}
        <button type="button" className={modalBtnSecondary} onClick={onClose}>
          {t.close}
        </button>
      </ModalFooter>
    </Modal>
  );
}

function Stat({ label, value, brand }: { label: string; value: string; brand?: boolean }) {
  return (
    <div className="rounded-xl border border-mist-200 bg-mist-50/50 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">{label}</div>
      <div className={`mt-0.5 text-sm font-semibold ${brand ? "text-brand-700" : "text-ink-900"}`}>
        {value}
      </div>
    </div>
  );
}
