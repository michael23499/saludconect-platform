"use client";

import type { ReactNode } from "react";
import { Modal, ModalFooter, modalBtnSecondary } from "@/components/ui/Modal";

/**
 * Diálogo de confirmación reutilizable (sustituye al feo window.confirm nativo).
 * Controlado: el padre maneja `open` y ejecuta la acción en `onConfirm`.
 * `tone` cambia el color del botón principal (brand = acción normal, danger =
 * destructiva). Dark-safe vía el Modal del proyecto.
 *
 * `children` (opcional) se renderiza bajo el mensaje: úsalo para contenido extra
 * como un campo de motivo. `confirmDisabled` bloquea el botón principal (p.ej.
 * hasta que se rellene ese motivo) sin tocar el resto del flujo.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancelar",
  tone = "brand",
  pending = false,
  confirmDisabled = false,
  children,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "brand" | "danger";
  pending?: boolean;
  confirmDisabled?: boolean;
  children?: ReactNode;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  const confirmCls =
    tone === "danger"
      ? "inline-flex h-10 items-center justify-center rounded-sm bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
      : "inline-flex h-10 items-center justify-center rounded-sm bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50";

  const iconWrap =
    tone === "danger"
      ? "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300"
      : "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-cyan-300";

  return (
    <Modal onClose={onClose} maxWidth={420} labelledBy="confirm-dialog-title">
      <div className="px-6 pt-6">
        <div className="flex items-start gap-3.5">
          <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconWrap}`}>
            {tone === "danger" ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><path d="M12 9v4M12 17h.01" /></svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>
            )}
          </span>
          <div className="min-w-0">
            <h2 id="confirm-dialog-title" className="text-base font-semibold text-ink-900">{title}</h2>
            <p className="mt-1 text-sm text-mist-500">{message}</p>
          </div>
        </div>
        {children && <div className="mt-4">{children}</div>}
      </div>
      <ModalFooter>
        <button type="button" onClick={onClose} disabled={pending} className={modalBtnSecondary}>{cancelLabel}</button>
        <button type="button" onClick={onConfirm} disabled={pending || confirmDisabled} className={confirmCls}>{confirmLabel}</button>
      </ModalFooter>
    </Modal>
  );
}
