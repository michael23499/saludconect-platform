"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useCallback } from "react";
import { cn } from "@/lib/cn";

const COPY = {
  es: {
    advanced: "Filtros avanzados",
    availability: "Disponibilidad",
    all: "Todos",
    available: "Disponible",
    busy: "Ocupado",
    reputation: "Nivel de reputación",
    any: "Cualquiera",
    rising: "Rising Star o superior",
    trusted: "Trusted o superior",
    top: "Top Rated o superior",
    expert: "Solo Expert / Elite",
    experience: "Experiencia mínima",
    exp3: "+ 3 años",
    exp5: "+ 5 años",
    exp10: "+ 10 años",
    rate: "Rango de tarifa",
    rate1: "€  Entry",
    rate2: "€€  Consolidado",
    rate3: "€€€  Senior",
    rate4: "€€€€  Premium",
    extras: "Extras",
    onlyVerified: "Solo verificados",
    only45: "Solo 4,5★ o más",
    waitlist: "Lista de espera",
    waitlistDesc: "¿No encuentras lo que necesitas? Avísanos y te conectamos.",
    waitlistCta: "Apuntarme",
  },
};

type Props = {
  initial: {
    disp?: string;
    nivel?: string;
    expmin?: string;
    tarifa?: string;
    verificado?: string;
    rating?: string;
  };
};

const NIVEL_OPTIONS = [
  { value: "", label: "any" as const },
  { value: "rising", label: "rising" as const },
  { value: "trusted", label: "trusted" as const },
  { value: "top", label: "top" as const },
  { value: "expert", label: "expert" as const },
];

const EXP_OPTIONS = [
  { value: "", label: "any" as const },
  { value: "3", label: "exp3" as const },
  { value: "5", label: "exp5" as const },
  { value: "10", label: "exp10" as const },
];

const RATE_OPTIONS = [
  { value: "", label: "any" as const },
  { value: "1", label: "rate1" as const },
  { value: "2", label: "rate2" as const },
  { value: "3", label: "rate3" as const },
  { value: "4", label: "rate4" as const },
];

export function SidebarFilters({ initial }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const t = COPY.es;

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(sp.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page"); // reset pagination on any filter change
      const qs = params.toString();
      startTransition(() => {
        router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
      });
    },
    [router, sp, pathname]
  );

  const toggleParam = useCallback(
    (key: string) => {
      const params = new URLSearchParams(sp.toString());
      if (params.has(key)) params.delete(key);
      else params.set(key, "1");
      params.delete("page");
      const qs = params.toString();
      startTransition(() => {
        router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
      });
    },
    [router, sp, pathname]
  );

  const disp = initial.disp || "";
  const nivel = initial.nivel || "";
  const expmin = initial.expmin || "";
  const tarifa = initial.tarifa || "";
  const verificado = initial.verificado === "1";
  const rating = initial.rating === "1";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-mist-200 bg-white p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-ink-900">{t.advanced}</div>

        <div className="mt-4 space-y-4">
          {/* Disponibilidad — segmented toggle */}
          <div>
            <div className="mb-2 text-sm font-medium text-ink-800">{t.availability}</div>
            <div className="grid grid-cols-3 gap-1 rounded-xl border border-mist-200 bg-mist-50 p-1 text-xs font-medium">
              {[
                { v: "", label: t.all },
                { v: "disponible", label: t.available },
                { v: "ocupado", label: t.busy },
              ].map((opt) => {
                const active = disp === opt.v;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => updateParam("disp", opt.v)}
                    className={cn(
                      "inline-flex h-8 items-center justify-center gap-1 rounded-lg transition",
                      active
                        ? "bg-white text-ink-900 shadow-sm ring-1 ring-mist-200"
                        : "text-mist-500 hover:text-ink-800"
                    )}
                  >
                    {opt.v === "disponible" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                    {opt.v === "ocupado" && <span className="h-1.5 w-1.5 rounded-full bg-mist-400" />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reputation level */}
          <SelectField
            label={t.reputation}
            value={nivel}
            onChange={(v) => updateParam("nivel", v)}
            options={NIVEL_OPTIONS.map((o) => ({ value: o.value, label: t[o.label] }))}
          />

          {/* Experience */}
          <SelectField
            label={t.experience}
            value={expmin}
            onChange={(v) => updateParam("expmin", v)}
            options={EXP_OPTIONS.map((o) => ({ value: o.value, label: t[o.label] }))}
          />

          {/* Rate range */}
          <SelectField
            label={t.rate}
            value={tarifa}
            onChange={(v) => updateParam("tarifa", v)}
            options={RATE_OPTIONS.map((o) => ({ value: o.value, label: t[o.label] }))}
          />

          {/* Extras */}
          <div>
            <div className="mb-2 text-sm font-medium text-ink-800">{t.extras}</div>
            <div className="space-y-1.5 text-sm text-ink-800">
              <label className="flex cursor-pointer items-center gap-2 select-none">
                <input
                  type="checkbox"
                  checked={verificado}
                  onChange={() => toggleParam("verificado")}
                  className="accent-brand-600"
                />
                {t.onlyVerified}
              </label>
              <label className="flex cursor-pointer items-center gap-2 select-none">
                <input
                  type="checkbox"
                  checked={rating}
                  onChange={() => toggleParam("rating")}
                  className="accent-brand-600"
                />
                {t.only45}
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-mist-200 bg-white p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-ink-900">{t.waitlist}</div>
        <p className="mt-2 text-xs text-mist-500">{t.waitlistDesc}</p>
        <a
          href="/contacto"
          className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-full border border-mist-200 bg-white px-4 text-sm font-medium text-ink-800 transition hover:bg-mist-50"
        >
          {t.waitlistCta}
        </a>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-800">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full appearance-none rounded-xl border border-mist-200 bg-white pl-3.5 pr-9 text-[14px] font-medium text-ink-900 outline-none transition focus:border-brand-500"
        >
          {options.map((o) => (
            <option key={o.value || "any"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </label>
  );
}
