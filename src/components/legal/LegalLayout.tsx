import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { LegalNav } from "@/components/legal/LegalNav";
import { getDict } from "@/lib/i18n-server";

export async function LegalLayout({
  title,
  intro,
  children,
}: {
  title?: string;
  intro?: string;
  children: ReactNode;
}) {
  const t = (await getDict()).legalLayout;
  return (
    <div className="bg-mist-50">
      <div className="mx-auto w-full max-w-7xl px-5 py-14 md:px-8 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Badge tone="brand">{t.center}</Badge>
            <LegalNav labels={t.links} />
          </aside>
          <article className="rounded-3xl border border-mist-200 bg-white p-7 shadow-[var(--shadow-soft)] md:p-12">
            {title && (
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-ink-900 md:text-4xl">{title}</h1>
            )}
            {intro && <p className="mt-3 text-mist-500">{intro}</p>}
            <div className="prose prose-zinc mt-8 max-w-none text-[15.5px] leading-[1.75] text-ink-800 [&_h1]:mb-3 [&_h1]:text-balance [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-ink-900 md:[&_h1]:text-4xl [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-ink-900 [&_p]:mb-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1.5 [&_a]:text-brand-700 [&_a]:underline dark:[&_h1]:text-[#eef2f8] dark:[&_h2]:text-[#eef2f8] dark:[&_strong]:text-[#eef2f8] dark:[&_a]:text-[#67e8f9]">
              {children}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
