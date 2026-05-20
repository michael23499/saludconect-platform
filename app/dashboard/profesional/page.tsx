import { DashboardShell, PageHeader, Kpi } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { InteractiveCalendar } from "@/components/dashboard/InteractiveCalendar";
import { PRO_CALENDAR } from "@/lib/mock-calendar";
import { NAV_PRO, USER_PRO } from "@/lib/dashboard-nav";

export const metadata = { title: "Área del profesional · SaludCoNet" };

const REQUESTS = [
  { clinic: "Clínica Sanitas Norte", city: "Madrid", date: "Mié 28 May · Mañana", spec: "Cardiología", fee: "85 €/h", state: "pendiente" as const },
  { clinic: "Centro Médico Bilbao", city: "Bilbao", date: "Vie 30 May · Tarde", spec: "Cardiología", fee: "90 €/h", state: "pendiente" as const },
  { clinic: "Clínica Mediterránea", city: "Valencia", date: "Lun 2 Jun · Mañana", spec: "Cardiología", fee: "80 €/h", state: "confirmada" as const },
];

export default function ProfesionalDashboardPage() {
  return (
    <DashboardShell role="Profesional" user={USER_PRO} nav={NAV_PRO}>
      <PageHeader
        title="Buenos días, Lucía"
        subtitle="Tienes 3 solicitudes nuevas y 2 mensajes sin leer."
        actions={
          <>
            <Button href="/dashboard/profesional/calendario" variant="secondary" size="sm">
              Editar disponibilidad
            </Button>
            <Button href="/buscar" size="sm">Buscar jornadas</Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Solicitudes activas" value="3" hint="+1 esta semana" tone="up" />
        <Kpi label="Reservas confirmadas" value="12" hint="Mayo" tone="neutral" />
        <Kpi label="Ingresos del mes" value="3.420 €" hint="+18% vs. abril" tone="up" />
        <Kpi label="Valoración media" value="4,9" hint="32 valoraciones" tone="neutral" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <InteractiveCalendar initialDate={new Date(2026, 4, 1)} data={PRO_CALENDAR} />

        <div className="rounded-2xl border border-mist-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Solicitudes pendientes</div>
              <div className="text-lg font-semibold tracking-tight text-ink-900">Reservas entrantes</div>
            </div>
            <a href="/dashboard/profesional/reservas" className="text-xs font-semibold text-brand-700 hover:text-brand-800">Ver todas →</a>
          </div>
          <div className="mt-4 space-y-3">
            {REQUESTS.map((r) => (
              <div key={r.clinic} className="rounded-xl border border-mist-200 bg-mist-50/50 p-4">
                <div className="flex items-start gap-3">
                  <Avatar name={r.clinic} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-semibold text-ink-900">{r.clinic}</div>
                      <Badge tone={r.state === "confirmada" ? "success" : "warning"}>
                        {r.state}
                      </Badge>
                    </div>
                    <div className="mt-0.5 text-xs text-mist-500">{r.city} · {r.spec}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span className="font-medium text-ink-800">{r.date}</span>
                      <span className="font-semibold text-brand-700">{r.fee}</span>
                    </div>
                  </div>
                </div>
                {r.state === "pendiente" && (
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 rounded-lg border border-mist-200 px-3 py-2 text-xs font-medium text-ink-800 hover:bg-white">Rechazar</button>
                    <button className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700">Aceptar</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-mist-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold tracking-tight text-ink-900">Estado de tu perfil</div>
            <Badge tone="success">85% completo</Badge>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-mist-100">
            <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-brand-500 to-cyan-400" />
          </div>
          <ul className="mt-5 space-y-3 text-sm">
            {[
              ["DNI verificado", true],
              ["Titulación verificada", true],
              ["Colegiación verificada", true],
              ["Certificado de especialidad", true],
              ["Foto profesional de perfil", false],
            ].map(([t, ok]) => (
              <li key={String(t)} className="flex items-center gap-2.5">
                {ok ? (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l4.5 4.5L19 7" /></svg>
                  </span>
                ) : (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-mist-300 bg-white text-mist-400">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M12 5v14M5 12h14" /></svg>
                  </span>
                )}
                <span className={ok ? "text-ink-800" : "text-mist-500"}>{t as string}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-mist-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold tracking-tight text-ink-900">Próximas jornadas</div>
            <a href="#" className="text-xs font-semibold text-brand-700">Calendario completo →</a>
          </div>
          <div className="mt-4 divide-y divide-mist-100">
            {[
              { d: "12", m: "May", t: "Clínica Sanitas Norte", spec: "Mañana · Cardiología" },
              { d: "21", m: "May", t: "Centro Médico Bilbao", spec: "Tarde · Cardiología" },
              { d: "28", m: "May", t: "Clínica Mediterránea", spec: "Mañana · Cardiología" },
            ].map((j) => (
              <div key={j.d + j.t} className="flex items-center gap-4 py-3">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl border border-mist-200 bg-mist-50">
                  <div className="text-base font-semibold text-ink-900">{j.d}</div>
                  <div className="text-[10px] uppercase tracking-wider text-mist-500">{j.m}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink-900">{j.t}</div>
                  <div className="text-xs text-mist-500">{j.spec}</div>
                </div>
                <button className="rounded-lg border border-mist-200 px-3 py-1.5 text-xs font-medium text-ink-800 hover:bg-mist-50">Detalles</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
