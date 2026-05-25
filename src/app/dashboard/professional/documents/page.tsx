import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { NAV_PRO } from "@/lib/dashboard-nav";
import { getDict } from "@/lib/i18n-server";
import { requireRole } from "@backend/auth/guards";

export const metadata = { title: "Documentos · Profesional · SaludCoNet" };

export default async function ProfesionalDocumentosPage() {
  const me = await requireRole("professional");
  const m = (await getDict()).dashboard.misc;
  const isAdmin = me.profile.role === "admin";
  const user = {
    name: me.profile.fullName,
    subtitle: isAdmin ? "Administrador" : me.profile.city ? `Técnico capilar · ${me.profile.city}` : "Técnico capilar",
    avatarUrl: me.profile.avatarUrl,
  };

  return (
    <DashboardShell role="Profesional" user={user} nav={NAV_PRO}>
      <PageHeader
        backHref="/dashboard/professional"
        backLabel={m.back}
        title={m.docsTitle}
        subtitle={m.docsSub}
      />
      <EmptyState
        comingSoon
        icon={
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" /><path d="M14 3v5h5" />
          </svg>
        }
        title={m.docsEmptyTitle}
        text={m.docsEmptyText}
      />
    </DashboardShell>
  );
}
