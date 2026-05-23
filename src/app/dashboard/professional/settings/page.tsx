import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { SettingsTabs } from "@/components/dashboard/SettingsTabs";
import { NAV_PRO, USER_PRO } from "@/lib/dashboard-nav";

export const metadata = { title: "Ajustes · Profesional · SaludCoNet" };

export default function ProfesionalAjustesPage() {
  return (
    <DashboardShell role="Profesional" user={USER_PRO} nav={NAV_PRO}>
      <PageHeader
        title="Ajustes"
        subtitle="Gestiona tu perfil profesional, cobros, notificaciones y seguridad."
      />
      <SettingsTabs role="professional" />
    </DashboardShell>
  );
}
