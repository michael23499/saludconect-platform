import { PageHeader } from "@/components/dashboard/Shell";
import { NotificationsCenter } from "@/components/dashboard/NotificationsCenter";
import { getDict } from "@/lib/i18n-server";
import { requireRole } from "@backend/auth/guards";
import { listNotificationsByUser } from "@backend/queries/notifications";

export const metadata = { title: "Notificaciones · Admin · SaludCoNet" };

export default async function AdminNotificationsPage() {
  const admin = await requireRole("admin");
  const m = (await getDict()).dashboard.misc;

  const rows = await listNotificationsByUser(admin.profile.id, 50);
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
    <>
      <PageHeader title={m.notifTitle} subtitle={m.notifSubAdmin} />
      <NotificationsCenter initialItems={items} />
    </>
  );
}
