"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useApp } from "@/components/providers/Providers";
import { useActionToast } from "@/lib/use-action-toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  confirmApplicationAction,
  rejectApplicationAction,
  unconfirmApplicationAction,
  type ActionResult,
} from "@backend/actions/surgeries";

type Status = "applied" | "confirmed" | "rejected" | "withdrawn";

/**
 * Acciones de la clínica sobre un candidato. `canConfirm` se apaga cuando ya no
 * quedan plazas (la action lo revalida igualmente en servidor). El feedback va
 * por toast traducido. Como admin (soporte), confirma con un diálogo propio.
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
  const t = useApp().t;
  const s = t.dashboard.surgeries;
  const { report } = useActionToast();
  const [status, setStatus] = useState<Status>(initialStatus);
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState<{
    fn: () => Promise<ActionResult>;
    next: Status;
    successMsg?: string;
  } | null>(null);

  function run(fn: () => Promise<ActionResult>, next: Status, successMsg?: string) {
    startTransition(async () => {
      if (report(await fn(), successMsg)) setStatus(next);
    });
  }

  function handle(fn: () => Promise<ActionResult>, next: Status, successMsg?: string) {
    if (asAdmin) setConfirm({ fn, next, successMsg });
    else run(fn, next, successMsg);
  }

  const adminDialog = (
    <ConfirmDialog
      open={!!confirm}
      title={s.adminActionTitle}
      message={s.adminConfirmAction}
      confirmLabel={s.confirm}
      cancelLabel={s.cancel}
      pending={pending}
      onConfirm={() => {
        if (confirm) run(confirm.fn, confirm.next, confirm.successMsg);
        setConfirm(null);
      }}
      onClose={() => setConfirm(null)}
    />
  );

  if (status === "confirmed")
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <Badge tone="success">{s.confirmedBadge}</Badge>
          <button
            type="button"
            disabled={pending}
            onClick={() => handle(() => unconfirmApplicationAction(applicationId), "applied", t.toasts.done)}
            className="rounded-sm border border-mist-200 px-2.5 py-1 text-xs font-medium text-ink-700 transition hover:bg-mist-50 disabled:opacity-50"
          >
            {s.unconfirm}
          </button>
        </div>
        {adminDialog}
      </div>
    );
  if (status === "rejected") return <Badge tone="neutral">{s.discardedBadge}</Badge>;
  if (status === "withdrawn") return <Badge tone="neutral">{s.withdrewBadge}</Badge>;

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => handle(() => rejectApplicationAction(applicationId), "rejected", t.toasts.done)}
          className="rounded-sm border border-mist-200 px-3 py-1.5 text-xs font-medium text-ink-800 transition hover:bg-mist-50 disabled:opacity-50"
        >
          {s.discard}
        </button>
        <button
          type="button"
          disabled={pending || !canConfirm}
          title={!canConfirm ? s.noSpots : undefined}
          onClick={() => handle(() => confirmApplicationAction(applicationId), "confirmed", t.toasts.confirmed)}
          className="inline-flex items-center gap-1.5 rounded-sm bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:opacity-40"
        >
          {pending ? <Spinner size="sm" solid /> : null}
          {s.confirm}
        </button>
      </div>
      {adminDialog}
    </div>
  );
}
