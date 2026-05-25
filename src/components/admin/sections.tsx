import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Kpi } from "@/components/dashboard/Shell";
import { ApprovalActions } from "@/components/admin/ApprovalActions";
import type { AdminStats, PendingApproval } from "@backend/queries/stats";

// El diccionario admin son todos strings; lo tratamos como mapa indexable.
type AdminDict = Record<string, string>;

const nf = (n: number) => n.toLocaleString("es-ES");

export function AdminKpis({ d, stats }: { d: AdminDict; stats: AdminStats }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Kpi label={d.kpiUsers} value={nf(stats.totalUsers)} hint={`+${nf(stats.newUsersThisWeek)} ${d.thisWeek}`} tone={stats.newUsersThisWeek > 0 ? "up" : "neutral"} />
      <Kpi label={d.kpiClinics} value={nf(stats.totalClinics)} tone="neutral" />
      <Kpi label={d.kpiProfessionals} value={nf(stats.totalProfessionals)} tone="neutral" />
      <Kpi label={d.kpiApprovals} value={nf(stats.pendingApprovals)} hint={stats.pendingApprovals > 0 ? d.reviewToday : undefined} tone={stats.pendingApprovals > 0 ? "down" : "neutral"} />
    </div>
  );
}

export function AdminActivityChart({ d, stats }: { d: AdminDict; stats: AdminStats }) {
  const data = stats.activity;
  const max = Math.max(...data.map((a) => a.count), 1);
  const total = data.reduce((acc, a) => acc + a.count, 0);
  const fmtAxis = (iso: string) => {
    const dt = new Date(iso + "T00:00:00");
    return dt.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };
  return (
    <div className="rounded-2xl border border-mist-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{d.platformActivity}</div>
          <div className="text-lg font-semibold tracking-tight text-ink-900">{d.activityPosted}</div>
        </div>
        <Badge tone="neutral">{nf(total)}</Badge>
      </div>
      {total === 0 ? (
        <p className="mt-8 py-8 text-center text-sm text-mist-500">{d.activityEmpty}</p>
      ) : (
        <div className="mt-6">
          <div className="flex h-44 items-end gap-1.5">
            {data.map((a) => (
              <div key={a.date} className="group relative flex-1" title={`${fmtAxis(a.date)}: ${a.count}`}>
                <div
                  className="rounded-md bg-gradient-to-t from-brand-500 to-cyan-400 transition group-hover:from-brand-700"
                  style={{ height: `${Math.max((a.count / max) * 100, a.count > 0 ? 6 : 0)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-mist-400">
            <span>{fmtAxis(data[0].date)}</span>
            <span>{fmtAxis(data[Math.floor(data.length / 2)].date)}</span>
            <span>{fmtAxis(data[data.length - 1].date)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function roleLine(d: AdminDict, a: PendingApproval): string {
  const role = a.role === "clinic" ? d.roleClinic : d.roleProfessional;
  const parts = [role];
  if (a.specialtyName) parts.push(a.specialtyName);
  if (a.city) parts.push(a.city);
  return parts.join(" · ");
}

export function AdminApprovalQueue({
  d,
  items,
  total,
  limit,
  href,
}: {
  d: AdminDict;
  items: PendingApproval[];
  total: number;
  limit?: number;
  href?: string;
}) {
  const shown = limit ? items.slice(0, limit) : items;
  const labels = {
    approve: d.approve,
    reject: d.reject,
    rejectTitle: d.rejectTitle,
    rejectMsg: d.rejectMsg,
    cancel: d.cancel ?? "Cancelar",
  };
  return (
    <div className="rounded-2xl border border-mist-200 bg-white">
      <div className="flex items-center justify-between border-b border-mist-100 p-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{d.approvalQueue}</div>
          <div className="text-lg font-semibold tracking-tight text-ink-900">{d.pendingProfiles}</div>
        </div>
        {total > 0 && <Badge tone="warning">{total} {d.pending}</Badge>}
      </div>

      {shown.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          </span>
          <h3 className="mt-3 text-sm font-semibold text-ink-900">{d.approvalsEmptyTitle}</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-mist-500">{d.approvalsEmptyText}</p>
        </div>
      ) : (
        <div className="divide-y divide-mist-100">
          {shown.map((a) => (
            <div key={a.id} className="flex items-center gap-4 p-5">
              <Avatar name={a.fullName} src={a.avatarUrl ?? undefined} size="md" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-ink-900">{a.fullName}</div>
                <div className="truncate text-xs text-mist-500">{roleLine(d, a)}</div>
                <div className="mt-0.5 text-xs text-mist-400">
                  {new Date(a.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
              <ApprovalActions userId={a.id} labels={labels} />
            </div>
          ))}
        </div>
      )}

      {href && shown.length > 0 && total > shown.length && (
        <div className="border-t border-mist-100 p-3 text-center">
          <Link href={href} className="text-xs font-semibold text-amber-700 hover:text-amber-800">{d.viewAll}</Link>
        </div>
      )}
    </div>
  );
}

export function AdminPaymentsComingSoon({ d }: { d: AdminDict }) {
  return (
    <div className="rounded-2xl border border-mist-200 bg-white p-6">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M7 15h3" /></svg>
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-ink-900">{d.paymentsTitle}</h3>
            <Badge tone="warning">{d.comingSoon}</Badge>
          </div>
          <p className="mt-1 text-sm text-mist-500">{d.paymentsText}</p>
        </div>
      </div>
    </div>
  );
}

export function AdminStatsBoxes({ d, stats }: { d: AdminDict; stats: AdminStats }) {
  const accounts: [string, string][] = [
    [d.mRegistered, nf(stats.totalUsers)],
    [d.mVerified, nf(stats.verifiedUsers)],
    [d.mPending, nf(stats.pendingApprovals)],
    [d.mSuspended, nf(stats.suspendedUsers)],
  ];
  const surg: [string, string][] = [
    [d.sOpen, nf(stats.surgeries.open)],
    [d.sFilled, nf(stats.surgeries.filled)],
    [d.sCompleted, nf(stats.surgeries.completed)],
    [d.sCancelled, nf(stats.surgeries.cancelled)],
    [d.sTotal, nf(stats.surgeries.total)],
  ];
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Box title={d.summaryTitle} items={accounts} />
      <Box
        title={d.topCities}
        items={stats.topCities.map((c) => [c.city, nf(c.count)] as [string, string])}
        empty={d.citiesEmpty}
      />
      <Box title={d.surgeriesTitle} items={surg} />
    </div>
  );
}

function Box({ title, items, empty }: { title: string; items: [string, string][]; empty?: string }) {
  return (
    <div className="rounded-2xl border border-mist-200 bg-white p-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{title}</div>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-mist-500">{empty}</p>
      ) : (
        <ul className="mt-3 divide-y divide-mist-100">
          {items.map(([k, v]) => (
            <li key={k} className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-ink-800">{k}</span>
              <span className="font-semibold text-ink-900">{v}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AdminComingSoon({ d }: { d: AdminDict }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-mist-300 bg-white px-6 py-20 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4l3 2" />
        </svg>
      </span>
      <h2 className="mt-4 text-lg font-semibold text-ink-900">{d.comingSoon}</h2>
      <p className="mt-1 max-w-sm text-sm text-mist-500">{d.comingSoonDesc}</p>
    </div>
  );
}
