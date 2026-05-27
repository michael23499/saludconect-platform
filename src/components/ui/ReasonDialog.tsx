"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, Textarea } from "@/components/ui/Input";

/**
 * Diálogo genérico que pide un MOTIVO obligatorio antes de confirmar una acción
 * (cancelar una reserva, rechazar una solicitud…). Encapsula el estado del campo
 * de texto y deshabilita el botón hasta que haya motivo. Sobre ConfirmDialog
 * (con su slot `children`), así que hereda tono/pending/dark-safe. El texto lo
 * pone cada caller (i18n), por eso el componente es agnóstico al contexto.
 */
export function ReasonDialog({
  open,
  title,
  message,
  reasonLabel,
  placeholder,
  confirmLabel,
  cancelLabel,
  tone = "danger",
  pending = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  reasonLabel: string;
  placeholder?: string;
  confirmLabel: string;
  cancelLabel: string;
  tone?: "brand" | "danger";
  pending?: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");

  // Limpia el motivo al cerrar sin confirmar (tras confirmar, el caller suele
  // desmontar el componente al cambiar de estado, así que no queda texto viejo).
  function handleClose() {
    setReason("");
    onClose();
  }

  return (
    <ConfirmDialog
      open={open}
      title={title}
      message={message}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      tone={tone}
      pending={pending}
      confirmDisabled={reason.trim().length === 0}
      onConfirm={() => onConfirm(reason.trim())}
      onClose={handleClose}
    >
      <Field label={reasonLabel}>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder={placeholder}
        />
      </Field>
    </ConfirmDialog>
  );
}
