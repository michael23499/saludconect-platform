import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { AvailabilityForm } from "@/components/dashboard/AvailabilityForm";
import { ProAvailabilityCalendar, type ProSlot, type ProSurgery } from "@/components/dashboard/ProAvailabilityCalendar";
import { ClinicAvailabilityCalendar, type ClinicSlot } from "@/components/dashboard/ClinicAvailabilityCalendar";
import { SupervisionBanner } from "@/components/dashboard/SupervisionBanner";
import { NAV_PRO } from "@/lib/dashboard-nav";
import { getDict } from "@/lib/i18n-server";
import { buildDashboardUser } from "@/lib/dashboard-user";
import { requireRole } from "@backend/auth/guards";
import { listSlotsByProfessional, listOpenSlots } from "@backend/queries/availability";
import { listConfirmedUpcomingForProfessional } from "@backend/queries/applications";

export const metadata = { title: "Calendario · Profesional · SaludCoNet" };

export default async function ProfesionalCalendarioPage() {
  const me = await requireRole("professional");
  const c = (await getDict()).dashboard.cal;
  const isAdmin = me.profile.role === "admin";
  const sh = (await getDict()).dashboard.shell;
  const user = buildDashboardUser(me.profile, { isAdmin, roleLabel: sh.roleTechnician, adminLabel: sh.roleAdmin });

  // --- Supervisión (admin): ve el calendario global en modo solo lectura ---
  if (isAdmin) {
    const open = await listOpenSlots();
    const adminSlots: ClinicSlot[] = open.map(({ slot, proName, proCity, proAvatarUrl, proVerified }) => ({
      id: slot.id,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      city: slot.city,
      note: slot.note,
      proName,
      proCity,
      proAvatarUrl,
      proVerified,
    }));
    return (
      <DashboardShell role={sh.roleProfessional} user={user} nav={NAV_PRO}>
        <SupervisionBanner scope="professional" />
        <PageHeader
          backHref="/dashboard/professional"
          backLabel={c.back}
          title={c.calAdminTitle}
          subtitle={c.calAdminSub}
        />
        <ClinicAvailabilityCalendar slots={adminSlots} canBook={false} />
      </DashboardShell>
    );
  }

  // --- Flujo normal del profesional: publicar y gestionar disponibilidad ---
  const [rows, confirmed] = await Promise.all([
    listSlotsByProfessional(me.profile.id),
    listConfirmedUpcomingForProfessional(me.profile.id),
  ]);
  const slots: ProSlot[] = rows.map((s) => ({
    id: s.id,
    date: s.date,
    startTime: s.startTime,
    endTime: s.endTime,
    city: s.city,
    note: s.note,
    status: s.status,
    bookedByName: s.bookedByName,
  }));
  const proSurgeries: ProSurgery[] = confirmed.map(({ surgery, clinicName }) => ({
    id: surgery.id,
    date: surgery.date,
    title: surgery.title,
    clinicName,
    startTime: surgery.startTime,
    endTime: surgery.endTime,
  }));

  return (
    <DashboardShell role="Profesional" user={user} nav={NAV_PRO}>
      <PageHeader
        backHref="/dashboard/professional"
        backLabel={c.back}
        title={c.calProTitle}
        subtitle={c.calProSub}
      />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <AvailabilityForm />
        <ProAvailabilityCalendar slots={slots} surgeries={proSurgeries} />
      </div>
    </DashboardShell>
  );
}
