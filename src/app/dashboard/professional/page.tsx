import { DashboardShell, PageHeader, Kpi } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { InteractiveCalendar } from "@/components/dashboard/InteractiveCalendar";
import { PRO_CALENDAR } from "@/lib/mock-calendar";
import { NAV_PRO, USER_PRO } from "@/lib/dashboard-nav";
import { getDict } from "@/lib/i18n-server";

export const metadata = { title: "Área del profesional · SaludCoNet" };

const REQUESTS = [
  { clinic: "Clínica Sanitas Norte", city: "Madrid", date: "Mié 28 May · Mañana", spec: "Cardiología", fee: "85 €/h", state: "pending" as const },
  { clinic: "Centro Médico Bilbao", city: "Bilbao", date: "Vie 30 May · Tarde", spec: "Cardiología", fee: "90 €/h", state: "pending" as const },
  { clinic: "Clínica Mediterránea", city: "Valencia", date: "Lun 2 Jun · Mañana", spec: "Cardiología", fee: "80 €/h", state: "confirmed" as const },
];

export default async function ProfesionalDashboardPage() {
  const t = await getDict();
  const d = t.dashboard.pro;
  const c = t.dashboard.common;

  const verifications: [string, boolean][] = [
    [d.verifDni, true],
    [d.verifTitle, true],
    [d.verifCollege, true],
    [d.verifSpecialty, true],
    [d.verifPhoto, false],
  ];

  return (
    <DashboardShell role="Profesional" user={USER_PRO} nav={NAV_PRO}>
      <PageHeader
        title={d.greeting}
        subtitle={d.greetingSub}
        actions={
          <>
            <Button href="/dashboard/professional/calendar" variant="secondary" size="sm">
              {d.editAvailability}
            </Button>
            <Button href="/search" size="sm">{d.findShifts}</Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label={d.kpiActiveRequests} value="3" hint={d.kpiActiveRequestsHint} tone="up" />
        <Kpi label={d.kpiConfirmedBookings} value="12" hint={d.kpiConfirmedBookingsHint} tone="neutral" />
        <Kpi label={d.kpiMonthIncome} value="3.420 €" hint={d.kpiMonthIncomeHint} tone="up" />
        <Kpi label={d.kpiAvgRating} value="4,9" hint={d.kpiAvgRatingHint} tone="neutral" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <InteractiveCalendar initialDate={new Date(2026, 4, 1)} data={PRO_CALENDAR} />

        <div className="rounded-2xl border border-mist-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{d.pendingRequests}</div>
              <div className="text-lg font-semibold tracking-tight text-ink-900">{d.incomingBookings}</div>
            </div>
            <a href="/dashboard/professional/bookings" className="text-xs font-semibold text-brand-700 hover:text-brand-800">{c.viewAll}</a>
          </div>
          <div className="mt-4 space-y-3">
            {REQUESTS.map((r) => (
              <div key={r.clinic} className="rounded-xl border border-mist-200 bg-mist-50/50 p-4">
                <div className="flex items-start gap-3">
                  <Avatar name={r.clinic} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-semibold text-ink-900">{r.clinic}</div>
                      <Badge tone={r.state === "confirmed" ? "success" : "warning"}>
                        {r.state === "confirmed" ? d.stateConfirmed : d.statePending}
                      </Badge>
                    </div>
                    <div className="mt-0.5 text-xs text-mist-500">{r.city} · {r.spec}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span className="font-medium text-ink-800">{r.date}</span>
                      <span className="font-semibold text-brand-700">{r.fee}</span>
                    </div>
                  </div>
                </div>
                {r.state === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 rounded-lg border border-mist-200 px-3 py-2 text-xs font-medium text-ink-800 hover:bg-white">{c.reject}</button>
                    <button className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700">{c.accept}</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-mist-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold tracking-tight text-ink-900">{d.profileStatus}</div>
            <Badge tone="success">85% {c.completePct}</Badge>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-mist-100">
            <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-brand-500 to-cyan-400" />
          </div>
          <ul className="mt-5 space-y-3 text-sm">
            {verifications.map(([label, ok]) => (
              <li key={label} className="flex items-center gap-2.5">
                {ok ? (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l4.5 4.5L19 7" /></svg>
                  </span>
                ) : (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-mist-300 bg-white text-mist-400">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M12 5v14M5 12h14" /></svg>
                  </span>
                )}
                <span className={ok ? "text-ink-800" : "text-mist-500"}>{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-mist-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold tracking-tight text-ink-900">{d.upcomingShifts}</div>
            <a href="/dashboard/professional/calendar" className="text-xs font-semibold text-brand-700 hover:text-brand-800">{d.fullCalendar}</a>
          </div>
          <div className="mt-4 divide-y divide-mist-100">
            {[
              { d: "12", m: "May", t: "Clínica Sanitas Norte", spec: "Mañana · Cardiología" },
              { d: "21", m: "May", t: "Centro Médico Bilbao", spec: "Tarde · Cardiología" },
              { d: "28", m: "May", t: "Clínica Mediterránea", spec: "Mañana · Cardiología" },
            ].map((j) => (
              <div key={j.d + j.t} className="flex items-center gap-4 py-3">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl border border-mist-200 bg-mist-50">
                  <div className="text-base font-semibold text-ink-900">{j.d}</div>
                  <div className="text-[10px] uppercase tracking-wider text-mist-500">{j.m}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink-900">{j.t}</div>
                  <div className="text-xs text-mist-500">{j.spec}</div>
                </div>
                <button className="rounded-lg border border-mist-200 px-3 py-1.5 text-xs font-medium text-ink-800 hover:bg-mist-50">{c.details}</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
