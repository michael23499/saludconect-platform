"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { VerifiedTag } from "@/components/ui/VerifiedTag";

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

/** Normaliza para buscar sin tildes ni mayúsculas. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Directorio de profesionales con búsqueda EN VIVO en el cliente: filtra por
 * cualquier coincidencia (nombre, especialidad, ciudad, titular) según se
 * escribe, sin recargar. El servidor entrega la lista pública completa.
 */
export function ProfessionalsDirectory({ pros, canContact }: { pros: PublicPro[]; canContact: boolean }) {
  const [query, setQuery] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    return pros.filter((p) => {
      if (availableOnly && !p.availableForWork) return false;
      if (!q) return true;
      const haystack = norm(
        [p.fullName, p.specialtyName ?? "", p.city ?? "", p.headline ?? ""].join(" "),
      );
      return haystack.includes(q);
    });
  }, [pros, query, availableOnly]);

  return (
    <main className="bg-mist-50">
      <section className="border-b border-mist-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-14">
          <Badge tone="brand">Directorio de profesionales</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 md:text-4xl">
            Encuentra técnicos capilares verificados
          </h1>
          <p className="mt-2 max-w-2xl text-mist-500">
            Explora los profesionales verificados de SaludCoNet. Para contactar o reservar a un técnico necesitas una cuenta de clínica.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-md">
              <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, especialidad o ciudad…"
                autoComplete="off"
                className="h-11 w-full rounded-lg border border-mist-200 bg-white pl-10 pr-4 text-sm text-ink-800 transition placeholder:text-mist-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink-800 select-none">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="h-4 w-4 rounded border-mist-300"
              />
              Solo disponibles
            </label>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-8 md:px-8 md:py-10">
        {!canContact && (
          <div className="mb-6 flex flex-col items-start gap-3 rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-cyan-50 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-brand-500/30 dark:from-brand-500/15 dark:to-cyan-500/10">
            <div className="text-sm text-ink-800 dark:text-slate-100">
              <b>¿Eres una clínica?</b> Inicia sesión o crea tu cuenta para ver el perfil completo, su disponibilidad y reservar.
            </div>
            <div className="flex gap-2">
              <Button href="/login" variant="secondary" size="sm">Iniciar sesión</Button>
              <Button href="/register?rol=clinic" size="sm">Crear cuenta de clínica</Button>
            </div>
          </div>
        )}

        <div className="mb-4 text-sm text-mist-500">
          {filtered.length} {filtered.length === 1 ? "profesional" : "profesionales"}
          {query.trim() ? ` · «${query.trim()}»` : ""}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-mist-300 bg-white p-10 text-center text-sm text-mist-500">
            No encontramos profesionales con esos criterios. Prueba con otra búsqueda.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((pro) => (
              <Link
                key={pro.id}
                href={`/professionals/${pro.id}`}
                className="card-hover flex flex-col rounded-2xl border border-mist-200 bg-white p-5"
              >
                <div className="flex items-start gap-3">
                  <Avatar name={pro.fullName} src={pro.avatarUrl ?? undefined} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate text-sm font-semibold text-ink-900">{pro.fullName}</span>
                      {pro.verified && <VerifiedTag label="Verificado" />}
                    </div>
                    <div className="mt-0.5 text-xs text-mist-500">
                      {pro.specialtyName ?? "Técnico capilar"}
                      {pro.city ? ` · ${pro.city}` : ""}
                    </div>
                  </div>
                  <Badge tone={pro.availableForWork ? "success" : "neutral"}>
                    {pro.availableForWork ? "Disponible" : "Ocupado"}
                  </Badge>
                </div>
                {pro.headline && <p className="mt-3 line-clamp-2 text-sm text-ink-800">{pro.headline}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-mist-500">
                  {pro.yearsExperience != null && <span>{pro.yearsExperience} años exp.</span>}
                  {pro.hourlyRate != null ? (
                    <span className="font-semibold text-brand-700">{pro.hourlyRate} €/h</span>
                  ) : (
                    <span>A convenir</span>
                  )}
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                  Ver perfil
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
