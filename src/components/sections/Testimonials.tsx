import { Section, SectionHeading } from "@/components/ui/Section";
import { Avatar } from "@/components/ui/Avatar";

const ITEMS = [
  {
    name: "Dra. Elena Romero",
    role: "Directora médica · Clínica Mediterránea",
    avatar: "Elena Romero",
    text:
      "Antes tardábamos semanas en cubrir una baja. Con SaludCoNet hemos confirmado profesionales en menos de una mañana. Cambia el ritmo de gestión de una clínica.",
  },
  {
    name: "Carlos Sánchez",
    role: "Fisioterapeuta · Madrid",
    avatar: "Carlos Sánchez",
    text:
      "Tengo control total de mi calendario y elijo solo las jornadas que me encajan. He duplicado mis ingresos sin perder calidad de vida.",
  },
  {
    name: "Marta Vives",
    role: "Gerente · Centros Salud Vives (4 sedes)",
    avatar: "Marta Vives",
    text:
      "La verificación documental y el chat interno nos dan confianza absoluta. Por fin trabajamos con una plataforma sanitaria pensada para clínicas serias.",
  },
];

export function Testimonials() {
  return (
    <Section className="bg-white">
      <SectionHeading
        eyebrow="Lo que dicen"
        title={<>Diseñada para <span className="text-gradient-brand">clínicas exigentes</span> y profesionales cualificados</>}
      />
      <div className="mt-16 grid gap-5 md:grid-cols-3">
        {ITEMS.map((t, i) => (
          <figure
            key={t.name}
            className="fade-up card-hover relative flex flex-col rounded-3xl border border-mist-200 bg-white p-7"
            style={{ animationDelay: `${i * 90}ms` }}
          >
            <svg className="absolute right-6 top-6 h-8 w-8 text-brand-100" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M9.5 6c-3 0-5.5 2.6-5.5 6v6h6v-6H6.5c0-1.7 1.3-3 3-3V6zm9 0c-3 0-5.5 2.6-5.5 6v6h6v-6h-3.5c0-1.7 1.3-3 3-3V6z" />
            </svg>
            <blockquote className="text-[15.5px] leading-relaxed text-ink-800">“{t.text}”</blockquote>
            <figcaption className="mt-7 flex items-center gap-3">
              <Avatar name={t.avatar} size="md" />
              <div>
                <div className="text-sm font-semibold text-ink-900">{t.name}</div>
                <div className="text-xs text-mist-500">{t.role}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
