import { notFound } from "next/navigation";
import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { MetaIcon } from "@/components/ui/MetaIcon";
import { ApplyButton } from "@/components/dashboard/ApplyButton";
import { CommitmentNotice } from "@/components/dashboard/CommitmentNotice";
import { SupervisionBanner } from "@/components/dashboard/SupervisionBanner";
import { NAV_PRO } from "@/lib/dashboard-nav";
import { formatDateLongEs } from "@/lib/dates";
import { formatNeeds } from "@/lib/surgery";
import { getDict } from "@/lib/i18n-server";
import { buildDashboardUser } from "@/lib/dashboard-user";
import { requireRole } from "@backend/auth/guards";
import { getSurgeryWithClinic } from "@backend/queries/surgeries";
import { getApplicationBySurgeryAndProfessional } from "@backend/queries/applications";

export const metadata = { title: "Detalle de cirugía · SaludCoNet" };

export default async function DetalleCirugiaProfesionalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await requireRole("professional");
  const t = (await getDict()).dashboard.surgeries;
  const isAdmin = me.profile.role === "admin";

  const row = await getSurgeryWithClinic(id);
  if (!row) notFound();
  const { surgery, clinicName, clinicCity, clinicAvatarUrl } = row;

  const app = isAdmin ? null : await getApplicationBySurgeryAndProfessional(id, me.profile.id);

  const user = buildDashboardUser(me.profile, { isAdmin, roleLabel: "Técnico capilar" });

  return (
    <DashboardShell role="Profesional" user={user} nav={NAV_PRO}>
      {isAdmin && <SupervisionBanner scope="professional" />}
      <PageHeader
        backHref="/dashboard/professional/surgeries"
        backLabel={t.back}
        title={surgery.title}
        subtitle={clinicCity ? `${clinicName} · ${clinicCity}` : clinicName}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Detalle */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-mist-200 bg-white p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">{t.open}</Badge>
              {surgery.urgent && <Badge tone="warning">{t.urgent}</Badge>}
            </div>

            <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <Detail icon="calendar" label={t.detailDate}>{formatDateLongEs(surgery.date)}</Detail>
              <Detail icon="clock" label={t.detailSchedule}>
                {surgery.startTime && surgery.endTime ? `${surgery.startTime}–${surgery.endTime}` : t.detailFlexible}
              </Detail>
              <Detail icon="pin" label={t.detailLocation}>
                {surgery.city || surgery.address ? [surgery.city, surgery.address].filter(Boolean).join(" · ") : t.detailLocationTBD}
              </Detail>
              <Detail icon="users" label={t.detailVacancies}>
                {formatNeeds(surgery.vacancies, surgery.doctorsNeeded, t)}
              </Detail>
              <Detail icon="clock" label={t.detailRate}>
                {surgery.ratePerHour ? <span className="font-semibold text-brand-700">{surgery.ratePerHour} €/h</span> : t.rateTBD}
              </Detail>
            </dl>

            {surgery.description && (
              <div className="mt-6 border-t border-mist-100 pt-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{t.detailDescription}</div>
                <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-ink-800">{surgery.description}</p>
              </div>
            )}
          </section>
        </div>

        {/* Clínica + acción */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-mist-200 bg-white p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{t.detailClinic}</div>
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={clinicName} src={clinicAvatarUrl ?? undefined} size="md" />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-ink-900">{clinicName}</div>
                {clinicCity && <div className="text-xs text-mist-500">{clinicCity}</div>}
              </div>
            </div>
            {!isAdmin && (
              <div className="mt-5">
                <ApplyButton surgeryId={surgery.id} applicationId={app?.id ?? null} initialStatus={app?.status ?? null} />
              </div>
            )}
          </div>
          {app?.status === "confirmed" && (
            <CommitmentNotice audience="professional" date={surgery.date} startTime={surgery.startTime} />
          )}
        </aside>
      </div>
    </DashboardShell>
  );
}

function Detail({ icon, label, children }: { icon: "calendar" | "clock" | "pin" | "users"; label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-mist-500">
        <MetaIcon name={icon} />
        {label}
      </dt>
      <dd className="mt-1 text-[15px] text-ink-900">{children}</dd>
    </div>
  );
}
