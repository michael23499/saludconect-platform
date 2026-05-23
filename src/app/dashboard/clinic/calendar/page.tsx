import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CalendarWorkspace } from "@/components/dashboard/CalendarWorkspace";
import { CLINIC_CALENDAR } from "@/lib/mock-calendar-clinic";
import { NAV_CLINICA, USER_CLINICA } from "@/lib/dashboard-nav";

export const metadata = { title: "Calendario · Clínica · SaludCoNet" };

export default function ClinicaCalendarioPage() {
  return (
    <DashboardShell role="Clínica" user={USER_CLINICA} nav={NAV_CLINICA}>
      <PageHeader
        title="Calendario operativo"
        subtitle="Coberturas, turnos publicados y planificación mensual de tu clínica."
        actions={
          <>
            <Badge tone="brand" className="hidden md:inline-flex">2 turnos sin cubrir</Badge>
            <Button variant="secondary" size="sm">Importar Google Calendar</Button>
            <Button size="sm">+ Publicar turno</Button>
          </>
        }
      />

      <CalendarWorkspace role="clinic" data={CLINIC_CALENDAR} initialDate={new Date(2026, 4, 1)} />
    </DashboardShell>
  );
}
