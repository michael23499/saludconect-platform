import Link from "next/link";
import { DashboardShell, Kpi } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SupervisionBanner } from "@/components/dashboard/SupervisionBanner";
import { NAV_CLINICA } from "@/lib/dashboard-nav";
import { getDict } from "@/lib/i18n-server";
import { dayMonth, formatDateEs } from "@/lib/dates";
import { SURGERY_STATUS_TONE } from "@/lib/status-colors";
import { buildDashboardUser } from "@/lib/dashboard-user";
import { requireRole } from "@backend/auth/guards";
import {
  listSurgeriesByClinicWithCounts,
  listAllSurgeriesWithCounts,
  type SurgeryWithCounts,
} from "@backend/queries/surgeries";
import { countUnreadNotifications } from "@backend/queries/notifications";
import { getClinicById } from "@backend/queries/clinics";
import { listPendingReviewsForUser } from "@backend/queries/reviews";
import { PendingReviews } from "@/components/dashboard/PendingReviews";
import type { Surgery } from "@backend/db";

export const metadata = { title: "Área de la clínica · SaludCoNet" };

export default async function ClinicaDashboardPage() {
  const me = await requireRole("clinic");
  const dict = (await getDict()).dashboard;
  const h = dict.home;
  const sg = dict.surgeries;
  const isAdmin = me.profile.role === "admin";
  const statusLabel: Record<Surgery["status"], string> = {
    open: sg.open,
    filled: sg.statusFilled,
    cancelled: sg.statusCancelled,
    completed: sg.statusCompleted,
  };
  const user = buildDashboardUser(me.profile, { isAdmin, roleLabel: "Clínica" });

  const [surgeries, unread, pendingReviews, clinic] = await Promise.all([
    isAdmin
      ? listAllSurgeriesWithCounts()
      : listSurgeriesByClinicWithCounts(me.profile.id),
    countUnreadNotifications(me.profile.id),
    isAdmin ? Promise.resolve([]) : listPendingReviewsForUser(me.profile.id),
    isAdmin ? Promise.resolve(null) : getClinicById(me.profile.id),
  ]);
  const list: (SurgeryWithCounts & { clinicName?: string })[] = surgeries;

  const openCount = list.filter((s) => s.status === "open").length;
  const pendingApplicants = list.reduce((acc, s) => acc + s.pendingCount, 0);
  const openVacancies = list
    .filter((s) => s.status === "open")
    .reduce((acc, s) => acc + Math.max(0, s.vacancies + s.doctorsNeeded - s.confirmedCount), 0);
  // Saludamos por el nombre del RESPONSABLE (persona de contacto), no por el del
  // centro. Fallback al fullName (clínicas antiguas sin contacto o vista admin).
  const firstName = (clinic?.contactName?.trim() || me.profile.fullName).split(" ")[0];

  return (
    <DashboardShell role="Clínica" user={user} nav={NAV_CLINICA}>
      {isAdmin && <SupervisionBanner />}

      {/* Banner de bienvenida */}
      <div className="relative mb-6 overflow-hidden rounded-3xl border border-mist-200 bg-gradient-to-br from-ink-950 via-ink-900 to-brand-800 p-6 text-white md:p-8">
        <div className="bg-grid absolute inset-0 opacity-20" />
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="relative flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{h.hello}, {firstName}</h1>
            <p className="mt-1.5 max-w-xl text-sm text-white/70 md:text-base">
              {isAdmin ? h.clinicSubtitleAdmin : h.clinicSubtitle}
            </p>
          </div>
          {!isAdmin && (
            <div className="flex gap-2">
              <Button href="/dashboard/clinic/surgeries" variant="outline" size="md">{h.myCirugias}</Button>
              <Button href="/dashboard/clinic/publish" size="md">{h.publishCirugia}</Button>
            </div>
          )}
        </div>
      </div>

      {!isAdmin && <PendingReviews items={pendingReviews} />}

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label={h.kpiOpen} value={String(openCount)} hint={isAdmin ? h.kpiOpenHintAll : h.kpiOpenHintClinic} tone="up" />
        <Kpi label={h.kpiPending} value={String(pendingApplicants)} hint={isAdmin ? h.kpiPendingHintAdmin : h.kpiPendingHint} tone={pendingApplicants > 0 ? "up" : "neutral"} />
        <Kpi label={h.kpiVacancies} value={String(openVacancies)} hint={h.kpiVacanciesHint} tone="neutral" />
        <Kpi label={h.kpiNotifs} value={unread > 0 ? String(unread) : "0"} hint={unread > 0 ? h.kpiNotifsUnread : h.kpiNotifsOk} tone={unread > 0 ? "up" : "neutral"} />
      </div>

      <div className="mt-6 rounded-2xl border border-mist-200 bg-white">
        <div className="flex items-center justify-between border-b border-mist-100 p-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{isAdmin ? h.secPlatform : h.secYourSurgeries}</div>
            <div className="text-lg font-semibold tracking-tight text-ink-900">{isAdmin ? h.secRecent : h.secPublishedRecently}</div>
          </div>
          <Link href="/dashboard/clinic/surgeries" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
            {h.viewAll}
          </Link>
        </div>

        {list.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-mist-500">
              {isAdmin ? h.emptyPlatform : h.emptyClinic}
            </p>
            {!isAdmin && (
              <div className="mt-4">
                <Button href="/dashboard/clinic/publish" size="sm">{h.publishFirst}</Button>
              </div>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-mist-100">
            {list.slice(0, 5).map((s) => {
              const { day, mon } = dayMonth(s.date);
              return (
                <li key={s.id}>
                  <Link href={`/dashboard/clinic/surgeries/${s.id}`} className="flex items-center gap-4 p-4 transition hover:bg-mist-50">
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-mist-200 bg-mist-50">
                      <div className="text-base font-semibold leading-none text-ink-900">{day}</div>
                      <div className="text-[10px] uppercase tracking-wider text-mist-500">{mon}</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-ink-900">{s.title}</span>
                        <Badge tone={SURGERY_STATUS_TONE[s.status]}>{statusLabel[s.status]}</Badge>
                      </div>
                      <div className="mt-0.5 text-xs text-mist-500">
                        {s.clinicName ? `${s.clinicName} · ` : ""}
                        {formatDateEs(s.date)} · {s.confirmedCount}/{s.vacancies + s.doctorsNeeded} {h.plazasWord}
                        {s.pendingCount > 0 ? ` · ${s.pendingCount} ${s.pendingCount === 1 ? h.pendingOne : h.pendingMany}` : ""}
                      </div>
                    </div>
                    <svg className="h-4 w-4 text-mist-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DashboardShell>
  );
}
