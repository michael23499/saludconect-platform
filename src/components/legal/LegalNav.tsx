"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

// Hrefs estables (no textuales); las etiquetas vienen del dict por índice y se
// reciben como prop desde el layout (Server Component) que las traduce.
const LINK_HREFS = [
  "/legal/privacy",
  "/legal/legal-notice",
  "/legal/terms",
  "/legal/cookies",
  "/legal/reservations",
];

export function LegalNav({ labels }: { labels: string[] }) {
  const pathname = usePathname();
  return (
    <nav className="mt-4 space-y-1">
      {LINK_HREFS.map((href, i) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? // Página actual: píldora destacada y legible en claro y oscuro
                  // (bg-white→surface y text-brand-700→cian en modo oscuro).
                  "bg-white font-semibold text-brand-700 shadow-[var(--shadow-soft)]"
                : // Resto: hover con un tono que sí se remapea en oscuro
                  // (hover:bg-white se volvía blanco e ilegible).
                  "text-ink-800 hover:bg-mist-100",
            )}
          >
            {labels[i]}
          </Link>
        );
      })}
    </nav>
  );
}
