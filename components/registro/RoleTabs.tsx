"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Role = "clinica" | "profesional" | null;

export function RoleTabs({
  initialRole,
  emptyState,
  formClinica,
  formProfesional,
}: {
  initialRole: Role;
  emptyState: ReactNode;
  formClinica: ReactNode;
  formProfesional: ReactNode;
}) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(initialRole);

  const select = (next: Exclude<Role, null>) => {
    if (next === role) return;
    setRole(next);
    router.replace(`/registro?rol=${next}`, { scroll: false });
  };

  return (
    <>
      <div className="relative grid grid-cols-2 rounded-2xl bg-mist-100 p-1">
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-xl bg-white shadow-sm transition-all duration-300 ease-[cubic-bezier(.34,1.56,.64,1)]",
            role === "profesional" ? "left-1/2" : "left-1",
            role === null && "opacity-0"
          )}
        />
        <button
          type="button"
          onClick={() => select("clinica")}
          className={cn(
            "relative z-10 rounded-xl px-4 py-3 text-center text-sm transition-colors duration-200",
            role === "clinica"
              ? "font-semibold text-ink-900"
              : "font-medium text-mist-500 hover:text-ink-800"
          )}
        >
          Soy una clínica
        </button>
        <button
          type="button"
          onClick={() => select("profesional")}
          className={cn(
            "relative z-10 rounded-xl px-4 py-3 text-center text-sm transition-colors duration-200",
            role === "profesional"
              ? "font-semibold text-ink-900"
              : "font-medium text-mist-500 hover:text-ink-800"
          )}
        >
          Soy un profesional sanitario
        </button>
      </div>

      <div key={role ?? "empty"} className="scale-in">
        {role === null && emptyState}
        {role === "clinica" && formClinica}
        {role === "profesional" && formProfesional}
      </div>
    </>
  );
}
