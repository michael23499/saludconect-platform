import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { ClinicAvailabilityCalendar, type ClinicSlot } from "@/components/dashboard/ClinicAvailabilityCalendar";
import { BookedSlotRow } from "@/components/dashboard/BookedSlotRow";
import { SupervisionBanner } from "@/components/dashboard/SupervisionBanner";
import { NAV_CLINICA } from "@/lib/dashboard-nav";
import { getDict } from "@/lib/i18n-server";
import { buildDashboardUser } from "@/lib/dashboard-user";
import { requireRole } from "@backend/auth/guards";
import {
  listOpenSlots,
  listSlotsBookedByClinic,
  type BookedSlotDetail,
} from "@backend/queries/availability";
import { getRatingSummaries } from "@backend/queries/reviews";
import { getSpecialtyBySlug } from "@backend/queries/specialties";
import { CAPILAR_SLUG } from "@backend/db/seed-data";

export const metadata = { title: "Técnicos disponibles · Clínica · SaludCoNet" };

export default async function ClinicaCalendarioPage() {
  const me = await requireRole("clinic");
  const c = (await getDict()).dashboard.cal;
  const isAdmin = me.profile.role === "admin";
  const sh = (await getDict()).dashboard.shell;
  const user = buildDashboardUser(me.profile, { isAdmin, roleLabel: sh.roleClinic, adminLabel: sh.roleAdmin });

  const specialty = await getSpecialtyBySlug(CAPILAR_SLUG);
  const [openSlots, myBookings] = await Promise.all([
    listOpenSlots(specialty?.id),
    isAdmin ? Promise.resolve<BookedSlotDetail[]>([]) : listSlotsBookedByClinic(me.profile.id),
  ]);
  // Puntuación de los técnicos reservados (para mostrarla en su ficha).
  const ratings = myBookings.length
    ? await getRatingSummaries(myBookings.map((b) => b.slot.professionalId))
    : {};

  const calendarSlots: ClinicSlot[] = openSlots.map(({ slot, proName, proCity, proAvatarUrl, proVerified }) => ({
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
    <DashboardShell role={sh.roleClinic} user={user} nav={NAV_CLINICA}>
      {isAdmin && <SupervisionBanner />}
      <PageHeader
        backHref="/dashboard/clinic"
        backLabel={c.back}
        title={c.calClinicTitle}
        subtitle={c.calClinicSub}
      />

      {/* Reservas que ya hizo esta clínica — clic para ver la ficha del técnico */}
      {!isAdmin && myBookings.length > 0 && (
        <section className="mb-6 rounded-2xl border border-mist-200 bg-white">
          <div className="border-b border-mist-100 p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{c.calYourBookings}</div>
            <div className="text-lg font-semibold tracking-tight text-ink-900">{c.calBookedTechs}</div>
          </div>
          <ul className="divide-y divide-mist-100">
            {myBookings.map((b) => {
              const r = ratings[b.slot.professionalId];
              return (
                <li key={b.slot.id}>
                  <BookedSlotRow
                    slotId={b.slot.id}
                    date={b.slot.date}
                    startTime={b.slot.startTime}
                    endTime={b.slot.endTime}
                    status={b.slot.status === "pending" ? "pending" : "booked"}
                    proId={b.slot.professionalId}
                    proName={b.proName}
                    proAvatarUrl={b.proAvatarUrl}
                    proVerified={b.proVerified}
                    proType={b.proType ?? "technician"}
                    specialtyName={b.specialtyName}
                    proCity={b.proCity}
                    yearsExperience={b.yearsExperience}
                    hourlyRate={b.hourlyRate}
                    bio={b.bio}
                    ratingAverage={r?.average ?? 0}
                    ratingCount={r?.count ?? 0}
                  />
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Disponibilidad publicada por los técnicos (calendario) */}
      <ClinicAvailabilityCalendar slots={calendarSlots} canBook={!isAdmin} />
    </DashboardShell>
  );
}
