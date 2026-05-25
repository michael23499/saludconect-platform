"use client";

import { useState } from "react";

/**
 * Iconito para copiar un correo al portapapeles. Pensado para ir junto al email
 * (incluso dentro de un <Link>): usa role="button" + stopPropagation para no
 * disparar la navegación del enlace contenedor. Feedback breve con un check.
 */
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const copy = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard
      ?.writeText(email)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      })
      .catch(() => {});
  };

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={copy}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") copy(e);
      }}
      aria-label={copied ? "Correo copiado" : "Copiar correo"}
      title={copied ? "¡Copiado!" : "Copiar correo"}
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded transition ${
        copied ? "text-emerald-600 dark:text-emerald-300" : "text-mist-400 hover:bg-mist-100 hover:text-brand-700"
      }`}
    >
      {copied ? (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
      ) : (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
      )}
    </span>
  );
}
