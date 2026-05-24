import { PageHeader } from "@/components/dashboard/Shell";
import {
  AdminKpis,
  AdminActivityChart,
  AdminApprovalQueue,
  AdminPaymentsTable,
  AdminStatsBoxes,
} from "@/components/admin/sections";
import { getDict } from "@/lib/i18n-server";

export const metadata = { title: "Panel administrador · SaludCoNet" };

export default async function AdminPage() {
  const t = await getDict();
  const d = t.dashboard.admin as Record<string, string>;

  return (
    <>
      <PageHeader title={d.title} subtitle={d.subtitle} />

      <AdminKpis d={d} />

      <div className="mt-6">
        <AdminActivityChart d={d} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <AdminApprovalQueue d={d} limit={4} href="/admin/approvals" />
        <AdminPaymentsTable d={d} limit={5} href="/admin/payments" />
      </div>

      <div className="mt-6">
        <AdminStatsBoxes d={d} />
      </div>
    </>
  );
}
