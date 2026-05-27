"use client";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { useApp } from "@/components/providers/Providers";
import type { Lang } from "@/lib/i18n";

export type Shift = "off" | "morning" | "afternoon" | "both";

type Slot = "morning" | "afternoon";

const COPY = {
  es: {
    weekly: "Disponibilidad semanal",
    dayActive: "día activo", daysActive: "días activos",
    morningWord: "mañana", afternoonWord: "tarde",
    shiftMorning: "Mañana", shiftAfternoon: "Tarde",
    removeAll: "Quitar", selectAll: "Todos",
    weekRemove: "Quitar", weekAdd: "Activar", weekSuffix: "en toda la semana",
    templates: "Plantillas:",
    presetLvM: "L-V mañana", presetLvT: "L-V tardes", presetFull: "Día completo", presetWeekend: "Fin de semana",
    clear: "Limpiar",
    startTime: "Hora de inicio", endTime: "Hora de fin",
  },
  en: {
    weekly: "Weekly availability",
    dayActive: "day active", daysActive: "days active",
    morningWord: "morning", afternoonWord: "afternoon",
    shiftMorning: "Morning", shiftAfternoon: "Afternoon",
    removeAll: "Remove", selectAll: "All",
    weekRemove: "Remove", weekAdd: "Enable", weekSuffix: "for the whole week",
    templates: "Templates:",
    presetLvM: "Mon–Fri morning", presetLvT: "Mon–Fri afternoon", presetFull: "Full day", presetWeekend: "Weekend",
    clear: "Clear",
    startTime: "Start time", endTime: "End time",
  },
};

// Nombres de días formateados con Intl (semana empezando en lunes: 2024-01-01 fue lunes).
function dayLabels(lang: Lang, fmt: "narrow" | "long"): string[] {
  const locale = lang === "en" ? "en-GB" : "es-ES";
  return Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: fmt }).format(new Date(2024, 0, 1 + i)),
  );
}

type Props = {
  initial?: Record<number, Shift>;
  defaultMorning?: { start: string; end: string };
  defaultAfternoon?: { start: string; end: string };
  compact?: boolean;
  onChange?: (state: { week: Record<number, Shift>; morning: { start: string; end: string }; afternoon: { start: string; end: string } }) => void;
};

const DEFAULT_WEEK: Record<number, Shift> = {
  0: "morning", 1: "both", 2: "off", 3: "morning", 4: "afternoon", 5: "off", 6: "off",
};

function hasSlot(s: Shift, slot: Slot) {
  if (slot === "morning") return s === "morning" || s === "both";
  return s === "afternoon" || s === "both";
}

function withSlot(current: Shift, slot: Slot, value: boolean): Shift {
  const m = slot === "morning" ? value : hasSlot(current, "morning");
  const a = slot === "afternoon" ? value : hasSlot(current, "afternoon");
  if (m && a) return "both";
  if (m) return "morning";
  if (a) return "afternoon";
  return "off";
}

export function AvailabilitySelector({
  initial = DEFAULT_WEEK,
  defaultMorning = { start: "08:00", end: "14:00" },
  defaultAfternoon = { start: "16:00", end: "20:00" },
  compact = false,
  onChange,
}: Props) {
  const { lang } = useApp();
  const c = COPY[lang];
  const [week, setWeek] = useState<Record<number, Shift>>(initial);
  const [morning, setMorning] = useState(defaultMorning);
  const [afternoon, setAfternoon] = useState(defaultAfternoon);

  const emit = (w: Record<number, Shift>, m = morning, a = afternoon) => {
    onChange?.({ week: w, morning: m, afternoon: a });
  };

  const toggleSlot = (i: number, slot: Slot) => {
    const next: Shift = withSlot(week[i] || "off", slot, !hasSlot(week[i] || "off", slot));
    const nextWeek = { ...week, [i]: next };
    setWeek(nextWeek);
    emit(nextWeek);
  };

  const setRowAll = (slot: Slot, value: boolean) => {
    const nextWeek: Record<number, Shift> = {} as Record<number, Shift>;
    for (let i = 0; i < 7; i++) nextWeek[i] = withSlot(week[i] || "off", slot, value);
    setWeek(nextWeek);
    emit(nextWeek);
  };

  const updateMorning = (key: "start" | "end", v: string) => {
    const next = { ...morning, [key]: v };
    setMorning(next);
    emit(week, next, afternoon);
  };
  const updateAfternoon = (key: "start" | "end", v: string) => {
    const next = { ...afternoon, [key]: v };
    setAfternoon(next);
    emit(week, morning, next);
  };

  const morningCount = [0, 1, 2, 3, 4, 5, 6].reduce((n, i) => n + (hasSlot(week[i] || "off", "morning") ? 1 : 0), 0);
  const afternoonCount = [0, 1, 2, 3, 4, 5, 6].reduce((n, i) => n + (hasSlot(week[i] || "off", "afternoon") ? 1 : 0), 0);
  const totalDays = [0, 1, 2, 3, 4, 5, 6].reduce((n, i) => n + ((week[i] || "off") !== "off" ? 1 : 0), 0);

  return (
    <div className={cn("rounded-2xl border border-mist-200 bg-white", compact ? "p-3.5" : "p-5")}>
      <header className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-500">
            {c.weekly}
          </div>
          <div className="mt-1 text-sm text-ink-800">
            <span className="font-semibold text-ink-900">{totalDays}</span> {totalDays === 1 ? c.dayActive : c.daysActive}
            <span className="text-mist-500"> · </span>
            <span className="text-brand-700 font-medium">{morningCount} {c.morningWord}</span>
            <span className="text-mist-400"> · </span>
            <span className="text-cyan-700 font-medium">{afternoonCount} {c.afternoonWord}</span>
          </div>
        </div>
      </header>

      <div className={cn("grid gap-2.5", compact ? "" : "gap-3")}>
        <ShiftRow
          tone="morning"
          label={c.shiftMorning}
          icon={<SunIcon />}
          count={morningCount}
          time={morning}
          onTime={updateMorning}
          week={week}
          onToggleDay={(i) => toggleSlot(i, "morning")}
          onSelectAll={(v) => setRowAll("morning", v)}
          compact={compact}
        />
        <ShiftRow
          tone="afternoon"
          label={c.shiftAfternoon}
          icon={<MoonIcon />}
          count={afternoonCount}
          time={afternoon}
          onTime={updateAfternoon}
          week={week}
          onToggleDay={(i) => toggleSlot(i, "afternoon")}
          onSelectAll={(v) => setRowAll("afternoon", v)}
          compact={compact}
        />
      </div>

      {!compact && (() => {
        const EMPTY: Record<number, Shift> = { 0: "off", 1: "off", 2: "off", 3: "off", 4: "off", 5: "off", 6: "off" };
        const PRESETS: Array<{ key: string; label: string; map: Record<number, Shift> }> = [
          { key: "lv-m", label: c.presetLvM, map: { 0: "morning", 1: "morning", 2: "morning", 3: "morning", 4: "morning", 5: "off", 6: "off" } },
          { key: "lv-t", label: c.presetLvT, map: { 0: "afternoon", 1: "afternoon", 2: "afternoon", 3: "afternoon", 4: "afternoon", 5: "off", 6: "off" } },
          { key: "all",  label: c.presetFull, map: { 0: "both", 1: "both", 2: "both", 3: "both", 4: "both", 5: "off", 6: "off" } },
          { key: "fds",  label: c.presetWeekend, map: { 0: "off", 1: "off", 2: "off", 3: "off", 4: "off", 5: "both", 6: "both" } },
        ];
        const sameAsWeek = (m: Record<number, Shift>) =>
          [0, 1, 2, 3, 4, 5, 6].every((i) => (week[i] || "off") === m[i]);
        return (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-mist-500">{c.templates}</span>
            {PRESETS.map((p) => {
              const active = sameAsWeek(p.map);
              return (
                <Preset
                  key={p.key}
                  label={p.label}
                  active={active}
                  onClick={() => {
                    const next = active ? EMPTY : p.map;
                    setWeek(next);
                    emit(next);
                  }}
                />
              );
            })}
            <Preset
              label={c.clear}
              variant="ghost"
              disabled={totalDays === 0}
              onClick={() => { setWeek(EMPTY); emit(EMPTY); }}
            />
          </div>
        );
      })()}
    </div>
  );
}

function ShiftRow({
  tone, label, icon, count, time, onTime, week, onToggleDay, onSelectAll, compact,
}: {
  tone: Slot;
  label: string;
  icon: React.ReactNode;
  count: number;
  time: { start: string; end: string };
  onTime: (key: "start" | "end", v: string) => void;
  week: Record<number, Shift>;
  onToggleDay: (i: number) => void;
  onSelectAll: (v: boolean) => void;
  compact?: boolean;
}) {
  const { lang } = useApp();
  const c = COPY[lang];
  const narrow = dayLabels(lang, "narrow");
  const long = dayLabels(lang, "long");
  const isBrand = tone === "morning";
  const sectionBorder = isBrand ? "border-brand-100" : "border-cyan-100";
  const sectionBg = isBrand ? "bg-brand-50/40" : "bg-cyan-50/40";
  const iconBg = isBrand ? "bg-brand-100 text-brand-700" : "bg-cyan-100 text-cyan-700";
  const accentText = isBrand ? "text-brand-700" : "text-cyan-700";
  const allOn = count === 7;

  return (
    <section className={cn("rounded-2xl border p-3", sectionBorder, sectionBg)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={cn("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", iconBg)}>
            {icon}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-semibold tracking-tight text-ink-900">{label}</span>
              <span className={cn("text-[11px] font-semibold", accentText)}>· {count}/7</span>
            </div>
            <TimeRangeCompact tone={tone} time={time} onChange={onTime} />
          </div>
        </div>
        <button
          type="button"
          onClick={() => onSelectAll(!allOn)}
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition",
            allOn
              ? "bg-white text-ink-700 ring-1 ring-inset ring-mist-200 hover:bg-mist-50"
              : isBrand
                ? "bg-white text-brand-700 ring-1 ring-inset ring-brand-200 hover:bg-brand-50"
                : "bg-white text-cyan-700 ring-1 ring-inset ring-cyan-200 hover:bg-cyan-50"
          )}
          aria-label={`${allOn ? c.weekRemove : c.weekAdd} ${label.toLowerCase()} ${c.weekSuffix}`}
        >
          {allOn ? c.removeAll : c.selectAll}
        </button>
      </div>

      <div className={cn("mt-3 grid grid-cols-7", compact ? "gap-1" : "gap-1.5")}>
        {narrow.map((d, i) => (
          <DayToggle
            key={i}
            label={d}
            fullLabel={long[i]}
            active={hasSlot(week[i] || "off", tone)}
            tone={tone}
            onClick={() => onToggleDay(i)}
            compact={compact}
          />
        ))}
      </div>
    </section>
  );
}

function DayToggle({
  label, fullLabel, active, tone, onClick, compact,
}: {
  label: string;
  fullLabel: string;
  active: boolean;
  tone: Slot;
  onClick: () => void;
  compact?: boolean;
}) {
  const { lang } = useApp();
  const c = COPY[lang];
  const isBrand = tone === "morning";
  const activeCls = isBrand
    ? "bg-brand-600 text-white border-brand-600 shadow-[0_4px_12px_-4px_rgba(37,99,235,0.55)]"
    : "bg-cyan-500 text-white border-cyan-500 shadow-[0_4px_12px_-4px_rgba(6,182,212,0.55)]";
  const idleCls = isBrand
    ? "bg-white text-ink-700 border-mist-200 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50/60"
    : "bg-white text-ink-700 border-mist-200 hover:border-cyan-300 hover:text-cyan-700 hover:bg-cyan-50/60";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${fullLabel} · ${tone === "morning" ? c.morningWord : c.afternoonWord}`}
      aria-pressed={active}
      title={fullLabel}
      className={cn(
        "inline-flex items-center justify-center rounded-lg border font-bold transition active:scale-95",
        compact ? "h-9 text-[12px]" : "h-10 text-[13px]",
        active ? activeCls : idleCls
      )}
    >
      {label}
    </button>
  );
}

function TimeRangeCompact({
  tone, time, onChange,
}: {
  tone: Slot;
  time: { start: string; end: string };
  onChange: (key: "start" | "end", v: string) => void;
}) {
  const { lang } = useApp();
  const c = COPY[lang];
  const ring = tone === "morning"
    ? "focus:border-brand-500 focus:ring-brand-500/20"
    : "focus:border-cyan-500 focus:ring-cyan-500/20";
  return (
    <div className="mt-0.5 flex items-center gap-1 text-[12px] text-ink-700">
      <input
        type="time"
        value={time.start}
        onChange={(e) => onChange("start", e.target.value)}
        className={cn(
          "h-6 rounded-md border border-transparent bg-transparent px-1 font-semibold tabular-nums outline-none transition hover:border-mist-200 hover:bg-white focus:ring-2 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer",
          ring
        )}
        aria-label={c.startTime}
      />
      <span className="text-mist-400">–</span>
      <input
        type="time"
        value={time.end}
        onChange={(e) => onChange("end", e.target.value)}
        className={cn(
          "h-6 rounded-md border border-transparent bg-transparent px-1 font-semibold tabular-nums outline-none transition hover:border-mist-200 hover:bg-white focus:ring-2 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer",
          ring
        )}
        aria-label={c.endTime}
      />
    </div>
  );
}

function Preset({
  label,
  onClick,
  active = false,
  variant = "default",
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  variant?: "default" | "ghost";
  disabled?: boolean;
}) {
  const isGhost = variant === "ghost";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      disabled={disabled}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed",
        active
          ? "border border-brand-600 bg-brand-600 text-white shadow-[0_6px_14px_-6px_rgba(37,99,235,0.55)] hover:bg-brand-700"
          : isGhost
            ? "border border-transparent bg-transparent text-mist-500 hover:bg-mist-100 hover:text-ink-800"
            : "border border-mist-200 bg-white text-ink-800 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
      )}
    >
      {active && (
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
          <path d="M5 12l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {label}
    </button>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M20.742 13.045A8 8 0 0 1 10.955 3.258a.5.5 0 0 0-.665-.55A9.5 9.5 0 1 0 21.292 13.71a.5.5 0 0 0-.55-.665z" />
    </svg>
  );
}
