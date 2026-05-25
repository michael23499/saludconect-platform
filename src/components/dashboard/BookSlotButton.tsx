"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/Providers";
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
  const c = useApp().t.dashboard.cal;
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function doBook() {
    setError(null);
    startTransition(async () => {
      const res = await bookSlotAction(slotId);
      if ("error" in res) setError(res.error);
      else router.refresh();
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
      {error && <span className="text-xs text-red-600">{error}</span>}
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
