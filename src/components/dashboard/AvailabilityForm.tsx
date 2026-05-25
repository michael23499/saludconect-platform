"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { SelectMenu, type SelectOption } from "@/components/ui/SelectMenu";
import { Spinner } from "@/components/ui/Spinner";
import { DatePicker } from "@/components/ui/DatePicker";
import { SPAIN_CITIES } from "@/lib/spain-cities";
import { cn } from "@/lib/cn";
import { useApp } from "@/components/providers/Providers";
import {
  publishAvailabilityAction,
  type PublishAvailabilityState,
} from "@backend/actions/availability";

type Mode = "one" | "range";

// Orden de chips L M X J V S D → getDay() (0=Dom … 6=Sáb).
const WEEKDAYS: { key: number; label: string }[] = [
  { key: 1, label: "L" },
  { key: 2, label: "M" },
  { key: 3, label: "X" },
  { key: 4, label: "J" },
  { key: 5, label: "V" },
  { key: 6, label: "S" },
  { key: 0, label: "D" },
];

// Opciones de hora cada 30 min + "sin hora" (día completo) para el selector.
const HOUR_OPTIONS: SelectOption[] = [
  { value: "", label: "— Sin hora" },
  ...Array.from({ length: 48 }, (_, i) => {
    const v = `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`;
    return { value: v, label: v };
  }),
];

/** "2026-05-26" → "26 may" (mediodía para no saltar de día por timezone). */
function fmtChip(d: string): string {
  return new Date(`${d}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

/** Días de la semana (getDay) que existen dentro del rango [from, to]. */
function weekdaysInRange(from: string, to: string): Set<number> {
  const out = new Set<number>();
  if (!from || !to) return out;
  const start = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  if (end < start) return out;
  const cur = new Date(start);
  let guard = 0;
  while (cur <= end && guard < 400 && out.size < 7) {
    out.add(cur.getDay());
    cur.setDate(cur.getDate() + 1);
    guard++;
  }
  return out;
}

function eachDate(from: string, to: string, days: Set<number>): string[] {
  if (!from || !to) return [];
  const start = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  if (end < start) return [];
  const out: string[] = [];
  const cur = new Date(start);
  let guard = 0;
  while (cur <= end && guard < 400) {
    if (days.has(cur.getDay())) out.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
    guard++;
  }
  return out;
}

/**
 * El técnico publica disponibilidad: un solo día o un RANGO con días de la
 * semana (presets L–V, todos, fines de semana). Calcula las fechas concretas en
 * el cliente y las envía como CSV en `dates`; la action crea un slot por fecha.
 */
export function AvailabilityForm() {
  const c = useApp().t.dashboard.cal;
  const [state, formAction] = useActionState<PublishAvailabilityState, FormData>(
    publishAvailabilityAction,
    null,
  );

  const [mode, setMode] = useState<Mode>("one");
  const [date, setDate] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [days, setDays] = useState<Set<number>>(new Set([1, 2, 3, 4, 5]));
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [city, setCity] = useState("");
  const [note, setNote] = useState("");

  const dates = useMemo(
    () => (mode === "one" ? (date ? [date] : []) : eachDate(from, to, days)),
    [mode, date, from, to, days],
  );

  // Días de la semana que CAEN dentro del rango elegido (los demás se
  // deshabilitan). En modo "un día" no aplica (todos disponibles).
  const available = useMemo(
    () => (mode === "range" ? weekdaysInRange(from, to) : new Set([0, 1, 2, 3, 4, 5, 6])),
    [mode, from, to],
  );

  // Al cambiar el rango, auto-marcamos todos los días disponibles (el usuario
  // puede luego desmarcar). Va en el handler, no en un effect.
  const setRange = (f: string, t: string) => {
    setFrom(f);
    setTo(t);
    setDays(weekdaysInRange(f, t));
  };
  const intersectAvail = (preset: number[]) => new Set(preset.filter((k) => available.has(k)));

  const toggleDay = (k: number) =>
    setDays((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const segCls = (active: boolean) =>
    cn(
      "h-9 flex-1 rounded-lg text-sm font-semibold transition",
      active ? "bg-brand-600 text-white shadow-[0_6px_14px_-8px_rgba(5,47,89,0.6)]" : "text-ink-700 hover:bg-mist-50",
    );

  return (
    <form action={formAction} className="rounded-2xl border border-mist-200 bg-white p-5 md:p-6">
      <h2 className="text-lg font-semibold tracking-tight text-ink-900">{c.avPublishTitle}</h2>
      <p className="mt-1 text-sm text-mist-500">{c.avPublishSub}</p>

      {/* Selector de modo */}
      <div className="mt-4 flex gap-1 rounded-xl border border-mist-200 bg-mist-50/60 p-1">
        <button type="button" onClick={() => setMode("one")} className={segCls(mode === "one")}>{c.avModeOne}</button>
        <button type="button" onClick={() => setMode("range")} className={segCls(mode === "range")}>{c.avModeRange}</button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {mode === "one" ? (
          <div className="sm:col-span-2">
            <Field label={c.avDay}>
              <DatePicker value={date} onChange={setDate} minToday placeholder="—" />
            </Field>
          </div>
        ) : (
          <>
            <Field label={c.avFrom}>
              <DatePicker value={from} onChange={(v) => setRange(v, to)} minToday placeholder="—" />
            </Field>
            <Field label={c.avTo}>
              <DatePicker value={to} onChange={(v) => setRange(from, v)} minToday placeholder="—" />
            </Field>
            <div className="sm:col-span-2">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-ink-800">{c.avWeekdays}</span>
                <div className="flex gap-1.5 text-[11px] font-semibold">
                  <button type="button" onClick={() => setDays(intersectAvail([1, 2, 3, 4, 5]))} className="rounded-md px-2 py-1 text-brand-700 hover:bg-brand-50">{c.avPresetWeekdays}</button>
                  <button type="button" onClick={() => setDays(intersectAvail([6, 0]))} className="rounded-md px-2 py-1 text-brand-700 hover:bg-brand-50">{c.avPresetWeekend}</button>
                  <button type="button" onClick={() => setDays(intersectAvail([0, 1, 2, 3, 4, 5, 6]))} className="rounded-md px-2 py-1 text-brand-700 hover:bg-brand-50">{c.avPresetAll}</button>
                </div>
              </div>
              <div className="flex gap-1.5">
                {WEEKDAYS.map((d) => {
                  const dis = !available.has(d.key);
                  return (
                    <button
                      key={d.key}
                      type="button"
                      disabled={dis}
                      onClick={() => toggleDay(d.key)}
                      aria-pressed={days.has(d.key)}
                      title={dis ? "Fuera del rango elegido" : undefined}
                      className={cn(
                        "h-9 flex-1 rounded-lg border text-sm font-semibold transition",
                        dis
                          ? "cursor-not-allowed border-mist-100 bg-mist-50 text-mist-300"
                          : days.has(d.key)
                            ? "border-brand-600 bg-brand-600 text-white"
                            : "border-mist-200 bg-white text-ink-700 hover:border-brand-300",
                      )}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-xs text-mist-500">
                {dates.length > 0 ? `${dates.length} ${dates.length === 1 ? c.avDayUnit : c.avDaysUnit}` : c.avPickDays}
              </p>
              {dates.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {dates.slice(0, 16).map((d) => (
                    <span key={d} className="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700 dark:bg-brand-500/15 dark:text-cyan-200">
                      {fmtChip(d)}
                    </span>
                  ))}
                  {dates.length > 16 && (
                    <span className="self-center text-[11px] font-medium text-mist-500">+{dates.length - 16}</span>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        <Field label={c.avStart}>
          <SelectMenu name="startTime" options={HOUR_OPTIONS} value={start} onChange={setStart} placeholder="—" ariaLabel={c.avStart} />
        </Field>
        <Field label={c.avEnd}>
          <SelectMenu name="endTime" options={HOUR_OPTIONS} value={end} onChange={setEnd} placeholder="—" ariaLabel={c.avEnd} />
        </Field>
        <div className="sm:col-span-2">
          <Field label={c.avCity}>
            <SelectMenu
              name="city"
              options={SPAIN_CITIES}
              value={city}
              onChange={setCity}
              placeholder={c.avCityPlaceholder}
              searchable
              ariaLabel={c.avCity}
            />
            {/* Atajos a las ciudades más típicas (rellenan el campo al pulsar) */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["Madrid", "Barcelona", "Valencia", "Sevilla", "Bilbao", "Málaga", "Zaragoza"].map((cc) => (
                <button
                  key={cc}
                  type="button"
                  onClick={() => setCity(cc)}
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-[11px] font-medium transition",
                    city === cc
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-mist-200 text-ink-700 hover:border-brand-300 dark:border-white/15",
                  )}
                >
                  {cc}
                </button>
              ))}
            </div>
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label={c.avNote}>
            <Input name="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder={c.avNotePlaceholder} />
          </Field>
        </div>
      </div>

      {/* Fechas calculadas (modo único o rango) */}
      <input type="hidden" name="dates" value={dates.join(",")} />

      {state && "error" in state && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state && "ok" in state && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {c.avSuccess}
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <SubmitButton disabled={dates.length === 0} />
      </div>
    </form>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const c = useApp().t.dashboard.cal;
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="md" disabled={pending || disabled}>
      {pending ? (
        <>
          <Spinner size="sm" solid /> {c.avPublishing}
        </>
      ) : (
        c.avPublish
      )}
    </Button>
  );
}
