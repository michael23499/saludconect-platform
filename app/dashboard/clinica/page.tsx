import { DashboardShell } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { InteractiveCalendar } from "@/components/dashboard/InteractiveCalendar";
import { CLINIC_CALENDAR } from "@/lib/mock-calendar-clinic";
import { KpiSparkCard } from "@/components/dashboard/Sparkline";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { NAV_CLINICA, USER_CLINICA } from "@/lib/dashboard-nav";

export const metadata = { title: "Área de la clínica · SaludCoNet" };

const URGENT = [
  { kind: "Pendiente de aceptación", who: "Andrés Cano", role: "Fisioterapia", when: "Hoy, 29 May · Tarde", tone: "warning" as const },
  { kind: "Documentación caduca pronto", who: "Lic. apertura sede norte", role: "Vence en 6 días", when: "5 jun 2026", tone: "danger" as const },
  { kind: "Mensaje sin leer", who: "Dra. Lucía Martín", role: "Sobre la jornada 28 May", when: "hace 12 min", tone: "brand" as const },
];

const UPCOMING = [
  { name: "Dra. Lucía Martín", spec: "Cardióloga · Madrid", day: "28", mon: "May", time: "08:00 - 14:00", rate: "Especialista senior · €€€", state: "confirmada" as const },
  { name: "Andrés Cano", spec: "Fisioterapeuta · Madrid", day: "29", mon: "May", time: "16:00 - 20:00", rate: "Profesional consolidado · €€", state: "pendiente" as const },
  { name: "Inés Vera", spec: "Pediatra · Madrid", day: "30", mon: "May", time: "09:00 - 13:00", rate: "Profesional consolidado · €€", state: "pendiente" as const },
  { name: "Dr. Jorge Pol", spec: "Anestesista · Madrid", day: "02", mon: "Jun", time: "08:00 - 14:00", rate: "Especialista premium · €€€€", state: "confirmada" as const },
];

const TOP_COLLABORATORS = [
  { name: "Dra. Lucía Martín", role: "Cardiología", reservas: 14, rating: 4.9 },
  { name: "Diego Alarcón", role: "Fisioterapia", reservas: 11, rating: 4.9 },
  { name: "Marta Lozano", role: "Enfermería", reservas: 9, rating: 4.8 },
  { name: "Dra. Sofía Morales", role: "Odontología", reservas: 7, rating: 4.9 },
];

const CANDIDATES = [
  { name: "Diego Alarcón", role: "Fisioterapia · 12 años exp.", city: "Madrid", rate: "€€", avail: true, level: "Top Rated" },
  { name: "Dra. Cristina Vidal", role: "Ginecología · 11 años exp.", city: "Zaragoza", rate: "€€€", avail: true, level: "Top Rated" },
  { name: "Patricia Ferrer", role: "Psicología · 6 años exp.", city: "Móstoles", rate: "€€", avail: false, level: "Trusted" },
];

export default function ClinicaDashboardPage() {
  return (
    <DashboardShell role="Clínica" user={USER_CLINICA} nav={NAV_CLINICA}>
      {/* Welcome banner */}
      <div className="relative mb-6 overflow-hidden rounded-3xl border border-mist-200 bg-gradient-to-br from-ink-950 via-ink-900 to-brand-800 p-6 text-white md:p-8">
        <div className="bg-grid absolute inset-0 opacity-20" />
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="relative flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Todo en marcha · Mié 20 May 2026
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
              Hola, Clínica Mediterránea
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-white/70 md:text-base">
              Esta semana tienes <span className="font-semibold text-cyan-300">12 reservas activas</span>, 2 coberturas urgentes y 3 mensajes sin leer.
            </p>
          </div>
          <div className="flex gap-2">
            <Button href="/buscar" variant="outline" size="md">Buscar profesionales</Button>
            <Button href="/dashboard/clinica/publicar" size="md">+ Publicar necesidad</Button>
          </div>
        </div>
      </div>

      {/* KPIs with sparklines */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiSparkCard
          index={0}
          label="Reservas activas"
          value="12"
          hint="+3 esta semana"
          tone="up"
          spark={[5, 6, 5, 7, 8, 7, 9, 10, 9, 11, 10, 12]}
          sparkColor="#2563eb"
          sparkFillFrom="rgba(37,99,235,0.22)"
        />
        <KpiSparkCard
          index={1}
          label="Tiempo medio cobertura"
          value="3 h 48 m"
          hint="−42 m vs. semana ant."
          tone="up"
          spark={[8, 7.6, 7.2, 7, 6.5, 6, 5.5, 5.2, 5, 4.6, 4.2, 3.8]}
          sparkColor="#06b6d4"
          sparkFillFrom="rgba(6,182,212,0.22)"
        />
        <KpiSparkCard
          index={2}
          label="Gasto del mes"
          value="6.840 €"
          hint="Presupuesto 78%"
          tone="neutral"
          spark={[2, 3, 2.5, 3.5, 4, 4.5, 5, 5.5, 6, 6.2, 6.5, 6.8]}
          sparkColor="#1e40af"
          sparkFillFrom="rgba(30,64,175,0.22)"
        />
        <KpiSparkCard
          index={3}
          label="Satisfacción media"
          value="4,9 ★"
          hint="32 valoraciones nuevas"
          tone="up"
          spark={[4.6, 4.7, 4.7, 4.8, 4.7, 4.8, 4.8, 4.9, 4.8, 4.9, 4.9, 4.9]}
          sparkColor="#10b981"
          sparkFillFrom="rgba(16,185,129,0.22)"
        />
      </div>

      {/* Urgent + Quick actions */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-mist-200 bg-white">
          <div className="flex items-center justify-between border-b border-mist-100 p-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Atención requerida</div>
              <div className="text-lg font-semibold tracking-tight text-ink-900">3 cosas pendientes</div>
            </div>
            <Badge tone="warning">Hoy</Badge>
          </div>
          <ul className="divide-y divide-mist-100">
            {URGENT.map((u) => (
              <li key={u.who + u.kind} className="flex items-start gap-4 p-5">
                <span
                  className={
                    u.tone === "danger"
                      ? "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600"
                      : u.tone === "warning"
                      ? "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600"
                      : "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"
                  }
                >
                  {u.tone === "danger" ? (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.3l-8 14A2 2 0 004 20.5h16a2 2 0 001.7-3.2l-8-14a2 2 0 00-3.4 0z" /></svg>
                  ) : u.tone === "warning" ? (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" /></svg>
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12c0 4.4-4 8-9 8-1.4 0-2.7-.2-3.9-.7L3 21l1.7-4.6C3.6 15 3 13.6 3 12c0-4.4 4-8 9-8s9 3.6 9 8z" /></svg>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-mist-500">{u.kind}</div>
                  <div className="text-sm font-semibold text-ink-900">{u.who}</div>
                  <div className="mt-0.5 text-xs text-mist-500">{u.role} · {u.when}</div>
                </div>
                <button className="rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-ink-800">Revisar</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          {/* Quick actions */}
          <div className="rounded-2xl border border-mist-200 bg-white p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Acciones rápidas</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { i: "＋", t: "Publicar necesidad", href: "/dashboard/clinica/publicar" },
                { i: "◷", t: "Crear turno", href: "/dashboard/clinica/calendario" },
                { i: "✉", t: "Mensaje rápido", href: "/dashboard/clinica/mensajes" },
                { i: "▤", t: "Exportar reporte", href: "#" },
              ].map((a) => (
                <a
                  key={a.t}
                  href={a.href}
                  className="card-hover flex flex-col items-start gap-2 rounded-xl border border-mist-200 bg-mist-50/40 p-3 text-left"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">{a.i}</span>
                  <span className="text-[13px] font-semibold text-ink-900">{a.t}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Budget progress */}
          <div className="rounded-2xl border border-mist-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Presupuesto del mes</div>
              <span className="text-xs font-semibold text-brand-700">78% usado</span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-mist-100">
              <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-brand-500 to-cyan-400" />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-mist-500">
              <span>6.840 €</span>
              <span>de 8.800 €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity chart */}
      <div className="mt-6">
        <ActivityChart />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        {/* Upcoming bookings timeline */}
        <div className="rounded-2xl border border-mist-200 bg-white">
          <div className="flex items-center justify-between border-b border-mist-100 p-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Próximas reservas</div>
              <div className="text-lg font-semibold tracking-tight text-ink-900">Confirmadas y pendientes</div>
            </div>
            <div className="flex gap-1.5 rounded-lg border border-mist-200 p-1 text-xs">
              <button className="rounded-md bg-mist-100 px-2.5 py-1 font-semibold text-ink-900">Todas</button>
              <button className="rounded-md px-2.5 py-1 text-mist-500">Confirmadas</button>
              <button className="rounded-md px-2.5 py-1 text-mist-500">Pendientes</button>
            </div>
          </div>
          <div className="divide-y divide-mist-100">
            {UPCOMING.map((u) => (
              <div key={u.name + u.day} className="flex items-center gap-4 p-5">
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-mist-200 bg-gradient-to-b from-mist-50 to-white">
                  <div className="text-lg font-semibold leading-none text-ink-900">{u.day}</div>
                  <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-mist-500">{u.mon}</div>
                </div>
                <Avatar name={u.name} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="truncate text-sm font-semibold text-ink-900">{u.name}</div>
                    <Badge tone={u.state === "confirmada" ? "success" : "warning"}>{u.state}</Badge>
                  </div>
                  <div className="text-xs text-mist-500">{u.spec}</div>
                  <div className="mt-0.5 text-xs font-medium text-ink-800">{u.time} · <span className="text-brand-700">{u.rate}</span></div>
                </div>
                <button className="hidden rounded-lg border border-mist-200 px-3 py-1.5 text-xs font-medium text-ink-800 hover:bg-mist-50 md:inline-flex">Detalles</button>
              </div>
            ))}
          </div>
        </div>

        {/* Top collaborators */}
        <div className="rounded-2xl border border-mist-200 bg-white">
          <div className="flex items-center justify-between border-b border-mist-100 p-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Top colaboradores</div>
              <div className="text-lg font-semibold tracking-tight text-ink-900">Este mes</div>
            </div>
          </div>
          <ol className="divide-y divide-mist-100">
            {TOP_COLLABORATORS.map((c, i) => (
              <li key={c.name} className="flex items-center gap-3 p-4">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-600 to-cyan-500 text-xs font-bold text-white">
                  #{i + 1}
                </div>
                <Avatar name={c.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink-900">{c.name}</div>
                  <div className="text-xs text-mist-500">{c.role} · {c.reservas} reservas</div>
                </div>
                <span className="text-sm font-semibold text-ink-900">★ {c.rating}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Calendar */}
      <div className="mt-6">
        <InteractiveCalendar initialDate={new Date(2026, 4, 1)} data={CLINIC_CALENDAR} />
      </div>

      {/* Subscription + Suggested */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.6fr]">
        <div className="rounded-2xl border border-mist-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold tracking-tight text-ink-900">Suscripción</div>
            <Badge tone="success">Activa</Badge>
          </div>
          <div className="mt-4 rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-cyan-50 p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">Plan Clínica Pro</div>
            <div className="mt-1 text-3xl font-semibold tracking-tight text-ink-900">149 €<span className="text-base font-normal text-mist-500"> /mes</span></div>
            <div className="mt-1 text-xs text-mist-500">Próxima renovación: 15 jun 2026</div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-ink-800 hover:bg-mist-50">Ver factura</button>
              <button className="flex-1 rounded-lg bg-ink-900 px-3 py-2 text-xs font-semibold text-white hover:bg-ink-800">Gestionar</button>
            </div>
          </div>
          <div className="mt-5 space-y-2.5 text-sm">
            {["Reservas ilimitadas", "Multi-sede", "Solicitudes prioritarias", "Acceso a perfiles Elite"].map((f) => (
              <div key={f} className="flex items-center gap-2 text-ink-800">
                <svg className="h-4 w-4 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12l4.5 4.5L19 7" /></svg>
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-mist-200 bg-white">
          <div className="flex items-center justify-between border-b border-mist-100 p-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Talento sugerido</div>
              <div className="text-lg font-semibold tracking-tight text-ink-900">Profesionales recomendados para ti</div>
            </div>
            <Button href="/buscar" variant="secondary" size="sm">Ver todos</Button>
          </div>
          <div className="grid gap-px bg-mist-100 md:grid-cols-3">
            {CANDIDATES.map((c) => (
              <div key={c.name} className="bg-white p-5">
                <div className="flex items-center gap-3">
                  <Avatar name={c.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-ink-900">{c.name}</div>
                    <div className="text-xs text-mist-500">{c.role}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <Badge tone="brand">{c.level}</Badge>
                  <span className="font-semibold text-brand-700">{c.rate}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-mist-500">{c.city}</span>
                  <Badge tone={c.avail ? "success" : "neutral"}>{c.avail ? "Disponible" : "Ocupado"}</Badge>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 rounded-lg border border-mist-200 px-3 py-2 text-xs font-medium text-ink-800 hover:bg-mist-50">Ver perfil</button>
                  <button className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700">Reservar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
