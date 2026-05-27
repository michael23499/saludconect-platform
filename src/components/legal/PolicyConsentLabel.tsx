"use client";

import Link from "next/link";
import { useApp } from "@/components/providers/Providers";

/**
 * Etiqueta del checkbox de aceptación de la Política de Reservas (texto + enlace
 * a /legal/reservations). Se usa dentro de los checkboxes del registro y de
 * complete-profile, que difieren en el wrapper pero comparten esta etiqueta.
 */
export function PolicyConsentLabel() {
  const r = useApp().t.register;
  return (
    <>
      {r.policyConsentPre}
      <Link
        href="/legal/reservations"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
      >
        {r.policyConsentLink}
      </Link>
      {r.policyConsentPost}
    </>
  );
}
