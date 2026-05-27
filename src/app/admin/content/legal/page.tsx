import Link from "next/link";
import { PageHeader } from "@/components/dashboard/Shell";
import { getDict } from "@/lib/i18n-server";
import { legalTitle } from "@/lib/legal-defaults";
import { LEGAL_CONTENT } from "@backend/queries/site-content";

export const metadata = { title: "Política y privacidad · SaludCoNet" };

/** Secciones del segmento "Política y privacidad": cada texto legal, editable. */
export default async function LegalSegmentPage() {
  const dict = await getDict();
  const a = dict.adminContent;

  return (
    <>
      <PageHeader
        title={a.legalSegment}
        subtitle={a.legalSegmentDesc}
        backHref="/admin/content"
        backLabel={a.title}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LEGAL_CONTENT.map((c) => (
          <Link
            key={c.key}
            href={`/admin/content/legal/${c.key}`}
            className="card-hover group flex items-center justify-between gap-3 rounded-2xl border border-mist-200 bg-white p-5 transition dark:border-white/10 dark:bg-white/[0.03]"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-ink-900">{legalTitle(c.key, dict)}</div>
              <div className="mt-0.5 text-xs text-mist-500">{a.editTab}</div>
            </div>
            <svg className="h-4 w-4 shrink-0 text-mist-400 transition group-hover:translate-x-0.5 group-hover:text-brand-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        ))}
      </div>
    </>
  );
}
