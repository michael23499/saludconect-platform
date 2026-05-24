import { PageHeader } from "@/components/dashboard/Shell";
import { AdminComingSoon } from "@/components/admin/sections";
import { getDict } from "@/lib/i18n-server";

export const metadata = { title: "Usuarios · SaludCoNet" };

export default async function AdminUsersPage() {
  const t = await getDict();
  const d = t.dashboard.admin as Record<string, string>;

  return (
    <>
      <PageHeader title={t.dashboard.nav.users} subtitle={d.usersDesc} />
      <AdminComingSoon d={d} />
    </>
  );
}
