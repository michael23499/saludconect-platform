"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/components/providers/Providers";

const LABELS = {
  es: { q: "Búsqueda", ciudad: "Ciudad", profesion: "Profesión", especialidad: "Especialidad", turno: "Turno", disp: "Estado", nivel: "Nivel", expmin: "Exp.", tarifa: "Tarifa", verificado: "Verificados", rating: "Top valorados", clear: "Limpiar todo", title: "Filtros activos" },
  en: { q: "Search",   ciudad: "City",    profesion: "Profession", especialidad: "Specialty", turno: "Shift", disp: "Status", nivel: "Level", expmin: "Exp.", tarifa: "Rate", verificado: "Verified", rating: "Top rated", clear: "Clear all", title: "Active filters" },
};

const VALUE_DISPLAY: Record<string, Record<string, string>> = {
  nivel: { rising: "Rising+", trusted: "Trusted+", top: "Top Rated+", expert: "Expert / Elite" },
  expmin: { "3": "+ 3 años", "5": "+ 5 años", "10": "+ 10 años" },
  tarifa: { "1": "€", "2": "€€", "3": "€€€", "4": "€€€€" },
  verificado: { "1": "Sí" },
  rating: { "1": "4,5★+" },
};

const KEYS = ["q", "ciudad", "profesion", "especialidad", "turno", "disp", "nivel", "expmin", "tarifa", "verificado", "rating"] as const;
type Key = typeof KEYS[number];

export function ActiveFilters() {
  const router = useRouter();
  const sp = useSearchParams();
  const { lang } = useApp();
  const L = LABELS[lang];

  const chips: Array<{ key: Key; value: string }> = [];
  KEYS.forEach((k) => {
    const v = sp.get(k);
    if (v) chips.push({ key: k, value: v });
  });

  if (chips.length === 0) return null;

  const removeKey = (key: Key) => {
    const params = new URLSearchParams(sp.toString());
    params.delete(key);
    router.push(`/buscar${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const clearAll = () => {
    router.push("/buscar");
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-mist-500">
        {L.title} ({chips.length}):
      </span>
      {chips.map(({ key, value }) => {
        const display = VALUE_DISPLAY[key]?.[value] ?? value;
        return (
          <button
            key={key + value}
            type="button"
            onClick={() => removeKey(key)}
            className="group inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-800 transition hover:border-brand-300 hover:bg-brand-100"
            aria-label={`Quitar filtro ${L[key]}: ${display}`}
          >
            <span className="text-brand-600">{L[key]}:</span>
            <span className="font-semibold">{display}</span>
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/70 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
                <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
              </svg>
            </span>
          </button>
        );
      })}
      <button
        type="button"
        onClick={clearAll}
        className="ml-auto text-xs font-semibold text-mist-500 underline-offset-4 transition hover:text-brand-700 hover:underline"
      >
        {L.clear}
      </button>
    </div>
  );
}
