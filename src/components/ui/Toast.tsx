"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Notificación efímera (toast) en la esquina inferior derecha. Se auto-cierra
 * tras `duration` ms. Renderizada en portal para no heredar estilos del
 * contenedor que la dispara.
 */
export function Toast({
  message,
  onClose,
  tone = "success",
  duration = 4500,
}: {
  message: string;
  onClose: () => void;
  tone?: "success" | "error";
  duration?: number;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  if (typeof document === "undefined") return null;

  const icon =
    tone === "success" ? (
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
      </span>
    ) : (
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v5M12 16.5v.5" /><circle cx="12" cy="12" r="9" /></svg>
      </span>
    );

  return createPortal(
    <div
      role="status"
      style={{ zIndex: 200 }}
      className="scale-in fixed bottom-5 right-5 flex max-w-sm items-center gap-3 rounded-xl border border-mist-200 bg-white py-3 pl-3 pr-4 shadow-xl"
    >
      {icon}
      <p className="text-sm text-ink-800">{message}</p>
    </div>,
    document.body,
  );
}
