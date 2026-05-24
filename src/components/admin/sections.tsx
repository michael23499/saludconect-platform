import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Kpi } from "@/components/dashboard/Shell";
import { APROBACIONES, PAGOS, BOXES, ACTIVITY } from "@/lib/admin-data";

// El diccionario admin son todos strings; lo tratamos como mapa indexable.
type AdminDict = Record<string, string>;

function tone(state: string) {
  if (state === "paid") return "success" as const;
  if (state === "pending") return "warning" as const;
  return "danger" as const;
}

export function AdminKpis({ d }: { d: AdminDict }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Kpi label={d.kpiUsers} value="5.362" hint={`+128 ${d.thisWeek}`} tone="up" />
      <Kpi label={d.kpiClinics} value="321" hint={`+12 ${d.thisWeek}`} tone="up" />
      <Kpi label="MRR" value="38.420 €" hint="+9,3% MoM" tone="up" />
      <Kpi label={d.kpiApprovals} value="8" hint={d.reviewToday} tone="down" />
    </div>
  );
}

export function AdminActivityChart({ d }: { d: AdminDict }) {
  return (
    <div className="rounded-2xl border border-mist-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{d.platformActivity}</div>
          <div className="text-lg font-semibold tracking-tight text-ink-900">{d.completedBookings}</div>
        </div>
        <Badge tone="brand">+34,2%</Badge>
      </div>
      <div className="mt-6">
        <div className="flex h-44 items-end gap-1.5">
          {ACTIVITY.map((v, i) => (
            <div key={i} className="group relative flex-1">
              <div
                className="rounded-md bg-gradient-to-t from-brand-500 to-cyan-400 transition group-hover:from-brand-700"
                style={{ height: `${(v / 200) * 100}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-mist-400">
          <span>1 May</span><span>15 May</span><span>30 May</span>
        </div>
      </div>
    </div>
  );
}

export function AdminApprovalQueue({ d, limit, href }: { d: AdminDict; limit?: number; href?: string }) {
  const items = limit ? APROBACIONES.slice(0, limit) : APROBACIONES;
  return (
    <div className="rounded-2xl border border-mist-200 bg-white">
      <div className="flex items-center justify-between border-b border-mist-100 p-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{d.approvalQueue}</div>
          <div className="text-lg font-semibold tracking-tight text-ink-900">{d.pendingProfiles}</div>
        </div>
        <Badge tone="warning">{APROBACIONES.length} {d.pending}</Badge>
      </div>
      <div className="divide-y divide-mist-100">
        {items.map((a) => (
          <div key={a.name} className="flex items-center gap-4 p-5">
            <Avatar name={a.name} size="md" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-ink-900">{a.name}</div>
              <div className="text-xs text-mist-500">{a.role}</div>
              <div className="mt-0.5 text-xs text-mist-400">{a.docs} {d.documents} · {a.date}</div>
            </div>
            <div className="hidden gap-2 md:flex">
              <button className="rounded-lg border border-mist-200 px-3 py-1.5 text-xs font-medium text-ink-800 hover:bg-mist-50">{d.reject}</button>
              <button className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">{d.approve}</button>
            </div>
          </div>
        ))}
      </div>
      {href && (
        <div className="border-t border-mist-100 p-3 text-center">
          <Link href={href} className="text-xs font-semibold text-amber-700 hover:text-amber-800">{d.viewAll}</Link>
        </div>
      )}
    </div>
  );
}

export function AdminPaymentsTable({ d, limit, href }: { d: AdminDict; limit?: number; href?: string }) {
  const items = limit ? PAGOS.slice(0, limit) : PAGOS;
  const statusLabel: Record<string, string> = {
    paid: d.statusPaid,
    pending: d.statusPending,
    failed: d.statusFailed,
  };
  return (
    <div className="rounded-2xl border border-mist-200 bg-white">
      <div className="flex items-center justify-between border-b border-mist-100 p-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{d.recentPayments}</div>
          <div className="text-lg font-semibold tracking-tight text-ink-900">{d.lastTransactions}</div>
        </div>
        {href && (
          <Link href={href} className="text-xs font-semibold text-amber-700 hover:text-amber-800">{d.viewAll}</Link>
        )}
      </div>
      <div className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-mist-50/60 text-left text-[11px] font-semibold uppercase tracking-wider text-mist-500">
            <tr>
              <th className="px-5 py-2.5">{d.client}</th>
              <th className="px-5 py-2.5">{d.plan}</th>
              <th className="px-5 py-2.5">{d.amount}</th>
              <th className="px-5 py-2.5">{d.status}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mist-100">
            {items.map((p) => (
              <tr key={p.client + p.date}>
                <td className="px-5 py-3 font-medium text-ink-900">{p.client}</td>
                <td className="px-5 py-3 text-mist-500">{p.plan}</td>
                <td className="px-5 py-3 font-semibold text-ink-900">{p.amount}</td>
                <td className="px-5 py-3"><Badge tone={tone(p.state)}>{statusLabel[p.state]}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminStatsBoxes({ d }: { d: AdminDict }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {BOXES.map((b) => (
        <div key={b.titleKey} className="rounded-2xl border border-mist-200 bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{d[b.titleKey]}</div>
          <ul className="mt-3 divide-y divide-mist-100">
            {b.items.map(([k, v]) => (
              <li key={k} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-ink-800">{k}</span>
                <span className="font-semibold text-ink-900">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
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
