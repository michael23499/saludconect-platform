import { Section, SectionHeading } from "@/components/ui/Section";

const STEPS_CLINIC = [
  {
    n: "01",
    t: "Publica tu necesidad",
    d: "Define profesión, especialidad, fechas, turno y tarifa orientativa. Tarda menos de 60 segundos.",
  },
  {
    n: "02",
    t: "Recibe candidatos verificados",
    d: "Profesionales disponibles te contactan o aparecen filtrados por compatibilidad con tu solicitud.",
  },
  {
    n: "03",
    t: "Confirma y trabaja",
    d: "Acuerda detalles por chat, confirma la reserva y deja que SaludCoNet gestione el resto.",
  },
];

const STEPS_PRO = [
  {
    n: "01",
    t: "Crea tu perfil profesional",
    d: "Sube titulación, colegiado y experiencia. Tu perfil queda verificado en menos de 24 h.",
  },
  {
    n: "02",
    t: "Marca tu disponibilidad",
    d: "Configura calendario, turnos, ciudad y tarifa. Las clínicas verán únicamente lo que tú permitas.",
  },
  {
    n: "03",
    t: "Acepta jornadas y cobra",
    d: "Recibe solicitudes de clínicas, confirma con un clic y gestiona tu agenda.",
  },
];

function StepList({ steps, color }: { steps: typeof STEPS_CLINIC; color: string }) {
  return (
    <ol className="relative space-y-6 pl-12">
      <span className="absolute left-[18px] top-2 bottom-2 w-px bg-gradient-to-b from-brand-200 to-transparent" />
      {steps.map((s) => (
        <li key={s.n} className="relative">
          <span
            className={`absolute -left-12 top-0 inline-flex h-9 w-9 items-center justify-center rounded-xl text-xs font-semibold text-white shadow-[0_8px_18px_-8px_rgba(37,99,235,0.55)] ${color}`}
          >
            {s.n}
          </span>
          <h4 className="text-[17px] font-semibold tracking-tight text-ink-900">{s.t}</h4>
          <p className="mt-1.5 text-[15px] leading-relaxed text-mist-500">{s.d}</p>
        </li>
      ))}
    </ol>
  );
}

export function HowItWorks() {
  return (
    <Section className="bg-white">
      <SectionHeading
        eyebrow="Cómo funciona"
        title={<>Tres pasos. Dos roles. <span className="text-gradient-brand">Cero fricción.</span></>}
        description="Diseñado por y para el sector sanitario. Cada flujo está optimizado para que el tiempo se invierta en pacientes, no en procesos."
      />
      <div className="mt-16 grid gap-10 lg:grid-cols-2">
        <div className="fade-up rounded-3xl border border-mist-200 bg-mist-50/50 p-8 md:p-10">
          <div className="mb-7 flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-[0_10px_22px_-8px_rgba(37,99,235,0.6)]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M4 21V8l8-5 8 5v13" strokeLinejoin="round" />
                <path d="M9 21v-7h6v7" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">Para clínicas</div>
              <div className="text-[18px] font-semibold tracking-tight text-ink-900">Encuentra y reserva</div>
            </div>
          </div>
          <StepList steps={STEPS_CLINIC} color="bg-gradient-to-br from-brand-600 to-brand-500" />
        </div>

        <div className="fade-up rounded-3xl border border-mist-200 bg-mist-50/50 p-8 md:p-10" style={{ animationDelay: "120ms" }}>
          <div className="mb-7 flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900 text-white shadow-[0_10px_22px_-8px_rgba(10,22,51,0.45)]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M12 11.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" />
                <path d="M5 21a7 7 0 0114 0" strokeLinecap="round" />
              </svg>
            </span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-700">Para profesionales</div>
              <div className="text-[18px] font-semibold tracking-tight text-ink-900">Conecta y trabaja</div>
            </div>
          </div>
          <StepList steps={STEPS_PRO} color="bg-gradient-to-br from-ink-800 to-brand-700" />
        </div>
      </div>
    </Section>
  );
}
