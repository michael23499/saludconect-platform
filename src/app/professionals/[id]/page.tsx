import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BookSlotButton } from "@/components/dashboard/BookSlotButton";
import { dayMonth, formatDateEs } from "@/lib/dates";
import { InviteToSurgeryButton } from "@/components/dashboard/InviteToSurgeryButton";
import { getPublicProfessionalById } from "@backend/queries/professionals";
import { listOpenSlotsByProfessional } from "@backend/queries/availability";
import { listSurgeriesByClinicWithCounts } from "@backend/queries/surgeries";
import { getCurrentUser } from "@backend/auth";

export const metadata = { title: "Perfil del profesional · SaludCoNet" };

function slotTime(s: { startTime: string | null; endTime: string | null }): string {
  return s.startTime && s.endTime ? `${s.startTime}–${s.endTime}` : "Día completo";
}

export default async function ProfessionalPublicProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [pro, current] = await Promise.all([getPublicProfessionalById(id), getCurrentUser()]);
  if (!pro) notFound();

  const canContact = current?.profile?.role === "clinic" || current?.profile?.role === "admin";
  const isAdmin = current?.profile?.role === "admin";
  const slots = canContact ? await listOpenSlotsByProfessional(id) : [];

  // Solo una clínica real (no admin) puede invitar a sus cirugías abiertas.
  const clinicId = current?.profile?.role === "clinic" ? current.profile.id : null;
  const inviteSurgeries = clinicId
    ? (await listSurgeriesByClinicWithCounts(clinicId))
        .filter((s) => s.status === "open")
        .map((s) => ({ id: s.id, title: s.title, dateLabel: formatDateEs(s.date) }))
    : [];

  return (
    <main className="bg-mist-50">
      <div className="mx-auto w-full max-w-4xl px-5 py-8 md:px-8 md:py-10">
        <Link href="/search" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-mist-500 transition hover:text-brand-700">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          Directorio
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
                    Verificado
                  </span>
                )}
                <Badge tone={pro.availableForWork ? "success" : "neutral"}>
                  {pro.availableForWork ? "Disponible" : "Ocupado"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-white/75 md:text-base">
                {pro.specialtyName ?? "Técnico capilar"}
                {pro.city ? ` · ${pro.city}` : ""}
              </p>
              {pro.headline && <p className="mt-2 max-w-xl text-sm text-white/70">{pro.headline}</p>}
            </div>
          </div>
        </section>

        {/* Datos rápidos */}
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <Stat label="Especialidad" value={pro.specialtyName ?? "—"} />
          <Stat label="Ciudad" value={pro.city ?? "—"} />
          <Stat label="Experiencia" value={pro.yearsExperience != null ? `${pro.yearsExperience} años` : "—"} />
          <Stat label="Tarifa orientativa" value={pro.hourlyRate != null ? `${pro.hourlyRate} €/h` : "A convenir"} />
        </div>

        {/* Sobre mí — solo con cuenta de clínica (ficha completa) */}
        {canContact ? (
          <section className="mt-6 rounded-2xl border border-mist-200 bg-white p-5 md:p-6">
            <h2 className="text-base font-semibold tracking-tight text-ink-900">Sobre el profesional</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-800">
              {pro.bio || "Este profesional aún no ha añadido una biografía."}
            </p>
          </section>
        ) : (
          <section className="mt-6 rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-cyan-50 p-6 text-center dark:border-brand-500/30 dark:from-brand-500/15 dark:to-cyan-500/10">
            <h2 className="text-base font-semibold tracking-tight text-ink-900">¿Quieres contactar con {pro.fullName.split(" ")[0]}?</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-mist-500 dark:text-slate-200">
              Inicia sesión o crea una cuenta de clínica para ver su disponibilidad y reservarle directamente.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button href="/login" variant="secondary" size="sm">Iniciar sesión</Button>
              <Button href="/register?rol=clinic" size="sm">Crear cuenta de clínica</Button>
            </div>
          </section>
        )}

        {/* Disponibilidad + reserva — solo clínica */}
        {canContact && (
          <section className="mt-6 rounded-2xl border border-mist-200 bg-white">
            <div className="border-b border-mist-100 p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Disponibilidad</div>
              <div className="text-lg font-semibold tracking-tight text-ink-900">Reserva un día directamente</div>
            </div>
            {slots.length === 0 ? (
              <div className="p-8 text-center text-sm text-mist-500">
                Este profesional no tiene disponibilidad publicada ahora mismo.
              </div>
            ) : (
              <ul className="divide-y divide-mist-100">
                {slots.map((s) => {
                  const { day, mon } = dayMonth(s.date);
                  return (
                    <li key={s.id} className="flex items-center gap-4 p-4">
                      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-mist-200 bg-mist-50">
                        <div className="text-base font-semibold leading-none text-ink-900">{day}</div>
                        <div className="text-[10px] uppercase tracking-wider text-mist-500">{mon}</div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-ink-900">{formatDateEs(s.date)}</div>
                        <div className="mt-0.5 text-xs text-mist-500">
                          {slotTime(s)}
                          {s.note ? ` · ${s.note}` : ""}
                        </div>
                      </div>
                      {isAdmin ? (
                        <Badge tone="brand">Disponible</Badge>
                      ) : (
                        <BookSlotButton slotId={s.id} proName={pro.fullName} dateLabel={formatDateEs(s.date)} />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        {/* Invitar a una cirugía — solo clínica real */}
        {clinicId && (
          <section className="mt-6 rounded-2xl border border-mist-200 bg-white p-5 md:p-6">
            <h2 className="text-base font-semibold tracking-tight text-ink-900">Invitar a una cirugía</h2>
            <p className="mb-4 mt-1 text-sm text-mist-500">
              Invita a {pro.fullName.split(" ")[0]} a una de tus cirugías abiertas. Recibirá un aviso por notificación y email.
            </p>
            <InviteToSurgeryButton professionalId={pro.id} surgeries={inviteSurgeries} />
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
