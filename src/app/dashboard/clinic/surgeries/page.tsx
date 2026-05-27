import Link from "next/link";
import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MetaIcon } from "@/components/ui/MetaIcon";
import { SupervisionBanner } from "@/components/dashboard/SupervisionBanner";
import { NAV_CLINICA } from "@/lib/dashboard-nav";
import { dayMonth, formatDateEs } from "@/lib/dates";
import { SURGERY_STATUS_TONE } from "@/lib/status-colors";
import { buildDashboardUser } from "@/lib/dashboard-user";
import { getDict } from "@/lib/i18n-server";
import { requireRole } from "@backend/auth/guards";
import {
  listSurgeriesByClinicWithCounts,
  listAllSurgeriesWithCounts,
  type SurgeryWithCounts,
} from "@backend/queries/surgeries";
import type { Surgery } from "@backend/db";

export const metadata = { title: "Cirugías · Clínica · SaludCoNet" };

export default async function MisCirugiasPage() {
  const me = await requireRole("clinic");
  const t = (await getDict()).dashboard.surgeries;
  const isAdmin = me.profile.role === "admin";
  const statusLabel: Record<Surgery["status"], string> = {
    open: t.open,
    filled: t.statusFilled,
    cancelled: t.statusCancelled,
    completed: t.statusCompleted,
  };
  const sh = (await getDict()).dashboard.shell;
  const user = buildDashboardUser(me.profile, { isAdmin, roleLabel: sh.roleClinic, adminLabel: sh.roleAdmin });

  const surgeries: (SurgeryWithCounts & { clinicName?: string })[] = isAdmin
    ? await listAllSurgeriesWithCounts()
    : await listSurgeriesByClinicWithCounts(me.profile.id);

  return (
    <DashboardShell role={sh.roleClinic} user={user} nav={NAV_CLINICA}>
      <PageHeader
        backHref="/dashboard/clinic"
        backLabel={t.back}
        title={isAdmin ? t.myTitleAdmin : t.myTitle}
        subtitle={isAdmin ? t.mySubtitleAdmin : t.mySubtitle}
        actions={
          <Button href="/dashboard/clinic/publish" size="sm">
            {isAdmin ? t.publishAdmin : t.publish}
          </Button>
        }
      />

      {isAdmin && <SupervisionBanner />}

      {surgeries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-mist-300 bg-white p-10 text-center">
          <Link
            href="/dashboard/clinic/publish"
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition hover:bg-brand-100 hover:text-brand-700"
            aria-label={t.publishTitle}
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M5 12h14" /></svg>
          </Link>
          <div className="text-sm font-semibold text-ink-900">
            {isAdmin ? t.emptyMyTitleAdmin : t.emptyMyTitle}
          </div>
          <p className="mx-auto mt-1 max-w-sm text-sm text-mist-500">
            {isAdmin ? t.emptyMyTextAdmin : t.emptyMyText}
          </p>
          <div className="mt-4">
            <Button href="/dashboard/clinic/publish" size="sm">
              {isAdmin ? t.emptyPublishAdmin : t.publish}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {surgeries.map((s) => {
            const { day, mon } = dayMonth(s.date);
            const tone = SURGERY_STATUS_TONE[s.status];
            return (
              <Link
                key={s.id}
                href={`/dashboard/clinic/surgeries/${s.id}`}
                className="card-hover flex flex-col gap-4 rounded-2xl border border-mist-200 bg-white p-5 md:flex-row md:items-center"
              >
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-mist-200 bg-gradient-to-b from-mist-50 to-white dark:border-white/10 dark:from-white/10 dark:to-white/5">
                  <div className="text-lg font-semibold leading-none text-ink-900">{day}</div>
                  <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-mist-500">{mon}</div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[15px] font-semibold text-ink-900">{s.title}</h3>
                    <Badge tone={tone}>{statusLabel[s.status]}</Badge>
                    {s.urgent && <Badge tone="warning">{t.urgent}</Badge>}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-700">
                    {s.clinicName && <span className="font-medium text-brand-700">{s.clinicName}</span>}
                    <span className="inline-flex items-center gap-1"><MetaIcon name="calendar" />{formatDateEs(s.date)}</span>
                    {s.startTime && s.endTime && <span className="inline-flex items-center gap-1"><MetaIcon name="clock" />{s.startTime}–{s.endTime}</span>}
                    {s.city && <span className="inline-flex items-center gap-1"><MetaIcon name="pin" />{s.city}</span>}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-5 md:pl-4">
                  <CountPill label={t.plazas} value={`${s.confirmedCount}/${s.vacancies + s.doctorsNeeded}`} />
                  <CountPill label={t.pendientes} value={String(s.pendingCount)} highlight={s.pendingCount > 0} />
                  <CountPill label={t.candidatos} value={String(s.applicantCount)} />
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

function CountPill({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="text-center">
      <div className={`text-lg font-semibold ${highlight ? "text-brand-700" : "text-ink-900"}`}>{value}</div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">{label}</div>
    </div>
  );
}
