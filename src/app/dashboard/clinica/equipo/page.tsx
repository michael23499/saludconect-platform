import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { NAV_CLINICA, USER_CLINICA } from "@/lib/dashboard-nav";

export const metadata = { title: "Mi equipo · SaludCoNet" };

type Role = "Administrador" | "Editor" | "Solo lectura";

const TEAM: Array<{
  name: string;
  email: string;
  role: Role;
  site: string;
  status: "activo" | "invitado" | "suspendido";
  lastActive: string;
}> = [
  { name: "Marta Vives", email: "marta@clinicamediterranea.es", role: "Administrador", site: "Sede Centro", status: "activo", lastActive: "hace 2 min" },
  { name: "Luis Ferrer", email: "luis@clinicamediterranea.es", role: "Editor", site: "Sede Centro", status: "activo", lastActive: "hoy, 10:42" },
  { name: "Andrea Iglesias", email: "andrea@clinicamediterranea.es", role: "Editor", site: "Sede Norte", status: "activo", lastActive: "ayer, 17:18" },
  { name: "Roberto Lima", email: "r.lima@clinicamediterranea.es", role: "Solo lectura", site: "Sede Sur", status: "activo", lastActive: "hace 3 días" },
  { name: "Pendiente · jefe@otraclinica.es", email: "jefe@otraclinica.es", role: "Editor", site: "Sede Centro", status: "invitado", lastActive: "—" },
];

const SITES = [
  { name: "Sede Centro", address: "Calle Alcalá 200, Madrid", members: 3, bookings: 28 },
  { name: "Sede Norte", address: "Av. de la Castellana 95, Madrid", members: 1, bookings: 14 },
  { name: "Sede Sur", address: "Calle Méndez Álvaro 12, Madrid", members: 1, bookings: 9 },
];

const ROLE_PERMS: Record<Role, string[]> = {
  Administrador: ["Gestionar equipo", "Suscripción y facturación", "Publicar necesidades", "Aceptar/rechazar reservas", "Configuración"],
  Editor: ["Publicar necesidades", "Aceptar/rechazar reservas", "Mensajería"],
  "Solo lectura": ["Ver calendario", "Ver reservas", "Mensajería"],
};

function statusTone(s: string) {
  if (s === "activo") return "success" as const;
  if (s === "invitado") return "warning" as const;
  return "danger" as const;
}

export default function EquipoPage() {
  return (
    <DashboardShell role="Clínica" user={USER_CLINICA} nav={NAV_CLINICA}>
      <PageHeader
        title="Mi equipo"
        subtitle="Gestiona usuarios, roles y sedes de tu clínica."
        actions={
          <>
            <Button variant="secondary" size="sm">Ver registro de actividad</Button>
            <Button size="sm">+ Invitar miembro</Button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-mist-200 bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-mist-500">Miembros</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">5</div>
          <div className="mt-1 text-xs text-emerald-600">4 activos · 1 invitado</div>
        </div>
        <div className="rounded-2xl border border-mist-200 bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-mist-500">Administradores</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">1</div>
          <div className="mt-1 text-xs text-mist-500">Marta Vives</div>
        </div>
        <div className="rounded-2xl border border-mist-200 bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-mist-500">Sedes activas</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">3</div>
          <div className="mt-1 text-xs text-mist-500">Plan Clínica Pro</div>
        </div>
        <div className="rounded-2xl border border-mist-200 bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-mist-500">Pendiente aceptar</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-amber-700">1</div>
          <div className="mt-1 text-xs text-mist-500">Invitación enviada hace 2 días</div>
        </div>
      </div>

      {/* Members table */}
      <div className="mt-6 rounded-2xl border border-mist-200 bg-white">
        <div className="flex items-center justify-between border-b border-mist-100 p-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Miembros del equipo</div>
            <div className="text-lg font-semibold tracking-tight text-ink-900">{TEAM.length} usuarios</div>
          </div>
          <div className="flex gap-1.5 rounded-lg border border-mist-200 p-1 text-xs">
            <button className="rounded-md bg-mist-100 px-2.5 py-1 font-semibold text-ink-900">Todos</button>
            <button className="rounded-md px-2.5 py-1 text-mist-500">Activos</button>
            <button className="rounded-md px-2.5 py-1 text-mist-500">Invitados</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-mist-50/60 text-left text-[11px] font-semibold uppercase tracking-wider text-mist-500">
              <tr>
                <th className="px-5 py-2.5">Usuario</th>
                <th className="px-5 py-2.5">Rol</th>
                <th className="px-5 py-2.5">Sede</th>
                <th className="px-5 py-2.5">Estado</th>
                <th className="px-5 py-2.5">Última actividad</th>
                <th className="px-5 py-2.5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist-100">
              {TEAM.map((m) => (
                <tr key={m.email} className="hover:bg-mist-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={m.name} size="sm" />
                      <div className="min-w-0">
                        <div className="truncate text-[14px] font-semibold text-ink-900">{m.name}</div>
                        <div className="truncate text-xs text-mist-500">{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={m.role === "Administrador" ? "brand" : m.role === "Editor" ? "accent" : "neutral"}>
                      {m.role}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-mist-500">{m.site}</td>
                  <td className="px-5 py-3"><Badge tone={statusTone(m.status)}>{m.status}</Badge></td>
                  <td className="px-5 py-3 text-xs text-mist-500">{m.lastActive}</td>
                  <td className="px-5 py-3 text-right">
                    <button className="rounded-lg border border-mist-200 px-3 py-1.5 text-xs font-medium text-ink-800 hover:bg-mist-50">
                      Gestionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sites + roles & permissions */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-mist-200 bg-white">
          <div className="flex items-center justify-between border-b border-mist-100 p-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Sedes</div>
              <div className="text-lg font-semibold tracking-tight text-ink-900">Tus ubicaciones</div>
            </div>
            <Button variant="secondary" size="sm">+ Añadir sede</Button>
          </div>
          <div className="divide-y divide-mist-100">
            {SITES.map((s) => (
              <div key={s.name} className="flex items-center gap-4 p-5">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M12 22s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12z" strokeLinejoin="round" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink-900">{s.name}</div>
                  <div className="truncate text-xs text-mist-500">{s.address}</div>
                  <div className="mt-1 text-xs text-mist-500">
                    <span className="font-medium text-ink-800">{s.members}</span> miembros · <span className="font-medium text-ink-800">{s.bookings}</span> reservas
                  </div>
                </div>
                <button className="rounded-lg border border-mist-200 px-3 py-1.5 text-xs font-medium text-ink-800 hover:bg-mist-50">
                  Editar
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-mist-200 bg-white">
          <div className="border-b border-mist-100 p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Roles y permisos</div>
            <div className="text-lg font-semibold tracking-tight text-ink-900">Qué puede hacer cada rol</div>
          </div>
          <div className="space-y-4 p-5">
            {(Object.entries(ROLE_PERMS) as Array<[Role, string[]]>).map(([role, perms]) => (
              <div key={role} className="rounded-xl border border-mist-200 bg-mist-50/40 p-4">
                <div className="flex items-center gap-2">
                  <Badge tone={role === "Administrador" ? "brand" : role === "Editor" ? "accent" : "neutral"}>{role}</Badge>
                  <span className="text-xs text-mist-500">{perms.length} permisos</span>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {perms.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-[13px] text-ink-800">
                      <svg className="h-3.5 w-3.5 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M5 12l4.5 4.5L19 7" /></svg>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending invitations */}
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M4 4h16v16H4z" /><path d="M4 4l8 8 8-8" />
            </svg>
          </span>
          <div className="flex-1">
            <div className="text-sm font-semibold text-ink-900">1 invitación pendiente</div>
            <div className="text-xs text-mist-500">jefe@otraclinica.es · enviada hace 2 días</div>
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg border border-mist-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-800 hover:bg-mist-50">Reenviar</button>
            <button className="rounded-lg border border-red-100 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50">Cancelar</button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
