"use client";

import { Button } from "@/components/ui/Button";
import { useApp } from "@/components/providers/Providers";
import { FeedbackCard } from "@/components/feedback/FeedbackCard";

/**
 * Vista de error reutilizable para los `error.tsx` (global, dashboard, admin).
 * Muestra el mensaje de marca traducido + "Reintentar" (si hay `reset`) y un
 * enlace al inicio de la sección.
 */
export function ErrorView({ reset, homeHref = "/" }: { reset?: () => void; homeHref?: string }) {
  const e = useApp().t.errorPage;
  return (
    <FeedbackCard title={e.title} message={e.message}>
      {reset && <Button onClick={reset}>{e.retry}</Button>}
      <Button href={homeHref} variant="secondary">
        {e.home}
      </Button>
    </FeedbackCard>
  );
}
