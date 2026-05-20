import { DashboardShell, PageHeader, Kpi, type NavItem } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";

export const metadata = { title: "Panel administrador · SaludCoNet" };

const ICONS = {
  home: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12L12 4l9 8" /><path d="M5 10v10h14V10" /></svg>,
  check: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" /></svg>,
  team: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="9" r="3.5" /><path d="M3 20a6 6 0 0112 0" /></svg>,
  card: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="13" rx="2" /></svg>,
  chart: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20V8M10 20V4M16 20v-9M22 20H2" /></svg>,
  flag: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 21V4l13 4-5 3 5 3-13 0" /></svg>,
};

const NAV: NavItem[] = [
  { href: "/admin", label: "Resumen", icon: ICONS.home },
  { href: "#", label: "Aprobaciones", icon: ICONS.check, badge: "8" },
  { href: "#", label: "Usuarios", icon: ICONS.team },
  { href: "#", label: "Pagos", icon: ICONS.card },
  { href: "#", label: "Estadísticas", icon: ICONS.chart },
  { href: "#", label: "Moderación", icon: ICONS.flag },
];

const APROBACIONES = [
  { name: "Dra. Beatriz Soler", role: "Médico/a · Oftalmología · Sevilla", date: "hace 12 min", docs: 4 },
  { name: "Roberto Vela", role: "Fisioterapeuta · Madrid", date: "hace 1 h", docs: 3 },
  { name: "Clínica Salud Vives", role: "Centro multi-sede · 4 ubicaciones", date: "hace 2 h", docs: 6 },
  { name: "Laura Gómez", role: "Enfermero/a · Sevilla", date: "hace 5 h", docs: 2 },
];

const PAGOS = [
  { client: "Clínica Mediterránea", plan: "Clínica Pro", amount: "149 €", state: "pagado", date: "15 May" },
  { client: "Centro Dental Norte", plan: "Clínica Starter", amount: "79 €", state: "pagado", date: "14 May" },
  { client: "Clínica Sanitas Norte", plan: "Clínica Pro", amount: "149 €", state: "pendiente", date: "14 May" },
  { client: "Salud Vives", plan: "Clínica Pro × 4", amount: "596 €", state: "pagado", date: "12 May" },
  { client: "Clínica Bilbao", plan: "Clínica Starter", amount: "79 €", state: "fallido", date: "11 May" },
];

function tone(state: string) {
  if (state === "pagado") return "success" as const;
  if (state === "pendiente") return "warning" as const;
  return "danger" as const;
}

export default function AdminPage() {
  return (
    <DashboardShell
      role="Administrador"
      user={{ name: "Admin SaludCoNet", subtitle: "Permisos completos" }}
      nav={NAV}
    >
      <PageHeader
        title="Panel de administración"
        subtitle="Métricas, aprobaciones de perfiles, pagos y salud de la plataforma."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Usuarios totales" value="5.362" hint="+128 esta semana" tone="up" />
        <Kpi label="Clínicas activas" value="321" hint="+12 esta semana" tone="up" />
        <Kpi label="MRR" value="38.420 €" hint="+9,3% MoM" tone="up" />
        <Kpi label="Aprobaciones pendientes" value="8" hint="Revisar hoy" tone="down" />
      </div>

      {/* Chart */}
      <div className="mt-6 rounded-2xl border border-mist-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Actividad de la plataforma</div>
            <div className="text-lg font-semibold tracking-tight text-ink-900">Reservas completadas · últimos 30 días</div>
          </div>
          <Badge tone="brand">+34,2%</Badge>
        </div>
        <div className="mt-6">
          <div className="flex h-44 items-end gap-1.5">
            {[42, 51, 38, 60, 72, 55, 80, 67, 90, 84, 95, 88, 103, 96, 110, 118, 112, 126, 134, 121, 142, 138, 150, 162, 156, 170, 178, 165, 188, 196].map((v, i) => (
              <div key={i} className="group relative flex-1">
                <div
                  className="rounded-md bg-gradient-to-t from-brand-500 to-cyan-400 transition group-hover:from-brand-700"
                  style={{ height: `${(v / 200) * 100}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-mist-400">
            <span>1 May</span><span>15 May</span><span>30 May</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-2xl border border-mist-200 bg-white">
          <div className="flex items-center justify-between border-b border-mist-100 p-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Cola de aprobación</div>
              <div className="text-lg font-semibold tracking-tight text-ink-900">Perfiles pendientes</div>
            </div>
            <Badge tone="warning">8 pendientes</Badge>
          </div>
          <div className="divide-y divide-mist-100">
            {APROBACIONES.map((a) => (
              <div key={a.name} className="flex items-center gap-4 p-5">
                <Avatar name={a.name} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink-900">{a.name}</div>
                  <div className="text-xs text-mist-500">{a.role}</div>
                  <div className="mt-0.5 text-xs text-mist-400">{a.docs} documentos · {a.date}</div>
                </div>
                <div className="hidden gap-2 md:flex">
                  <button className="rounded-lg border border-mist-200 px-3 py-1.5 text-xs font-medium text-ink-800 hover:bg-mist-50">Rechazar</button>
                  <button className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">Aprobar</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-mist-200 bg-white">
          <div className="flex items-center justify-between border-b border-mist-100 p-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Pagos recientes</div>
              <div className="text-lg font-semibold tracking-tight text-ink-900">Últimas transacciones</div>
            </div>
            <a href="#" className="text-xs font-semibold text-brand-700">Ver todas →</a>
          </div>
          <div className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-mist-50/60 text-left text-[11px] font-semibold uppercase tracking-wider text-mist-500">
                <tr>
                  <th className="px-5 py-2.5">Cliente</th>
                  <th className="px-5 py-2.5">Plan</th>
                  <th className="px-5 py-2.5">Importe</th>
                  <th className="px-5 py-2.5">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mist-100">
                {PAGOS.map((p) => (
                  <tr key={p.client + p.date}>
                    <td className="px-5 py-3 font-medium text-ink-900">{p.client}</td>
                    <td className="px-5 py-3 text-mist-500">{p.plan}</td>
                    <td className="px-5 py-3 font-semibold text-ink-900">{p.amount}</td>
                    <td className="px-5 py-3"><Badge tone={tone(p.state)}>{p.state}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {[
          { t: "Top ciudades", items: [["Madrid", "1.842"], ["Barcelona", "962"], ["Valencia", "618"], ["Sevilla", "412"], ["Bilbao", "297"]] },
          { t: "Top especialidades", items: [["Enfermería", "1.042"], ["Fisioterapia", "521"], ["Odontología", "384"], ["Pediatría", "218"], ["Cardiología", "142"]] },
          { t: "Conversión", items: [["Visitantes web", "42.180"], ["Registros", "1.892"], ["Verificados", "1.612"], ["Activos", "1.247"], ["Clínicas pagando", "321"]] },
        ].map((b) => (
          <div key={b.t} className="rounded-2xl border border-mist-200 bg-white p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{b.t}</div>
            <ul className="mt-3 divide-y divide-mist-100">
              {b.items.map(([k, v]) => (
                <li key={k} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-ink-800">{k}</span>
                  <span className="font-semibold text-ink-900">{v}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
