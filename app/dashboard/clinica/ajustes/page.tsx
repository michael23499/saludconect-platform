import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { NAV_CLINICA, USER_CLINICA } from "@/lib/dashboard-nav";
import { SettingsTabs } from "@/components/dashboard/SettingsTabs";

export const metadata = { title: "Ajustes · SaludCoNet" };

export default function AjustesPage() {
  return (
    <DashboardShell role="Clínica" user={USER_CLINICA} nav={NAV_CLINICA}>
      <PageHeader
        title="Ajustes"
        subtitle="Configura los datos de tu clínica, notificaciones, seguridad e integraciones."
      />
      <SettingsTabs />
    </DashboardShell>
  );
}
