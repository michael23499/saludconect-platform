import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { JourneyTabs } from "@/components/sections/JourneyTabs";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata = {
  title: "Cómo funciona · SaludCoNet",
};

const METRICS = [
  {
    v: "4 h 12 min",
    l: "Tiempo medio de cobertura",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    v: "< 24 h",
    l: "Verificación de profesional",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" strokeLinejoin="round" />
        <path d="M8 12.5l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    v: "5.000+",
    l: "Profesionales inscritos",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="9" r="3.5" />
        <path d="M3 20a6 6 0 0112 0" strokeLinecap="round" />
        <circle cx="17" cy="10" r="2.5" />
        <path d="M14 20a4 4 0 018 0" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    v: "98%",
    l: "Tasa de satisfacción",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
        <path d="M5 12l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const FAQ = [
  {
    q: "¿Cuánto tarda la verificación de un profesional?",
    a: "Habitualmente menos de 24 horas en días laborables. Recibirás un email cuando tu perfil sea aprobado.",
  },
  {
    q: "¿Cuál es el modelo de la plataforma?",
    a: "Las clínicas se inscriben en un plan mensual (desde 50 €/mes con la promo de lanzamiento) para acceder a los profesionales. Nosotros no somos intermediarios para la contratación: solo ayudamos a encontrar el horario y al profesional adecuado. La contratación y el pago de los servicios los gestiona directamente la clínica con el profesional.",
  },
  {
    q: "¿Necesito inscribirme para ver los profesionales?",
    a: "Sí. El acceso al directorio de profesionales requiere una inscripción activa. Sin inscripción no se pueden consultar perfiles ni contactar con la red.",
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
      {/* Hero — dark to break the white */}
      <section className="relative overflow-hidden bg-hero text-white">
        <div className="bg-grid absolute inset-0 opacity-25" />
        <div className="absolute -top-32 right-[-10%] h-[460px] w-[460px] rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-32 left-[-10%] h-[460px] w-[460px] rounded-full bg-brand-500/30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <Badge tone="accent">Cómo funciona</Badge>
          <h1 className="mt-4 max-w-3xl text-balance text-4xl font-semibold tracking-tight md:text-6xl">
            Conectar talento sanitario, <span className="text-gradient">sin fricción</span>.
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-white/70 md:text-lg">
            Te contamos cómo trabajamos paso a paso. Cinco etapas claras, cero ambigüedad. Diseñado para clínicas que quieren ir rápido y profesionales que quieren elegir.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/register?rol=clinic" size="lg">Empezar como clínica</Button>
            <Button href="/register?rol=professional" variant="outline" size="lg">
              Empezar como profesional
            </Button>
          </div>

          {/* Metric strip — minimal glow + sweep */}
          <div className="relative mt-14 md:mt-16">
            {/* Single soft halo — only brand blue */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-8 rounded-[32px] opacity-60 blur-3xl"
              style={{
                background:
                  "radial-gradient(50% 60% at 50% 50%, rgba(37,99,235,0.30) 0%, transparent 70%)",
              }}
            />

            <div className="relative grid gap-3 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04] p-2 backdrop-blur-xl md:grid-cols-4 md:p-3">
              {/* Light sweep that crosses the strip */}
              <span aria-hidden className="metric-sweep pointer-events-none absolute inset-y-0 -left-1/3 w-1/3" />

              {METRICS.map((m, i) => (
                <div
                  key={m.l}
                  className="metric-tile group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 transition duration-300 hover:border-white/20 hover:bg-white/[0.06]"
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  {/* Subtle hover halo — also brand blue */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -inset-6 rounded-2xl opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(37,99,235,0.25) 0%, transparent 70%)" }}
                  />

                  {/* Icon + value — uniform monochrome */}
                  <div className="relative flex items-center gap-2.5">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] text-white/90">
                      {m.icon}
                    </span>
                    <div className="text-xl font-semibold tracking-tight text-white md:text-2xl">
                      {m.v}
                    </div>
                  </div>
                  <div className="relative mt-1.5 text-[11px] uppercase tracking-wider text-white/55">{m.l}</div>

                  {/* Bottom underline animates on hover — brand only */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-3 bottom-2 h-px origin-left scale-x-0 bg-gradient-to-r from-brand-400/0 via-brand-400/70 to-brand-400/0 transition-transform duration-500 group-hover:scale-x-100"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Journey with role tabs */}
      <Section className="bg-mist-50">
        <SectionHeading
          eyebrow="Tu camino paso a paso"
          title={<>Elige tu rol y descubre <span className="text-gradient-brand">qué pasa después</span></>}
          description="Cambia entre el flujo de clínica y profesional. Cada paso muestra lo que ocurre, cuánto tarda y qué obtienes."
        />
        <div className="mt-12">
          <JourneyTabs />
        </div>
      </Section>

      {/* Comparativa de roles */}
      <section className="relative overflow-hidden py-20 md:py-28" style={{ background: "linear-gradient(135deg, #050b1f 0%, #0a1633 50%, #172554 100%)" }}>
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-15" />
        <div className="pointer-events-none absolute -right-32 top-0 h-[460px] w-[460px] rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-[460px] w-[460px] rounded-full bg-brand-500/25 blur-3xl" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 md:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur" style={{ color: "#a5f3fc" }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#67e8f9" }} />
              Comparativa rápida
            </div>
            <h2 className="!text-white text-balance text-3xl font-semibold tracking-tight md:text-5xl">
              <span className="!text-white">Dos roles.</span>{" "}
              <span className="!text-cyan-300">Cero fricción.</span>
            </h2>
            <p className="mt-5 text-pretty text-base md:text-lg" style={{ color: "rgba(255,255,255,0.8)" }}>
              Lo que obtienes según quién seas. Sin sorpresas, sin letra pequeña.
            </p>
          </div>

        <div className="relative mt-14 grid gap-5 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur md:p-10">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand-500/30 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 21V8l8-5 8 5v13" strokeLinejoin="round" />
                    <path d="M9 21v-7h6v7" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-cyan-200/80">Para clínicas</div>
                  <div className="text-lg font-semibold tracking-tight">Encuentra y reserva</div>
                </div>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Cobertura de turnos en menos de 4 h de media",
                  "Perfiles 100% verificados y ordenados por valoración",
                  "Geolocalizador por sede y panel de gestión",
                  "Inscripción mensual con promo de lanzamiento desde 50 €",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2.5">
                    <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/90">
                      <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l4.5 4.5L19 7" /></svg>
                    </span>
                    <span className="text-white/85">{b}</span>
                  </li>
                ))}
              </ul>
              <Button href="/clinics" variant="outline" size="sm" className="mt-7">Ver detalles para clínicas</Button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur md:p-10">
            <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-cyan-400/30 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-brand-600 shadow-lg">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 3v6a4 4 0 008 0V3" strokeLinecap="round" />
                    <path d="M10 17a4 4 0 008 0v-3" strokeLinecap="round" />
                    <circle cx="18" cy="11" r="2.5" />
                  </svg>
                </span>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-cyan-200/80">Para profesionales</div>
                  <div className="text-lg font-semibold tracking-tight">Conecta y trabaja</div>
                </div>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Inscripción para entrar en la red sanitaria",
                  "Verificación en menos de 24 h por equipo humano",
                  "Eliges turnos, ciudades y tarifa orientativa",
                  "Acuerdo de contratación y pago directo con la clínica",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2.5">
                    <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/90">
                      <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l4.5 4.5L19 7" /></svg>
                    </span>
                    <span className="text-white/85">{b}</span>
                  </li>
                ))}
              </ul>
              <Button href="/professionals" variant="outline" size="sm" className="mt-7">Ver detalles para profesionales</Button>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* FAQ */}
      <Section className="bg-mist-50">
        <SectionHeading
          eyebrow="Preguntas frecuentes"
          title="Resolvemos tus dudas"
          description="Si necesitas más detalles, escríbenos a info@clinicacapilarcastellana.es."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {FAQ.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-mist-200 bg-white p-5 open:border-brand-200 open:bg-gradient-to-br open:from-white open:to-brand-50/40 open:shadow-[var(--shadow-card)]"
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
