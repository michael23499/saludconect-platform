"use client";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { SelectMenu } from "@/components/ui/SelectMenu";
import { useApp } from "@/components/providers/Providers";
import { cn } from "@/lib/cn";

// El estado guarda índices/ids estables (no los textos traducidos), para que al
// cambiar de idioma la selección se conserve y los menús no se "desincronicen".
const SPECIALTIES = [
  { es: "Cardiología", en: "Cardiology" },
  { es: "Pediatría", en: "Pediatrics" },
  { es: "Odontología", en: "Dentistry" },
  { es: "Fisioterapia", en: "Physiotherapy" },
  { es: "Psicología", en: "Psychology" },
  { es: "Dermatología", en: "Dermatology" },
  { es: "Enfermería general", en: "General nursing" },
  { es: "Ginecología", en: "Gynecology" },
  { es: "Traumatología", en: "Orthopedics" },
  { es: "Oftalmología", en: "Ophthalmology" },
  { es: "Radiología", en: "Radiology" },
  { es: "Anestesia", en: "Anesthesia" },
];

const SHIFTS = [
  { id: "morning", es: "Mañana", en: "Morning", hours: 8 },
  { id: "afternoon", es: "Tarde", en: "Afternoon", hours: 8 },
  { id: "night", es: "Noche", en: "Night", hours: 10 },
  { id: "full", es: "24 h", en: "24 h", hours: 24 },
] as const;

type ShiftId = (typeof SHIFTS)[number]["id"];

const COPY = {
  es: {
    newRequest: "Nueva solicitud", location: "Madrid · Centro", live: "En vivo", published: "Publicada",
    specialty: "Especialidad", date: "Fecha", duration: "Duración", shift: "Turno", rate: "Tarifa orientativa",
    publishing: "Publicando…", republish: "Editar y volver a publicar", publish: "Publicar solicitud",
    activeTitle: "Solicitud activa", readyTitle: "Listos para responder",
    activeSub: "Los profesionales compatibles ya la reciben", readySub: "Pulsa publicar para activar la red",
    rateMin: "Tarifa mínima por hora", rateMax: "Tarifa máxima por hora",
    weekdays: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
    months: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
  },
  en: {
    newRequest: "New request", location: "Madrid · Centro", live: "Live", published: "Published",
    specialty: "Specialty", date: "Date", duration: "Duration", shift: "Shift", rate: "Indicative rate",
    publishing: "Publishing…", republish: "Edit and repost", publish: "Post request",
    activeTitle: "Request active", readyTitle: "Ready to respond",
    activeSub: "Compatible professionals are already receiving it", readySub: "Hit publish to activate the network",
    rateMin: "Minimum hourly rate", rateMax: "Maximum hourly rate",
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  },
};

// Avatares ilustrativos del mockup (solo para animar la tira de "compatibles").
// No afirman ser usuarios reales: son una demostración visual de la interfaz.
const CANDIDATES = [
  { name: "Ana López" },
  { name: "Carlos Ruiz" },
  { name: "Marta Vives" },
];

export function LiveRequestCard() {
  const { lang } = useApp();
  const c = COPY[lang];

  const [specialtyIdx, setSpecialtyIdx] = useState(0);
  const [shift, setShift] = useState<ShiftId>("morning");
  const [range, setRange] = useState<[number, number]>([75, 95]);
  const [dateOffset, setDateOffset] = useState(8);

  const [published, setPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [visibleMatches, setVisibleMatches] = useState(0);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timeouts.current.forEach(clearTimeout), []);

  const shiftDef = SHIFTS.find((s) => s.id === shift) ?? SHIFTS[0];

  const onPublish = () => {
    if (publishing) return;
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    setPublishing(true);
    setVisibleMatches(0);
    timeouts.current.push(
      setTimeout(() => {
        setPublishing(false);
        setPublished(true);
        CANDIDATES.forEach((_, idx) => {
          timeouts.current.push(
            setTimeout(() => setVisibleMatches((v) => Math.max(v, idx + 1)), 220 + idx * 260)
          );
        });
      }, 850)
    );
  };

  const reset = () => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    setPublished(false);
    setPublishing(false);
    setVisibleMatches(0);
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-brand-500/30 to-cyan-400/30 blur-3xl" />
      <div className="rounded-3xl border border-white/10 bg-white p-5 text-ink-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </span>
            <div>
              <div className="text-[13px] font-semibold tracking-tight text-ink-900">{c.newRequest}</div>
              <div className="text-[11px] text-mist-500">{c.location}</div>
            </div>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors",
              published ? "bg-emerald-100 text-emerald-700" : "bg-emerald-50 text-emerald-700"
            )}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            {published ? c.published : c.live}
          </span>
        </div>

        {/* Especialidad */}
        <div className="mt-5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-mist-500">{c.specialty}</div>
          <div className="mt-1.5">
            <SelectMenu
              options={SPECIALTIES.map((s, i) => ({ value: String(i), label: s[lang] }))}
              value={String(specialtyIdx)}
              onChange={(v) => { setSpecialtyIdx(Number(v)); if (published) reset(); }}
            />
          </div>
        </div>

        {/* Fecha + Duración */}
        <div className="mt-3 grid grid-cols-[1fr_auto] gap-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-mist-500">{c.date}</div>
            <DateChip value={dateOffset} onChange={(v) => { setDateOffset(v); if (published) reset(); }} weekdays={c.weekdays} months={c.months} />
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-mist-500">{c.duration}</div>
            <div className="mt-1.5 inline-flex h-11 items-center gap-2 rounded-xl border border-mist-200 bg-white px-3 text-sm font-semibold text-ink-900 tabular-nums">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-mist-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <polyline points="12 7 12 12 15 14" />
              </svg>
              {shiftDef.hours} h
            </div>
          </div>
        </div>

        {/* Turno chips */}
        <div className="mt-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-mist-500">{c.shift}</div>
          <div className="mt-1.5 grid grid-cols-4 gap-1.5">
            {SHIFTS.map((s) => (
              <ShiftChip
                key={s.id}
                active={shift === s.id}
                onClick={() => { setShift(s.id); if (published) reset(); }}
              >
                {s[lang]}
              </ShiftChip>
            ))}
          </div>
        </div>

        {/* Tarifa con barra */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-mist-500">{c.rate}</div>
            <div className="text-[13px] font-bold tabular-nums text-ink-900">
              {range[0]} <span className="text-mist-400">–</span> {range[1]} <span className="font-semibold text-mist-500">€/h</span>
            </div>
          </div>
          <DualRange
            min={30}
            max={150}
            step={5}
            value={range}
            onChange={(v) => { setRange(v); if (published) reset(); }}
            ariaMin={c.rateMin}
            ariaMax={c.rateMax}
          />
          <div className="mt-1 flex justify-between text-[10px] tabular-nums text-mist-400">
            <span>30 €/h</span>
            <span>150 €/h</span>
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={published ? reset : onPublish}
          disabled={publishing}
          className={cn(
            "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(37,99,235,0.6)] transition active:scale-[0.98]",
            published ? "bg-ink-900 hover:bg-ink-800" : "bg-brand-600 hover:bg-brand-700",
            publishing && "opacity-90 cursor-progress"
          )}
        >
          {publishing ? (
            <>
              <Spinner />
              {c.publishing}
            </>
          ) : published ? (
            <>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              {c.republish}
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
              </svg>
              {c.publish}
            </>
          )}
        </button>

        {/* Matches strip */}
        <div
          className={cn(
            "mt-4 overflow-hidden rounded-xl border px-3 py-2.5 transition-colors",
            published ? "border-emerald-200 bg-emerald-50/70" : "border-mist-200 bg-mist-50/60"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {CANDIDATES.map((cand, i) => (
                <span
                  key={cand.name}
                  className={cn(
                    "inline-block transition-all duration-300 ease-out",
                    i < visibleMatches ? "opacity-100 translate-y-0 scale-100" : "opacity-30 translate-y-1 scale-95"
                  )}
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <Avatar name={cand.name} size="xs" className="ring-2 ring-white" />
                </span>
              ))}
            </div>
            <div className="min-w-0 leading-tight">
              <div className={cn("text-[12px] font-semibold transition-colors", published ? "text-emerald-800" : "text-ink-700")}>
                {published ? c.activeTitle : c.readyTitle}
              </div>
              <div className={cn("text-[11px] transition-colors", published ? "text-emerald-700/70" : "text-mist-500")}>
                {published ? c.activeSub : c.readySub}
              </div>
            </div>
            <svg
              viewBox="0 0 24 24"
              className={cn("ml-auto h-4 w-4 transition", published ? "text-emerald-700" : "text-mist-400")}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShiftChip({
  active, onClick, children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-2 py-2 text-[12px] font-semibold transition-all active:scale-95",
        active
          ? "bg-brand-600 text-white shadow-[0_4px_10px_-4px_rgba(37,99,235,0.55)]"
          : "border border-mist-200 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50/60"
      )}
    >
      {children}
    </button>
  );
}

function DateChip({ value, onChange, weekdays, months }: { value: number; onChange: (v: number) => void; weekdays: string[]; months: string[] }) {
  const [open, setOpen] = useState(false);
  const today = new Date(2026, 4, 20);
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
  const fmt = (d: Date) => `${weekdays[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-datechip]")) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="relative mt-1.5" data-datechip>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-xl border bg-white px-3 text-sm font-semibold text-ink-900 transition",
          open ? "border-brand-500 ring-4 ring-brand-500/15" : "border-mist-200 hover:border-mist-300"
        )}
      >
        <span className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-mist-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {fmt(days[value] ?? days[0])}
        </span>
        <svg
          className={cn("h-4 w-4 text-mist-400 transition-transform", open && "rotate-180")}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="combobox-pop absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-mist-200 bg-white p-2 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.25)]">
          <div className="grid max-h-64 grid-cols-2 gap-1 overflow-y-auto">
            {days.map((d, i) => {
              const selected = i === value;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => { onChange(i); setOpen(false); }}
                  className={cn(
                    "rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition",
                    selected ? "bg-brand-600 text-white" : "text-ink-800 hover:bg-brand-50 hover:text-brand-800"
                  )}
                >
                  {fmt(d)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function DualRange({
  min, max, step, value, onChange, ariaMin, ariaMax,
}: {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
  ariaMin: string;
  ariaMax: string;
}) {
  const [lo, hi] = value;
  const lowPct = ((lo - min) / (max - min)) * 100;
  const highPct = ((hi - min) / (max - min)) * 100;
  const thumbCls =
    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-600 [&::-webkit-slider-thumb]:shadow-[0_4px_10px_-2px_rgba(15,23,42,0.25)] [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:scale-110 " +
    "[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-brand-600 [&::-moz-range-thumb]:shadow-[0_4px_10px_-2px_rgba(15,23,42,0.25)] [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:pointer-events-auto";
  const thumbClsHi = thumbCls
    .replaceAll("border-brand-600", "border-cyan-500");

  return (
    <div className="relative mt-3 h-6">
      <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-mist-100" />
      <div
        className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-brand-500 to-cyan-400"
        style={{ left: `${lowPct}%`, right: `${100 - highPct}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={lo}
        onChange={(e) => {
          const v = Math.min(Number(e.target.value), hi - step);
          onChange([v, hi]);
        }}
        aria-label={ariaMin}
        className={cn(
          "pointer-events-none absolute inset-0 z-10 h-6 w-full appearance-none bg-transparent outline-none",
          thumbCls
        )}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={hi}
        onChange={(e) => {
          const v = Math.max(Number(e.target.value), lo + step);
          onChange([lo, v]);
        }}
        aria-label={ariaMax}
        className={cn(
          "pointer-events-none absolute inset-0 z-20 h-6 w-full appearance-none bg-transparent outline-none",
          thumbClsHi
        )}
      />
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
