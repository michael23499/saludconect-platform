"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Stars } from "@/components/ui/Stars";
import { VerifiedTag } from "@/components/ui/VerifiedTag";
import { ProfessionalDetailModal } from "@/components/dashboard/ProfessionalDetailModal";
import { InviteToSurgeryButton } from "@/components/dashboard/InviteToSurgeryButton";
import { useApp } from "@/components/providers/Providers";
import { removeFromTeamAction } from "@backend/actions/team";

export type TeamCardData = {
  professionalId: string;
  fullName: string;
  avatarUrl: string | null;
  verified: boolean;
  specialtyName: string | null;
  city: string | null;
  proType: "doctor" | "technician" | null;
  headline: string | null;
  bio: string | null;
  yearsExperience: number | null;
  hourlyRate: number | null;
  ratingAverage: number;
  ratingCount: number;
};

type InviteSurgery = { id: string; title: string; dateLabel: string };

/**
 * Equipo de confianza de la clínica: profesionales guardados. Cada fila abre su
 * ficha (modal compartido) y permite invitarlo a una cirugía o quitarlo.
 */
export function TeamList({ members, surgeries }: { members: TeamCardData[]; surgeries: InviteSurgery[] }) {
  const m = useApp().t.dashboard.misc;

  if (members.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-mist-300 bg-white p-10 text-center">
        <p className="text-sm text-mist-500">{m.teamEmptyList}</p>
        <div className="mt-4">
          <Button href="/search" size="sm">{m.teamFindPros}</Button>
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-mist-200 bg-white">
      <div className="border-b border-mist-100 p-5">
        <div className="text-lg font-semibold tracking-tight text-ink-900">{m.teamListTitle}</div>
        <div className="mt-0.5 text-sm text-mist-500">{m.teamListSub}</div>
      </div>
      <ul className="divide-y divide-mist-100">
        {members.map((member) => (
          <TeamCard key={member.professionalId} member={member} surgeries={surgeries} />
        ))}
      </ul>
    </section>
  );
}

function TeamCard({ member, surgeries }: { member: TeamCardData; surgeries: InviteSurgery[] }) {
  const t = useApp().t;
  const m = t.dashboard.misc;
  const s = t.dashboard.surgeries;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const typeLabel = member.proType === "doctor" ? s.typeDoctor : s.typeTechnician;

  function remove() {
    startTransition(async () => {
      await removeFromTeamAction(member.professionalId);
      router.refresh();
    });
  }

  return (
    <li className="flex flex-col gap-3 p-5 md:flex-row md:items-center">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <Avatar name={member.fullName} src={member.avatarUrl ?? undefined} size="md" ring="" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-ink-900 transition group-hover:text-brand-700 group-hover:underline">
              {member.fullName}
            </span>
            <Badge tone={member.proType === "doctor" ? "brand" : "neutral"}>{typeLabel}</Badge>
            {member.verified && <VerifiedTag label={s.verified} />}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-mist-500">
            {member.ratingCount > 0 && <Stars value={member.ratingAverage} count={member.ratingCount} />}
            <span>{[member.specialtyName ?? s.defaultTechnician, member.city].filter(Boolean).join(" · ")}</span>
          </div>
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-2 md:pl-4">
        <InviteToSurgeryButton professionalId={member.professionalId} surgeries={surgeries} />
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          className="rounded-sm border border-mist-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 transition hover:bg-mist-50 disabled:opacity-50"
        >
          {m.teamRemove}
        </button>
      </div>

      <ProfessionalDetailModal
        open={open}
        onClose={() => setOpen(false)}
        detail={{
          proId: member.professionalId,
          proName: member.fullName,
          proAvatarUrl: member.avatarUrl,
          proVerified: member.verified,
          proType: member.proType ?? "technician",
          specialtyName: member.specialtyName,
          proCity: member.city,
          yearsExperience: member.yearsExperience,
          hourlyRate: member.hourlyRate,
          bio: member.bio,
          ratingAverage: member.ratingAverage,
          ratingCount: member.ratingCount,
        }}
      />
    </li>
  );
}
