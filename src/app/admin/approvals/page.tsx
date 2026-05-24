import { PageHeader } from "@/components/dashboard/Shell";
import { AdminApprovalQueue } from "@/components/admin/sections";
import { getDict } from "@/lib/i18n-server";

export const metadata = { title: "Aprobaciones · SaludCoNet" };

export default async function AdminApprovalsPage() {
  const t = await getDict();
  const d = t.dashboard.admin as Record<string, string>;

  return (
    <>
      <PageHeader title={t.dashboard.nav.approvals} subtitle={d.approvalsDesc} />
      <AdminApprovalQueue d={d} />
    </>
  );
}
