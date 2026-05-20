"use client";
import { useMemo, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/cn";
import { useApp } from "@/components/providers/Providers";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

export type DayShift = "morning" | "afternoon" | "both" | "blocked" | "free";

export type Appointment = {
  id: string;
  shift: "Mañana" | "Tarde" | "Día completo";
  start: string;          // "08:00"
  end: string;            // "14:00"
  clinic: string;
  city: string;
  specialty: string;
  rateLabel: string;
  status: "confirmada" | "pendiente" | "completada" | "cancelada";
  contact: string;
};

export type DayData = {
  shift: DayShift;
  appointments?: Appointment[];
};

export type CalendarData = Record<string, DayData>; // key: "YYYY-MM-DD"

type Props = {
  initialDate?: Date;
  data: CalendarData;
};

const TILE: Record<DayShift, string> = {
  free: "bg-white border-mist-200 text-ink-800 hover:border-brand-400 hover:bg-brand-50/40",
  morning: "bg-brand-50 border-brand-200 text-brand-800 hover:border-brand-400",
  afternoon: "bg-cyan-50 border-cyan-200 text-cyan-800 hover:border-cyan-400",
  both: "bg-gradient-to-br from-brand-50 to-cyan-50 border-brand-200 text-ink-900 hover:border-brand-400",
  blocked: "bg-mist-100 border-mist-200 text-mist-400",
};

const COPY = {
  es: {
    today: "Hoy", legend: { morning: "Mañana", afternoon: "Tarde", both: "Día completo", blocked: "Bloqueado", free: "Libre" },
    months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    weekdays: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    noAppts: "Sin reservas",
    detail: "Detalle del día",
    appts: "Reservas del día",
    block: "Bloquear día",
    unblock: "Desbloquear",
    morningOn: "Marcar mañana disponible",
    afternoonOn: "Marcar tarde disponible",
    addAppt: "Nueva reserva",
    close: "Cerrar",
    confirmed: "Confirmada",
    pending: "Pendiente",
    completed: "Completada",
    cancelled: "Cancelada",
    contact: "Contacto",
    rate: "Tarifa",
    shift: "Turno",
    spec: "Especialidad",
    chat: "Abrir chat",
    reschedule: "Reprogramar",
    cancel: "Cancelar reserva",
    blockedDay: "Día bloqueado",
    blockedDesc: "No recibirás solicitudes este día.",
  },
  en: {
    today: "Today", legend: { morning: "Morning", afternoon: "Afternoon", both: "Full day", blocked: "Blocked", free: "Free" },
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    noAppts: "No bookings",
    detail: "Day detail",
    appts: "Bookings",
    block: "Block day",
    unblock: "Unblock",
    morningOn: "Open morning",
    afternoonOn: "Open afternoon",
    addAppt: "New booking",
    close: "Close",
    confirmed: "Confirmed",
    pending: "Pending",
    completed: "Completed",
    cancelled: "Cancelled",
    contact: "Contact",
    rate: "Rate",
    shift: "Shift",
    spec: "Specialty",
    chat: "Open chat",
    reschedule: "Reschedule",
    cancel: "Cancel booking",
    blockedDay: "Blocked day",
    blockedDesc: "You won't receive requests on this day.",
  },
};

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function statusTone(s: Appointment["status"]) {
  switch (s) {
    case "confirmada": return "success" as const;
    case "pendiente": return "warning" as const;
    case "completada": return "brand" as const;
    case "cancelada": return "danger" as const;
  }
}

export function InteractiveCalendar({ initialDate, data }: Props) {
  const { lang } = useApp();
  const c = COPY[lang];

  const [cursor, setCursor] = useState(() => {
    const d = initialDate || new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthLabel = `${c.months[month]} ${year}`;

  // First weekday of month (Mon=0..Sun=6)
  const firstDay = new Date(year, month, 1);
  const jsDay = firstDay.getDay(); // 0=Sun
  const startOffset = (jsDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<{ key: string | null; d: number | null }> = [];
  for (let i = 0; i < startOffset; i++) cells.push({ key: null, d: null });
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    cells.push({ key: ymd(date), d: day });
  }
  while (cells.length % 7 !== 0) cells.push({ key: null, d: null });

  const today = useMemo(() => ymd(new Date()), []);
  const selected = selectedKey ? data[selectedKey] : null;

  const goPrev = () => setCursor(new Date(year, month - 1, 1));
  const goNext = () => setCursor(new Date(year, month + 1, 1));
  const goToday = () => {
    const d = new Date();
    setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  // ESC to close modal
  const closeModal = useCallback(() => setSelectedKey(null), []);
  useEffect(() => {
    if (!selectedKey) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selectedKey, closeModal]);

  return (
    <div className="rounded-2xl border border-mist-200 bg-white p-3 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 md:mb-5">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500 md:text-xs">Calendar</div>
          <div className="text-base font-semibold tracking-tight text-ink-900 capitalize md:text-lg">{monthLabel}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={goPrev} aria-label="Mes anterior" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-mist-200 text-ink-700 hover:bg-mist-50">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button onClick={goToday} className="inline-flex h-9 items-center justify-center rounded-lg border border-mist-200 px-3 text-xs font-medium text-ink-800 hover:bg-mist-50">
            {c.today}
          </button>
          <button onClick={goNext} aria-label="Mes siguiente" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-mist-200 text-ink-700 hover:bg-mist-50">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-1.5">
        {c.weekdays.map((d) => (
          <div key={d} className="py-1.5 text-center text-[9px] font-semibold uppercase tracking-wider text-mist-500 md:py-2 md:text-[10px]">
            <span className="hidden sm:inline">{d}</span>
            <span className="sm:hidden">{d.charAt(0)}</span>
          </div>
        ))}
        {cells.map((cell, i) => {
          if (!cell.d || !cell.key) return <div key={i} className="min-h-[52px] md:min-h-[88px]" />;
          const dayData = data[cell.key];
          const state: DayShift = dayData?.shift || "free";
          const appts = dayData?.appointments || [];
          const apptCount = appts.length;
          const isToday = cell.key === today;
          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => setSelectedKey(cell.key)}
              className={cn(
                "group relative flex min-h-[52px] flex-col rounded-lg border p-1 text-left text-[12px] font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-500 md:min-h-[88px] md:rounded-xl md:p-1.5",
                TILE[state],
                isToday && "ring-2 ring-brand-500 ring-offset-1"
              )}
            >
              {/* Day number + indicators */}
              <div className="flex items-start justify-between gap-1">
                <span className={cn("text-[11px] leading-none", isToday && "font-bold")}>{cell.d}</span>
                <div className="flex items-center gap-0.5">
                  {state === "morning" && <span className="h-1.5 w-1.5 rounded-full bg-brand-500" title="Mañana" />}
                  {state === "afternoon" && <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" title="Tarde" />}
                  {state === "both" && (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                    </>
                  )}
                </div>
              </div>

              {/* Mobile: just dots + count badge */}
              {apptCount > 0 && (
                <div className="mt-auto flex items-center justify-center gap-0.5 pb-0.5 md:hidden">
                  {Array.from({ length: Math.min(apptCount, 3) }).map((_, idx) => (
                    <span key={idx} className="h-1 w-1 rounded-full bg-ink-900/70" />
                  ))}
                </div>
              )}

              {/* Appointments preview (md+) */}
              {apptCount > 0 ? (
                <div className="mt-1.5 hidden flex-1 flex-col gap-1 md:flex">
                  {appts.slice(0, 2).map((a) => (
                    <AppointmentChip key={a.id} a={a} />
                  ))}
                  {apptCount > 2 && (
                    <div className="rounded-md bg-ink-900/85 px-1.5 py-0.5 text-center text-[9px] font-bold text-white">
                      +{apptCount - 2}
                    </div>
                  )}
                </div>
              ) : state === "blocked" ? (
                <div className="mt-auto hidden items-center justify-center pb-1 text-[9px] uppercase tracking-wider text-mist-400 md:flex">
                  bloqueado
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {(["morning", "afternoon", "both", "blocked", "free"] as DayShift[]).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5 text-xs text-mist-500">
            <span className={cn("h-3 w-3 rounded-md border", TILE[k])} />
            {c.legend[k]}
          </span>
        ))}
      </div>

      {selected && selectedKey && (
        <DayModal
          dateKey={selectedKey}
          data={selected}
          onClose={closeModal}
          copy={c}
          lang={lang}
        />
      )}
    </div>
  );
}

function AppointmentChip({ a }: { a: Appointment }) {
  const tone =
    a.status === "confirmada"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : a.status === "pendiente"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : a.status === "completada"
      ? "border-mist-200 bg-white text-mist-500 line-through decoration-mist-400/60"
      : "border-red-200 bg-red-50 text-red-700 line-through decoration-red-400";
  const bar =
    a.status === "confirmada" ? "bg-emerald-500"
    : a.status === "pendiente" ? "bg-amber-500"
    : a.status === "completada" ? "bg-mist-300"
    : "bg-red-500";
  return (
    <div
      title={`${a.start}–${a.end} · ${a.clinic} · ${a.specialty}`}
      className={cn(
        "relative flex items-center gap-1 overflow-hidden rounded-md border px-1.5 py-0.5 text-left text-[10px] font-semibold leading-tight",
        tone
      )}
    >
      <span className={cn("absolute left-0 top-0 bottom-0 w-[3px] rounded-l-md", bar)} />
      <span className="ml-1 shrink-0 tabular-nums opacity-80">{a.start}</span>
      <span className="min-w-0 flex-1 truncate font-semibold">{a.clinic}</span>
    </div>
  );
}

function DayModal({
  dateKey,
  data,
  onClose,
  copy,
  lang,
}: {
  dateKey: string;
  data: DayData;
  onClose: () => void;
  copy: typeof COPY.es;
  lang: "es" | "en";
}) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const weekdayFmt = lang === "es" ? ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
                                    : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weekday = weekdayFmt[date.getDay()];
  const monthLabel = `${copy.months[m - 1]}`;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 md:items-center md:p-6">
      <div className="modal-backdrop absolute inset-0" onClick={onClose} />
      <div className="scale-in relative z-10 w-full max-w-2xl rounded-t-3xl border border-mist-200 bg-white shadow-2xl md:rounded-3xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-mist-100 p-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{copy.detail}</div>
            <div className="mt-1 text-xl font-semibold tracking-tight text-ink-900 capitalize">
              {weekday} {d} {monthLabel}
            </div>
            <div className="mt-1 flex items-center gap-2">
              {data.shift === "blocked" ? (
                <Badge tone="neutral">{copy.legend.blocked}</Badge>
              ) : data.shift === "morning" ? (
                <Badge tone="brand">{copy.legend.morning}</Badge>
              ) : data.shift === "afternoon" ? (
                <Badge tone="accent">{copy.legend.afternoon}</Badge>
              ) : data.shift === "both" ? (
                <Badge tone="brand">{copy.legend.both}</Badge>
              ) : (
                <Badge tone="neutral">{copy.legend.free}</Badge>
              )}
              {data.appointments && data.appointments.length > 0 && (
                <span className="text-xs text-mist-500">· {data.appointments.length} {copy.appts.toLowerCase()}</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.close}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-mist-200 text-ink-700 hover:bg-mist-50"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {data.shift === "blocked" ? (
            <div className="rounded-2xl border border-dashed border-mist-300 bg-mist-50/60 p-8 text-center">
              <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-mist-200 text-ink-700">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M6 6l12 12" /></svg>
              </div>
              <div className="mt-4 text-base font-semibold text-ink-900">{copy.blockedDay}</div>
              <p className="mt-1 text-sm text-mist-500">{copy.blockedDesc}</p>
              <button className="mt-5 rounded-xl border border-mist-200 bg-white px-4 py-2 text-sm font-medium text-ink-800 hover:bg-mist-50">
                {copy.unblock}
              </button>
            </div>
          ) : !data.appointments || data.appointments.length === 0 ? (
            <DayAvailabilityEditor initialShift={data.shift} copy={copy} lang={lang} />
          ) : (
            <div className="space-y-3">
              {data.appointments.map((a) => (
                <div key={a.id} className="rounded-2xl border border-mist-200 bg-mist-50/40 p-4">
                  <div className="flex items-start gap-4">
                    <Avatar name={a.clinic} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="truncate text-[15px] font-semibold text-ink-900">{a.clinic}</div>
                        <Badge tone={statusTone(a.status)}>
                          {copy[a.status === "confirmada" ? "confirmed" : a.status === "pendiente" ? "pending" : a.status === "completada" ? "completed" : "cancelled"]}
                        </Badge>
                      </div>
                      <div className="text-xs text-mist-500">{a.city} · {a.specialty}</div>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                        <div className="rounded-lg border border-mist-200 bg-white px-2.5 py-1.5">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">{copy.shift}</div>
                          <div className="text-[13px] font-semibold text-ink-900">{a.shift}</div>
                        </div>
                        <div className="rounded-lg border border-mist-200 bg-white px-2.5 py-1.5">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">{lang === "es" ? "Horario" : "Hours"}</div>
                          <div className="text-[13px] font-semibold text-ink-900">{a.start} - {a.end}</div>
                        </div>
                        <div className="rounded-lg border border-mist-200 bg-white px-2.5 py-1.5">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">{copy.rate}</div>
                          <div className="text-[13px] font-semibold text-brand-700">{a.rateLabel}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">{copy.chat}</button>
                        <button className="rounded-lg border border-mist-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-800 hover:bg-mist-50">{copy.reschedule}</button>
                        <button className="rounded-lg border border-red-100 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50">{copy.cancel}</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-2 text-center">
                <button className="rounded-xl border border-mist-200 bg-white px-4 py-2 text-sm font-medium text-ink-800 hover:bg-mist-50">
                  + {copy.addAppt}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DayAvailabilityEditor({
  initialShift,
  copy,
  lang,
}: {
  initialShift: DayShift;
  copy: typeof COPY.es;
  lang: "es" | "en";
}) {
  const [shift, setShift] = useState<DayShift>(initialShift === "blocked" ? "free" : initialShift);
  const [morningStart, setMorningStart] = useState("08:00");
  const [morningEnd, setMorningEnd] = useState("14:00");
  const [afternoonStart, setAfternoonStart] = useState("16:00");
  const [afternoonEnd, setAfternoonEnd] = useState("20:00");
  const [saved, setSaved] = useState(false);

  const labels = lang === "es"
    ? { off: "No disponible", morning: "Solo mañana", afternoon: "Solo tarde", both: "Día completo", save: "Guardar disponibilidad", block: "Bloquear día", saved: "Guardado", quick: "Configura el turno y horario para este día" }
    : { off: "Not available", morning: "Morning only", afternoon: "Afternoon only", both: "Full day", save: "Save availability", block: "Block day", saved: "Saved", quick: "Set shift and hours for this day" };

  const shifts: Array<{ k: DayShift; label: string; tone: string }> = [
    { k: "free", label: labels.off, tone: "border-mist-200 bg-mist-50 text-mist-500" },
    { k: "morning", label: labels.morning, tone: "border-brand-200 bg-brand-50 text-brand-800" },
    { k: "afternoon", label: labels.afternoon, tone: "border-cyan-200 bg-cyan-50 text-cyan-800" },
    { k: "both", label: labels.both, tone: "border-brand-200 bg-gradient-to-br from-brand-50 to-cyan-50 text-ink-900" },
  ];

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-mist-200 bg-mist-50/40 p-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{copy.detail}</div>
        <div className="text-sm text-ink-800">{labels.quick}</div>
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
          {shifts.map((s) => (
            <button
              key={s.k}
              type="button"
              onClick={() => setShift(s.k)}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-sm font-medium transition",
                shift === s.k
                  ? `${s.tone} ring-2 ring-brand-500 ring-offset-2 ring-offset-mist-50`
                  : "border-mist-200 bg-white text-ink-800 hover:border-brand-300"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {(shift === "morning" || shift === "both") && (
        <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-700">
            <span className="h-2 w-2 rounded-full bg-brand-500" />
            {copy.legend.morning}
          </div>
          <div className="flex items-center gap-2">
            <input type="time" value={morningStart} onChange={(e) => setMorningStart(e.target.value)}
              className="h-10 flex-1 rounded-lg border border-mist-200 bg-white px-3 text-sm font-medium text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
            <span className="text-mist-400">→</span>
            <input type="time" value={morningEnd} onChange={(e) => setMorningEnd(e.target.value)}
              className="h-10 flex-1 rounded-lg border border-mist-200 bg-white px-3 text-sm font-medium text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
          </div>
        </div>
      )}

      {(shift === "afternoon" || shift === "both") && (
        <div className="rounded-xl border border-cyan-200 bg-cyan-50/40 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-700">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
            {copy.legend.afternoon}
          </div>
          <div className="flex items-center gap-2">
            <input type="time" value={afternoonStart} onChange={(e) => setAfternoonStart(e.target.value)}
              className="h-10 flex-1 rounded-lg border border-mist-200 bg-white px-3 text-sm font-medium text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
            <span className="text-mist-400">→</span>
            <input type="time" value={afternoonEnd} onChange={(e) => setAfternoonEnd(e.target.value)}
              className="h-10 flex-1 rounded-lg border border-mist-200 bg-white px-3 text-sm font-medium text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={save}
          className={cn(
            "rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition",
            saved ? "bg-emerald-600" : "bg-brand-600 hover:bg-brand-700"
          )}
        >
          {saved ? `✓ ${labels.saved}` : labels.save}
        </button>
        <button
          type="button"
          onClick={() => setShift("free")}
          className="rounded-xl border border-mist-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-800 hover:bg-mist-50"
        >
          {labels.block}
        </button>
        <button
          type="button"
          className="ml-auto rounded-xl border border-mist-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-800 hover:bg-mist-50"
        >
          + {copy.addAppt}
        </button>
      </div>
    </div>
  );
}
