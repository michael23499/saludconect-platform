import Link from "next/link";
import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { MetaIcon } from "@/components/ui/MetaIcon";
import { ApplyButton } from "@/components/dashboard/ApplyButton";
import { SupervisionBanner } from "@/components/dashboard/SupervisionBanner";
import { NAV_PRO } from "@/lib/dashboard-nav";
import { dayMonth, formatDateEs } from "@/lib/dates";
import { getDict } from "@/lib/i18n-server";
import { requireRole } from "@backend/auth/guards";
import { getProfessionalById } from "@backend/queries/professionals";
import {
  listOpenSurgeriesForProfessional,
  listAllOpenSurgeries,
  type SurgeryForProfessional,
} from "@backend/queries/surgeries";

export const metadata = { title: "Cirugías disponibles · Profesional · SaludCoNet" };

export default async function CirugiasDisponiblesPage() {
  const me = await requireRole("professional");
  const t = (await getDict()).dashboard.surgeries;
  const isAdmin = me.profile.role === "admin";
  const user = {
    name: me.profile.fullName,
    subtitle: isAdmin ? "Administrador" : me.profile.city ? `Técnico capilar · ${me.profile.city}` : "Técnico capilar",
    avatarUrl: me.profile.avatarUrl,
  };

  // Normalizamos a una sola forma para renderizar igual en ambos modos.
  let items: SurgeryForProfessional[] = [];
  let noSpecialty = false;
  if (isAdmin) {
    const all = await listAllOpenSurgeries();
    items = all.map((r) => ({ ...r, myStatus: null, myApplicationId: null }));
  } else {
    const professional = await getProfessionalById(me.profile.id);
    if (!professional?.specialtyId) noSpecialty = true;
    else items = await listOpenSurgeriesForProfessional(professional.specialtyId, me.profile.id);
  }

  return (
    <DashboardShell role="Profesional" user={user} nav={NAV_PRO}>
      <PageHeader
        backHref="/dashboard/professional"
        backLabel={t.back}
        title={isAdmin ? t.availTitleAdmin : t.availTitle}
        subtitle={isAdmin ? t.availSubtitleAdmin : t.availSubtitle}
      />

      {isAdmin && <SupervisionBanner scope="professional" />}

      {noSpecialty ? (
        <EmptyState title={t.noSpecialtyTitle} text={t.noSpecialtyText} />
      ) : items.length === 0 ? (
        <EmptyState
          title={isAdmin ? t.emptyAvailTitleAdmin : t.emptyAvailTitle}
          text={isAdmin ? t.emptyAvailTextAdmin : t.emptyAvailText}
        />
      ) : (
        <div className="space-y-3">
          {items.map(({ surgery, clinicName, clinicCity, clinicAvatarUrl, myStatus, myApplicationId }) => {
            const { day, mon } = dayMonth(surgery.date);
            return (
              <div
                key={surgery.id}
                className="card-hover relative flex flex-col gap-4 rounded-2xl border border-mist-200 bg-white p-5 md:flex-row md:items-center"
              >
                {/* Stretched link: toda la tarjeta lleva al detalle; el botón de
                    postular queda por encima (z-10) y se clica independiente. */}
                <Link
                  href={`/dashboard/professional/surgeries/${surgery.id}`}
                  className="absolute inset-0 rounded-2xl"
                  aria-label={surgery.title}
                />
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-mist-200 bg-gradient-to-b from-mist-50 to-white dark:border-white/10 dark:from-white/10 dark:to-white/5">
                  <div className="text-lg font-semibold leading-none text-ink-900">{day}</div>
                  <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-mist-500">{mon}</div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[15px] font-semibold text-ink-900">{surgery.title}</h3>
                    {surgery.urgent && <Badge tone="warning">{t.urgent}</Badge>}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-mist-500">
                    <Avatar name={clinicName} src={clinicAvatarUrl ?? undefined} size="xs" />
                    <span className="font-medium text-ink-800">{clinicName}</span>
                    {clinicCity && <span>· {clinicCity}</span>}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-700">
                    <span className="inline-flex items-center gap-1"><MetaIcon name="calendar" />{formatDateEs(surgery.date)}</span>
                    {surgery.startTime && surgery.endTime && (
                      <span className="inline-flex items-center gap-1"><MetaIcon name="clock" />{surgery.startTime}–{surgery.endTime}</span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <MetaIcon name="users" />{surgery.vacancies} {surgery.vacancies === 1 ? t.technician : t.technicians}
                    </span>
                    {surgery.ratePerHour ? (
                      <span className="font-semibold text-brand-700">{surgery.ratePerHour} €/h</span>
                    ) : (
                      <span>{t.rateTBD}</span>
                    )}
                  </div>
                </div>

                <div className="relative z-10 shrink-0 md:pl-4">
                  {isAdmin ? (
                    <Badge tone="brand">{t.open}</Badge>
                  ) : (
                    <ApplyButton
                      surgeryId={surgery.id}
                      applicationId={myApplicationId}
                      initialStatus={myStatus}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-mist-300 bg-white p-10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      </div>
      <div className="text-sm font-semibold text-ink-900">{title}</div>
      <p className="mx-auto mt-1 max-w-sm text-sm text-mist-500">{text}</p>
    </div>
  );
}
