import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedTag } from "@/components/ui/VerifiedTag";
import { ClinicAvailabilityCalendar, type ClinicSlot } from "@/components/dashboard/ClinicAvailabilityCalendar";
import { SupervisionBanner } from "@/components/dashboard/SupervisionBanner";
import { NAV_CLINICA } from "@/lib/dashboard-nav";
import { getDict } from "@/lib/i18n-server";
import { dayMonth, formatDateEs } from "@/lib/dates";
import { requireRole } from "@backend/auth/guards";
import {
  listOpenSlots,
  listSlotsBookedByClinic,
  type SlotWithProfessional,
} from "@backend/queries/availability";
import { getSpecialtyBySlug } from "@backend/queries/specialties";
import { CAPILAR_SLUG } from "@backend/db/seed-data";

export const metadata = { title: "Técnicos disponibles · Clínica · SaludCoNet" };

export default async function ClinicaCalendarioPage() {
  const me = await requireRole("clinic");
  const c = (await getDict()).dashboard.cal;
  const slotTime = (s: SlotWithProfessional["slot"]) =>
    s.startTime && s.endTime ? `${s.startTime}–${s.endTime}` : c.avFullDay;
  const isAdmin = me.profile.role === "admin";
  const user = {
    name: me.profile.fullName,
    subtitle: isAdmin ? "Administrador" : me.profile.city ? `Clínica · ${me.profile.city}` : "Clínica",
    avatarUrl: me.profile.avatarUrl,
  };

  const specialty = await getSpecialtyBySlug(CAPILAR_SLUG);
  const [openSlots, myBookings] = await Promise.all([
    listOpenSlots(specialty?.id),
    isAdmin ? Promise.resolve<SlotWithProfessional[]>([]) : listSlotsBookedByClinic(me.profile.id),
  ]);

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
    <DashboardShell role="Clínica" user={user} nav={NAV_CLINICA}>
      {isAdmin && <SupervisionBanner />}
      <PageHeader
        backHref="/dashboard/clinic"
        backLabel={c.back}
        title={c.calClinicTitle}
        subtitle={c.calClinicSub}
      />

      {/* Reservas que ya hizo esta clínica */}
      {!isAdmin && myBookings.length > 0 && (
        <section className="mb-6 rounded-2xl border border-mist-200 bg-white">
          <div className="border-b border-mist-100 p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{c.calYourBookings}</div>
            <div className="text-lg font-semibold tracking-tight text-ink-900">{c.calBookedTechs}</div>
          </div>
          <ul className="divide-y divide-mist-100">
            {myBookings.map(({ slot, proName, proCity, proAvatarUrl, proVerified }) => {
              const { day, mon } = dayMonth(slot.date);
              return (
                <li key={slot.id} className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50">
                    <div className="text-base font-semibold leading-none text-emerald-700">{day}</div>
                    <div className="text-[10px] uppercase tracking-wider text-emerald-600">{mon}</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
                      <Avatar name={proName} src={proAvatarUrl ?? undefined} size="xs" />
                      {proName}
                      {proVerified && <VerifiedTag label={c.verified} />}
                    </div>
                    <div className="mt-0.5 text-xs text-mist-500">
                      {formatDateEs(slot.date)} · {slotTime(slot)}
                      {proCity ? ` · ${proCity}` : ""}
                    </div>
                  </div>
                  <Badge tone="success">{c.calReserved}</Badge>
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
