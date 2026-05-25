"use client";
import { Section, SectionHeading } from "@/components/ui/Section";
import { LEVELS, type ReputationLevel } from "@/lib/reputation";
import { LevelGem } from "@/components/reputation/ReputationBadge";
import { useApp } from "@/components/providers/Providers";

const ORDER: ReputationLevel[] = ["rookie", "rising", "trusted", "top", "expert", "elite"];

const COPY = {
  es: {
    eyebrow: "Sistema de reputación",
    title1: "Los mejores ",
    title2: "se reconocen solos",
    desc: "Cada profesional gana puntos por cada colaboración exitosa, valoración positiva, puntualidad y respuesta rápida. Los niveles se actualizan en tiempo real y las clínicas ven primero a los mejores valorados.",
    factors: "¿Qué cuenta para la puntuación?",
    fact1: "Valoraciones de clínicas",
    fact1d: "Promedio ponderado de las últimas 30 colaboraciones",
    fact2: "Puntualidad",
    fact2d: "Llegar a tiempo y completar los turnos comprometidos",
    fact3: "Tasa de respuesta",
    fact3d: "Velocidad y consistencia al responder solicitudes",
    fact4: "Reservas completadas",
    fact4d: "Historial verificado dentro de la plataforma",
    range: "Rango",
  },
  en: {
    eyebrow: "Reputation system",
    title1: "The best ",
    title2: "stand out on their own",
    desc: "Every professional earns points for each successful booking, positive review, punctuality and fast response. Levels update in real time and clinics see top-rated professionals first.",
    factors: "What counts toward your score?",
    fact1: "Clinic ratings",
    fact1d: "Weighted average of the last 30 collaborations",
    fact2: "Punctuality",
    fact2d: "Arriving on time and completing committed shifts",
    fact3: "Response rate",
    fact3d: "Speed and consistency answering requests",
    fact4: "Completed bookings",
    fact4d: "Verified history inside the platform",
    range: "Range",
  },
};

export function ReputationSection() {
  const { lang } = useApp();
  const c = COPY[lang];

  return (
    <Section className="bg-mist-50">
      <SectionHeading
        eyebrow={c.eyebrow}
        title={<>{c.title1}<span className="text-gradient-brand">{c.title2}</span></>}
        description={c.desc}
      />

      <div className="mt-14 grid gap-10 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <div className="rounded-3xl border border-mist-200 bg-white p-6 md:p-7">
            <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{c.factors}</div>
            <ul className="mt-5 space-y-4">
              {[
                { i: "★", t: c.fact1, d: c.fact1d },
                { i: "◷", t: c.fact2, d: c.fact2d },
                { i: "⚡", t: c.fact3, d: c.fact3d },
                { i: "◆", t: c.fact4, d: c.fact4d },
              ].map((f) => (
                <li key={f.t} className="flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-cyan-50 text-base text-brand-700 dark:from-brand-500/20 dark:to-cyan-500/15">
                    {f.i}
                  </span>
                  <div>
                    <div className="text-[15px] font-semibold text-ink-900">{f.t}</div>
                    <div className="text-sm text-mist-500">{f.d}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          {ORDER.map((lv, i) => {
            const meta = LEVELS[lv];
            return (
              <div
                key={lv}
                className="fade-up card-hover flex items-center justify-between gap-4 rounded-2xl border border-mist-200 bg-white p-4 pl-5"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="flex items-center gap-4">
                  <LevelGem level={lv} size={18} />
                  <div>
                    <div className="text-[15px] font-semibold tracking-tight text-ink-900">{meta.label[lang]}</div>
                    <div className="text-xs text-mist-500">{meta.description[lang]}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">{c.range}</div>
                  <div className="text-sm font-semibold text-ink-900">{meta.range[0]} - {meta.range[1]}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
