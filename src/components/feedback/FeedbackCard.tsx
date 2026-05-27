import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";

/**
 * Tarjeta centrada de marca para pantallas de feedback a página completa
 * (error, 404). Presentacional y sin hooks, así sirve tanto en Server como en
 * Client Components.
 */
export function FeedbackCard({
  title,
  message,
  children,
}: {
  title: string;
  message: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-5 py-16">
      <div className="w-full max-w-md rounded-3xl border border-mist-200 bg-white p-8 text-center shadow-[var(--shadow-soft)]">
        <div className="mb-5 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-ink-900">{title}</h1>
        <p className="mt-2 text-sm text-mist-500">{message}</p>
        {children && <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{children}</div>}
      </div>
    </div>
  );
}
