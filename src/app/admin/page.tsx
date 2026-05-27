import Link from "next/link";
import { PageHeader } from "@/components/dashboard/Shell";
import {
  AdminKpis,
  AdminActivityChart,
  AdminApprovalQueue,
  AdminPaymentsComingSoon,
  AdminStatsBoxes,
} from "@/components/admin/sections";
import { getDict } from "@/lib/i18n-server";
import { getAdminStats, listPendingApprovals } from "@backend/queries/stats";

export const metadata = { title: "Panel administrador · SaludCoNet" };

const SUPERVISION = [
  {
    href: "/dashboard/clinic/surgeries",
    title: "Vista de clínicas",
    desc: "Todas las cirugías publicadas por las clínicas y sus candidatos.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h3l2 5 4-12 2 7h2" /><circle cx="19.5" cy="12" r="1.6" /></svg>
    ),
  },
  {
    href: "/dashboard/professional/surgeries",
    title: "Vista de profesionales",
    desc: "Todas las oportunidades abiertas de la plataforma.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0114 0" /></svg>
    ),
  },
];

export default async function AdminPage() {
  const t = await getDict();
  const d = t.dashboard.admin as Record<string, string>;
  const [stats, pending] = await Promise.all([getAdminStats(), listPendingApprovals(4)]);

  return (
    <>
      <PageHeader title={d.title} subtitle={d.subtitle} />

      {/* Accesos de supervisión: reusan los paneles de clínica/profesional con datos globales */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        {SUPERVISION.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="card-hover group flex items-center gap-4 rounded-2xl border border-mist-200 bg-white p-5"
          >
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              {s.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
                {s.title}
                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-400/25 dark:text-amber-100">
                  Supervisión
                </span>
              </div>
              <div className="mt-0.5 text-xs text-mist-500">{s.desc}</div>
            </div>
            <svg className="h-4 w-4 shrink-0 text-mist-400 transition group-hover:translate-x-0.5 group-hover:text-mist-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
          </Link>
        ))}
      </div>

      <AdminKpis d={d} stats={stats} />

      <div className="mt-6">
        <AdminActivityChart d={d} stats={stats} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <AdminApprovalQueue d={d} items={pending} total={stats.pendingApprovals} limit={4} href="/admin/approvals" />
        <AdminPaymentsComingSoon d={d} />
      </div>

      <div className="mt-6">
        <AdminStatsBoxes d={d} stats={stats} />
      </div>
    </>
  );
}
