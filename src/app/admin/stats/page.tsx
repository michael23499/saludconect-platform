import { PageHeader } from "@/components/dashboard/Shell";
import { AdminKpis, AdminActivityChart, AdminStatsBoxes } from "@/components/admin/sections";
import { getDict } from "@/lib/i18n-server";

export const metadata = { title: "Estadísticas · SaludCoNet" };

export default async function AdminStatsPage() {
  const t = await getDict();
  const d = t.dashboard.admin as Record<string, string>;

  return (
    <>
      <PageHeader title={t.dashboard.nav.stats} subtitle={d.statsDesc} />

      <AdminKpis d={d} />

      <div className="mt-6">
        <AdminActivityChart d={d} />
      </div>

      <div className="mt-6">
        <AdminStatsBoxes d={d} />
      </div>
    </>
  );
}
