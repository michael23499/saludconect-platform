import { Section } from "@/components/ui/Section";

const STATS = [
  { v: "5.000+", l: "Profesionales verificados" },
  { v: "320+", l: "Clínicas privadas activas" },
  { v: "4 h 12 m", l: "Tiempo medio de cobertura" },
  { v: "96%", l: "Satisfacción de clínicas" },
];

export function Stats() {
  return (
    <section className="border-y border-mist-200 bg-white">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-5 py-12 md:grid-cols-4 md:px-8 md:py-14">
        {STATS.map((s) => (
          <div key={s.l} className="text-center md:text-left">
            <div className="bg-gradient-to-br from-ink-900 to-brand-600 bg-clip-text text-3xl font-semibold tracking-tight text-transparent md:text-4xl">
              {s.v}
            </div>
            <div className="mt-1 text-sm text-mist-500">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
