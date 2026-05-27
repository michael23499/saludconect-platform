"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/Providers";
import { useActionToast } from "@/lib/use-action-toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { bookSlotAction } from "@backend/actions/availability";

/**
 * Botón para que la clínica reserve directamente la franja de un técnico
 * (Fase 2). Pide confirmación con un diálogo propio y, al reservar, la action
 * avisa al técnico.
 */
export function BookSlotButton({
  slotId,
  proName,
  dateLabel,
}: {
  slotId: string;
  proName: string;
  dateLabel: string;
}) {
  const router = useRouter();
  const t = useApp().t;
  const c = t.dashboard.cal;
  const { report } = useActionToast();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function doBook() {
    startTransition(async () => {
      if (report(await bookSlotAction(slotId), t.toasts.booked)) router.refresh();
      setOpen(false);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={pending}
        className="inline-flex h-9 items-center gap-2 rounded-sm bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? c.avBooking : c.avBook}
      </button>
      <ConfirmDialog
        open={open}
        title={c.bookTitle}
        message={`${c.avBookConfirmPre} ${proName} (${dateLabel})? ${c.avBookConfirmPost}`}
        confirmLabel={c.avBook}
        cancelLabel={c.dlgCancel}
        pending={pending}
        onConfirm={doBook}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
