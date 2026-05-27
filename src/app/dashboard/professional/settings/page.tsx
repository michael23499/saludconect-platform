import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { SettingsTabs } from "@/components/dashboard/SettingsTabs";
import type { AccountData } from "@/components/dashboard/AccountSettingsForm";
import { NAV_PRO } from "@/lib/dashboard-nav";
import { getDict } from "@/lib/i18n-server";
import { buildDashboardUser } from "@/lib/dashboard-user";
import { requireRole } from "@backend/auth/guards";
import { getProfessionalById } from "@backend/queries/professionals";
import { getSpecialtyById } from "@backend/queries/specialties";

export const metadata = { title: "Ajustes · Profesional · SaludCoNet" };

export default async function ProfesionalAjustesPage() {
  const me = await requireRole("professional");
  const p = (await getDict()).dashboard.prof;
  const isAdmin = me.profile.role === "admin";
  const sh = (await getDict()).dashboard.shell;
  const user = buildDashboardUser(me.profile, { isAdmin, roleLabel: sh.roleTechnician, adminLabel: sh.roleAdmin });

  const professional = await getProfessionalById(me.profile.id);
  const specialty = professional?.specialtyId ? await getSpecialtyById(professional.specialtyId) : null;
  const account: AccountData = {
    role: "professional",
    fullName: me.profile.fullName,
    email: me.profile.email,
    phone: me.profile.phone ?? "",
    city: me.profile.city ?? "",
    address: me.profile.address ?? "",
    postalCode: me.profile.postalCode ?? "",
    lat: me.profile.lat,
    lng: me.profile.lng,
    avatarUrl: me.profile.avatarUrl,
    specialtyName: specialty?.name ?? null,
    proType: professional?.proType ?? "technician",
    headline: professional?.headline ?? "",
    bio: professional?.bio ?? "",
    yearsExperience: professional?.yearsExperience != null ? String(professional.yearsExperience) : "",
    hourlyRate: professional?.hourlyRate != null ? String(professional.hourlyRate) : "",
    clinicName: "",
    contactName: "",
    specialties: [],
    about: "",
    website: "",
  };

  return (
    <DashboardShell role={sh.roleProfessional} user={user} nav={NAV_PRO}>
      <PageHeader
        backHref="/dashboard/professional"
        backLabel={p.back}
        title={p.settingsTitle}
        subtitle={p.settingsSubPro}
      />
      <SettingsTabs role="professional" account={account} />
    </DashboardShell>
  );
}
