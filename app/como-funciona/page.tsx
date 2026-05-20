import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata = {
  title: "Cómo funciona · SaludCoNet",
};

const FLOW = [
  {
    n: "01",
    title: "Regístrate y elige tu rol",
    desc: "Selecciona si eres clínica o profesional sanitario. Completa tu perfil con los datos clave: especialidades, ciudad, experiencia y documentación.",
    bullets: ["Verificación email", "DNI y colegiación", "Logo o foto de perfil"],
  },
  {
    n: "02",
    title: "Verifica tu identidad",
    desc: "Nuestro equipo valida titulación, colegiación y certificados en menos de 24 horas. Sin verificación, no hay confianza.",
    bullets: ["Titulación oficial", "Número de colegiado", "Certificados especializados"],
  },
  {
    n: "03",
    title: "Configura disponibilidad",
    desc: "Los profesionales marcan calendario, turnos y tarifa orientativa. Las clínicas publican necesidades de personal con fecha, turno y especialidad.",
    bullets: ["Turnos mañana/tarde", "Bloqueo de fechas", "Tarifas orientativas"],
  },
  {
    n: "04",
    title: "Conecta y reserva",
    desc: "Buscador inteligente con filtros por ciudad, especialidad, experiencia y disponibilidad. Solicita reservas y confirma con un clic.",
    bullets: ["Búsqueda avanzada", "Chat interno", "Solicitudes de reserva"],
  },
  {
    n: "05",
    title: "Cobra y gestiona",
    desc: "Pagos integrados con Stripe y PayPal. Suscripción mensual para clínicas, gratis para profesionales. Facturación automática.",
    bullets: ["Stripe y PayPal", "Facturación automática", "Cancelación en 1 clic"],
  },
];

const FAQ = [
  {
    q: "¿Cuánto tarda la verificación de un profesional?",
    a: "Habitualmente menos de 24 horas en días laborables. Recibirás un email cuando tu perfil sea aprobado.",
  },
  {
    q: "¿Cuál es el modelo de cobro?",
    a: "Los profesionales se registran gratis. Las clínicas pagan una suscripción mensual (desde 79 €/mes) con prueba de 14 días.",
  },
  {
    q: "¿SaludCoNet cobra una comisión por reserva?",
    a: "No. Una vez tienes la suscripción, las reservas son ilimitadas y sin comisión.",
  },
  {
    q: "¿Cómo se gestiona la documentación sensible?",
    a: "Almacenamiento cifrado con acceso restringido. Solo la clínica con la que confirmes la reserva podrá ver los documentos que tú habilites.",
  },
  {
    q: "¿Puedo cancelar mi suscripción cuando quiera?",
    a: "Sí. Sin permanencia, sin penalización. Cancelas desde tu panel y mantienes el acceso hasta el fin del período facturado.",
  },
  {
    q: "¿Tenéis app móvil?",
    a: "La plataforma web es totalmente responsive y funciona perfecto en móvil. La app nativa está en nuestro roadmap.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <>
      {/* Page intro */}
      <section className="relative overflow-hidden bg-mesh-light">
        <div className="bg-dotgrid absolute inset-0 opacity-50" />
        <div className="relative mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <Badge tone="brand">Cómo funciona</Badge>
          <h1 className="mt-4 max-w-3xl text-balance text-4xl font-semibold tracking-tight text-ink-900 md:text-6xl">
            Conectar talento sanitario, <span className="text-gradient-brand">sin fricción</span>.
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-mist-500 md:text-lg">
            Te contamos cómo trabajamos paso a paso. Cinco etapas claras, cero ambigüedad. Diseñado para clínicas que quieren ir rápido y profesionales que quieren elegir.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/registro?rol=clinica" size="lg">Empezar como clínica</Button>
            <Button href="/registro?rol=profesional" variant="secondary" size="lg">
              Empezar como profesional
            </Button>
          </div>
        </div>
      </section>

      {/* Step-by-step */}
      <Section className="bg-white">
        <SectionHeading
          eyebrow="El flujo completo"
          title={<>De registro a primera reserva en <span className="text-gradient-brand">menos de 24 h</span></>}
        />
        <div className="mt-14 space-y-5">
          {FLOW.map((s, i) => (
            <div
              key={s.n}
              className="card-hover grid items-center gap-6 rounded-3xl border border-mist-200 bg-mist-50/40 p-6 md:grid-cols-[120px_1fr_auto] md:p-8"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-ink-900 to-brand-600 text-lg font-semibold text-white shadow-[0_12px_28px_-12px_rgba(37,99,235,0.55)]">
                  {s.n}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-ink-900 md:text-2xl">{s.title}</h3>
                <p className="mt-2 text-[15.5px] leading-relaxed text-mist-500">{s.desc}</p>
              </div>
              <ul className="flex shrink-0 flex-col gap-1.5 md:items-end">
                {s.bullets.map((b) => (
                  <li key={b} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-ink-800 ring-1 ring-mist-200">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-brand-600" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
                      <path d="M5 12l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Reuse step blocks for clinic vs pro */}
      <HowItWorks />

      {/* FAQ */}
      <Section className="bg-mist-50">
        <SectionHeading
          eyebrow="Preguntas frecuentes"
          title="Resolvemos tus dudas"
          description="Si necesitas más detalles, escríbenos a hola@saludconet.demo."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {FAQ.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-mist-200 bg-white p-5 open:bg-white"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                <span className="text-[15.5px] font-semibold text-ink-900">{f.q}</span>
                <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-mist-200 text-mist-500 transition group-open:rotate-45 group-open:border-brand-300 group-open:bg-brand-50 group-open:text-brand-700">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-mist-500">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <FinalCTA />
    </>
  );
}
