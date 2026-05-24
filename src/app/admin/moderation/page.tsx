import { PageHeader } from "@/components/dashboard/Shell";
import { AdminComingSoon } from "@/components/admin/sections";
import { getDict } from "@/lib/i18n-server";

export const metadata = { title: "Moderación · SaludCoNet" };

export default async function AdminModerationPage() {
  const t = await getDict();
  const d = t.dashboard.admin as Record<string, string>;

  return (
    <>
      <PageHeader title={t.dashboard.nav.moderation} subtitle={d.moderationDesc} />
      <AdminComingSoon d={d} />
    </>
  );
}
