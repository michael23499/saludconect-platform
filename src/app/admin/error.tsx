"use client";

import { ErrorView } from "@/components/feedback/ErrorView";

/** Error boundary del área de administración. */
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorView reset={reset} homeHref="/admin" />;
}
