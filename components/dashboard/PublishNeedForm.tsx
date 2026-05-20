"use client";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Checkbox } from "@/components/ui/Input";
import { SelectMenu } from "@/components/ui/SelectMenu";
import { cn } from "@/lib/cn";

type Props = {
  ciudades: string[];
  profesiones: string[];
  especialidades: string[];
};

const TURNOS = ["Mañana", "Tarde", "Día completo", "Guardia 24 h"];
const TIPOS = ["Puntual", "Continuada", "Sustitución", "Refuerzo"];

export function PublishNeedForm({ ciudades, profesiones, especialidades }: Props) {
  const [profesion, setProfesion] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [ciudad, setCiudad] = useState("Madrid");
  const [tipo, setTipo] = useState("Puntual");
  const [turno, setTurno] = useState("Mañana");
  const [dateFrom, setDateFrom] = useState("2026-05-28");
  const [dateTo, setDateTo] = useState("2026-05-28");
  const [timeStart, setTimeStart] = useState("08:00");
  const [timeEnd, setTimeEnd] = useState("14:00");
  const [rateMin, setRateMin] = useState("70");
  const [rateMax, setRateMax] = useState("95");
  const [expMin, setExpMin] = useState("3");
  const [urgent, setUrgent] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [description, setDescription] = useState("");
  const [saved, setSaved] = useState<"idle" | "saving" | "published" | "draft">("idle");

  const isValid = profesion && especialidad && ciudad && dateFrom && turno;

  const summary = useMemo(() => {
    const parts: string[] = [];
    if (especialidad) parts.push(especialidad);
    if (profesion) parts.push(profesion);
    return parts.join(" · ");
  }, [especialidad, profesion]);

  const submit = (mode: "publish" | "draft") => {
    setSaved("saving");
    setTimeout(() => setSaved(mode === "publish" ? "published" : "draft"), 700);
    setTimeout(() => setSaved("idle"), 2400);
  };

  return (
    <div className="space-y-5">
      <form className="rounded-2xl border border-mist-200 bg-white p-6 md:p-7" onSubmit={(e) => e.preventDefault()}>
        {/* Section 1 */}
        <header className="mb-5">
          <Badge tone="brand">Datos del perfil</Badge>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-ink-900">
            ¿Qué profesional necesitas?
          </h2>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Profesión *">
            <SelectMenu options={profesiones} value={profesion} onChange={setProfesion} placeholder="Selecciona…" />
          </Field>
          <Field label="Especialidad *">
            <SelectMenu options={especialidades} value={especialidad} onChange={setEspecialidad} placeholder="Selecciona…" searchable />
          </Field>
          <Field label="Ciudad *">
            <SelectMenu options={ciudades} value={ciudad} onChange={setCiudad} placeholder="Selecciona…" />
          </Field>
          <Field label="Experiencia mínima">
            <SelectMenu
              options={[
                { value: "", label: "Indiferente" },
                { value: "1", label: "+ 1 año" },
                { value: "3", label: "+ 3 años" },
                { value: "5", label: "+ 5 años" },
                { value: "10", label: "+ 10 años" },
              ]}
              value={expMin}
              onChange={setExpMin}
            />
          </Field>
        </div>

        {/* Section 2 — schedule */}
        <header className="mb-5 mt-8 border-t border-mist-100 pt-6">
          <Badge tone="accent">Calendario y horario</Badge>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-ink-900">¿Cuándo lo necesitas?</h2>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Tipo de jornada">
            <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-mist-200 bg-mist-50 p-1 text-xs font-medium md:grid-cols-4">
              {TIPOS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={cn(
                    "inline-flex h-9 items-center justify-center rounded-lg transition",
                    tipo === t ? "bg-white text-ink-900 shadow-sm ring-1 ring-mist-200" : "text-mist-500 hover:text-ink-800"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Turno">
            <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-mist-200 bg-mist-50 p-1 text-xs font-medium md:grid-cols-4">
              {TURNOS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTurno(t)}
                  className={cn(
                    "inline-flex h-9 items-center justify-center rounded-lg transition",
                    turno === t ? "bg-white text-ink-900 shadow-sm ring-1 ring-mist-200" : "text-mist-500 hover:text-ink-800"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Desde">
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </Field>
          <Field label="Hasta">
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </Field>
          <Field label="Hora inicio">
            <Input type="time" value={timeStart} onChange={(e) => setTimeStart(e.target.value)} />
          </Field>
          <Field label="Hora fin">
            <Input type="time" value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} />
          </Field>
        </div>

        {/* Section 3 — tarifa */}
        <header className="mb-5 mt-8 border-t border-mist-100 pt-6">
          <Badge tone="success">Tarifa orientativa</Badge>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-ink-900">¿Qué presupuesto manejas?</h2>
          <p className="mt-1 text-sm text-mist-500">Rango por hora — los profesionales lo verán como referencia.</p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Desde (€/h)">
            <Input type="number" min="0" value={rateMin} onChange={(e) => setRateMin(e.target.value)} />
          </Field>
          <Field label="Hasta (€/h)">
            <Input type="number" min="0" value={rateMax} onChange={(e) => setRateMax(e.target.value)} />
          </Field>
        </div>

        {/* Section 4 — descripción y extras */}
        <header className="mb-5 mt-8 border-t border-mist-100 pt-6">
          <Badge tone="neutral">Detalles</Badge>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-ink-900">Descripción y requisitos</h2>
        </header>

        <Field label="Descripción de la jornada">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Cuenta brevemente cómo es el equipo, qué pacientes se atienden, equipamiento disponible…"
          />
        </Field>

        <div className="mt-4 space-y-2.5 rounded-xl border border-mist-200 bg-mist-50/40 p-4 text-sm text-ink-800">
          <label className="flex cursor-pointer items-start gap-2.5 select-none">
            <Checkbox className="mt-0.5" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />
            <span>
              <span className="font-semibold text-ink-900">Cobertura urgente</span>
              <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Notif. push + email
              </span>
              <div className="text-xs text-mist-500">Avisamos a los profesionales más cercanos en menos de 5 minutos.</div>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2.5 select-none">
            <Checkbox className="mt-0.5" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
            <span>
              <span className="font-semibold text-ink-900">Solo perfiles verificados</span>
              <div className="text-xs text-mist-500">DNI, titulación y colegiación validados por SaludCoNet.</div>
            </span>
          </label>
        </div>

        {/* Footer actions */}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-mist-100 pt-6">
          <div className="text-xs text-mist-500">
            {!isValid ? (
              <span className="inline-flex items-center gap-1.5 text-amber-700">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" strokeLinecap="round" /></svg>
                Completa los campos obligatorios para publicar
              </span>
            ) : saved === "published" ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M5 12l4.5 4.5L19 7" /></svg>
                ¡Publicado! Notificando a la red…
              </span>
            ) : saved === "draft" ? (
              <span className="inline-flex items-center gap-1.5 text-brand-700">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M5 12l4.5 4.5L19 7" /></svg>
                Borrador guardado
              </span>
            ) : (
              "Puedes guardar como borrador y publicar después"
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => submit("draft")}
              disabled={saved === "saving"}
            >
              Guardar borrador
            </Button>
            <Button
              size="md"
              onClick={() => submit("publish")}
              disabled={!isValid || saved === "saving"}
            >
              {saved === "saving" ? "Publicando…" : "Publicar necesidad"}
              {saved !== "saving" && (
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Live preview */}
      <div className="rounded-2xl border border-dashed border-mist-300 bg-mist-50/40 p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Vista previa de la oferta</div>
        <div className="mt-3 rounded-2xl border border-mist-200 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[15px] font-semibold text-ink-900">
                {summary || "Selecciona profesión y especialidad"}
              </div>
              <div className="text-xs text-mist-500">
                {ciudad || "Ciudad"} · {tipo} · {turno}
              </div>
            </div>
            {urgent && <Badge tone="warning">Urgente</Badge>}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg border border-mist-200 bg-mist-50/60 p-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">Fecha</div>
              <div className="text-sm font-semibold text-ink-900">
                {dateFrom === dateTo ? dateFrom || "—" : `${dateFrom} → ${dateTo}`}
              </div>
            </div>
            <div className="rounded-lg border border-mist-200 bg-mist-50/60 p-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">Horario</div>
              <div className="text-sm font-semibold text-ink-900">{timeStart} - {timeEnd}</div>
            </div>
            <div className="rounded-lg border border-mist-200 bg-mist-50/60 p-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">Tarifa</div>
              <div className="text-sm font-semibold text-brand-700">{rateMin}-{rateMax} €/h</div>
            </div>
          </div>
          {description && (
            <p className="mt-4 line-clamp-3 border-t border-mist-100 pt-3 text-sm text-mist-500">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
