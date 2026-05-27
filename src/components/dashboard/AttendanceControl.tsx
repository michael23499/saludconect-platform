"use client";

import { useState, useTransition } from "react";
import { useApp } from "@/components/providers/Providers";
import { useActionToast } from "@/lib/use-action-toast";
import { Spinner } from "@/components/ui/Spinner";
import { markAttendanceAction } from "@backend/actions/surgeries";

/**
 * Control con el que la clínica marca, tras la cirugía, si un profesional
 * confirmado asistió o no se presentó (no-show). Solo aparece cuando la fecha ya
 * pasó. El no-show penaliza la fiabilidad del profesional.
 */
export function AttendanceControl({
  applicationId,
  initial,
}: {
  applicationId: string;
  initial: boolean | null;
}) {
  const t = useApp().t;
  const r = t.dashboard.reliability;
  const { report } = useActionToast();
  const [attended, setAttended] = useState<boolean | null>(initial);
  const [pending, startTransition] = useTransition();

  function mark(value: boolean) {
    startTransition(async () => {
      if (report(await markAttendanceAction(applicationId, value), t.toasts.attendance)) {
        setAttended(value);
      }
    });
  }

  const base =
    "inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-xs font-semibold transition disabled:opacity-50";
  const attendedCls =
    attended === true
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300"
      : "border-mist-200 bg-white text-ink-700 hover:bg-mist-50";
  const noShowCls =
    attended === false
      ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300"
      : "border-mist-200 bg-white text-ink-700 hover:bg-mist-50";

  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wider text-mist-500">
        {r.attendanceQuestion}
      </span>
      <div className="flex items-center gap-2">
        <button type="button" disabled={pending} aria-pressed={attended === true} onClick={() => mark(true)} className={`${base} ${attendedCls}`}>
          {pending ? <Spinner size="sm" /> : null}
          {r.attended}
        </button>
        <button type="button" disabled={pending} aria-pressed={attended === false} onClick={() => mark(false)} className={`${base} ${noShowCls}`}>
          {r.noShow}
        </button>
      </div>
    </div>
  );
}
