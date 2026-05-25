import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { NotificationsCenter } from "@/components/dashboard/NotificationsCenter";
import { NAV_CLINICA } from "@/lib/dashboard-nav";
import { getDict } from "@/lib/i18n-server";
import { requireRole } from "@backend/auth/guards";
import { listNotificationsByUser } from "@backend/queries/notifications";

export const metadata = { title: "Notificaciones · Clínica · SaludCoNet" };

export default async function ClinicNotificationsPage() {
  const clinic = await requireRole("clinic");
  const m = (await getDict()).dashboard.misc;
  const user = {
    name: clinic.profile.fullName,
    subtitle: clinic.profile.city ? `Clínica · ${clinic.profile.city}` : "Clínica",
    avatarUrl: clinic.profile.avatarUrl,
  };

  const rows = await listNotificationsByUser(clinic.profile.id, 50);
  const items = rows.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    link: n.link,
    read: n.readAt !== null,
    createdAtISO: n.createdAt.toISOString(),
  }));

  return (
    <DashboardShell role="Clínica" user={user} nav={NAV_CLINICA}>
      <PageHeader backHref="/dashboard/clinic" backLabel={m.back} title={m.notifTitle} subtitle={m.notifSubClinic} />
      <NotificationsCenter initialItems={items} />
    </DashboardShell>
  );
}
