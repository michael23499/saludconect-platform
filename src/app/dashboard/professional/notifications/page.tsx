import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { NotificationsCenter } from "@/components/dashboard/NotificationsCenter";
import { NAV_PRO } from "@/lib/dashboard-nav";
import { getDict } from "@/lib/i18n-server";
import { requireRole } from "@backend/auth/guards";
import { listNotificationsByUser } from "@backend/queries/notifications";

export const metadata = { title: "Notificaciones · Profesional · SaludCoNet" };

export default async function ProNotificationsPage() {
  const pro = await requireRole("professional");
  const m = (await getDict()).dashboard.misc;
  const user = {
    name: pro.profile.fullName,
    subtitle: pro.profile.city ? `Técnico capilar · ${pro.profile.city}` : "Técnico capilar",
    avatarUrl: pro.profile.avatarUrl,
  };

  const rows = await listNotificationsByUser(pro.profile.id, 50);
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
    <DashboardShell role="Profesional" user={user} nav={NAV_PRO}>
      <PageHeader backHref="/dashboard/professional" backLabel={m.back} title={m.notifTitle} subtitle={m.notifSubPro} />
      <NotificationsCenter initialItems={items} />
    </DashboardShell>
  );
}
