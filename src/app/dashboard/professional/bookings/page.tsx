import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { NAV_PRO } from "@/lib/dashboard-nav";
import { getDict } from "@/lib/i18n-server";
import { dayMonth, formatDateEs } from "@/lib/dates";
import { requireRole } from "@backend/auth/guards";
import {
  listApplicationsByProfessional,
  listConfirmedUpcomingForProfessional,
} from "@backend/queries/applications";
import type { Application } from "@backend/db";

export const metadata = { title: "Reservas · Profesional · SaludCoNet" };

const APP_TONE: Record<Application["status"], "success" | "warning" | "neutral"> = {
  applied: "warning",
  confirmed: "success",
  rejected: "neutral",
  withdrawn: "neutral",
};

export default async function ProfesionalReservasPage() {
  const me = await requireRole("professional");
  const c = (await getDict()).dashboard.cal;
  const appLabel: Record<Application["status"], string> = {
    applied: c.appApplied,
    confirmed: c.appConfirmed,
    rejected: c.appRejected,
    withdrawn: c.appWithdrawn,
  };
  const isAdmin = me.profile.role === "admin";
  const user = {
    name: me.profile.fullName,
    subtitle: isAdmin ? "Administrador" : me.profile.city ? `Técnico capilar · ${me.profile.city}` : "Técnico capilar",
    avatarUrl: me.profile.avatarUrl,
  };

  const [upcoming, all] = await Promise.all([
    listConfirmedUpcomingForProfessional(me.profile.id),
    listApplicationsByProfessional(me.profile.id),
  ]);

  return (
    <DashboardShell role="Profesional" user={user} nav={NAV_PRO}>
      <PageHeader
        backHref="/dashboard/professional"
        backLabel={c.back}
        title={c.bkProTitle}
        subtitle={c.bkProSub}
      />

      {all.length === 0 ? (
        <EmptyState
          title={c.bkProEmptyTitle}
          text={c.bkProEmptyText}
          action={{ href: "/dashboard/professional/surgeries", label: c.bkSeeAvailable }}
        />
      ) : (
        <div className="space-y-6">
          {/* Próximas jornadas confirmadas */}
          <div className="rounded-2xl border border-mist-200 bg-white">
            <div className="border-b border-mist-100 p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{c.bkAgenda}</div>
              <div className="text-lg font-semibold tracking-tight text-ink-900">{c.bkUpcoming}</div>
            </div>
            {upcoming.length === 0 ? (
              <div className="p-8 text-center text-sm text-mist-500">{c.bkUpcomingEmpty}</div>
            ) : (
              <ul className="divide-y divide-mist-100">
                {upcoming.map(({ application, surgery, clinicName }) => {
                  const { day, mon } = dayMonth(surgery.date);
                  return (
                    <li key={application.id} className="flex items-center gap-4 p-4">
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
                      <Badge tone="success">{c.bkConfirmedBadge}</Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Histórico de postulaciones */}
          <div className="rounded-2xl border border-mist-200 bg-white">
            <div className="border-b border-mist-100 p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{c.bkHistory}</div>
              <div className="text-lg font-semibold tracking-tight text-ink-900">{c.bkAllApps}</div>
            </div>
            <ul className="divide-y divide-mist-100">
              {all.map(({ application, surgery, clinicName }) => {
                return (
                  <li key={application.id} className="flex items-center gap-4 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-ink-900">{surgery.title}</div>
                      <div className="mt-0.5 text-xs text-mist-500">{clinicName} · {formatDateEs(surgery.date)}</div>
                    </div>
                    <Badge tone={APP_TONE[application.status]}>{appLabel[application.status]}</Badge>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
