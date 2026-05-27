"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Toast } from "@/components/ui/Toast";

type Tone = "success" | "error";
type ToastCtx = { toast: (message: string, tone?: Tone) => void };

const Ctx = createContext<ToastCtx | null>(null);

/**
 * Proveedor global de toasts. Cualquier componente cliente puede mostrar un aviso
 * efímero con `useToast().toast(msg, "error"|"success")`. Mantiene UN toast a la
 * vez (el último reemplaza al anterior) para no solaparlos en la esquina.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<{ id: number; message: string; tone: Tone } | null>(null);

  const toast = useCallback((message: string, tone: Tone = "success") => {
    setCurrent({ id: Date.now(), message, tone });
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      {current && (
        <Toast
          key={current.id}
          message={current.message}
          tone={current.tone}
          onClose={() => setCurrent(null)}
        />
      )}
    </Ctx.Provider>
  );
}

/** Devuelve `{ toast }`. Fuera del provider es un no-op (no rompe). */
export function useToast(): ToastCtx {
  return useContext(Ctx) ?? { toast: () => {} };
}
