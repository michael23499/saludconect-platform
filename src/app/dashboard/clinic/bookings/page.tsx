import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { Button } from "@/components/ui/Button";
import { ReservasView } from "@/components/dashboard/ReservasView";
import { CLINICA_RESERVAS } from "@/lib/mock-reservas";
import { NAV_CLINICA, USER_CLINICA } from "@/lib/dashboard-nav";

export const metadata = { title: "Reservas · Clínica · SaludCoNet" };

export default function ClinicaReservasPage() {
  return (
    <DashboardShell role="Clínica" user={USER_CLINICA} nav={NAV_CLINICA}>
      <PageHeader
        title="Reservas de la clínica"
        subtitle="Aprueba solicitudes, sigue las jornadas activas y exporta tu actividad."
        actions={
          <>
            <Button variant="secondary" size="sm">Exportar CSV</Button>
            <Button href="/search" size="sm">+ Publicar necesidad</Button>
          </>
        }
      />
      <ReservasView role="clinic" items={CLINICA_RESERVAS} />
    </DashboardShell>
  );
}
