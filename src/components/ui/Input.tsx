import { cn } from "@/lib/cn";
import type { ComponentProps, ReactNode } from "react";

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      {label && <span className="mb-1.5 block text-sm font-medium text-ink-800">{label}</span>}
      {children}
      {hint && !error && <span className="mt-1.5 block text-xs text-mist-500">{hint}</span>}
      {error && <span className="mt-1.5 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

// `suppressHydrationWarning`: los gestores de contraseñas / extensiones del
// navegador inyectan atributos (data-*, autocomplete, iconos) en los campos
// de formulario ANTES de que React hidrate, lo que dispara un warning de
// mismatch inofensivo. Suprimirlo en los inputs es la práctica recomendada
// por Next.js para este caso (el valor lo sigue controlando React igual).
export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      suppressHydrationWarning
      className={cn(
        "w-full h-11 rounded-xl border border-mist-200 bg-white px-4 text-[15px] text-ink-900 placeholder:text-mist-400",
        "focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none transition",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      suppressHydrationWarning
      className={cn(
        "w-full min-h-28 rounded-xl border border-mist-200 bg-white px-4 py-3 text-[15px] text-ink-900 placeholder:text-mist-400",
        "focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none transition resize-y",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select
      suppressHydrationWarning
      className={cn(
        "w-full h-11 rounded-xl border border-mist-200 bg-white px-3 text-[15px] text-ink-900",
        "focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none transition",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Checkbox({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      type="checkbox"
      suppressHydrationWarning
      className={cn(
        "h-4 w-4 rounded border-mist-300 text-brand-600 focus:ring-brand-500",
        className
      )}
      {...props}
    />
  );
}
