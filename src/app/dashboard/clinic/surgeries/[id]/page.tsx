import { notFound } from "next/navigation";
import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { ApplicantActions } from "@/components/dashboard/ApplicantActions";
import { ApplicantProfileModal } from "@/components/dashboard/ApplicantProfileModal";
import { EditSurgeryButton } from "@/components/dashboard/EditSurgeryModal";
import { DeleteSurgeryButton } from "@/components/dashboard/DeleteSurgeryButton";
import { SupervisionBanner } from "@/components/dashboard/SupervisionBanner";
import { NAV_CLINICA } from "@/lib/dashboard-nav";
import { formatDateLongEs } from "@/lib/dates";
import { getDict } from "@/lib/i18n-server";
import { requireRole } from "@backend/auth/guards";
import { getSurgeryWithClinic } from "@backend/queries/surgeries";
import { listApplicantsForSurgery, countConfirmedByTypeForSurgery } from "@backend/queries/applications";
import { getRatingSummaries } from "@backend/queries/reviews";

export const metadata = { title: "Detalle de cirugía · Clínica · SaludCoNet" };

export default async function DetalleCirugiaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await requireRole("clinic");
  const t = (await getDict()).dashboard.surgeries;
  const isAdmin = me.profile.role === "admin";

  const row = await getSurgeryWithClinic(id);
  // Propiedad: una clínica solo ve sus cirugías; el admin (supervisión) ve cualquiera.
  if (!row || (!isAdmin && row.surgery.clinicId !== me.profile.id)) notFound();
  const { surgery, clinicName } = row;

  const [applicants, confirmed] = await Promise.all([
    listApplicantsForSurgery(id),
    countConfirmedByTypeForSurgery(id),
  ]);
  // Plazas por tipo: confirmar a un médico/técnico solo si queda hueco de SU tipo.
  const canConfirmTech = confirmed.technicians < surgery.vacancies;
  const canConfirmDoctor = confirmed.doctors < surgery.doctorsNeeded;
  // Resumen de plazas mostrando solo los tipos que la cirugía pide.
  const plazasValue =
    [
      surgery.vacancies > 0 ? `${confirmed.technicians}/${surgery.vacancies} ${t.technicians}` : null,
      surgery.doctorsNeeded > 0 ? `${confirmed.doctors}/${surgery.doctorsNeeded} ${t.doctors}` : null,
    ]
      .filter(Boolean)
      .join(" · ") || `0/${surgery.vacancies}`;

  const user = {
    name: me.profile.fullName,
    subtitle: isAdmin ? "Administrador" : me.profile.city ? `Clínica · ${me.profile.city}` : "Clínica",
    avatarUrl: me.profile.avatarUrl,
  };

  const pending = applicants.filter((a) => a.application.status === "applied");
  const decided = applicants.filter((a) => a.application.status !== "applied");
  // Puntuación media de cada candidato (su reputación como profesional).
  const ratings = await getRatingSummaries(applicants.map((a) => a.application.professionalId));

  return (
    <DashboardShell role="Clínica" user={user} nav={NAV_CLINICA}>
      <PageHeader
        backHref="/dashboard/clinic/surgeries"
        backLabel={isAdmin ? t.detailBackAdmin : t.detailBack}
        title={surgery.title}
        subtitle={`${isAdmin ? `${clinicName} · ` : ""}${formatDateLongEs(surgery.date)}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <EditSurgeryButton surgery={surgery} asAdmin={isAdmin} />
            <DeleteSurgeryButton surgeryId={surgery.id} asAdmin={isAdmin} />
          </div>
        }
      />

      {isAdmin && <SupervisionBanner />}

      <div className="mb-6 grid gap-4 rounded-2xl border border-mist-200 bg-white p-6 md:grid-cols-4">
        <Summary label={t.sumEstado} value={surgery.status === "filled" ? t.statusFilled : surgery.status === "open" ? t.open : surgery.status === "cancelled" ? t.statusCancelled : t.statusCompleted} />
        <Summary label={t.sumPlazas} value={plazasValue} />
        <Summary label={t.sumHorario} value={surgery.startTime && surgery.endTime ? `${surgery.startTime}–${surgery.endTime}` : "—"} />
        <Summary label={t.sumTarifa} value={surgery.ratePerHour ? `${surgery.ratePerHour} €/h` : t.rateTBD} />
        {(surgery.city || surgery.address) && (
          <div className="md:col-span-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-mist-500">{t.sumUbicacion}</div>
            <div className="mt-0.5 text-sm text-ink-800">
              {[surgery.address, surgery.city].filter(Boolean).join(", ")}
            </div>
          </div>
        )}
        {surgery.description && (
          <div className="md:col-span-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-mist-500">{t.sumDescripcion}</div>
            <p className="mt-0.5 whitespace-pre-line text-sm text-ink-800">{surgery.description}</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-mist-200 bg-white">
        <div className="flex items-center justify-between border-b border-mist-100 p-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{t.candidates}</div>
            <div className="text-lg font-semibold tracking-tight text-ink-900">
              {pending.length} {pending.length === 1 ? t.pendingOne : t.pendingMany}
            </div>
          </div>
        </div>

        {applicants.length === 0 ? (
          <div className="p-8 text-center text-sm text-mist-500">{t.noApplicants}</div>
        ) : (
          <ul className="divide-y divide-mist-100">
            {[...pending, ...decided].map((a) => {
              const proType = a.proType ?? "technician";
              const canConfirm = proType === "doctor" ? canConfirmDoctor : canConfirmTech;
              const rating = ratings[a.application.professionalId];
              return (
                <li key={a.application.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center">
                  <ApplicantProfileModal
                    proName={a.proName}
                    proAvatarUrl={a.proAvatarUrl}
                    proVerified={a.proVerified}
                    proType={proType}
                    specialtyName={a.specialtyName}
                    proCity={a.proCity}
                    yearsExperience={a.yearsExperience}
                    hourlyRate={a.hourlyRate}
                    headline={a.headline}
                    bio={a.bio}
                    message={a.application.message}
                    ratingAverage={rating?.average ?? 0}
                    ratingCount={rating?.count ?? 0}
                  />
                  <div className="shrink-0 md:pl-4">
                    <ApplicantActions
                      applicationId={a.application.id}
                      initialStatus={a.application.status}
                      canConfirm={canConfirm}
                      asAdmin={isAdmin}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DashboardShell>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-mist-500">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-ink-900">{value}</div>
    </div>
  );
}
