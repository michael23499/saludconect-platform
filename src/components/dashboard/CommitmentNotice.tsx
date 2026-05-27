import Link from "next/link";
import { getDict } from "@/lib/i18n-server";
import { classifyCancellation, leadHoursUntil } from "@backend/policy/reservation";

/**
 * Resumen del "Compromiso de colaboración" que se muestra a ambas partes cuando
 * una reserva queda confirmada. No es un contrato: deja constancia visible del
 * compromiso adquirido y enlaza a la Política de Reservas. `audience` adapta el
 * texto a quien lo ve.
 *
 * Es CONSCIENTE de la fecha: además del aviso general, indica en qué ventana de
 * cancelación se está ahora mismo (libre >72 h, afecta 24–72 h, penaliza <24 h o
 * fecha ya pasada), para que cada parte sepa qué implica cancelar en este momento.
 */
export async function CommitmentNotice({
  audience,
  date,
  startTime,
}: {
  audience: "professional" | "clinic";
  date: string;
  startTime?: string | null;
}) {
  const t = (await getDict()).dashboard.surgeries;

  // Ventana actual según la antelación hasta el inicio del trabajo.
  const lead = leadHoursUntil(date, startTime ?? null);
  const window =
    lead <= 0
      ? { text: t.windowPast, tone: "neutral" as const }
      : ((): { text: string; tone: "free" | "late" | "severe" } => {
          const sev = classifyCancellation(lead);
          if (sev === "free") return { text: t.windowFree, tone: "free" };
          if (sev === "late") return { text: t.windowLate, tone: "late" };
          return { text: t.windowSevere, tone: "severe" };
        })();

  const dot = {
    free: "bg-emerald-500",
    late: "bg-amber-500",
    severe: "bg-red-500",
    neutral: "bg-mist-400",
  }[window.tone];
  const windowText = {
    free: "text-emerald-700 dark:text-emerald-300",
    late: "text-amber-700 dark:text-amber-300",
    severe: "text-red-700 dark:text-red-300",
    neutral: "text-mist-500",
  }[window.tone];

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <h3 className="text-sm font-semibold text-ink-900">{t.commitmentTitle}</h3>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-700">
        {audience === "clinic" ? t.commitmentBodyClinic : t.commitmentBody}
      </p>
      <div className="mt-2.5 flex items-start gap-2">
        <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
        <span className={`text-[13px] font-medium ${windowText}`}>{window.text}</span>
      </div>
      <Link
        href="/legal/reservations"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block text-xs font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-800 dark:text-emerald-300"
      >
        {t.commitmentPolicy}
      </Link>
    </div>
  );
}
