import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { Button } from "@/components/ui/Button";
import { MessagesView } from "@/components/dashboard/MessagesView";
import { PRO_THREADS } from "@/lib/mock-messages";
import { NAV_PRO, USER_PRO } from "@/lib/dashboard-nav";

export const metadata = { title: "Mensajes · Profesional · SaludCoNet" };

export default function ProfesionalMensajesPage() {
  return (
    <DashboardShell role="Profesional" user={USER_PRO} nav={NAV_PRO}>
      <PageHeader
        title="Mensajes"
        subtitle="Centro de conversaciones con tus clínicas. Sin salir de la plataforma."
        actions={<Button size="sm">+ Nuevo mensaje</Button>}
      />
      <MessagesView role="profesional" threads={PRO_THREADS} />
    </DashboardShell>
  );
}
