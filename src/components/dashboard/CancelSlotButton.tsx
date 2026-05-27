"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/Providers";
import { useActionToast } from "@/lib/use-action-toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CancelReservationDialog } from "@/components/dashboard/CancelReservationDialog";
import { cancelAvailabilityAction } from "@backend/actions/availability";

/**
 * Botón para que el técnico retire una franja de disponibilidad (Fase 2). Si la
 * franja está reservada EN FIRME (`booked`), cancelar es romper un compromiso:
 * abre el diálogo con motivo + aviso de fiabilidad. Si solo está libre, basta un
 * confirm simple sin consecuencias.
 */
export function CancelSlotButton({ slotId, booked = false }: { slotId: string; booked?: boolean }) {
  const router = useRouter();
  const t = useApp().t;
  const c = t.dashboard.cal;
  const { report } = useActionToast();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function doCancel(reason?: string) {
    startTransition(async () => {
      if (report(await cancelAvailabilityAction(slotId, reason), t.toasts.cancelled)) {
        router.refresh();
      }
      setOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={pending}
        className="inline-flex h-8 items-center rounded-lg border border-mist-200 bg-white px-3 text-xs font-semibold text-ink-700 transition hover:bg-mist-50 disabled:opacity-60"
      >
        {pending ? c.avRetiring : c.avRetire}
      </button>
      {booked ? (
        <CancelReservationDialog
          open={open}
          pending={pending}
          onConfirm={(reason) => doCancel(reason)}
          onClose={() => setOpen(false)}
        />
      ) : (
        <ConfirmDialog
          open={open}
          title={c.cancelTitle}
          message={c.avCancelConfirm}
          confirmLabel={c.avRetire}
          cancelLabel={c.dlgCancel}
          tone="danger"
          pending={pending}
          onConfirm={() => doCancel()}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
