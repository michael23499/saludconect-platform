import { Section, SectionHeading } from "@/components/ui/Section";

const SPECS = [
  { name: "Cardiología", count: 142, icon: "❤" },
  { name: "Pediatría", count: 218, icon: "★" },
  { name: "Odontología", count: 384, icon: "◐" },
  { name: "Fisioterapia", count: 521, icon: "◆" },
  { name: "Psicología", count: 296, icon: "◉" },
  { name: "Dermatología", count: 174, icon: "✦" },
  { name: "Enfermería", count: 1042, icon: "✚" },
  { name: "Ginecología", count: 158, icon: "◇" },
  { name: "Traumatología", count: 132, icon: "▲" },
  { name: "Oftalmología", count: 96, icon: "◎" },
  { name: "Radiología", count: 78, icon: "◑" },
  { name: "Anestesia", count: 64, icon: "✺" },
];

export function Specialties() {
  return (
    <Section className="bg-mist-50">
      <SectionHeading
        eyebrow="Talento por especialidad"
        title={<>Profesionales verificados en <span className="text-gradient-brand">toda España</span></>}
        description="Más de 40 especialidades sanitarias activas. Filtra por ciudad, experiencia y tipo de jornada."
      />
      <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {SPECS.map((s) => (
          <a
            key={s.name}
            href={`/buscar?especialidad=${encodeURIComponent(s.name)}`}
            className="card-hover group flex items-center justify-between gap-3 rounded-2xl border border-mist-200 bg-white p-4 pl-5 hover:border-brand-300"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-lg text-brand-700">
                {s.icon}
              </span>
              <div>
                <div className="text-[15px] font-semibold text-ink-900">{s.name}</div>
                <div className="text-xs text-mist-500">{s.count} profesionales</div>
              </div>
            </div>
            <svg className="h-4 w-4 -translate-x-1 text-mist-400 opacity-0 transition group-hover:translate-x-0 group-hover:text-brand-600 group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        ))}
      </div>
    </Section>
  );
}
