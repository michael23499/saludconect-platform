"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useApp } from "@/components/providers/Providers";
import { useActionToast } from "@/lib/use-action-toast";
import { CancelReservationDialog } from "@/components/dashboard/CancelReservationDialog";
import {
  applyToSurgeryAction,
  withdrawApplicationAction,
  type ActionResult,
} from "@backend/actions/surgeries";

type Status = "applied" | "confirmed" | "rejected" | "withdrawn" | null;

/**
 * Botón de postulación del técnico. Refleja el estado actual de su postulación
 * y permite postularse / retirarse. El feedback (error/éxito) va por toast
 * traducido (useActionToast); la verificación real la hace la server action.
 */
export function ApplyButton({
  surgeryId,
  applicationId,
  initialStatus,
}: {
  surgeryId: string;
  applicationId?: string | null;
  initialStatus: Status;
}) {
  const t = useApp().t;
  const s = t.dashboard.surgeries;
  const cx = t.dashboard.cancel;
  const { report } = useActionToast();
  const [status, setStatus] = useState<Status>(initialStatus);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handle(fn: () => Promise<ActionResult>, onOk: () => void, successMsg?: string) {
    startTransition(async () => {
      if (report(await fn(), successMsg)) onOk();
    });
  }

  // Cancelar una reserva CONFIRMADA (con motivo). Cierra el diálogo al terminar.
  function cancelReservation(reason: string) {
    if (!applicationId) return;
    startTransition(async () => {
      if (report(await withdrawApplicationAction(applicationId, reason), t.toasts.cancelled)) {
        setStatus("withdrawn");
      }
      setCancelOpen(false);
    });
  }

  if (status === "confirmed") {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <Badge tone="success">{s.confirmedBadge}</Badge>
          {applicationId && (
            <button
              type="button"
              disabled={pending}
              onClick={() => setCancelOpen(true)}
              className="text-xs font-medium text-mist-500 hover:text-red-600 disabled:opacity-50"
            >
              {cx.proCta}
            </button>
          )}
        </div>
        {applicationId && (
          <CancelReservationDialog
            open={cancelOpen}
            pending={pending}
            onConfirm={cancelReservation}
            onClose={() => setCancelOpen(false)}
          />
        )}
      </div>
    );
  }
  if (status === "rejected") {
    return <Badge tone="neutral">{s.rejectedBadge}</Badge>;
  }
  if (status === "withdrawn") {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          handle(
            () => applyToSurgeryAction(surgeryId),
            () => setStatus("applied"),
            t.toasts.applied,
          )
        }
        className="inline-flex items-center gap-1.5 rounded-sm border border-brand-200 bg-white px-3.5 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-50 disabled:opacity-60"
      >
        {pending ? <Spinner size="sm" /> : null}
        {s.reapplyCta}
      </button>
    );
  }
  if (status === "applied") {
    return (
      <div className="flex items-center gap-2">
        <Badge tone="warning">{s.appliedBadge}</Badge>
        {applicationId && (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              handle(
                () => withdrawApplicationAction(applicationId),
                () => setStatus("withdrawn"),
                t.toasts.withdrawn,
              )
            }
            className="text-xs font-medium text-mist-500 hover:text-red-600 disabled:opacity-50"
          >
            {s.withdraw}
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        handle(
          () => applyToSurgeryAction(surgeryId),
          () => setStatus("applied"),
          t.toasts.applied,
        )
      }
      className="inline-flex items-center gap-1.5 rounded-sm bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? <Spinner size="sm" solid /> : null}
      {s.applyCta}
    </button>
  );
}
