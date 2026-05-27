import Link from "next/link";
import { DashboardShell, PageHeader, Kpi } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ApplyButton } from "@/components/dashboard/ApplyButton";
import { SupervisionBanner } from "@/components/dashboard/SupervisionBanner";
import { NAV_PRO } from "@/lib/dashboard-nav";
import { getDict } from "@/lib/i18n-server";
import { dayMonth, formatDateEs } from "@/lib/dates";
import { formatNeeds } from "@/lib/surgery";
import { APPLICATION_STATUS_TONE } from "@/lib/status-colors";
import { buildDashboardUser } from "@/lib/dashboard-user";
import { requireRole } from "@backend/auth/guards";
import { getProfessionalById } from "@backend/queries/professionals";
import { listOpenSurgeriesForProfessional, listAllOpenSurgeries } from "@backend/queries/surgeries";
import {
  listApplicationsByProfessional,
  listConfirmedUpcomingForProfessional,
} from "@backend/queries/applications";
import { countUnreadNotifications } from "@backend/queries/notifications";
import { listPendingReviewsForUser } from "@backend/queries/reviews";
import { PendingReviews } from "@/components/dashboard/PendingReviews";
import type { Application } from "@backend/db";

export const metadata = { title: "Área del profesional · SaludCoNet" };

export default async function ProfesionalDashboardPage() {
  const me = await requireRole("professional");
  const dict = (await getDict()).dashboard;
  const h = dict.home;
  const sg = dict.surgeries;
  const isAdmin = me.profile.role === "admin";
  const appLabel: Record<Application["status"], string> = {
    applied: h.appApplied,
    confirmed: h.appConfirmed,
    rejected: h.appRejected,
    withdrawn: h.appWithdrawn,
  };
  const user = buildDashboardUser(me.profile, { isAdmin, roleLabel: "Técnico capilar" });

  // --- Modo supervisión (admin): oportunidades globales, sin datos propios ---
  if (isAdmin) {
    const open = await listAllOpenSurgeries();
    return (
      <DashboardShell role="Profesional" user={user} nav={NAV_PRO}>
        <SupervisionBanner scope="professional" />
        <PageHeader title={h.proSupTitle} subtitle={h.proSupSubtitle} />
        <div className="grid gap-4 md:grid-cols-3">
          <Kpi label={h.kpiOpportunities} value={String(open.length)} hint={h.kpiOpenHintAll} tone="up" />
        </div>
        <div className="mt-6 rounded-2xl border border-mist-200 bg-white">
          <div className="border-b border-mist-100 p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{h.secPlatform}</div>
            <div className="text-lg font-semibold tracking-tight text-ink-900">{h.openSurgeries}</div>
          </div>
          {open.length === 0 ? (
            <div className="p-8 text-center text-sm text-mist-500">{h.emptyOpenAll}</div>
          ) : (
            <ul className="divide-y divide-mist-100">
              {open.slice(0, 8).map(({ surgery, clinicName, clinicAvatarUrl }) => {
                const { day, mon } = dayMonth(surgery.date);
                return (
                  <li key={surgery.id} className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-mist-200 bg-mist-50">
                      <div className="text-base font-semibold leading-none text-ink-900">{day}</div>
                      <div className="text-[10px] uppercase tracking-wider text-mist-500">{mon}</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-ink-900">{surgery.title}</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-mist-500">
                        <Avatar name={clinicName} src={clinicAvatarUrl ?? undefined} size="xs" />
                        <span>{clinicName}</span>
                        <span>· {formatDateEs(surgery.date)}</span>
                      </div>
                    </div>
                    <Badge tone="brand">{h.openBadge}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DashboardShell>
    );
  }

  // --- Flujo normal del profesional ---
  const professional = await getProfessionalById(me.profile.id);
  const specialtyId = professional?.specialtyId ?? null;

  const [openSurgeries, myApplications, upcoming, unread, pendingReviews] = await Promise.all([
    specialtyId
      ? listOpenSurgeriesForProfessional(specialtyId, me.profile.id, professional?.proType ?? "technician")
      : Promise.resolve([]),
    listApplicationsByProfessional(me.profile.id),
    listConfirmedUpcomingForProfessional(me.profile.id),
    countUnreadNotifications(me.profile.id),
    listPendingReviewsForUser(me.profile.id),
  ]);

  const activeApplications = myApplications.filter((a) => a.application.status === "applied");
  const firstName = me.profile.fullName.split(" ")[0];

  return (
    <DashboardShell role="Profesional" user={user} nav={NAV_PRO}>
      <PageHeader
        title={`${h.hello}, ${firstName}`}
        subtitle={h.proSubtitle}
        actions={
          <>
            <Button href="/dashboard/professional/notifications" variant="secondary" size="sm">
              {h.notifsBtn}{unread > 0 ? ` (${unread})` : ""}
            </Button>
            <Button href="/dashboard/professional/surgeries" size="sm">
              {h.viewSurgeries}
            </Button>
          </>
        }
      />

      <PendingReviews items={pendingReviews} />

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label={h.kpiOpportunities} value={String(openSurgeries.length)} hint={h.kpiOpportunitiesHintMine} tone="up" />
        <Kpi label={h.kpiActiveApps} value={String(activeApplications.length)} hint={h.kpiActiveAppsHint} tone="neutral" />
        <Kpi label={h.kpiConfirmed} value={String(upcoming.length)} hint={h.kpiConfirmedHint} tone="up" />
        <Kpi label={h.kpiProfileStatus} value={me.profile.verified ? h.verified : h.pendingStatus} hint={me.profile.verified ? h.profileVerifiedHint : h.profilePendingHint} tone={me.profile.verified ? "up" : "neutral"} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Oportunidades para ti */}
        <div className="rounded-2xl border border-mist-200 bg-white">
          <div className="flex items-center justify-between border-b border-mist-100 p-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{h.oppsForYou}</div>
              <div className="text-lg font-semibold tracking-tight text-ink-900">{h.openSurgeries}</div>
            </div>
            <Link href="/dashboard/professional/surgeries" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
              {h.viewAll}
            </Link>
          </div>
          {openSurgeries.length === 0 ? (
            <div className="p-8 text-center text-sm text-mist-500">{h.emptyOppsPro}</div>
          ) : (
            <ul className="divide-y divide-mist-100">
              {openSurgeries.slice(0, 4).map(({ surgery, clinicName, clinicAvatarUrl, myStatus, myApplicationId }) => {
                const { day, mon } = dayMonth(surgery.date);
                return (
                  <li key={surgery.id} className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-mist-200 bg-mist-50">
                      <div className="text-base font-semibold leading-none text-ink-900">{day}</div>
                      <div className="text-[10px] uppercase tracking-wider text-mist-500">{mon}</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-ink-900">{surgery.title}</span>
                        {surgery.urgent && <Badge tone="warning">{sg.urgent}</Badge>}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-mist-500">
                        <Avatar name={clinicName} src={clinicAvatarUrl ?? undefined} size="xs" />
                        <span>{clinicName}</span>
                        <span>· {formatNeeds(surgery.vacancies, surgery.doctorsNeeded, sg)}</span>
                      </div>
                    </div>
                    <ApplyButton surgeryId={surgery.id} applicationId={myApplicationId} initialStatus={myStatus} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Mis postulaciones */}
        <div className="rounded-2xl border border-mist-200 bg-white">
          <div className="border-b border-mist-100 p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{h.myApplications}</div>
            <div className="text-lg font-semibold tracking-tight text-ink-900">{h.currentStatus}</div>
          </div>
          {myApplications.length === 0 ? (
            <div className="p-8 text-center text-sm text-mist-500">{h.emptyMyApps}</div>
          ) : (
            <ul className="divide-y divide-mist-100">
              {myApplications.slice(0, 6).map(({ application, surgery, clinicName }) => (
                <li key={application.id} className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-ink-900">{surgery.title}</div>
                    <div className="mt-0.5 text-xs text-mist-500">{clinicName} · {formatDateEs(surgery.date)}</div>
                  </div>
                  <Badge tone={APPLICATION_STATUS_TONE[application.status]}>{appLabel[application.status]}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Próximas cirugías confirmadas */}
      <div className="mt-6 rounded-2xl border border-mist-200 bg-white">
        <div className="border-b border-mist-100 p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{h.yourAgenda}</div>
          <div className="text-lg font-semibold tracking-tight text-ink-900">{h.upcomingConfirmed}</div>
        </div>
        {upcoming.length === 0 ? (
          <div className="p-8 text-center text-sm text-mist-500">{h.emptyUpcoming}</div>
        ) : (
          <ul className="divide-y divide-mist-100">
            {upcoming.map(({ application, surgery, clinicName }) => {
              const { day, mon } = dayMonth(surgery.date);
              return (
                <li key={application.id}>
                  <Link
                    href={`/dashboard/professional/surgeries/${surgery.id}`}
                    className="flex items-center gap-4 p-4 transition hover:bg-mist-50"
                  >
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50">
                      <div className="text-base font-semibold leading-none text-emerald-700">{day}</div>
                      <div className="text-[10px] uppercase tracking-wider text-emerald-600">{mon}</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-ink-900">{surgery.title}</div>
                      <div className="mt-0.5 text-xs text-mist-500">
                        {clinicName}
                        {surgery.startTime && surgery.endTime ? ` · ${surgery.startTime}–${surgery.endTime}` : ""}
                        {surgery.city ? ` · ${surgery.city}` : ""}
                      </div>
                    </div>
                    <Badge tone="success">{h.confirmedBadge}</Badge>
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
