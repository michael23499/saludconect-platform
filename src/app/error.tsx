"use client";

import { ErrorView } from "@/components/feedback/ErrorView";

/** Error boundary global (se renderiza dentro del layout, con Providers). */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorView reset={reset} />;
}
