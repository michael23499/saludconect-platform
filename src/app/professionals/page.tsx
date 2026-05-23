import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Pricing } from "@/components/sections/Pricing";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { AvailabilitySelector } from "@/components/availability/AvailabilitySelector";

export const metadata = { title: "Para profesionales · SaludCoNet" };

const BENEFITS = [
  { t: "Tú eliges cuándo y dónde trabajar", d: "Configura tu calendario. Acepta solo las jornadas que te encajen." },
  { t: "Conéctate con clínicas", d: "Acceso directo a clínicas verificadas en toda España." },
  { t: "Más oportunidades, más flexibilidad", d: "Diversifica tu actividad sin renunciar a tu actividad principal." },
  { t: "Tu talento merece mejor", d: "Tarifas transparentes acordadas directamente con la clínica que te contrata." },
  { t: "Lleva tu carrera al siguiente nivel", d: "Construye red profesional y reputación con cada colaboración." },
  { t: "Inscríbete y aparece ante las clínicas", d: "Crea tu perfil verificado: solo los profesionales inscritos son visibles para las clínicas." },
];

export default function ProfesionalesPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-mesh-light">
        <div className="bg-dotgrid absolute inset-0 opacity-50" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-5 py-20 md:grid-cols-[1.1fr_1fr] md:px-8 md:py-28">
          <div>
            <Badge tone="brand">Para profesionales sanitarios</Badge>
            <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-ink-900 md:text-6xl">
              Convierte tu experiencia en <span className="text-gradient-brand">nuevas oportunidades</span>.
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-mist-500 md:text-lg">
              Encuentra jornadas, turnos y colaboraciones en clínicas. Tú decides cuándo, dónde y con quién. Gestiona tu disponibilidad desde una sola plataforma.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/register?rol=professional" size="lg">Crear mi perfil</Button>
              <Button href="/how-it-works" variant="secondary" size="lg">Ver cómo funciona</Button>
            </div>
            <div className="mt-10 flex items-center gap-5">
              <div className="flex -space-x-2">
                {["Lucía Martín", "Carlos Sánchez", "Inés Vera", "Jorge Pol"].map((n) => (
                  <Avatar key={n} name={n} size="sm" className="ring-2 ring-white" />
                ))}
              </div>
              <div className="text-sm text-mist-500">
                <span className="font-semibold text-ink-900">+5.000 profesionales</span> ya forman parte
              </div>
            </div>
          </div>

          {/* Profile card mock with interactive availability */}
          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-brand-400/20 to-cyan-300/30 blur-3xl" />
            <div className="rounded-3xl border border-mist-200 bg-white p-6 shadow-2xl">
              <div className="flex items-start gap-4">
                <Avatar name="Dra. Lucía Martín" size="xl" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-[17px] font-semibold tracking-tight text-ink-900">Dra. Lucía Martín</div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden>
                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                      </svg>
                      Verificado
                    </span>
                  </div>
                  <div className="text-sm text-mist-500">Cardióloga · Madrid</div>
                  <div className="mt-1 text-xs text-mist-500">12 años de experiencia · Col. nº 28-049-381</div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-mist-200 bg-mist-50/60 p-3">
                  <div className="text-lg font-semibold text-ink-900">€€€</div>
                  <div className="text-[10px] uppercase tracking-wider text-mist-500">Tarifa</div>
                </div>
                <div className="rounded-xl border border-mist-200 bg-mist-50/60 p-3">
                  <div className="text-lg font-semibold text-ink-900">M/T</div>
                  <div className="text-[10px] uppercase tracking-wider text-mist-500">Turnos</div>
                </div>
                <div className="rounded-xl border border-mist-200 bg-mist-50/60 p-3">
                  <div className="text-lg font-semibold text-emerald-600">Sí</div>
                  <div className="text-[10px] uppercase tracking-wider text-mist-500">Disponible</div>
                </div>
              </div>
              <div className="mt-5">
                <AvailabilitySelector compact />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section className="bg-white">
        <SectionHeading
          eyebrow="Beneficios"
          title={<>Más oportunidades. <span className="text-gradient-brand">Más libertad.</span></>}
        />
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => (
            <div key={b.t} className="card-hover relative overflow-hidden rounded-2xl border border-mist-200 bg-mist-50/40 p-6">
              <div className="text-xs font-mono font-semibold text-brand-600">P/{String(i + 1).padStart(2, "0")}</div>
              <h3 className="mt-2 text-[17px] font-semibold tracking-tight text-ink-900">{b.t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-mist-500">{b.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Pricing />
      <FinalCTA />
    </>
  );
}
