"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Checkbox } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { DatePicker } from "@/components/ui/DatePicker";
import { AddressAutocomplete } from "@/components/admin/AddressAutocomplete";
import { useApp } from "@/components/providers/Providers";
import {
  createSurgeryAction,
  type CreateSurgeryState,
} from "@backend/actions/surgeries";

// Estilo de input que combina con el DatePicker (mismo h-11 rounded-lg).
const FIELD_INPUT =
  "h-11 w-full rounded-lg border border-mist-200 bg-white px-3 text-sm text-ink-800 transition placeholder:text-mist-400 hover:border-mist-300 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

type ClinicOption = { id: string; fullName: string; city: string | null };

/**
 * Formulario real de publicación de cirugía (capilar). Envía a createSurgeryAction
 * vía useActionState; el estado devuelto trae el error de validación si lo hay.
 * En éxito la action redirige al detalle de la cirugía. Si `isAdmin`, exige
 * elegir a nombre de qué clínica se publica (el admin no tiene clínica propia).
 */
export function SurgeryForm({
  isAdmin = false,
  clinics = [],
}: {
  isAdmin?: boolean;
  clinics?: ClinicOption[];
}) {
  const s = useApp().t.dashboard.surgeries;
  const [state, formAction] = useActionState<CreateSurgeryState, FormData>(
    createSurgeryAction,
    null,
  );

  // Estado local solo para el preview en vivo.
  const [clinicId, setClinicId] = useState("");
  const [title, setTitle] = useState("Microinjerto capilar");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [vacancies, setVacancies] = useState("2");
  // La ciudad NO se pre-rellena: se deriva solo de la dirección elegida.
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [rate, setRate] = useState("");
  const [urgent, setUrgent] = useState(false);

  return (
    <div className="space-y-5">
      <form action={formAction} className="rounded-2xl border border-mist-200 bg-white p-6 md:p-7">
        <header className="mb-5">
          <Badge tone="brand">Microinjerto capilar</Badge>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-ink-900">
            {s.formHeading}
          </h2>
          <p className="mt-1 text-sm text-mist-500">{s.formSub}</p>
        </header>

        {isAdmin && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-400/30 dark:text-amber-100">
            <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z" /><path d="M9 12l2 2 4-4" /></svg>
            <span><b>{s.supAdminMode}</b> {s.adminFormNote}</span>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {isAdmin && (
            <div className="md:col-span-2">
              <Field label={s.fldClinic}>
                <select
                  name="clinicId"
                  required
                  value={clinicId}
                  onChange={(e) => setClinicId(e.target.value)}
                  className={FIELD_INPUT}
                >
                  <option value="">{s.chooseClinic}</option>
                  {clinics.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName}{c.city ? ` · ${c.city}` : ""}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          )}
          <div className="md:col-span-2">
            <Field label={s.fldTitle}>
              <Input
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Microinjerto capilar"
              />
            </Field>
          </div>

          <Field label={s.fldDateReq}>
            <DatePicker name="date" value={date} onChange={setDate} minToday placeholder="—" />
          </Field>
          <Field label={s.fldVacanciesReq}>
            <Input
              name="vacancies"
              type="number"
              min="1"
              max="20"
              required
              value={vacancies}
              onChange={(e) => setVacancies(e.target.value)}
            />
          </Field>

          <Field label={s.fldStart}>
            <Input name="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </Field>
          <Field label={s.fldEnd}>
            <Input name="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </Field>

          <Field label={s.fldRate}>
            <Input
              name="ratePerHour"
              type="number"
              min="0"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder={s.rateOptional}
            />
          </Field>

          <div className="md:col-span-2">
            <Field label={s.fldAddress}>
              <AddressAutocomplete
                value={address}
                onSelect={(r) => {
                  setAddress(r.address);
                  if (r.city) setCity(r.city);
                }}
                onTextChange={setAddress}
                inputClassName={FIELD_INPUT}
                placeholder={s.addressPlaceholder}
              />
            </Field>
            <input type="hidden" name="address" value={address} />
            <input type="hidden" name="city" value={city} />
            {city && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-mist-500">
                <svg className="h-3.5 w-3.5 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-6-5.3-6-10a6 6 0 0112 0c0 4.7-6 10-6 10z" /><circle cx="12" cy="11" r="2" /></svg>
                {s.cityLabel} <span className="font-medium text-ink-700">{city}</span>
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <Field label={s.fldDescription}>
              <Textarea name="description" placeholder={s.descPlaceholder} />
            </Field>
          </div>
        </div>

        <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl border border-mist-200 bg-mist-50/40 p-4 text-sm text-ink-800 select-none">
          <Checkbox
            name="urgent"
            className="mt-0.5"
            checked={urgent}
            onChange={(e) => setUrgent(e.target.checked)}
          />
          <span>
            <span className="font-semibold text-ink-900">{s.urgentLabel}</span>
            <div className="text-xs text-mist-500">{s.urgentDesc}</div>
          </span>
        </label>

        {state?.error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <div className="mt-7 flex items-center justify-end gap-2 border-t border-mist-100 pt-6">
          <Button href="/dashboard/clinic/surgeries" variant="secondary" size="md">
            {s.cancel}
          </Button>
          <SubmitButton label={s.publishTitle} pendingLabel={s.publishing} />
        </div>
      </form>

      {/* Preview en vivo */}
      <div className="rounded-2xl border border-dashed border-mist-300 bg-mist-50/40 p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{s.preview}</div>
        <div className="mt-3 rounded-2xl border border-mist-200 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[15px] font-semibold text-ink-900">
                {title || "Microinjerto capilar"}
              </div>
              <div className="text-xs text-mist-500">
                {city || s.previewCity} · {vacancies || "—"}{" "}
                {vacancies === "1" ? s.technician : s.technicians}
              </div>
            </div>
            {urgent && <Badge tone="warning">{s.urgent}</Badge>}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <Stat label={s.statFecha} value={date || "—"} />
            <Stat label={s.statHorario} value={`${startTime}–${endTime}`} />
            <Stat label={s.sumTarifa} value={rate ? `${rate} €/h` : s.rateTBD} brand />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, brand }: { label: string; value: string; brand?: boolean }) {
  return (
    <div className="rounded-lg border border-mist-200 bg-mist-50/60 p-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">{label}</div>
      <div className={`text-sm font-semibold ${brand ? "text-brand-700" : "text-ink-900"}`}>
        {value}
      </div>
    </div>
  );
}

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="md" disabled={pending}>
      {pending ? (
        <>
          <Spinner size="sm" solid /> {pendingLabel}
        </>
      ) : (
        label
      )}
    </Button>
  );
}
