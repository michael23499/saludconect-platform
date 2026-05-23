import { DashboardShell } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { InteractiveCalendar } from "@/components/dashboard/InteractiveCalendar";
import { CLINIC_CALENDAR } from "@/lib/mock-calendar-clinic";
import { KpiSparkCard } from "@/components/dashboard/Sparkline";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { NAV_CLINICA, USER_CLINICA } from "@/lib/dashboard-nav";
import { getDict } from "@/lib/i18n-server";

export const metadata = { title: "Área de la clínica · SaludCoNet" };

const URGENT = [
  { kindKey: "urgentAcceptance", who: "Andrés Cano", role: "Fisioterapia", when: "Hoy, 29 May · Tarde", tone: "warning" as const },
  { kindKey: "urgentDocs", who: "Lic. apertura sede norte", role: "Vence en 6 días", when: "5 jun 2026", tone: "danger" as const },
  { kindKey: "urgentMessage", who: "Dra. Lucía Martín", role: "Sobre la jornada 28 May", when: "hace 12 min", tone: "brand" as const },
] as const;

const UPCOMING = [
  { name: "Dra. Lucía Martín", spec: "Cardióloga · Madrid", day: "28", mon: "May", time: "08:00 - 14:00", rate: "Especialista senior · €€€", state: "confirmed" as const },
  { name: "Andrés Cano", spec: "Fisioterapeuta · Madrid", day: "29", mon: "May", time: "16:00 - 20:00", rate: "Profesional consolidado · €€", state: "pending" as const },
  { name: "Inés Vera", spec: "Pediatra · Madrid", day: "30", mon: "May", time: "09:00 - 13:00", rate: "Profesional consolidado · €€", state: "pending" as const },
  { name: "Dr. Jorge Pol", spec: "Anestesista · Madrid", day: "02", mon: "Jun", time: "08:00 - 14:00", rate: "Especialista premium · €€€€", state: "confirmed" as const },
] as const;

const TOP_COLLABORATORS = [
  { name: "Dra. Lucía Martín", role: "Cardiología", reservas: 14, rating: 4.9 },
  { name: "Diego Alarcón", role: "Fisioterapia", reservas: 11, rating: 4.9 },
  { name: "Marta Lozano", role: "Enfermería", reservas: 9, rating: 4.8 },
  { name: "Dra. Sofía Morales", role: "Odontología", reservas: 7, rating: 4.9 },
];

const CANDIDATES = [
  { name: "Diego Alarcón", role: "Fisioterapia · 12 años exp.", city: "Madrid", rate: "€€", avail: true, level: "Top Rated" },
  { name: "Dra. Cristina Vidal", role: "Ginecología · 11 años exp.", city: "Zaragoza", rate: "€€€", avail: true, level: "Top Rated" },
  { name: "Patricia Ferrer", role: "Psicología · 6 años exp.", city: "Móstoles", rate: "€€", avail: false, level: "Trusted" },
];

export default async function ClinicaDashboardPage() {
  const t = await getDict();
  const d = t.dashboard.clinic;

  const quickActions = [
    { i: "＋", t: d.qaPublish, href: "/dashboard/clinic/publish" },
    { i: "◷", t: d.qaCreateShift, href: "/dashboard/clinic/calendar" },
    { i: "✉", t: d.qaQuickMsg, href: "/dashboard/clinic/messages" },
    { i: "▤", t: d.qaExport, href: "#" },
  ];

  const features = [d.featUnlimited, d.featMultisite, d.featPriority, d.featElite];

  return (
    <DashboardShell role="Clínica" user={USER_CLINICA} nav={NAV_CLINICA}>
      {/* Welcome banner */}
      <div className="relative mb-6 overflow-hidden rounded-3xl border border-mist-200 bg-gradient-to-br from-ink-950 via-ink-900 to-brand-800 p-6 text-white md:p-8">
        <div className="bg-grid absolute inset-0 opacity-20" />
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="relative flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {d.statusOk} · Mié 20 May 2026
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
              {d.greeting}
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-white/70 md:text-base">
              {d.greetingSub}
            </p>
          </div>
          <div className="flex gap-2">
            <Button href="/search" variant="outline" size="md">{d.findPros}</Button>
            <Button href="/dashboard/clinic/publish" size="md">{d.publishNeed}</Button>
          </div>
        </div>
      </div>

      {/* KPIs with sparklines */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiSparkCard index={0} label={d.kpiActiveBookings} value="12" hint={d.kpiActiveBookingsHint} tone="up" spark={[5, 6, 5, 7, 8, 7, 9, 10, 9, 11, 10, 12]} sparkColor="#2563eb" sparkFillFrom="rgba(37,99,235,0.22)" />
        <KpiSparkCard index={1} label={d.kpiAvgCoverage} value="3 h 48 m" hint={d.kpiAvgCoverageHint} tone="up" spark={[8, 7.6, 7.2, 7, 6.5, 6, 5.5, 5.2, 5, 4.6, 4.2, 3.8]} sparkColor="#06b6d4" sparkFillFrom="rgba(6,182,212,0.22)" />
        <KpiSparkCard index={2} label={d.kpiMonthSpend} value="6.840 €" hint={d.kpiMonthSpendHint} tone="neutral" spark={[2, 3, 2.5, 3.5, 4, 4.5, 5, 5.5, 6, 6.2, 6.5, 6.8]} sparkColor="#1e40af" sparkFillFrom="rgba(30,64,175,0.22)" />
        <KpiSparkCard index={3} label={d.kpiSatisfaction} value="4,9 ★" hint={d.kpiSatisfactionHint} tone="up" spark={[4.6, 4.7, 4.7, 4.8, 4.7, 4.8, 4.8, 4.9, 4.8, 4.9, 4.9, 4.9]} sparkColor="#10b981" sparkFillFrom="rgba(16,185,129,0.22)" />
      </div>

      {/* Urgent + Quick actions */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-mist-200 bg-white">
          <div className="flex items-center justify-between border-b border-mist-100 p-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{d.attentionRequired}</div>
              <div className="text-lg font-semibold tracking-tight text-ink-900">{d.threePending}</div>
            </div>
            <Badge tone="warning">{d.today}</Badge>
          </div>
          <ul className="divide-y divide-mist-100">
            {URGENT.map((u) => (
              <li key={u.who + u.kindKey} className="flex items-start gap-4 p-5">
                <span
                  className={
                    u.tone === "danger"
                      ? "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600"
                      : u.tone === "warning"
                      ? "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600"
                      : "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"
                  }
                >
                  {u.tone === "danger" ? (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.3l-8 14A2 2 0 004 20.5h16a2 2 0 001.7-3.2l-8-14a2 2 0 00-3.4 0z" /></svg>
                  ) : u.tone === "warning" ? (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" /></svg>
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12c0 4.4-4 8-9 8-1.4 0-2.7-.2-3.9-.7L3 21l1.7-4.6C3.6 15 3 13.6 3 12c0-4.4 4-8 9-8s9 3.6 9 8z" /></svg>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-mist-500">{d[u.kindKey]}</div>
                  <div className="text-sm font-semibold text-ink-900">{u.who}</div>
                  <div className="mt-0.5 text-xs text-mist-500">{u.role} · {u.when}</div>
                </div>
                <button className="rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-ink-800">{d.review}</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-mist-200 bg-white p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{d.quickActions}</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {quickActions.map((a) => (
                <a key={a.t} href={a.href} className="card-hover flex flex-col items-start gap-2 rounded-xl border border-mist-200 bg-mist-50/40 p-3 text-left">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">{a.i}</span>
                  <span className="text-[13px] font-semibold text-ink-900">{a.t}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-mist-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{d.monthBudget}</div>
              <span className="text-xs font-semibold text-brand-700">{d.budgetUsed}</span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-mist-100">
              <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-brand-500 to-cyan-400" />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-mist-500">
              <span>6.840 €</span>
              <span>{d.budgetOf} 8.800 €</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ActivityChart />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-mist-200 bg-white">
          <div className="flex items-center justify-between border-b border-mist-100 p-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{d.upcomingBookings}</div>
              <div className="text-lg font-semibold tracking-tight text-ink-900">{d.confirmedPending}</div>
            </div>
            <div className="flex gap-1.5 rounded-lg border border-mist-200 p-1 text-xs">
              <button className="rounded-md bg-mist-100 px-2.5 py-1 font-semibold text-ink-900">{d.filterAll}</button>
              <button className="rounded-md px-2.5 py-1 text-mist-500">{d.filterConfirmed}</button>
              <button className="rounded-md px-2.5 py-1 text-mist-500">{d.filterPending}</button>
            </div>
          </div>
          <div className="divide-y divide-mist-100">
            {UPCOMING.map((u) => (
              <div key={u.name + u.day} className="flex items-center gap-4 p-5">
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-mist-200 bg-gradient-to-b from-mist-50 to-white">
                  <div className="text-lg font-semibold leading-none text-ink-900">{u.day}</div>
                  <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-mist-500">{u.mon}</div>
                </div>
                <Avatar name={u.name} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="truncate text-sm font-semibold text-ink-900">{u.name}</div>
                    <Badge tone={u.state === "confirmed" ? "success" : "warning"}>{u.state === "confirmed" ? d.stateConfirmed : d.statePending}</Badge>
                  </div>
                  <div className="text-xs text-mist-500">{u.spec}</div>
                  <div className="mt-0.5 text-xs font-medium text-ink-800">{u.time} · <span className="text-brand-700">{u.rate}</span></div>
                </div>
                <button className="hidden rounded-lg border border-mist-200 px-3 py-1.5 text-xs font-medium text-ink-800 hover:bg-mist-50 md:inline-flex">{t.dashboard.common.details}</button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-mist-200 bg-white">
          <div className="flex items-center justify-between border-b border-mist-100 p-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{d.topCollaborators}</div>
              <div className="text-lg font-semibold tracking-tight text-ink-900">{d.thisMonth}</div>
            </div>
          </div>
          <ol className="divide-y divide-mist-100">
            {TOP_COLLABORATORS.map((col, i) => (
              <li key={col.name} className="flex items-center gap-3 p-4">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-600 to-cyan-500 text-xs font-bold text-white">
                  #{i + 1}
                </div>
                <Avatar name={col.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink-900">{col.name}</div>
                  <div className="text-xs text-mist-500">{col.role} · {col.reservas} {d.bookingsWord}</div>
                </div>
                <span className="text-sm font-semibold text-ink-900">★ {col.rating}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-6">
        <InteractiveCalendar initialDate={new Date(2026, 4, 1)} data={CLINIC_CALENDAR} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.6fr]">
        <div className="rounded-2xl border border-mist-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold tracking-tight text-ink-900">{d.subscription}</div>
            <Badge tone="success">{d.active}</Badge>
          </div>
          <div className="mt-4 rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-cyan-50 p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">{d.planPro}</div>
            <div className="mt-1 text-3xl font-semibold tracking-tight text-ink-900">149 €<span className="text-base font-normal text-mist-500"> {d.perMonth}</span></div>
            <div className="mt-1 text-xs text-mist-500">{d.nextRenewal}</div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-ink-800 hover:bg-mist-50">{d.viewInvoice}</button>
              <button className="flex-1 rounded-lg bg-ink-900 px-3 py-2 text-xs font-semibold text-white hover:bg-ink-800">{d.manage}</button>
            </div>
          </div>
          <div className="mt-5 space-y-2.5 text-sm">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-2 text-ink-800">
                <svg className="h-4 w-4 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12l4.5 4.5L19 7" /></svg>
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-mist-200 bg-white">
          <div className="flex items-center justify-between border-b border-mist-100 p-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{d.suggestedTalent}</div>
              <div className="text-lg font-semibold tracking-tight text-ink-900">{d.recommendedPros}</div>
            </div>
            <Button href="/search" variant="secondary" size="sm">{d.viewAllPros}</Button>
          </div>
          <div className="grid gap-px bg-mist-100 md:grid-cols-3">
            {CANDIDATES.map((cand) => (
              <div key={cand.name} className="bg-white p-5">
                <div className="flex items-center gap-3">
                  <Avatar name={cand.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-ink-900">{cand.name}</div>
                    <div className="text-xs text-mist-500">{cand.role}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <Badge tone="brand">{cand.level}</Badge>
                  <span className="font-semibold text-brand-700">{cand.rate}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-mist-500">{cand.city}</span>
                  <Badge tone={cand.avail ? "success" : "neutral"}>{cand.avail ? d.available : d.busy}</Badge>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 rounded-lg border border-mist-200 px-3 py-2 text-xs font-medium text-ink-800 hover:bg-mist-50">{d.viewProfile}</button>
                  <button className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700">{d.book}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
