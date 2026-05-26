"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Stars } from "@/components/ui/Stars";
import { AnimatedCheckbox } from "@/components/ui/AnimatedCheckbox";
import { VerifiedTag } from "@/components/ui/VerifiedTag";
import { useApp } from "@/components/providers/Providers";

type RatingSummary = { average: number; count: number };

export type PublicPro = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  verified: boolean;
  specialtyName: string | null;
  city: string | null;
  availableForWork: boolean;
  headline: string | null;
  yearsExperience: number | null;
  hourlyRate: number | null;
};

export type PublicClinicCard = {
  id: string;
  name: string;
  clinicName: string | null;
  city: string | null;
  avatarUrl: string | null;
  verified: boolean;
  specialties: string[] | null;
  about: string | null;
  website: string | null;
  openSurgeries: number;
};

type Tab = "all" | "pros" | "clinics";

/** Cuántos resultados se muestran por tanda (lazy render al hacer scroll). */
const PAGE = 12;

/** Normaliza para buscar sin tildes ni mayúsculas. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Resalta CADA coincidencia del término de búsqueda dentro de un texto. */
function highlight(text: string, q: string): ReactNode {
  const term = q.trim();
  if (!term) return text;
  const safe = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${safe})`, "ig"));
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    part.toLowerCase() === term.toLowerCase() ? (
      <mark key={i} className="rounded bg-brand-100 px-0.5 text-brand-800 dark:bg-brand-500/30 dark:text-cyan-200">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

/**
 * Directorio público con búsqueda EN VIVO (cliente): técnicos y clínicas.
 * Filtro por tipo, resaltado de coincidencias y LAZY LOAD: renderiza por tandas
 * y carga más al hacer scroll, para no pintar cientos de tarjetas de golpe.
 * Textos vía i18n.
 */
export function ProfessionalsDirectory({
  pros,
  clinics = [],
  ratings = {},
  canContact,
}: {
  pros: PublicPro[];
  clinics?: PublicClinicCard[];
  ratings?: Record<string, RatingSummary>;
  canContact: boolean;
}) {
  const t = useApp().t.directory;
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [visible, setVisible] = useState(PAGE);

  const q = norm(query.trim());

  const filteredPros = useMemo(() => {
    if (tab === "clinics") return [];
    return pros.filter((p) => {
      if (availableOnly && !p.availableForWork) return false;
      if (!q) return true;
      const haystack = norm([p.fullName, p.specialtyName ?? "", p.city ?? "", p.headline ?? ""].join(" "));
      return haystack.includes(q);
    });
  }, [pros, q, availableOnly, tab]);

  const filteredClinics = useMemo(() => {
    if (tab === "pros") return [];
    return clinics.filter((c) => {
      if (!q) return true;
      const haystack = norm(
        [c.clinicName ?? c.name, c.city ?? "", (c.specialties ?? []).join(" "), c.about ?? ""].join(" "),
      );
      return haystack.includes(q);
    });
  }, [clinics, q, tab]);

  // Lista combinada (técnicos primero, luego clínicas) para el lazy render.
  const items = useMemo(
    () => [
      ...filteredPros.map((p) => ({ kind: "pro" as const, pro: p })),
      ...filteredClinics.map((c) => ({ kind: "clinic" as const, clinic: c })),
    ],
    [filteredPros, filteredClinics],
  );
  const total = items.length;

  // Al cambiar la búsqueda o el filtro, volvemos a la primera tanda.
  // Reset puntual ligado al filtro (no cascada): falso positivo de la regla.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(PAGE);
  }, [q, tab, availableOnly]);

  // Infinite scroll: cuando el sentinel entra en viewport, mostramos más.
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setVisible((v) => Math.min(v + PAGE, total));
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [total]);

  const shown = items.slice(0, visible);

  return (
    <main className="bg-mist-50">
      <section className="border-b border-mist-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-14">
          <Badge tone="brand">{t.badge}</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 md:text-4xl">{t.heading}</h1>
          <p className="mt-2 max-w-2xl text-mist-500">{t.sub}</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-md">
              <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                autoComplete="off"
                className="h-11 w-full rounded-lg border border-mist-200 bg-white pl-10 pr-4 text-sm text-ink-800 transition placeholder:text-mist-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            {tab !== "clinics" && (
              <AnimatedCheckbox checked={availableOnly} onCheckedChange={setAvailableOnly} className="items-center">
                {t.onlyAvailable}
              </AnimatedCheckbox>
            )}
          </div>

          {/* Filtro de tipo */}
          <div className="mt-4 inline-flex rounded-lg border border-mist-200 bg-mist-50/60 p-1">
            {(
              [
                ["all", t.tabAll],
                ["pros", t.tabPros],
                ["clinics", t.tabClinics],
              ] as [Tab, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={`rounded-md px-4 py-1.5 text-sm font-semibold transition ${
                  tab === value ? "bg-white text-brand-700 shadow-sm" : "text-mist-500 hover:text-ink-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-8 md:px-8 md:py-10">
        {!canContact && (
          <div className="mb-6 flex flex-col items-start gap-3 rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-cyan-50 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-brand-500/30 dark:from-brand-500/15 dark:to-cyan-500/10">
            <div className="text-sm text-ink-800 dark:text-slate-100">
              <b>{t.clinicCtaQ}</b> {t.clinicCtaText}
            </div>
            <div className="flex gap-2">
              <Button href="/login" variant="secondary" size="sm">{t.login}</Button>
              <Button href="/register?rol=clinic" size="sm">{t.createClinic}</Button>
            </div>
          </div>
        )}

        <div className="mb-4 text-sm text-mist-500">
          {total} {total === 1 ? t.resultOne : t.resultMany}
          {query.trim() ? ` · «${query.trim()}»` : ""}
        </div>

        {total === 0 ? (
          <div className="rounded-2xl border border-dashed border-mist-300 bg-white p-10 text-center text-sm text-mist-500">
            {t.noResults}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((item) =>
                item.kind === "pro" ? renderPro(item.pro) : renderClinic(item.clinic),
              )}
            </div>
            {/* Sentinel para cargar más al hacer scroll */}
            {visible < total && <div ref={sentinelRef} className="h-10" aria-hidden />}
          </>
        )}
      </section>
    </main>
  );

  function renderPro(pro: PublicPro) {
    const rating = ratings[pro.id];
    return (
      <Link
        key={`pro-${pro.id}`}
        href={`/professionals/${pro.id}`}
        className="card-hover flex flex-col rounded-2xl border border-mist-200 bg-white p-5"
      >
        <div className="flex items-start gap-3">
          <Avatar name={pro.fullName} src={pro.avatarUrl ?? undefined} size="md" />
          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-ink-900">{highlight(pro.fullName, query)}</span>
            {pro.verified && (
              <div className="mt-1">
                <VerifiedTag label={t.verified} />
              </div>
            )}
            <div className="mt-0.5 text-xs text-mist-500">
              {highlight(pro.specialtyName ?? t.defaultTechnician, query)}
              {pro.city ? <> · {highlight(pro.city, query)}</> : null}
            </div>
            {rating && rating.count > 0 && (
              <div className="mt-1">
                <Stars value={rating.average} count={rating.count} />
              </div>
            )}
          </div>
          <Badge tone={pro.availableForWork ? "success" : "neutral"}>
            {pro.availableForWork ? t.available : t.busy}
          </Badge>
        </div>
        {pro.headline && <p className="mt-3 line-clamp-2 text-sm text-ink-800">{highlight(pro.headline, query)}</p>}

        {canContact ? (
          <>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-mist-500">
              {pro.yearsExperience != null && <span>{pro.yearsExperience} {t.yearsExp}</span>}
              {pro.hourlyRate != null ? (
                <span className="font-semibold text-brand-700">{pro.hourlyRate} €/h</span>
              ) : (
                <span>{t.rateTBD}</span>
              )}
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
              {t.viewProfile}
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
            </span>
          </>
        ) : (
          <div className="relative mt-4">
            <div className="pointer-events-none absolute -inset-1 rounded-xl bg-gradient-to-r from-brand-400/25 via-cyan-400/20 to-brand-400/25 blur-lg" aria-hidden />
            <div className="relative flex select-none items-center gap-3 blur-[5px]" aria-hidden>
              <span className="text-xs text-mist-500">•• {t.yearsExp}</span>
              <span className="text-xs font-semibold text-brand-700">••• €/h</span>
            </div>
            <span className="relative mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
              {t.lockedHint}
            </span>
          </div>
        )}
      </Link>
    );
  }

  function renderClinic(clinic: PublicClinicCard) {
    const site = clinic.website
      ? clinic.website.startsWith("http")
        ? clinic.website
        : `https://${clinic.website}`
      : null;
    const clinicRating = ratings[clinic.id];
    return (
      <div key={`clinic-${clinic.id}`} className="flex flex-col rounded-2xl border border-mist-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <Avatar name={clinic.clinicName ?? clinic.name} src={clinic.avatarUrl ?? undefined} size="md" />
          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-ink-900">
              {highlight(clinic.clinicName ?? clinic.name, query)}
            </span>
            {clinic.verified && (
              <div className="mt-1">
                <VerifiedTag label={t.verified} />
              </div>
            )}
            <div className="mt-0.5 flex items-center gap-1 text-xs text-mist-500">
              <svg className="h-3.5 w-3.5 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /><path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" /></svg>
              {t.clinicLabel}{clinic.city ? <> · {highlight(clinic.city, query)}</> : null}
            </div>
            {clinicRating && clinicRating.count > 0 && (
              <div className="mt-1">
                <Stars value={clinicRating.average} count={clinicRating.count} />
              </div>
            )}
          </div>
        </div>

        {clinic.about && <p className="mt-3 line-clamp-2 text-sm text-ink-800">{highlight(clinic.about, query)}</p>}

        {clinic.specialties && clinic.specialties.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {clinic.specialties.slice(0, 4).map((s) => (
              <span key={s} className="rounded-md bg-mist-100 px-2 py-0.5 text-[11px] font-medium text-ink-700">
                {highlight(s, query)}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-mist-500">
          {clinic.openSurgeries > 0 && (
            <span className="inline-flex items-center gap-1 font-semibold text-brand-700">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4M16 3v4M4 11h16M9 15l2 2 4-4" /></svg>
              {clinic.openSurgeries} {clinic.openSurgeries === 1 ? t.activeSurgeryOne : t.activeSurgeryMany}
            </span>
          )}
          {site && (
            <a href={site} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 transition hover:text-brand-700">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></svg>
              {t.website}
            </a>
          )}
        </div>
      </div>
    );
  }
}
