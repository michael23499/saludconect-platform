"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/Providers";
import { addToTeamAction, removeFromTeamAction } from "@backend/actions/team";

/**
 * Botón para que la clínica guarde/quite a un profesional de su equipo de
 * confianza. Toggle optimista con refresh; lo usa la ficha pública del técnico.
 */
export function AddToTeamButton({
  professionalId,
  initialInTeam,
}: {
  professionalId: string;
  initialInTeam: boolean;
}) {
  const m = useApp().t.dashboard.misc;
  const router = useRouter();
  const [inTeam, setInTeam] = useState(initialInTeam);
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const res = inTeam
        ? await removeFromTeamAction(professionalId)
        : await addToTeamAction(professionalId);
      if (!("error" in res)) {
        setInTeam((v) => !v);
        router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={
        inTeam
          ? "inline-flex h-9 items-center gap-1.5 rounded-sm border border-mist-200 bg-white px-4 text-sm font-semibold text-ink-800 transition hover:bg-mist-50 disabled:opacity-60"
          : "inline-flex h-9 items-center gap-1.5 rounded-sm bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      }
    >
      {inTeam ? (
        <>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
          {m.teamInTeam}
        </>
      ) : (
        <>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
          {m.teamAdd}
        </>
      )}
    </button>
  );
}
