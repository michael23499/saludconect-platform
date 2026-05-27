import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { NAV_CLINICA } from "@/lib/dashboard-nav";
import { SettingsTabs } from "@/components/dashboard/SettingsTabs";
import type { AccountData } from "@/components/dashboard/AccountSettingsForm";
import { getDict } from "@/lib/i18n-server";
import { buildDashboardUser } from "@/lib/dashboard-user";
import { requireRole } from "@backend/auth/guards";
import { getClinicById } from "@backend/queries/clinics";

export const metadata = { title: "Ajustes · SaludCoNet" };

export default async function AjustesPage() {
  const me = await requireRole("clinic");
  const p = (await getDict()).dashboard.prof;
  const isAdmin = me.profile.role === "admin";
  const user = buildDashboardUser(me.profile, { isAdmin, roleLabel: "Clínica" });

  const clinic = await getClinicById(me.profile.id);
  const account: AccountData = {
    role: "clinic",
    fullName: me.profile.fullName,
    email: me.profile.email,
    phone: me.profile.phone ?? "",
    city: me.profile.city ?? "",
    address: me.profile.address ?? "",
    postalCode: me.profile.postalCode ?? "",
    lat: me.profile.lat,
    lng: me.profile.lng,
    avatarUrl: me.profile.avatarUrl,
    specialtyName: null,
    headline: "",
    bio: "",
    yearsExperience: "",
    hourlyRate: "",
    clinicName: clinic?.clinicName ?? "",
    contactName: clinic?.contactName ?? "",
    specialties: clinic?.specialties ?? [],
    about: clinic?.about ?? "",
    website: clinic?.website ?? "",
  };

  return (
    <DashboardShell role="Clínica" user={user} nav={NAV_CLINICA}>
      <PageHeader
        backHref="/dashboard/clinic"
        backLabel={p.back}
        title={p.settingsTitle}
        subtitle={p.settingsSubClinic}
      />
      <SettingsTabs account={account} />
    </DashboardShell>
  );
}
