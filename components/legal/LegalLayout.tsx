import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";

const LINKS = [
  { href: "/legal/privacidad", label: "Política de privacidad" },
  { href: "/legal/aviso", label: "Aviso legal" },
  { href: "/legal/terminos", label: "Términos y condiciones" },
  { href: "/legal/cookies", label: "Política de cookies" },
];

export function LegalLayout({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-mist-50">
      <div className="mx-auto w-full max-w-7xl px-5 py-14 md:px-8 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Badge tone="brand">Centro legal</Badge>
            <nav className="mt-4 space-y-1">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink-800 hover:bg-white"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <p className="mt-6 text-xs text-mist-500">
              Última revisión: <span className="font-semibold text-ink-800">{updated}</span>
            </p>
          </aside>
          <article className="rounded-3xl border border-mist-200 bg-white p-7 shadow-[var(--shadow-soft)] md:p-12">
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-ink-900 md:text-4xl">{title}</h1>
            {intro && <p className="mt-3 text-mist-500">{intro}</p>}
            <div className="prose prose-zinc mt-8 max-w-none text-[15.5px] leading-[1.75] text-ink-800 [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-ink-900 [&_p]:mb-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1.5 [&_a]:text-brand-700 [&_a]:underline">
              {children}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
