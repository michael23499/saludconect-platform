import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { NAV_CLINICA } from "@/lib/dashboard-nav";
import { getDict } from "@/lib/i18n-server";
import { buildDashboardUser } from "@/lib/dashboard-user";
import { requireRole } from "@backend/auth/guards";

export const metadata = { title: "Mensajes · Clínica · SaludCoNet" };

export default async function ClinicaMensajesPage() {
  const me = await requireRole("clinic");
  const m = (await getDict()).dashboard.misc;
  const isAdmin = me.profile.role === "admin";
  const user = buildDashboardUser(me.profile, { isAdmin, roleLabel: "Clínica" });

  return (
    <DashboardShell role="Clínica" user={user} nav={NAV_CLINICA}>
      <PageHeader
        backHref="/dashboard/clinic"
        backLabel={m.back}
        title={m.msgTitle}
        subtitle={m.msgSubClinic}
      />
      <EmptyState
        comingSoon
        icon={
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12c0 4.4-4 8-9 8-1.4 0-2.7-.2-3.9-.7L3 21l1.7-4.6C3.6 15 3 13.6 3 12c0-4.4 4-8 9-8s9 3.6 9 8z" />
          </svg>
        }
        title={m.msgEmptyTitle}
        text={m.msgEmptyTextClinic}
      />
    </DashboardShell>
  );
}
