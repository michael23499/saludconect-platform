import Link from "next/link";
import { PageHeader } from "@/components/dashboard/Shell";
import { getDict } from "@/lib/i18n-server";
import { LEGAL_CONTENT } from "@backend/queries/site-content";

export const metadata = { title: "Contenido editable · SaludCoNet" };

/**
 * Índice de "Contenido editable": SEGMENTOS de contenido editable. Hoy hay uno
 * (Política y privacidad) que agrupa los textos legales; cada segmento abre su
 * propia lista de secciones. Pensado para añadir más segmentos en el futuro.
 */
export default async function AdminContentIndex() {
  const dict = await getDict();
  const a = dict.adminContent;

  const segments = [
    {
      href: "/admin/content/legal",
      title: a.legalSegment,
      desc: a.legalSegmentDesc,
      count: `${LEGAL_CONTENT.length} ${a.sections}`,
    },
  ];

  return (
    <>
      <PageHeader title={a.title} subtitle={a.subtitle} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {segments.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="card-hover group flex items-start justify-between gap-3 rounded-2xl border border-mist-200 bg-white p-5 transition dark:border-white/10 dark:bg-white/[0.03]"
          >
            <div className="min-w-0">
              <div className="text-sm font-semibold text-ink-900">{s.title}</div>
              <div className="mt-0.5 text-xs text-mist-500">{s.desc}</div>
              <div className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-brand-700 dark:text-cyan-300">
                {s.count}
              </div>
            </div>
            <svg className="mt-1 h-4 w-4 shrink-0 text-mist-400 transition group-hover:translate-x-0.5 group-hover:text-brand-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        ))}
      </div>
    </>
  );
}
