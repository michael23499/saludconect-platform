import { redirect } from "next/navigation";
import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ProfileVisibilityToggle } from "@/components/dashboard/ProfileVisibilityToggle";
import { ReliabilityBadge } from "@/components/dashboard/ReliabilityBadge";
import { NAV_PRO } from "@/lib/dashboard-nav";
import { getDict } from "@/lib/i18n-server";
import { buildDashboardUser } from "@/lib/dashboard-user";
import { requireRole } from "@backend/auth/guards";
import { getProfessionalById } from "@backend/queries/professionals";
import { getSpecialtyById } from "@backend/queries/specialties";
import { getReliability } from "@backend/queries/reliability";

export const metadata = { title: "Mi perfil · Profesional · SaludCoNet" };

export default async function ProfesionalPerfilPage() {
  const me = await requireRole("professional");
  const p = (await getDict()).dashboard.prof;
  const isAdmin = me.profile.role === "admin";
  const user = buildDashboardUser(me.profile, { isAdmin, roleLabel: "Técnico capilar" });

  const professional = isAdmin ? null : await getProfessionalById(me.profile.id);
  const specialty = professional?.specialtyId ? await getSpecialtyById(professional.specialtyId) : null;
  const specialtyName = specialty?.name ?? p.defaultTechnician;

  // El administrador no tiene perfil de técnico: no es una sección suya.
  if (isAdmin) redirect("/dashboard/professional");

  const r = (await getDict()).dashboard.reliability;
  const reliability = await getReliability(me.profile.id);

  return (
    <DashboardShell role="Profesional" user={user} nav={NAV_PRO}>
      <PageHeader
        backHref="/dashboard/professional"
        backLabel={p.back}
        title={p.title}
        subtitle={p.sub}
        actions={<Button href="/dashboard/professional/settings" size="sm">{p.edit}</Button>}
      />

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-mist-200 bg-gradient-to-br from-ink-950 via-ink-900 to-brand-800 text-white">
        <div className="bg-grid absolute inset-0 opacity-20" />
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" />

        <div className="relative flex flex-col items-start gap-6 p-6 md:flex-row md:items-end md:gap-8 md:p-8">
          <div className="relative">
            <Avatar name={me.profile.fullName} src={me.profile.avatarUrl ?? undefined} size="xl" />
            {professional?.availableForWork && (
              <span className="absolute -bottom-1 -right-1 inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-md">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                {p.available}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{me.profile.fullName}</h2>
              {me.profile.verified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-200 backdrop-blur">
                  <span className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-emerald-400 text-emerald-950">
                    <svg className="h-2 w-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
                  </span>
                  {p.verified}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-semibold text-amber-200 backdrop-blur">
                  {p.pendingVerify}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-white/75 md:text-base">
              {specialtyName}
              {me.profile.city ? ` · ${me.profile.city}` : ""}
            </p>
            {professional?.headline && (
              <p className="mt-2 max-w-xl text-sm text-white/70">{professional.headline}</p>
            )}
          </div>
        </div>
      </section>

      {/* Datos rápidos */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <ProfileStat label={p.statSpecialty} value={specialtyName} />
        <ProfileStat label={p.statCity} value={me.profile.city ?? "—"} />
        <ProfileStat label={p.statExp} value={professional?.yearsExperience != null ? `${professional.yearsExperience} ${p.years}` : "—"} />
        <ProfileStat label={p.statRate} value={professional?.hourlyRate != null ? `${professional.hourlyRate} €/h` : p.rateTBD} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        {/* Sobre mí */}
        <SectionCard title={p.about} action={{ href: "/dashboard/professional/settings", label: p.editShort }}>
          {professional?.bio ? (
            <p className="text-sm leading-relaxed text-ink-800">{professional.bio}</p>
          ) : (
            <p className="text-sm text-mist-500">{p.bioEmpty}</p>
          )}
        </SectionCard>

        {/* Verificación */}
        <SectionCard title={p.verifSection} badge={<Badge tone={me.profile.verified ? "success" : "warning"}>{me.profile.verified ? p.verified : p.pendingBadge}</Badge>}>
          {me.profile.verified ? (
            <p className="text-sm text-ink-800">{p.verifiedText}</p>
          ) : (
            <p className="text-sm text-mist-500">{p.pendingText}</p>
          )}
          <div className="mt-3">
            <Badge tone={professional?.availableForWork ? "success" : "neutral"}>
              {professional?.availableForWork ? p.availableForWork : p.notAvailable}
            </Badge>
          </div>
          <div className="mt-4 border-t border-mist-100 pt-4">
            <ProfileVisibilityToggle initial={me.profile.isPublic} />
          </div>
        </SectionCard>
      </div>

      {/* Fiabilidad: puntualidad y compromiso con las reservas confirmadas. */}
      <div className="mt-5">
        <SectionCard title={r.label}>
          <ReliabilityBadge reliability={reliability} />
          <p className="mt-3 text-sm text-mist-500">{r.profileHint}</p>
        </SectionCard>
      </div>
    </DashboardShell>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-mist-200 bg-white p-4 md:p-5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">{label}</div>
      <div className="mt-1.5 text-lg font-semibold tracking-tight text-ink-900 md:text-xl">{value}</div>
    </div>
  );
}

function SectionCard({
  title,
  action,
  badge,
  children,
}: {
  title: string;
  action?: { href: string; label: string };
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-mist-200 bg-white p-5 md:p-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold tracking-tight text-ink-900">{title}</h3>
        <div className="flex items-center gap-2">
          {badge}
          {action && (
            <a href={action.href} className="rounded-md border border-mist-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-ink-800 hover:bg-mist-50">
              {action.label}
            </a>
          )}
        </div>
      </header>
      {children}
    </section>
  );
}
