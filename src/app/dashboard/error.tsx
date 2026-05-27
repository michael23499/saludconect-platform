"use client";

import { ErrorView } from "@/components/feedback/ErrorView";

/** Error boundary del área de dashboard (clínica/profesional). */
export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorView reset={reset} />;
}
