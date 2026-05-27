import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { TeamList, type TeamCardData } from "@/components/dashboard/TeamList";
import { NAV_CLINICA } from "@/lib/dashboard-nav";
import { getDict } from "@/lib/i18n-server";
import { formatDateEs } from "@/lib/dates";
import { buildDashboardUser } from "@/lib/dashboard-user";
import { requireRole } from "@backend/auth/guards";
import { listClinicTeam } from "@backend/queries/team";
import { getRatingSummaries } from "@backend/queries/reviews";
import { listSurgeriesByClinicWithCounts } from "@backend/queries/surgeries";

export const metadata = { title: "Mi equipo · SaludCoNet" };

export default async function EquipoPage() {
  const me = await requireRole("clinic");
  const m = (await getDict()).dashboard.misc;
  const isAdmin = me.profile.role === "admin";
  const sh = (await getDict()).dashboard.shell;
  const user = buildDashboardUser(me.profile, { isAdmin, roleLabel: sh.roleClinic, adminLabel: sh.roleAdmin });

  if (isAdmin) {
    return (
      <DashboardShell role={sh.roleClinic} user={user} nav={NAV_CLINICA}>
        <PageHeader backHref="/dashboard/clinic" backLabel={m.back} title={m.teamTitle} subtitle={m.teamSub} />
        <EmptyState
          icon={
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="9" r="3.5" /><path d="M3 20a6 6 0 0112 0" /><circle cx="17" cy="10" r="2.5" /><path d="M14 20a4 4 0 018 0" />
            </svg>
          }
          title={m.teamEmptyTitle}
          text={m.teamEmptyText}
        />
      </DashboardShell>
    );
  }

  const team = await listClinicTeam(me.profile.id);
  const ratings = team.length ? await getRatingSummaries(team.map((p) => p.professionalId)) : {};
  const surgeries = (await listSurgeriesByClinicWithCounts(me.profile.id))
    .filter((su) => su.status === "open")
    .map((su) => ({ id: su.id, title: su.title, dateLabel: formatDateEs(su.date) }));

  const members: TeamCardData[] = team.map((p) => {
    const r = ratings[p.professionalId];
    return {
      professionalId: p.professionalId,
      fullName: p.fullName,
      avatarUrl: p.avatarUrl,
      verified: p.verified,
      specialtyName: p.specialtyName,
      city: p.city,
      proType: p.proType,
      headline: p.headline,
      bio: p.bio,
      yearsExperience: p.yearsExperience,
      hourlyRate: p.hourlyRate,
      ratingAverage: r?.average ?? 0,
      ratingCount: r?.count ?? 0,
    };
  });

  return (
    <DashboardShell role="Clínica" user={user} nav={NAV_CLINICA}>
      <PageHeader backHref="/dashboard/clinic" backLabel={m.back} title={m.teamTitle} subtitle={m.teamSub} />
      <TeamList members={members} surgeries={surgeries} />
    </DashboardShell>
  );
}
