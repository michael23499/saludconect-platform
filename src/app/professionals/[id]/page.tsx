import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Stars } from "@/components/ui/Stars";
import { AvailabilityCalendar } from "@/components/dashboard/AvailabilityCalendar";
import { formatDateEs } from "@/lib/dates";
import { getDict } from "@/lib/i18n-server";
import { InviteToSurgeryButton } from "@/components/dashboard/InviteToSurgeryButton";
import { AddToTeamButton } from "@/components/dashboard/AddToTeamButton";
import { getPublicProfessionalById } from "@backend/queries/professionals";
import { listOpenSlotsByProfessional } from "@backend/queries/availability";
import { listSurgeriesByClinicWithCounts } from "@backend/queries/surgeries";
import { getRatingSummary, listReviewsFor } from "@backend/queries/reviews";
import { isInClinicTeam } from "@backend/queries/team";
import { getCurrentUser } from "@backend/auth";

export const metadata = { title: "Perfil del profesional · SaludCoNet" };

export default async function ProfessionalPublicProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [pro, current, rating, reviewList, t] = await Promise.all([
    getPublicProfessionalById(id),
    getCurrentUser(),
    getRatingSummary(id),
    listReviewsFor(id),
    getDict().then((d) => d.directory),
  ]);
  if (!pro) notFound();

  const canContact = current?.profile?.role === "clinic" || current?.profile?.role === "admin";
  const isAdmin = current?.profile?.role === "admin";
  const slots = canContact ? await listOpenSlotsByProfessional(id) : [];
  const firstName = pro.fullName.split(" ")[0];

  // Solo una clínica real (no admin) puede invitar a sus cirugías abiertas y
  // guardar al profesional en su equipo.
  const clinicId = current?.profile?.role === "clinic" ? current.profile.id : null;
  const [inviteSurgeries, inTeam] = clinicId
    ? await Promise.all([
        listSurgeriesByClinicWithCounts(clinicId).then((list) =>
          list.filter((s) => s.status === "open").map((s) => ({ id: s.id, title: s.title, dateLabel: formatDateEs(s.date) })),
        ),
        isInClinicTeam(clinicId, id),
      ])
    : [[] as { id: string; title: string; dateLabel: string }[], false as boolean];

  return (
    <main className="bg-mist-50">
      <div className="mx-auto w-full max-w-4xl px-5 py-8 md:px-8 md:py-10">
        <Link href="/search" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-mist-500 transition hover:text-brand-700">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          {t.back}
        </Link>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-mist-200 bg-gradient-to-br from-ink-950 via-ink-900 to-brand-800 text-white">
          <div className="bg-grid absolute inset-0 opacity-20" />
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="relative flex flex-col items-start gap-5 p-6 md:flex-row md:items-end md:gap-8 md:p-8">
            <Avatar name={pro.fullName} src={pro.avatarUrl ?? undefined} size="xl" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{pro.fullName}</h1>
                {pro.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-200 backdrop-blur">
                    <span className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-emerald-400 text-emerald-950">
                      <svg className="h-2 w-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
                    </span>
                    {t.verified}
                  </span>
                )}
                <Badge tone={pro.availableForWork ? "success" : "neutral"}>
                  {pro.availableForWork ? t.available : t.busy}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-white/75 md:text-base">
                {pro.specialtyName ?? t.defaultTechnician}
                {pro.city ? ` · ${pro.city}` : ""}
              </p>
              {rating.count > 0 && (
                <div className="mt-2 flex items-center gap-1.5">
                  <Stars value={rating.average} size="md" />
                  <span className="text-sm font-semibold text-white">{rating.average.toFixed(1)}</span>
                  <span className="text-sm text-white/60">
                    ({rating.count} {rating.count === 1 ? t.ratingOne : t.ratingMany})
                  </span>
                </div>
              )}
              {pro.headline && <p className="mt-2 max-w-xl text-sm text-white/70">{pro.headline}</p>}
            </div>
          </div>
        </section>

        {/* Datos rápidos */}
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <Stat label={t.statSpecialty} value={pro.specialtyName ?? "—"} />
          <Stat label={t.statCity} value={pro.city ?? "—"} />
          {canContact ? (
            <>
              <Stat label={t.statExperience} value={pro.yearsExperience != null ? `${pro.yearsExperience} ${t.years}` : "—"} />
              <Stat label={t.statRate} value={pro.hourlyRate != null ? `${pro.hourlyRate} €/h` : t.rateTBD} />
            </>
          ) : (
            <>
              <LockedStat label={t.statExperience} lockedText={t.lockedShort} />
              <LockedStat label={t.statRate} lockedText={t.lockedShort} />
            </>
          )}
        </div>

        {/* Sobre mí — solo con cuenta de clínica (ficha completa) */}
        {canContact ? (
          <section className="mt-6 rounded-2xl border border-mist-200 bg-white p-5 md:p-6">
            <h2 className="text-base font-semibold tracking-tight text-ink-900">{t.aboutPro}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-800">{pro.bio || t.noBio}</p>
          </section>
        ) : (
          <section className="mt-6 rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-cyan-50 p-6 text-center dark:border-brand-500/30 dark:from-brand-500/15 dark:to-cyan-500/10">
            <h2 className="text-base font-semibold tracking-tight text-ink-900">
              {t.contactHeading.replace("{name}", firstName)}
            </h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-mist-500 dark:text-slate-200">{t.contactText}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button href="/login" variant="secondary" size="sm">{t.login}</Button>
              <Button href="/register?rol=clinic" size="sm">{t.createClinic}</Button>
            </div>
          </section>
        )}

        {/* Valoraciones — visibles para todos */}
        {reviewList.length > 0 && (
          <section className="mt-6 rounded-2xl border border-mist-200 bg-white p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold tracking-tight text-ink-900">{t.reviewsTitle}</h2>
              <Stars value={rating.average} count={rating.count} size="md" />
            </div>
            <ul className="mt-4 space-y-4">
              {reviewList.map(({ review, raterName, raterAvatarUrl }) => (
                <li key={review.id} className="flex gap-3 border-t border-mist-100 pt-4 first:border-t-0 first:pt-0">
                  <Avatar name={raterName} src={raterAvatarUrl ?? undefined} size="sm" ring="" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-ink-900">{raterName}</span>
                      <Stars value={review.rating} size="sm" />
                    </div>
                    {review.comment && <p className="mt-1 text-sm leading-relaxed text-ink-700">{review.comment}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Disponibilidad + reserva — solo clínica */}
        {canContact && (
          <section className="mt-6 rounded-2xl border border-mist-200 bg-white">
            <div className="border-b border-mist-100 p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{t.availTitle}</div>
              <div className="text-lg font-semibold tracking-tight text-ink-900">{t.availSub}</div>
            </div>
            {slots.length === 0 ? (
              <div className="p-8 text-center text-sm text-mist-500">{t.noAvailability}</div>
            ) : (
              <AvailabilityCalendar
                slots={slots.map((s) => ({
                  id: s.id,
                  date: s.date,
                  startTime: s.startTime,
                  endTime: s.endTime,
                  note: s.note,
                }))}
                proName={pro.fullName}
                isAdmin={isAdmin}
              />
            )}
          </section>
        )}

        {/* Acciones de la clínica: equipo + invitar a una cirugía — solo clínica real */}
        {clinicId && (
          <section className="mt-6 rounded-2xl border border-mist-200 bg-white p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-base font-semibold tracking-tight text-ink-900">{t.inviteTitle}</h2>
                <p className="mt-1 text-sm text-mist-500">{t.inviteText.replace("{name}", firstName)}</p>
              </div>
              <AddToTeamButton professionalId={pro.id} initialInTeam={inTeam} />
            </div>
            <div className="mt-4">
              <InviteToSurgeryButton professionalId={pro.id} surgeries={inviteSurgeries} />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-mist-200 bg-white p-4 md:p-5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">{label}</div>
      <div className="mt-1.5 text-lg font-semibold tracking-tight text-ink-900 md:text-xl">{value}</div>
    </div>
  );
}

/** Dato sensible velado para visitantes sin sesión de clínica (glow + candado). */
function LockedStat({ label, lockedText }: { label: string; lockedText: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-mist-200 bg-white p-4 md:p-5">
      <div className="pointer-events-none absolute -inset-2 bg-gradient-to-r from-brand-400/20 via-cyan-400/20 to-brand-400/20 blur-xl" aria-hidden />
      <div className="relative text-[10px] font-semibold uppercase tracking-wider text-mist-500">{label}</div>
      <div className="relative mt-1.5 flex items-center gap-1.5 text-sm font-medium text-brand-700">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
        {lockedText}
      </div>
    </div>
  );
}
