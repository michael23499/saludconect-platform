import { PageHeader } from "@/components/dashboard/Shell";
import { AdminPaymentsTable } from "@/components/admin/sections";
import { getDict } from "@/lib/i18n-server";

export const metadata = { title: "Pagos · SaludCoNet" };

export default async function AdminPaymentsPage() {
  const t = await getDict();
  const d = t.dashboard.admin as Record<string, string>;

  return (
    <>
      <PageHeader title={t.dashboard.nav.payments} subtitle={d.paymentsDesc} />
      <AdminPaymentsTable d={d} />
    </>
  );
}
