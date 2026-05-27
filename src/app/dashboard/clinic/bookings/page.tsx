import Link from "next/link";
import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { MetaIcon } from "@/components/ui/MetaIcon";
import { NAV_CLINICA } from "@/lib/dashboard-nav";
import { getDict } from "@/lib/i18n-server";
import { dayMonth, formatDateEs } from "@/lib/dates";
import { buildDashboardUser } from "@/lib/dashboard-user";
import { requireRole } from "@backend/auth/guards";
import {
  listSurgeriesByClinicWithCounts,
  listAllSurgeriesWithCounts,
  type SurgeryWithCounts,
} from "@backend/queries/surgeries";

export const metadata = { title: "Reservas · Clínica · SaludCoNet" };

export default async function ClinicaReservasPage() {
  const me = await requireRole("clinic");
  const c = (await getDict()).dashboard.cal;
  const isAdmin = me.profile.role === "admin";
  const sh = (await getDict()).dashboard.shell;
  const user = buildDashboardUser(me.profile, { isAdmin, roleLabel: sh.roleClinic, adminLabel: sh.roleAdmin });

  const all: (SurgeryWithCounts & { clinicName?: string })[] = isAdmin
    ? await listAllSurgeriesWithCounts()
    : await listSurgeriesByClinicWithCounts(me.profile.id);
  // "Reservas" = cirugías con al menos un técnico confirmado.
  const reserved = all.filter((s) => s.confirmedCount > 0);

  return (
    <DashboardShell role={sh.roleClinic} user={user} nav={NAV_CLINICA}>
      <PageHeader
        backHref="/dashboard/clinic"
        backLabel={c.back}
        title={isAdmin ? c.bkClinicTitleAdmin : c.bkClinicTitle}
        subtitle={isAdmin ? c.bkClinicSubAdmin : c.bkClinicSub}
      />

      {reserved.length === 0 ? (
        <EmptyState
          title={isAdmin ? c.bkClinicEmptyTitleAdmin : c.bkClinicEmptyTitle}
          text={isAdmin ? c.bkClinicEmptyTextAdmin : c.bkClinicEmptyText}
          action={isAdmin ? undefined : { href: "/dashboard/clinic/surgeries", label: c.bkGoSurgeries }}
        />
      ) : (
        <div className="space-y-3">
          {reserved.map((s) => {
            const { day, mon } = dayMonth(s.date);
            const complete = s.confirmedCount >= s.vacancies + s.doctorsNeeded;
            return (
              <Link
                key={s.id}
                href={`/dashboard/clinic/surgeries/${s.id}`}
                className="card-hover flex flex-col gap-4 rounded-2xl border border-mist-200 bg-white p-5 md:flex-row md:items-center"
              >
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50">
                  <div className="text-lg font-semibold leading-none text-emerald-700">{day}</div>
                  <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">{mon}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[15px] font-semibold text-ink-900">{s.title}</h3>
                    <Badge tone={complete ? "success" : "brand"}>
                      {complete ? c.bkComplete : c.bkPartial}
                    </Badge>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-700">
                    {s.clinicName && <span className="font-medium text-brand-700">{s.clinicName}</span>}
                    <span className="inline-flex items-center gap-1"><MetaIcon name="calendar" />{formatDateEs(s.date)}</span>
                    {s.startTime && s.endTime && <span className="inline-flex items-center gap-1"><MetaIcon name="clock" />{s.startTime}–{s.endTime}</span>}
                    {s.city && <span className="inline-flex items-center gap-1"><MetaIcon name="pin" />{s.city}</span>}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 md:pl-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-emerald-700">{s.confirmedCount}/{s.vacancies + s.doctorsNeeded}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">{c.bkConfirmed}</div>
                  </div>
                  <svg className="h-4 w-4 text-mist-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
