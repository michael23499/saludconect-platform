"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/Providers";
import { useActionToast } from "@/lib/use-action-toast";
import { Spinner } from "@/components/ui/Spinner";
import { ReasonDialog } from "@/components/ui/ReasonDialog";
import { acceptBookingAction, rejectBookingAction } from "@backend/actions/availability";

/**
 * Botones para que el técnico responda a una solicitud de reserva (Fase 2+4):
 * Aceptar (pending → confirmada) o Rechazar. Rechazar pide un MOTIVO (la clínica
 * lo recibe): si publicaste disponibilidad y declinas, merece una explicación.
 * Cada acción avisa a la clínica. El estado de carga se muestra por botón.
 */
export function BookingDecisionButtons({ slotId }: { slotId: string }) {
  const router = useRouter();
  const t = useApp().t;
  const c = t.dashboard.cal;
  const { report } = useActionToast();
  const [pending, startTransition] = useTransition();
  const [acting, setActing] = useState<"accept" | "reject" | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);

  function accept() {
    setActing("accept");
    startTransition(async () => {
      if (report(await acceptBookingAction(slotId), t.toasts.confirmed)) router.refresh();
      else setActing(null);
    });
  }

  function reject(reason: string) {
    setActing("reject");
    startTransition(async () => {
      if (report(await rejectBookingAction(slotId, reason), t.toasts.done)) router.refresh();
      else setActing(null);
      setRejectOpen(false);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => setRejectOpen(true)}
          className="inline-flex h-8 items-center rounded-sm border border-mist-200 bg-white px-3 text-xs font-semibold text-ink-700 transition hover:bg-mist-50 disabled:opacity-60"
        >
          {acting === "reject" ? c.avRejecting : c.avReject}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={accept}
          className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-brand-600 px-3.5 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          {acting === "accept" ? <Spinner size="sm" solid /> : null}
          {acting === "accept" ? c.avAccepting : c.avAccept}
        </button>
      </div>

      <ReasonDialog
        open={rejectOpen}
        title={c.rejectReasonTitle}
        message={c.rejectReasonDesc}
        reasonLabel={c.rejectReasonLabel}
        placeholder={c.rejectReasonPlaceholder}
        confirmLabel={c.avReject}
        cancelLabel={c.dlgCancel}
        tone="danger"
        pending={pending}
        onConfirm={reject}
        onClose={() => setRejectOpen(false)}
      />
    </div>
  );
}
