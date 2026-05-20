import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { Button } from "@/components/ui/Button";
import { ReservasView } from "@/components/dashboard/ReservasView";
import { PRO_RESERVAS } from "@/lib/mock-reservas";
import { NAV_PRO, USER_PRO } from "@/lib/dashboard-nav";

export const metadata = { title: "Reservas · Profesional · SaludCoNet" };

export default function ProfesionalReservasPage() {
  return (
    <DashboardShell role="Profesional" user={USER_PRO} nav={NAV_PRO}>
      <PageHeader
        title="Tus reservas"
        subtitle="Gestiona solicitudes, acepta jornadas y consulta tu histórico completo."
        actions={
          <>
            <Button variant="secondary" size="sm">Exportar CSV</Button>
            <Button href="/buscar" size="sm">Buscar nuevas jornadas</Button>
          </>
        }
      />
      <ReservasView role="profesional" items={PRO_RESERVAS} />
    </DashboardShell>
  );
}
