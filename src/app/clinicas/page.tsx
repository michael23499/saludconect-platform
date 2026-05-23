import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Pricing } from "@/components/sections/Pricing";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { LiveRequestCard } from "@/components/clinicas/LiveRequestCard";

export const metadata = { title: "Para clínicas · SaludCoNet" };

const BENEFITS = [
  {
    t: "Encuentra profesionales en minutos",
    d: "Publica tu necesidad y recibe candidatos verificados antes de cerrar la jornada.",
  },
  {
    t: "Elimina largos procesos de selección",
    d: "Filtros inteligentes por especialidad, ciudad, experiencia y disponibilidad real.",
  },
  {
    t: "Accede a talento sanitario verificado",
    d: "DNI, titulación, colegiación y certificados validados por nuestro equipo.",
  },
  {
    t: "Cobertura rápida para tu clínica",
    d: "Tiempo medio de cobertura: 4 h 12 min. Sin agencias, sin intermediarios.",
  },
  {
    t: "Reduce tiempos vacíos en agenda",
    d: "Cubre huecos, vacaciones y picos de demanda con una red lista para responder.",
  },
  {
    t: "Optimiza el rendimiento de la clínica",
    d: "Dashboard con estadísticas de reservas, costes y desempeño por especialidad.",
  },
];

const FEATURES = [
  { icon: "◧", t: "Búsqueda avanzada", d: "Ciudad · profesión · especialidad · turno · tarifa" },
  { icon: "◐", t: "Calendario integrado", d: "Visualiza disponibilidad real, no promesas" },
  { icon: "◑", t: "Chat interno", d: "Acuerda detalles sin salir de la plataforma" },
  { icon: "◯", t: "Documentación verificada", d: "Confianza absoluta antes de aceptar" },
  { icon: "◍", t: "Multi-sede", d: "Gestiona varias clínicas con un único panel" },
  { icon: "◫", t: "Facturación automática", d: "Recibos, IVA y exportes contables" },
];

export default function ClinicasPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-hero text-white">
        <div className="bg-grid absolute inset-0 opacity-25" />
        <div className="absolute -bottom-32 left-[-10%] h-[420px] w-[420px] rounded-full bg-brand-500/30 blur-3xl" />
        <div className="absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-5 py-20 md:grid-cols-[1.2fr_1fr] md:px-8 md:py-28">
          <div>
            <Badge tone="accent">Para clínicas</Badge>
            <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              Encuentra profesionales <span className="text-gradient">cuando lo necesites.</span>
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-white/70 md:text-lg">
              Simplificamos la búsqueda de personal sanitario. Conecta con profesionales cualificados de forma inmediata, sin agencias ni largos procesos de selección.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/registro?rol=clinica" size="lg">Empezar prueba 14 días</Button>
              <Button href="/buscar" variant="outline" size="lg">Explorar talento</Button>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-6">
              {[
                { v: "4 h 12 m", l: "cobertura media" },
                { v: "320+", l: "clínicas activas" },
                { v: "96%", l: "satisfacción" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl font-semibold tracking-tight">{s.v}</div>
                  <div className="text-xs text-white/60">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <LiveRequestCard />
        </div>
      </section>

      <Section className="bg-white">
        <SectionHeading
          eyebrow="Beneficios"
          title={<>Diseñado para <span className="text-gradient-brand">clínicas serias</span></>}
          description="Las clínicas que ya usan SaludCoNet reducen su tiempo de contratación y eliminan dependencia de intermediarios costosos."
        />
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => (
            <div key={b.t} className="card-hover relative overflow-hidden rounded-2xl border border-mist-200 bg-mist-50/40 p-6">
              <div className="text-xs font-mono font-semibold text-brand-600">B/{String(i + 1).padStart(2, "0")}</div>
              <h3 className="mt-2 text-[17px] font-semibold tracking-tight text-ink-900">{b.t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-mist-500">{b.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-mist-50">
        <SectionHeading
          eyebrow="Funcionalidades"
          title="Todo lo que tu clínica necesita"
        />
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.t} className="flex items-start gap-4 rounded-2xl border border-mist-200 bg-white p-6">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl text-brand-700">
                {f.icon}
              </span>
              <div>
                <h3 className="text-[16px] font-semibold tracking-tight text-ink-900">{f.t}</h3>
                <p className="mt-1 text-sm text-mist-500">{f.d}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Pricing />
      <FinalCTA />
    </>
  );
}
