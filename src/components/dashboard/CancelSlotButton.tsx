"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/Providers";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cancelAvailabilityAction } from "@backend/actions/availability";

/** Botón para que el técnico retire una franja de disponibilidad (Fase 2). */
export function CancelSlotButton({ slotId, booked = false }: { slotId: string; booked?: boolean }) {
  const router = useRouter();
  const c = useApp().t.dashboard.cal;
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function doCancel() {
    setError(null);
    startTransition(async () => {
      const res = await cancelAvailabilityAction(slotId);
      if ("error" in res) setError(res.error);
      else router.refresh();
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
      {error && <span className="ml-2 text-xs text-red-600">{error}</span>}
      <ConfirmDialog
        open={open}
        title={c.cancelTitle}
        message={booked ? c.avCancelBookedConfirm : c.avCancelConfirm}
        confirmLabel={c.avRetire}
        cancelLabel={c.dlgCancel}
        tone="danger"
        pending={pending}
        onConfirm={doCancel}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
