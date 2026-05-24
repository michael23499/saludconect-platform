"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Shell de modal de alta calidad. Se renderiza en un PORTAL a document.body,
 * lo que evita heredar estilos del contenedor donde se dispara (p.ej. una
 * celda de tabla con text-align). Maneja backdrop, cierre con Escape/click
 * fuera y bloqueo de scroll. El contenido (header/body/footer) lo arma el
 * modal concreto con `ModalHeader`/`ModalBody`/`ModalFooter` para un ritmo
 * de espaciado consistente.
 */
export function Modal({
  onClose,
  children,
  maxWidth = 480,
  labelledBy,
}: {
  onClose: () => void;
  children: ReactNode;
  maxWidth?: number;
  labelledBy?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  // El modal solo se monta tras una interacción (cliente); en SSR no se renderiza.
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center p-4 text-left" style={{ zIndex: 100 }}>
      <div className="modal-backdrop absolute inset-0" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="scale-in relative w-full overflow-hidden rounded-2xl bg-white shadow-2xl"
        style={{ maxWidth }}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

/** Cabecera de marca (navy) con icono/avatar a la izquierda y botón de cerrar. */
export function ModalHeader({
  icon,
  eyebrow,
  title,
  subtitle,
  onClose,
  titleId,
  closeLabel = "Cerrar",
}: {
  icon: ReactNode;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  titleId?: string;
  closeLabel?: string;
}) {
  return (
    <div className="flex items-center gap-4 bg-brand-600 px-6 py-6 text-white">
      <span className="flex shrink-0 items-center justify-center">{icon}</span>
      <div className="min-w-0 flex-1">
        {eyebrow && <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">{eyebrow}</div>}
        <div id={titleId} className="truncate text-base font-semibold leading-snug">{title}</div>
        {subtitle && <div className="mt-1 truncate text-[13px] leading-snug text-white/75">{subtitle}</div>}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M18 6l-12 12" /></svg>
      </button>
    </div>
  );
}

export function ModalBody({ children }: { children: ReactNode }) {
  return <div className="space-y-5 px-6 py-6">{children}</div>;
}

export function ModalFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-2.5 border-t border-mist-100 px-6 py-4">
      {children}
    </div>
  );
}

/** Campo de formulario: label + control con ritmo consistente. */
export function ModalField({ label, htmlFor, hint, children }: { label: string; htmlFor?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-ink-800">{label}</label>
      {children}
      {hint && <p className="mt-2 text-xs text-mist-500">{hint}</p>}
    </div>
  );
}

/** Clases compartidas para inputs y botones del sistema de modales. */
export const modalInputCls =
  "h-11 w-full rounded-sm border border-mist-200 bg-white px-3.5 text-sm text-ink-900 outline-none transition placeholder:text-mist-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15";

export const modalBtnPrimary =
  "inline-flex h-10 items-center justify-center rounded-sm bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50";

export const modalBtnSecondary =
  "inline-flex h-10 items-center justify-center rounded-sm border border-mist-200 bg-white px-4 text-sm font-semibold text-ink-800 transition hover:bg-mist-50";
