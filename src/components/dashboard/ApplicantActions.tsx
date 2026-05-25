"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useApp } from "@/components/providers/Providers";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  confirmApplicationAction,
  rejectApplicationAction,
  type ActionResult,
} from "@backend/actions/surgeries";

type Status = "applied" | "confirmed" | "rejected" | "withdrawn";

/**
 * Acciones de la clínica sobre un candidato. `canConfirm` se apaga cuando ya no
 * quedan plazas (la action lo revalida igualmente en servidor). Cuando lo usa un
 * admin (intervención de soporte), confirma con un diálogo propio.
 */
export function ApplicantActions({
  applicationId,
  initialStatus,
  canConfirm,
  asAdmin = false,
}: {
  applicationId: string;
  initialStatus: Status;
  canConfirm: boolean;
  asAdmin?: boolean;
}) {
  const s = useApp().t.dashboard.surgeries;
  const [status, setStatus] = useState<Status>(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState<{ fn: () => Promise<ActionResult>; next: Status } | null>(null);

  function run(fn: () => Promise<ActionResult>, next: Status) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if ("error" in res) setError(res.error);
      else setStatus(next);
    });
  }

  function handle(fn: () => Promise<ActionResult>, next: Status) {
    if (asAdmin) setConfirm({ fn, next });
    else run(fn, next);
  }

  if (status === "confirmed") return <Badge tone="success">{s.confirmedBadge}</Badge>;
  if (status === "rejected") return <Badge tone="neutral">{s.discardedBadge}</Badge>;
  if (status === "withdrawn") return <Badge tone="neutral">{s.withdrewBadge}</Badge>;

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => handle(() => rejectApplicationAction(applicationId), "rejected")}
          className="rounded-sm border border-mist-200 px-3 py-1.5 text-xs font-medium text-ink-800 transition hover:bg-mist-50 disabled:opacity-50"
        >
          {s.discard}
        </button>
        <button
          type="button"
          disabled={pending || !canConfirm}
          title={!canConfirm ? s.noSpots : undefined}
          onClick={() => handle(() => confirmApplicationAction(applicationId), "confirmed")}
          className="inline-flex items-center gap-1.5 rounded-sm bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:opacity-40"
        >
          {pending ? <Spinner size="sm" solid /> : null}
          {s.confirm}
        </button>
      </div>
      {error && <span className="text-[11px] text-red-600">{error}</span>}
      <ConfirmDialog
        open={!!confirm}
        title={s.adminActionTitle}
        message={s.adminConfirmAction}
        confirmLabel={s.confirm}
        cancelLabel={s.cancel}
        pending={pending}
        onConfirm={() => {
          if (confirm) run(confirm.fn, confirm.next);
          setConfirm(null);
        }}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
}
