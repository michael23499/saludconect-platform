"use client";

import Link from "next/link";
import { useApp } from "@/components/providers/Providers";

/**
 * Cintillo que avisa al admin de que está viendo la actividad global de la
 * plataforma, reutilizando los paneles de clínica/profesional. El mensaje se
 * adapta al lado en el que está (`scope`): en clínica puede intervenir (editar
 * cirugías, gestionar candidatos); en profesional es vista de supervisión.
 * Incluye un atajo de vuelta al panel admin (el admin sale de su propia área
 * al entrar aquí y, si no, se queda "atrapado" en el menú de clínica/profesional).
 */
export function SupervisionBanner({ scope = "clinic" }: { scope?: "clinic" | "professional" }) {
  const s = useApp().t.dashboard.surgeries;
  const message = scope === "professional" ? s.supProfessional : s.supClinic;
  return (
    <div className="mb-5 flex flex-col gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between dark:border-amber-400/30 dark:text-amber-100">
      <span className="flex items-start gap-2.5">
        <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
        <span><b>{s.supAdminMode}</b> {message}</span>
      </span>
      <Link
        href="/admin"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-amber-300 bg-white/70 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-white dark:border-amber-400/40 dark:bg-white/10 dark:text-amber-100 dark:hover:bg-white/15"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        {s.supPanelAdmin}
      </Link>
    </div>
  );
}
