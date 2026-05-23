import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { Button } from "@/components/ui/Button";
import { MessagesView } from "@/components/dashboard/MessagesView";
import { CLINICA_THREADS } from "@/lib/mock-messages";
import { NAV_CLINICA, USER_CLINICA } from "@/lib/dashboard-nav";

export const metadata = { title: "Mensajes · Clínica · SaludCoNet" };

export default function ClinicaMensajesPage() {
  return (
    <DashboardShell role="Clínica" user={USER_CLINICA} nav={NAV_CLINICA}>
      <PageHeader
        title="Mensajes"
        subtitle="Comunícate con tu red de profesionales en tiempo real."
        actions={<Button size="sm">+ Nuevo mensaje</Button>}
      />
      <MessagesView role="clinic" threads={CLINICA_THREADS} />
    </DashboardShell>
  );
}
