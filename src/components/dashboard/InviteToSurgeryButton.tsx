"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { useActionToast } from "@/lib/use-action-toast";
import { inviteToSurgeryAction } from "@backend/actions/surgeries";

export type InviteSurgeryOption = { id: string; title: string; dateLabel: string };

/**
 * Botón para que una clínica invite a un técnico (desde su ficha pública) a una
 * de sus cirugías abiertas. Si no tiene cirugías abiertas, enlaza a publicar.
 */
export function InviteToSurgeryButton({
  professionalId,
  surgeries,
}: {
  professionalId: string;
  surgeries: InviteSurgeryOption[];
}) {
  const router = useRouter();
  const { report } = useActionToast();
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState("");
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  if (done) return <Badge tone="success">Invitación enviada</Badge>;

  if (surgeries.length === 0) {
    return (
      <a
        href="/dashboard/clinic/publish"
        className="inline-flex h-9 items-center rounded-sm border border-mist-200 bg-white px-3.5 text-sm font-semibold text-ink-800 transition hover:bg-mist-50"
      >
        Publica una cirugía para invitar
      </a>
    );
  }

  function invite() {
    if (!sel) return;
    startTransition(async () => {
      if (report(await inviteToSurgeryAction(sel, professionalId))) {
        setDone(true);
        router.refresh();
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-sm bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        Invitar a una cirugía
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <select
        value={sel}
        onChange={(e) => setSel(e.target.value)}
        className="h-10 rounded-lg border border-mist-200 bg-white px-3 text-sm text-ink-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
      >
        <option value="">Elige una cirugía…</option>
        {surgeries.map((s) => (
          <option key={s.id} value={s.id}>
            {s.title} · {s.dateLabel}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={invite}
          disabled={pending || !sel}
          className="inline-flex h-9 items-center rounded-sm bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "Enviando…" : "Enviar invitación"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex h-9 items-center rounded-sm border border-mist-200 bg-white px-4 text-sm font-semibold text-ink-800 transition hover:bg-mist-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
