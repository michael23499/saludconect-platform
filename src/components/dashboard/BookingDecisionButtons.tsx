"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/Providers";
import { Spinner } from "@/components/ui/Spinner";
import { acceptBookingAction, rejectBookingAction } from "@backend/actions/availability";

/**
 * Botones para que el técnico responda a una solicitud de reserva (Fase 2+4):
 * Aceptar (pending → confirmada) o Rechazar (vuelve a quedar libre). Cada acción
 * avisa a la clínica. El estado de carga se muestra por botón.
 */
export function BookingDecisionButtons({ slotId }: { slotId: string }) {
  const router = useRouter();
  const c = useApp().t.dashboard.cal;
  const [pending, startTransition] = useTransition();
  const [acting, setActing] = useState<"accept" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(kind: "accept" | "reject") {
    setError(null);
    setActing(kind);
    startTransition(async () => {
      const res = kind === "accept"
        ? await acceptBookingAction(slotId)
        : await rejectBookingAction(slotId);
      if ("error" in res) {
        setError(res.error);
        setActing(null);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => run("reject")}
          className="inline-flex h-8 items-center rounded-sm border border-mist-200 bg-white px-3 text-xs font-semibold text-ink-700 transition hover:bg-mist-50 disabled:opacity-60"
        >
          {acting === "reject" ? c.avRejecting : c.avReject}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run("accept")}
          className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-brand-600 px-3.5 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          {acting === "accept" ? <Spinner size="sm" solid /> : null}
          {acting === "accept" ? c.avAccepting : c.avAccept}
        </button>
      </div>
      {error && <span className="text-[11px] text-red-600">{error}</span>}
    </div>
  );
}
