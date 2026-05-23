import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { LevelChip, BadgeChip, StarRow } from "@/components/reputation/ReputationBadge";
import { PROFESSIONALS } from "@/lib/mock-professionals";
import { NAV_PRO, USER_PRO } from "@/lib/dashboard-nav";
import { LEVELS, nextLevel } from "@/lib/reputation";

export const metadata = { title: "Mi perfil · Profesional · SaludCoNet" };

const PRO = PROFESSIONALS[0]; // Dra. Lucía Martín

const BIO = `Cardióloga clínica con 12 años de experiencia en hospitales y centros privados de Madrid. Especializada en ecocardiografía, Holter de 24 h y pruebas de esfuerzo. Acostumbrada a coberturas urgentes y consulta de alta resolución, priorizo la comunicación directa con la clínica y la puntualidad en cada jornada.`;

const SPECIALTIES = [
  { label: "Cardiología clínica", main: true },
  { label: "Ecocardiografía transtorácica", main: false },
  { label: "Holter de 24 h", main: false },
  { label: "Prueba de esfuerzo", main: false },
  { label: "Consulta de alta resolución", main: false },
  { label: "Insuficiencia cardíaca", main: false },
];

const LANGUAGES = [
  { code: "ES", label: "Español", level: "Nativo" },
  { code: "EN", label: "Inglés", level: "C1" },
  { code: "PT", label: "Portugués", level: "B2" },
];

const EDUCATION = [
  { year: "2010", title: "Grado en Medicina", place: "Universidad Complutense de Madrid" },
  { year: "2014", title: "MIR Cardiología", place: "Hospital Universitario La Paz" },
  { year: "2019", title: "Máster Ecocardiografía", place: "Sociedad Española de Cardiología" },
  { year: "2022", title: "Certificación Holter avanzado", place: "AHA · American Heart Association" },
];

const VERIFICATION = [
  { label: "DNI", state: "verified", note: "Validado 14 mar 2025" },
  { label: "Titulación de Medicina", state: "verified", note: "Universidad Complutense" },
  { label: "Colegiación · 28-12345-MAD", state: "verified", note: "Colegio de Médicos de Madrid" },
  { label: "Certificado de especialidad MIR", state: "verified", note: "Cardiología" },
  { label: "Seguro de responsabilidad civil", state: "verified", note: "Vigente hasta 12 abr 2027" },
  { label: "Foto profesional", state: "pending", note: "Sube una foto reciente para completar tu perfil" },
] as const;

const REVIEWS = [
  {
    by: "Clínica Sanitas Norte",
    role: "Marta Vives · Gerente",
    rating: 5,
    when: "hace 4 días",
    text: "Lucía es de los profesionales más solventes con los que hemos trabajado. Comunicación impecable y siempre puntual. Repetiremos en próximas jornadas.",
  },
  {
    by: "Hospital Quirón Salud",
    role: "Andrea Iglesias · Coordinadora",
    rating: 5,
    when: "hace 2 semanas",
    text: "Cobertura quirúrgica resuelta sin fricciones. Manejo de protocolos perfecto y dejó toda la documentación al día.",
  },
  {
    by: "Centro Médico Bilbao",
    role: "Iker Arana · Director",
    rating: 4,
    when: "hace 1 mes",
    text: "Muy buena profesional, llegada 10 min antes de la sesión. Nos gustaría coordinar más jornadas con ella.",
  },
];

const PREFERRED_CITIES = ["Madrid", "Bilbao", "Valencia (online)"];
const PREFERRED_SHIFTS = ["Mañana", "Día completo"];

const CURRENT_LEVEL = LEVELS[PRO.rep.level];
const NEXT = nextLevel(PRO.rep.level);
const NEXT_LEVEL = NEXT ? LEVELS[NEXT] : null;
const SCORE_PROGRESS = (() => {
  const [from, to] = CURRENT_LEVEL.range;
  if (PRO.rep.score >= to) return 100;
  return Math.round(((PRO.rep.score - from) / (to - from)) * 100);
})();

const COMPLETION = 85;

export default function ProfesionalPerfilPage() {
  return (
    <DashboardShell role="Profesional" user={USER_PRO} nav={NAV_PRO}>
      <PageHeader
        title="Mi perfil"
        subtitle="Esta es la información que las clínicas ven de ti. Mantén tu perfil actualizado para recibir más solicitudes."
        actions={
          <>
            <Button variant="secondary" size="sm">Vista pública</Button>
            <Button size="sm">Editar perfil</Button>
          </>
        }
      />

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-mist-200 bg-gradient-to-br from-ink-950 via-ink-900 to-brand-800 text-white">
        <div className="bg-grid absolute inset-0 opacity-20" />
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" />

        <div className="relative grid gap-6 p-6 md:grid-cols-[auto_1fr_auto] md:items-end md:gap-8 md:p-8">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-end">
            <div className="relative">
              <div className={`rounded-full ring-4 ${CURRENT_LEVEL.ring} ring-offset-2 ring-offset-ink-900`}>
                <Avatar name={PRO.name} size="xl" />
              </div>
              {PRO.available && (
                <span className="absolute -bottom-1 -right-1 inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  Activa
                </span>
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{PRO.name}</h2>
                {PRO.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-200 backdrop-blur">
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden>
                      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                    </svg>
                    Verificada
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-white/75 md:text-base">
                {PRO.specialty} · {PRO.profession} · {PRO.city}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <LevelChip level={PRO.rep.level} />
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/95 backdrop-blur">
                  <StarRow value={PRO.rep.rating} />
                  {PRO.rep.rating.toFixed(1)} · {PRO.rep.reviews} reseñas
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white/80 backdrop-blur">
                  {PRO.rep.yearsExperience} años de experiencia
                </span>
              </div>
            </div>
          </div>

          {/* Score panel */}
          <div className="md:col-start-3 md:row-start-1">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur md:min-w-[260px]">
              <div className="flex items-baseline justify-between">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Reputación</div>
                <div className="text-xs font-semibold text-cyan-200">Top {Math.max(1, 100 - Math.round(PRO.rep.score / 10))}%</div>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-bold tabular-nums">{PRO.rep.score}</span>
                <span className="text-xs text-white/60">/ 1000</span>
              </div>
              {NEXT_LEVEL && (
                <>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-brand-400" style={{ width: `${SCORE_PROGRESS}%` }} />
                  </div>
                  <div className="mt-2 text-[11px] text-white/70">
                    {NEXT_LEVEL.range[0] - PRO.rep.score} puntos para <span className="font-semibold text-white">{NEXT_LEVEL.label.es}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Profile completion bar */}
        <div className="relative border-t border-white/10 bg-black/15 px-6 py-4 backdrop-blur md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Perfil completado</div>
              <div className="text-sm font-semibold text-white">{COMPLETION}%</div>
            </div>
            <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10 md:w-64">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{ width: `${COMPLETION}%` }} />
            </div>
            <a href="#verificacion" className="text-xs font-semibold text-cyan-200 hover:text-cyan-100">
              Completar perfil →
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <ProfileStat label="Jornadas completadas" value={String(PRO.rep.completed)} hint="Histórico total" />
        <ProfileStat label="Tasa de respuesta" value={`${PRO.rep.responseRate}%`} hint={`Responde en ${PRO.rep.responseTime}`} />
        <ProfileStat label="Puntualidad" value={`${PRO.rep.punctuality}%`} hint="Sobre 287 jornadas" />
        <ProfileStat label="Tasa de éxito" value={`${PRO.rep.successRate}%`} hint="Sin incidencias" />
      </div>

      {/* Main grid */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        {/* Left column */}
        <div className="space-y-5">
          {/* Sobre mí */}
          <SectionCard title="Sobre mí" action="Editar">
            <p className="text-sm leading-relaxed text-ink-800">{BIO}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-mist-100 pt-4 sm:grid-cols-4">
              <MiniFact label="Profesión" value={PRO.profession} />
              <MiniFact label="Especialidad" value={PRO.specialty} />
              <MiniFact label="Ciudad base" value={PRO.city} />
              <MiniFact label="Experiencia" value={`${PRO.rep.yearsExperience} años`} />
            </div>
          </SectionCard>

          {/* Especialidades y subespecialidades */}
          <SectionCard title="Áreas de especialización" action="Editar">
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((s) => (
                <span
                  key={s.label}
                  className={
                    s.main
                      ? "inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700"
                      : "inline-flex items-center gap-1.5 rounded-full border border-mist-200 bg-white px-3 py-1 text-xs font-medium text-ink-800"
                  }
                >
                  {s.main && <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />}
                  {s.label}
                </span>
              ))}
              <button className="inline-flex items-center gap-1 rounded-full border border-dashed border-mist-300 bg-mist-50/40 px-3 py-1 text-xs font-medium text-mist-500 hover:bg-mist-100">
                + Añadir
              </button>
            </div>
          </SectionCard>

          {/* Idiomas */}
          <SectionCard title="Idiomas" action="Editar">
            <ul className="grid gap-3 sm:grid-cols-3">
              {LANGUAGES.map((l) => (
                <li key={l.code} className="flex items-center gap-3 rounded-xl border border-mist-200 bg-mist-50/40 p-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[11px] font-bold text-ink-900 ring-1 ring-mist-200">
                    {l.code}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-ink-900">{l.label}</div>
                    <div className="text-[11px] text-mist-500">{l.level}</div>
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* Educación */}
          <SectionCard title="Formación y educación" action="Editar">
            <ol className="relative space-y-4 border-l border-mist-200 pl-5">
              {EDUCATION.map((e) => (
                <li key={e.title} className="relative">
                  <span className="absolute -left-[26px] top-1 inline-flex h-3 w-3 items-center justify-center rounded-full bg-brand-50 ring-4 ring-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                  </span>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">{e.year}</div>
                  <div className="text-sm font-semibold text-ink-900">{e.title}</div>
                  <div className="text-xs text-mist-500">{e.place}</div>
                </li>
              ))}
            </ol>
          </SectionCard>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Verificación */}
          <SectionCard id="verificacion" title="Verificación" badge={<Badge tone="success">5 de 6 OK</Badge>}>
            <ul className="space-y-2.5">
              {VERIFICATION.map((v) => (
                <li key={v.label} className="flex items-start gap-3 rounded-xl border border-mist-100 bg-mist-50/40 p-3">
                  <span
                    className={
                      v.state === "verified"
                        ? "mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
                        : "mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700"
                    }
                  >
                    {v.state === "verified" ? (
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l4.5 4.5L19 7" /></svg>
                    ) : (
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M12 5v14M5 12h14" /></svg>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-ink-900">{v.label}</div>
                    <div className="text-[11px] text-mist-500">{v.note}</div>
                  </div>
                  {v.state === "pending" && (
                    <button className="rounded-md bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-800 hover:bg-amber-200">
                      Subir
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* Disponibilidad y tarifa */}
          <SectionCard title="Disponibilidad y tarifa" action="Editar">
            <div className="rounded-xl border border-brand-100 bg-gradient-to-br from-brand-50 to-cyan-50 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-brand-700">Rango de tarifa</div>
              <div className="mt-1 flex items-baseline gap-2">
                <div className="text-2xl font-bold tabular-nums text-ink-900">85 €<span className="text-base font-medium text-mist-500"> – 110 €/h</span></div>
                <div className="flex gap-0.5 text-base font-bold tracking-tighter">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <span key={i} className={i < PRO.rateRange.length ? "text-brand-700" : "text-mist-300"}>€</span>
                  ))}
                </div>
              </div>
              <div className="text-[11px] text-mist-500">{PRO.rateLabel} · Tarifa orientativa, negociable por jornada</div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">Turnos preferidos</div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {PREFERRED_SHIFTS.map((s) => (
                    <span key={s} className="inline-flex items-center rounded-full border border-mist-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-ink-800">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">Ciudades de trabajo</div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {PREFERRED_CITIES.map((c) => (
                    <span key={c} className="inline-flex items-center rounded-full border border-mist-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-ink-800">{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Insignias */}
          <SectionCard title="Insignias">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {PRO.rep.badges.map((b) => (
                <div key={b} className="rounded-xl border border-mist-200 bg-mist-50/40 p-3 text-center">
                  <BadgeChip b={b} />
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-mist-500">
              Las insignias se otorgan automáticamente según tu actividad y valoraciones.
            </p>
          </SectionCard>
        </div>
      </div>

      {/* Reseñas */}
      <section className="mt-6">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Reseñas recientes</div>
            <h3 className="text-lg font-semibold tracking-tight text-ink-900">Lo que dicen las clínicas sobre ti</h3>
          </div>
          <button type="button" className="text-xs font-semibold text-brand-700 hover:text-brand-800">Ver todas ({PRO.rep.reviews}) →</button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <article key={r.by} className="rounded-2xl border border-mist-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <Avatar name={r.by} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink-900">{r.by}</div>
                  <div className="text-[11px] text-mist-500">{r.role}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <StarRow value={r.rating} />
                <span className="text-[11px] text-mist-500">{r.when}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-800">&ldquo;{r.text}&rdquo;</p>
            </article>
          ))}
        </div>
      </section>

      {/* Public profile CTA */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-mist-200 bg-white">
        <div className="grid gap-4 p-6 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-6 md:p-8">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-cyan-500 text-white">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
          </span>
          <div>
            <div className="text-base font-semibold tracking-tight text-ink-900">Tu perfil público</div>
            <p className="text-sm text-mist-500">
              Compártelo con clínicas o redes profesionales. La URL es estable y se actualiza con tus cambios automáticamente.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-mist-200 bg-mist-50 px-3 py-2 text-xs font-mono text-ink-800">
              <svg className="h-3.5 w-3.5 text-mist-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /></svg>
              saludconet.es/p/lucia-martin
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">Copiar enlace</Button>
            <Button size="sm">Abrir vista pública</Button>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}

function ProfileStat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-mist-200 bg-white p-4 md:p-5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">{label}</div>
      <div className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-ink-900 md:text-3xl">{value}</div>
      {hint && <div className="mt-1 text-[11px] text-mist-500">{hint}</div>}
    </div>
  );
}

function SectionCard({
  id,
  title,
  action,
  badge,
  children,
}: {
  id?: string;
  title: string;
  action?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="rounded-2xl border border-mist-200 bg-white p-5 md:p-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold tracking-tight text-ink-900">{title}</h3>
        <div className="flex items-center gap-2">
          {badge}
          {action && (
            <button className="rounded-md border border-mist-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-ink-800 hover:bg-mist-50">
              {action}
            </button>
          )}
        </div>
      </header>
      {children}
    </section>
  );
}

function MiniFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-ink-900">{value}</div>
    </div>
  );
}
