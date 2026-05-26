"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useApp } from "@/components/providers/Providers";
import { RegisterFormProvider } from "@/components/register/RegisterFormContext";
import { cn } from "@/lib/cn";

type Role = "clinic" | "professional" | null;

export function RegisterShell({
  initialRole,
  emptyState,
  formClinica,
  formProfesional,
  footer,
}: {
  initialRole: Role;
  emptyState: ReactNode;
  formClinica: ReactNode;
  formProfesional: ReactNode;
  footer: ReactNode;
}) {
  const router = useRouter();
  const { t } = useApp();
  const r = t.register;
  const [role, setRole] = useState<Role>(initialRole);

  const select = (next: Exclude<Role, null>) => {
    if (next === role) return;
    setRole(next);
    router.replace(`/register?rol=${next}`, { scroll: false });
  };

  // Beneficios distintos según quién se registra (sin selección, clínica o
  // profesional). Todo el texto viene del diccionario i18n.
  const copy =
    role === "clinic"
      ? { pre: r.cTitlePre, hi: r.cTitleHi, suf: r.cTitleSuf, subtitle: r.cSubtitle, bullets: [r.cB1, r.cB2, r.cB3, r.cB4] }
      : role === "professional"
        ? { pre: r.pTitlePre, hi: r.pTitleHi, suf: r.pTitleSuf, subtitle: r.pSubtitle, bullets: [r.pB1, r.pB2, r.pB3, r.pB4] }
        : { pre: r.dTitlePre, hi: r.dTitleHi, suf: r.dTitleSuf, subtitle: r.dSubtitle, bullets: [r.dB1, r.dB2, r.dB3] };

  return (
    <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.05fr_1.4fr] md:px-8 md:py-16">
      <aside className="md:sticky md:top-24 md:self-start">
        {/* El logo ya vive en el navbar global; aquí lo omitimos para no duplicarlo. */}
        {/* key fuerza el re-montaje al cambiar de rol → reanima el bloque */}
        <div key={role ?? "default"} className="scale-in">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-ink-900 md:text-4xl">
            {copy.pre}
            <span className="text-gradient-brand">{copy.hi}</span>
            {copy.suf}
          </h1>
          <p className="mt-4 text-mist-500">{copy.subtitle}</p>
          <ul className="mt-8 space-y-3">
            {copy.bullets.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-[15px] text-ink-800">
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-brand-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  aria-hidden
                >
                  <path d="M5 12l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {b}
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-10 text-sm text-mist-500">
          {r.already}{" "}
          <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-800">
            {r.signIn}
          </Link>
        </p>
      </aside>

      <div className="rounded-3xl border border-mist-200 bg-white p-6 shadow-[var(--shadow-card)] md:p-10">
        <div className="relative grid grid-cols-2 rounded-2xl bg-mist-100 p-1">
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-xl bg-white shadow-sm transition-all duration-300 ease-[cubic-bezier(.34,1.56,.64,1)]",
              role === "professional" ? "left-1/2" : "left-1",
              role === null && "opacity-0"
            )}
          />
          <button
            type="button"
            onClick={() => select("clinic")}
            className={cn(
              "relative z-10 rounded-xl px-4 py-3 text-center text-sm transition-colors duration-200",
              role === "clinic"
                ? "font-semibold text-ink-900"
                : "font-medium text-mist-500 hover:text-ink-800"
            )}
          >
            {r.tabClinic}
          </button>
          <button
            type="button"
            onClick={() => select("professional")}
            className={cn(
              "relative z-10 rounded-xl px-4 py-3 text-center text-sm transition-colors duration-200",
              role === "professional"
                ? "font-semibold text-ink-900"
                : "font-medium text-mist-500 hover:text-ink-800"
            )}
          >
            {r.tabPro}
          </button>
        </div>

        {/* El provider va por FUERA del div con `key`: este se re-monta al
            cambiar de rol (reanima), pero los valores escritos persisten. */}
        <RegisterFormProvider>
          <div key={role ?? "empty"} className="scale-in">
            {role === null && emptyState}
            {role === "clinic" && formClinica}
            {role === "professional" && formProfesional}
          </div>
        </RegisterFormProvider>

        {footer}
      </div>
    </div>
  );
}
