"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useApp } from "@/components/providers/Providers";
import {
  applyToSurgeryAction,
  withdrawApplicationAction,
  type ActionResult,
} from "@backend/actions/surgeries";

type Status = "applied" | "confirmed" | "rejected" | "withdrawn" | null;

/**
 * Botón de postulación del técnico. Refleja el estado actual de su postulación
 * y permite postularse / retirarse. La verificación real (duplicados, cirugía
 * cerrada) la hace la server action; aquí solo damos feedback.
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
  const s = useApp().t.dashboard.surgeries;
  const [status, setStatus] = useState<Status>(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handle(fn: () => Promise<ActionResult>, onOk: () => void) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if ("error" in res) setError(res.error);
      else onOk();
    });
  }

  if (status === "confirmed") {
    return <Badge tone="success">{s.confirmedBadge}</Badge>;
  }
  if (status === "rejected") {
    return <Badge tone="neutral">{s.rejectedBadge}</Badge>;
  }
  if (status === "withdrawn") {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            handle(
              () => applyToSurgeryAction(surgeryId),
              () => setStatus("applied"),
            )
          }
          className="inline-flex items-center gap-1.5 rounded-sm border border-brand-200 bg-white px-3.5 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-50 disabled:opacity-60"
        >
          {pending ? <Spinner size="sm" /> : null}
          {s.reapplyCta}
        </button>
        {error && <span className="text-[11px] text-red-600">{error}</span>}
      </div>
    );
  }
  if (status === "applied") {
    return (
      <div className="flex flex-col items-end gap-1">
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
                )
              }
              className="text-xs font-medium text-mist-500 hover:text-red-600 disabled:opacity-50"
            >
              {s.withdraw}
            </button>
          )}
        </div>
        {error && <span className="text-[11px] text-red-600">{error}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          handle(
            () => applyToSurgeryAction(surgeryId),
            () => setStatus("applied"),
          )
        }
        className="inline-flex items-center gap-1.5 rounded-sm bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? <Spinner size="sm" solid /> : null}
        {s.applyCta}
      </button>
      {error && <span className="text-[11px] text-red-600">{error}</span>}
    </div>
  );
}
