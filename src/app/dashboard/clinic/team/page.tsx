import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { NAV_CLINICA } from "@/lib/dashboard-nav";
import { getDict } from "@/lib/i18n-server";
import { requireRole } from "@backend/auth/guards";

export const metadata = { title: "Mi equipo · SaludCoNet" };

export default async function EquipoPage() {
  const me = await requireRole("clinic");
  const m = (await getDict()).dashboard.misc;
  const isAdmin = me.profile.role === "admin";
  const user = {
    name: me.profile.fullName,
    subtitle: isAdmin ? "Administrador" : me.profile.city ? `Clínica · ${me.profile.city}` : "Clínica",
    avatarUrl: me.profile.avatarUrl,
  };

  return (
    <DashboardShell role="Clínica" user={user} nav={NAV_CLINICA}>
      <PageHeader
        backHref="/dashboard/clinic"
        backLabel={m.back}
        title={m.teamTitle}
        subtitle={m.teamSub}
      />
      <EmptyState
        comingSoon
        icon={
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="9" r="3.5" /><path d="M3 20a6 6 0 0112 0" /><circle cx="17" cy="10" r="2.5" /><path d="M14 20a4 4 0 018 0" />
          </svg>
        }
        title={m.teamEmptyTitle}
        text={m.teamEmptyText}
      />
    </DashboardShell>
  );
}
