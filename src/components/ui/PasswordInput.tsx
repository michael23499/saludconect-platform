"use client";

import { useState, type ComponentProps } from "react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

/**
 * Campo de contraseña con botón "ojito" para mostrar/ocultar el texto.
 * Acepta los mismos props que <Input> salvo `type` (lo controla el toggle).
 * El botón es type="button" y tabIndex=-1 para no interferir con el envío ni
 * el orden de tabulación del formulario.
 */
export function PasswordInput({ className, ...props }: Omit<ComponentProps<"input">, "type">) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input type={show ? "text" : "password"} className={cn("pr-11", className)} {...props} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        aria-pressed={show}
        tabIndex={-1}
        className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-mist-400 transition hover:text-ink-700"
      >
        {show ? (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M9.9 5.1A9.5 9.5 0 0 1 12 5c5.5 0 9 5.5 9 7 0 .7-.8 2.2-2.2 3.6M6.6 6.6C4 8.1 2.7 10.5 2.7 12c0 1.5 3.5 7 9.3 7 1.6 0 3-.4 4.2-1" />
            <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
            <path d="m3 3 18 18" />
          </svg>
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M2.7 12C2.7 10.5 6 5 12 5s9.3 5.5 9.3 7-3.3 7-9.3 7-9.3-5.5-9.3-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
