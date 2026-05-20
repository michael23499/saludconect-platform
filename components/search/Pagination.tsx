import Link from "next/link";
import { cn } from "@/lib/cn";

type Props = {
  page: number;
  pageCount: number;
  total: number;
  perPage: number;
  buildHref: (p: number) => string;
};

function range(start: number, end: number) {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

function getPageItems(page: number, pageCount: number): Array<number | "..."> {
  if (pageCount <= 7) return range(1, pageCount);
  if (page <= 4) return [...range(1, 5), "...", pageCount];
  if (page >= pageCount - 3) return [1, "...", ...range(pageCount - 4, pageCount)];
  return [1, "...", page - 1, page, page + 1, "...", pageCount];
}

export function Pagination({ page, pageCount, total, perPage, buildHref }: Props) {
  if (pageCount <= 1) return null;
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);
  const items = getPageItems(page, pageCount);

  const navBtn =
    "inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-mist-200 bg-white px-3.5 text-sm font-medium text-ink-800 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700";
  const disabledBtn = "inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-mist-200 bg-mist-50 px-3.5 text-sm font-medium text-mist-400 cursor-not-allowed";

  return (
    <nav className="mt-10 flex flex-col items-center justify-between gap-4 sm:flex-row" aria-label="Paginación">
      <div className="text-xs text-mist-500">
        Mostrando <span className="font-semibold text-ink-900">{start}</span>–
        <span className="font-semibold text-ink-900">{end}</span> de{" "}
        <span className="font-semibold text-ink-900">{total}</span> profesionales
      </div>

      <div className="flex items-center gap-1.5">
        {page > 1 ? (
          <Link href={buildHref(page - 1)} className={navBtn} aria-label="Página anterior" rel="prev">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">Anterior</span>
          </Link>
        ) : (
          <span className={disabledBtn} aria-disabled>
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">Anterior</span>
          </span>
        )}

        <div className="hidden items-center gap-1 sm:flex">
          {items.map((it, idx) =>
            it === "..." ? (
              <span key={`ell-${idx}`} className="inline-flex h-10 w-8 items-center justify-center text-sm text-mist-400">…</span>
            ) : (
              <Link
                key={it}
                href={buildHref(it)}
                aria-current={it === page ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-medium transition",
                  it === page
                    ? "border-brand-600 bg-brand-600 text-white shadow-[0_8px_18px_-8px_rgba(37,99,235,0.6)]"
                    : "border-mist-200 bg-white text-ink-800 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                )}
              >
                {it}
              </Link>
            )
          )}
        </div>

        {/* Mobile compact: "Page X / Y" */}
        <div className="inline-flex h-10 items-center rounded-xl border border-mist-200 bg-white px-3 text-sm font-medium text-ink-800 sm:hidden">
          <span className="font-semibold">{page}</span>
          <span className="mx-1 text-mist-400">/</span>
          <span>{pageCount}</span>
        </div>

        {page < pageCount ? (
          <Link href={buildHref(page + 1)} className={navBtn} aria-label="Página siguiente" rel="next">
            <span className="hidden sm:inline">Siguiente</span>
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        ) : (
          <span className={disabledBtn} aria-disabled>
            <span className="hidden sm:inline">Siguiente</span>
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>
    </nav>
  );
}
