import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CalendarWorkspace } from "@/components/dashboard/CalendarWorkspace";
import { PRO_CALENDAR } from "@/lib/mock-calendar";
import { NAV_PRO, USER_PRO } from "@/lib/dashboard-nav";

export const metadata = { title: "Calendario · Profesional · SaludCoNet" };

export default function ProfesionalCalendarioPage() {
  return (
    <DashboardShell role="Profesional" user={USER_PRO} nav={NAV_PRO}>
      <PageHeader
        title="Tu calendario"
        subtitle="Gestiona disponibilidad, plantillas semanales y reservas en una sola vista."
        actions={
          <>
            <Badge tone="success" className="hidden md:inline-flex">Sincronizado · hace 2 min</Badge>
            <Button variant="secondary" size="sm">Exportar (.ics)</Button>
            <Button size="sm">+ Nueva jornada</Button>
          </>
        }
      />

      <CalendarWorkspace role="profesional" data={PRO_CALENDAR} initialDate={new Date(2026, 4, 1)} />

      <div className="mt-8 rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-cyan-50 p-5 md:p-6">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">Consejo de productividad</div>
            <div className="mt-1 text-base font-semibold text-ink-900">
              Las profesionales con disponibilidad publicada con +14 días reciben un 38% más de solicitudes.
            </div>
            <p className="mt-1 text-sm text-ink-800">
              Aplica una plantilla a tu mes y deja que las clínicas reserven directamente sobre tus huecos abiertos.
            </p>
          </div>
          <Button>Configurar plantilla por defecto</Button>
        </div>
      </div>
    </DashboardShell>
  );
}
