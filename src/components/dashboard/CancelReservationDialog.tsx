"use client";

import { ReasonDialog } from "@/components/ui/ReasonDialog";
import { useApp } from "@/components/providers/Providers";

/**
 * Diálogo para cancelar una reserva YA CONFIRMADA (una cirugía o una franja de
 * disponibilidad). Preset de ReasonDialog con el texto de "cancelación de
 * compromiso" (aviso de fiabilidad). Usado por ApplyButton y CancelSlotButton.
 */
export function CancelReservationDialog({
  open,
  pending,
  onConfirm,
  onClose,
}: {
  open: boolean;
  pending: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const c = useApp().t.dashboard.cancel;
  return (
    <ReasonDialog
      open={open}
      title={c.title}
      message={c.warning}
      reasonLabel={c.reasonLabel}
      placeholder={c.reasonPlaceholder}
      confirmLabel={c.confirm}
      cancelLabel={c.keep}
      tone="danger"
      pending={pending}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}
