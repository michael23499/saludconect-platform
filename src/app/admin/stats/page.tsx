import { PageHeader } from "@/components/dashboard/Shell";
import { AdminKpis, AdminActivityChart, AdminStatsBoxes } from "@/components/admin/sections";
import { getDict } from "@/lib/i18n-server";
import { getAdminStats } from "@backend/queries/stats";

export const metadata = { title: "Estadísticas · SaludCoNet" };

export default async function AdminStatsPage() {
  const t = await getDict();
  const d = t.dashboard.admin as Record<string, string>;
  const stats = await getAdminStats();

  return (
    <>
      <PageHeader title={t.dashboard.nav.stats} subtitle={d.statsDesc} />

      <AdminKpis d={d} stats={stats} />

      <div className="mt-6">
        <AdminActivityChart d={d} stats={stats} />
      </div>

      <div className="mt-6">
        <AdminStatsBoxes d={d} stats={stats} />
      </div>
    </>
  );
}
