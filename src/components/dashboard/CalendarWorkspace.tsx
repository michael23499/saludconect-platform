"use client";
import { useMemo, useState } from "react";
import { InteractiveCalendar, type CalendarData, type Appointment } from "@/components/dashboard/InteractiveCalendar";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { cn } from "@/lib/cn";

type Role = "profesional" | "clinica";

type Props = {
  role: Role;
  data: CalendarData;
  initialDate: Date;
};

type ViewMode = "month" | "agenda" | "stats";

type Template = {
  id: string;
  name: string;
  desc: string;
  pattern: Array<"morning" | "afternoon" | "both" | "free">;
};

const TEMPLATES_PRO: Template[] = [
  { id: "t1", name: "Lun-Vie · Mañanas", desc: "Jornada matinal de lunes a viernes", pattern: ["morning", "morning", "morning", "morning", "morning", "free", "free"] },
  { id: "t2", name: "Lun-Vie · Día completo", desc: "Tu plantilla habitual de consulta", pattern: ["both", "both", "both", "both", "both", "free", "free"] },
  { id: "t3", name: "Mar-Jue · Tardes", desc: "Compatible con guardias", pattern: ["free", "afternoon", "free", "afternoon", "free", "free", "free"] },
  { id: "t4", name: "Fines de semana", desc: "Solo sábado y domingo", pattern: ["free", "free", "free", "free", "free", "both", "morning"] },
];

const TEMPLATES_CLINICA: Template[] = [
  { id: "tc1", name: "Apertura semanal completa", desc: "Lun-Sab mañana y tarde", pattern: ["both", "both", "both", "both", "both", "both", "free"] },
  { id: "tc2", name: "Solo mañanas", desc: "Reduce horas de tarde un mes", pattern: ["morning", "morning", "morning", "morning", "morning", "morning", "free"] },
  { id: "tc3", name: "Verano reducido", desc: "Lun-Vie mañanas, cerrado fines", pattern: ["morning", "morning", "morning", "morning", "morning", "free", "free"] },
];

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function hoursForAppt(a: Appointment): number {
  const [sh, sm] = a.start.split(":").map(Number);
  const [eh, em] = a.end.split(":").map(Number);
  return Math.max(0, eh + em / 60 - sh - sm / 60);
}

function parseRate(rateLabel: string): number {
  const ladder: Record<string, number> = {
    "€": 35,
    "€€": 55,
    "€€€": 85,
    "€€€€": 130,
  };
  const tokens = rateLabel.match(/€+/g);
  if (!tokens) return 70;
  const last = tokens.sort((a, b) => b.length - a.length)[0];
  return ladder[last] ?? 70;
}

function monthStats(data: CalendarData, year: number, month: number) {
  let scheduledDays = 0;
  let blockedDays = 0;
  let freeDays = 0;
  let confirmed = 0;
  let pending = 0;
  let completed = 0;
  let cancelled = 0;
  let totalHours = 0;
  let estimatedEarnings = 0;
  const weekdayHistogram = [0, 0, 0, 0, 0, 0, 0]; // Mon..Sun

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const key = ymd(new Date(year, month, day));
    const entry = data[key];
    if (!entry) {
      freeDays++;
      continue;
    }
    if (entry.shift === "blocked") {
      blockedDays++;
      continue;
    }
    if (entry.shift === "free") {
      freeDays++;
    } else {
      scheduledDays++;
    }
    if (entry.appointments) {
      for (const a of entry.appointments) {
        if (a.status === "confirmada") confirmed++;
        else if (a.status === "pendiente") pending++;
        else if (a.status === "completada") completed++;
        else if (a.status === "cancelada") cancelled++;

        const hrs = hoursForAppt(a);
        totalHours += hrs;
        if (a.status !== "cancelada") {
          estimatedEarnings += hrs * parseRate(a.rateLabel);
        }
        const date = new Date(year, month, day);
        const wd = (date.getDay() + 6) % 7;
        weekdayHistogram[wd] += hrs;
      }
    }
  }
  const occupancy = Math.round((scheduledDays / daysInMonth) * 100);
  return {
    scheduledDays,
    blockedDays,
    freeDays,
    confirmed,
    pending,
    completed,
    cancelled,
    totalHours,
    estimatedEarnings,
    occupancy,
    daysInMonth,
    weekdayHistogram,
  };
}

function getUpcoming(data: CalendarData, from: Date, limit = 6) {
  const fromKey = ymd(from);
  return Object.entries(data)
    .filter(([k, v]) => k >= fromKey && v.appointments && v.appointments.length > 0)
    .flatMap(([k, v]) => (v.appointments || []).map((a) => ({ key: k, a })))
    .sort((x, y) => (x.key < y.key ? -1 : x.key > y.key ? 1 : x.a.start.localeCompare(y.a.start)))
    .slice(0, limit);
}

const STATUS_BADGE = {
  confirmada: "success",
  pendiente: "warning",
  completada: "brand",
  cancelada: "danger",
} as const;

export function CalendarWorkspace({ role, data, initialDate }: Props) {
  const [cursor, setCursor] = useState<Date>(() => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const [view, setView] = useState<ViewMode>("month");
  const [filterStatus, setFilterStatus] = useState<"all" | Appointment["status"]>("all");
  const [savedTpl, setSavedTpl] = useState<string | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const stats = useMemo(() => monthStats(data, year, month), [data, year, month]);
  const upcoming = useMemo(() => getUpcoming(data, new Date()), [data]);
  const monthLabel = cursor.toLocaleDateString("es", { month: "long", year: "numeric" });
  const templates = role === "profesional" ? TEMPLATES_PRO : TEMPLATES_CLINICA;
  const weekdayLabels = ["L", "M", "X", "J", "V", "S", "D"];
  const maxBar = Math.max(1, ...stats.weekdayHistogram);

  const goPrev = () => setCursor(new Date(year, month - 1, 1));
  const goNext = () => setCursor(new Date(year, month + 1, 1));
  const goToday = () => {
    const d = new Date();
    setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const applyTemplate = (id: string) => {
    setSavedTpl(id);
    setTimeout(() => setSavedTpl(null), 2200);
  };

  const filteredAgenda = useMemo(() => {
    const fromKey = ymd(new Date(year, month, 1));
    const toKey = ymd(new Date(year, month + 1, 0));
    return Object.entries(data)
      .filter(([k]) => k >= fromKey && k <= toKey)
      .filter(([, v]) => v.appointments && v.appointments.length > 0)
      .map(([k, v]) => ({
        key: k,
        appts: (v.appointments || []).filter((a) => filterStatus === "all" || a.status === filterStatus),
      }))
      .filter((g) => g.appts.length > 0)
      .sort((a, b) => (a.key < b.key ? -1 : 1));
  }, [data, year, month, filterStatus]);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="rounded-2xl border border-mist-200 bg-white p-3 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <button onClick={goPrev} aria-label="Mes anterior" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-mist-200 text-ink-700 hover:bg-mist-50">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button onClick={goToday} className="h-9 rounded-lg border border-mist-200 px-3 text-xs font-medium text-ink-800 hover:bg-mist-50">Hoy</button>
            <button onClick={goNext} aria-label="Mes siguiente" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-mist-200 text-ink-700 hover:bg-mist-50">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
            </button>
            <div className="ml-1 truncate text-sm font-semibold capitalize text-ink-900 md:ml-2 md:text-lg">{monthLabel}</div>
          </div>

          <div className="flex w-full items-center gap-2 md:w-auto">
            {/* View switcher — segmented on mobile (full width) and md+ */}
            <div className="flex flex-1 items-center gap-1 rounded-lg border border-mist-200 p-1 text-xs md:flex-initial">
              {(["month", "agenda", "stats"] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    "flex-1 rounded-md px-2.5 py-1 font-semibold capitalize transition md:flex-initial md:px-3",
                    view === v ? "bg-mist-100 text-ink-900" : "text-mist-500 hover:text-ink-800"
                  )}
                >
                  {v === "month" ? "Mes" : v === "agenda" ? "Agenda" : "Métricas"}
                </button>
              ))}
            </div>
            {view === "agenda" && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                className="hidden h-9 rounded-lg border border-mist-200 bg-white px-3 text-xs font-medium text-ink-800 md:block"
              >
                <option value="all">Todos los estados</option>
                <option value="confirmada">Confirmadas</option>
                <option value="pendiente">Pendientes</option>
                <option value="completada">Completadas</option>
                <option value="cancelada">Canceladas</option>
              </select>
            )}
            <button className="hidden h-9 items-center rounded-lg bg-ink-900 px-3 text-xs font-semibold text-white hover:bg-ink-800 md:inline-flex">
              + {role === "profesional" ? "Nueva jornada" : "Publicar turno"}
            </button>
          </div>
        </div>

        {/* Mobile-only secondary controls */}
        {view === "agenda" && (
          <div className="mt-3 md:hidden">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="h-9 w-full rounded-lg border border-mist-200 bg-white px-3 text-xs font-medium text-ink-800"
            >
              <option value="all">Todos los estados</option>
              <option value="confirmada">Confirmadas</option>
              <option value="pendiente">Pendientes</option>
              <option value="completada">Completadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>
        )}

        {/* Mini-stats summary row */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">
          <SummaryStat
            label="Días planificados"
            value={`${stats.scheduledDays}/${stats.daysInMonth}`}
            hint={`Ocupación ${stats.occupancy}%`}
            tone="brand"
          />
          <SummaryStat
            label="Reservas confirmadas"
            value={String(stats.confirmed)}
            hint={`${stats.pending} pendientes`}
            tone="success"
          />
          <SummaryStat
            label="Horas planificadas"
            value={`${stats.totalHours.toFixed(0)} h`}
            hint={`Promedio ${stats.scheduledDays ? (stats.totalHours / stats.scheduledDays).toFixed(1) : "0"} h/día`}
            tone="cyan"
          />
          <SummaryStat
            label={role === "profesional" ? "Ingresos estimados" : "Gasto estimado"}
            value={`${Math.round(stats.estimatedEarnings).toLocaleString("es")} €`}
            hint={stats.cancelled ? `${stats.cancelled} cancelaciones excluidas` : "Sin cancelaciones"}
            tone="warning"
          />
        </div>
      </div>

      {/* Main layout */}
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          {view === "month" && <InteractiveCalendar initialDate={cursor} data={data} />}
          {view === "agenda" && (
            <AgendaList groups={filteredAgenda} role={role} />
          )}
          {view === "stats" && (
            <StatsPanel stats={stats} weekdayLabels={weekdayLabels} maxBar={maxBar} role={role} />
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Próximas jornadas */}
          <div className="rounded-2xl border border-mist-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Próximas {role === "profesional" ? "jornadas" : "reservas"}</div>
              <Badge tone="brand">{upcoming.length}</Badge>
            </div>
            <div className="mt-4 space-y-3">
              {upcoming.length === 0 && (
                <p className="text-sm text-mist-500">No hay reservas próximas en tu calendario.</p>
              )}
              {upcoming.map(({ key, a }) => {
                const [y, m, d] = key.split("-").map(Number);
                const date = new Date(y, m - 1, d);
                const dayLabel = date.toLocaleDateString("es", { weekday: "short", day: "2-digit", month: "short" });
                return (
                  <div key={a.id} className="flex items-start gap-3 rounded-xl border border-mist-200 bg-mist-50/40 p-3">
                    <Avatar name={a.clinic} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold text-ink-900">{a.clinic}</div>
                      <div className="text-[11px] text-mist-500">{a.specialty}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] font-medium text-ink-800">
                        <span className="capitalize">{dayLabel}</span>
                        <span className="tabular-nums text-mist-500">·</span>
                        <span className="tabular-nums">{a.start}–{a.end}</span>
                      </div>
                    </div>
                    <Badge tone={STATUS_BADGE[a.status]} className="!text-[10px] !px-2 !py-0.5">
                      {a.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Templates */}
          <div className="rounded-2xl border border-mist-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Plantillas</div>
              <span className="text-[10px] font-medium text-brand-700">Aplica a 1 clic</span>
            </div>
            <p className="mt-1 text-[11px] text-mist-500">
              Aplica un patrón semanal a todo el mes visible.
            </p>
            <div className="mt-3 space-y-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => applyTemplate(t.id)}
                  className={cn(
                    "group block w-full rounded-xl border bg-white p-3 text-left transition",
                    savedTpl === t.id ? "border-emerald-300 bg-emerald-50/60" : "border-mist-200 hover:border-brand-400 hover:bg-brand-50/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-ink-900">{t.name}</div>
                    {savedTpl === t.id && <span className="text-[10px] font-semibold text-emerald-700">✓ Aplicada</span>}
                  </div>
                  <div className="text-[11px] text-mist-500">{t.desc}</div>
                  <div className="mt-2 flex gap-1">
                    {t.pattern.map((p, i) => (
                      <div key={i} className="flex flex-1 flex-col items-center gap-0.5">
                        <span className="text-[9px] font-semibold text-mist-400">{weekdayLabels[i]}</span>
                        <span
                          className={cn(
                            "h-3 w-full rounded-sm",
                            p === "morning" && "bg-brand-400",
                            p === "afternoon" && "bg-cyan-400",
                            p === "both" && "bg-gradient-to-r from-brand-500 to-cyan-500",
                            p === "free" && "bg-mist-200"
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Bulk actions */}
          <div className="rounded-2xl border border-mist-200 bg-white p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Acciones masivas</div>
            <div className="mt-3 space-y-2 text-xs">
              <BulkAction icon="↻" label={`Replicar ${monthLabel}`} desc="Copiar disponibilidad al mes siguiente" />
              <BulkAction icon="✕" label="Bloquear semana actual" desc="Marcar 7 días como no disponibles" />
              <BulkAction icon="✉" label="Notificar a clínicas" desc="Aviso de cambios de disponibilidad" />
              <BulkAction icon="⇩" label="Exportar a Google Calendar" desc="Sincroniza con tu calendario personal" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone: "brand" | "success" | "warning" | "cyan";
}) {
  const dot = {
    brand: "bg-brand-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    cyan: "bg-cyan-500",
  }[tone];
  return (
    <div className="rounded-xl border border-mist-200 bg-mist-50/40 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-mist-500">
        <span className={cn("inline-block h-1.5 w-1.5 rounded-full", dot)} />
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold tracking-tight text-ink-900">{value}</div>
      {hint && <div className="text-[11px] text-mist-500">{hint}</div>}
    </div>
  );
}

function BulkAction({ icon, label, desc }: { icon: string; label: string; desc: string }) {
  return (
    <button type="button" className="card-hover flex w-full items-center gap-3 rounded-lg border border-mist-200 bg-white p-2.5 text-left">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-base font-semibold text-brand-700">{icon}</span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-ink-900">{label}</span>
        <span className="block truncate text-[11px] text-mist-500">{desc}</span>
      </span>
    </button>
  );
}

function AgendaList({
  groups,
  role,
}: {
  groups: Array<{ key: string; appts: Appointment[] }>;
  role: Role;
}) {
  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-mist-300 bg-white p-12 text-center">
        <div className="text-base font-semibold text-ink-900">Sin reservas en esta vista</div>
        <p className="mt-1 text-sm text-mist-500">Cambia los filtros o añade una nueva reserva.</p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-mist-200 bg-white">
      <div className="border-b border-mist-100 p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Agenda</div>
        <div className="text-lg font-semibold tracking-tight text-ink-900">Listado cronológico del mes</div>
      </div>
      <div className="divide-y divide-mist-100">
        {groups.map((g) => {
          const [y, m, d] = g.key.split("-").map(Number);
          const date = new Date(y, m - 1, d);
          const dayName = date.toLocaleDateString("es", { weekday: "long" });
          const dayLabel = date.toLocaleDateString("es", { day: "2-digit", month: "short" });
          const dayHours = g.appts.reduce((acc, a) => acc + hoursForAppt(a), 0);
          return (
            <div key={g.key} className="grid gap-4 p-5 md:grid-cols-[160px_1fr]">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">{dayName}</div>
                <div className="text-2xl font-semibold tracking-tight text-ink-900">{dayLabel}</div>
                <div className="mt-1 text-[11px] text-mist-500">{g.appts.length} reserva{g.appts.length === 1 ? "" : "s"} · {dayHours.toFixed(1)} h</div>
              </div>
              <div className="space-y-3">
                {g.appts.map((a) => (
                  <div key={a.id} className="rounded-xl border border-mist-200 bg-mist-50/40 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg border border-mist-200 bg-white text-xs">
                          <span className="font-semibold text-ink-900 tabular-nums">{a.start}</span>
                          <span className="text-[10px] text-mist-500">{a.end}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-sm font-semibold text-ink-900">{a.clinic}</div>
                            <Badge tone={STATUS_BADGE[a.status]}>{a.status}</Badge>
                          </div>
                          <div className="text-xs text-mist-500">{a.city} · {a.specialty}</div>
                          <div className="mt-1 text-[11px] font-medium text-brand-700">{a.rateLabel}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="rounded-lg border border-mist-200 bg-white px-3 py-1.5 text-[11px] font-medium text-ink-800 hover:bg-mist-50">
                          {role === "profesional" ? "Chat" : "Mensaje"}
                        </button>
                        <button className="rounded-lg bg-brand-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-brand-700">
                          Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatsPanel({
  stats,
  weekdayLabels,
  maxBar,
  role,
}: {
  stats: ReturnType<typeof monthStats>;
  weekdayLabels: string[];
  maxBar: number;
  role: Role;
}) {
  const distribution = [
    { label: "Confirmadas", value: stats.confirmed, color: "bg-emerald-500", text: "text-emerald-600", soft: "bg-emerald-50" },
    { label: "Pendientes", value: stats.pending, color: "bg-amber-500", text: "text-amber-600", soft: "bg-amber-50" },
    { label: "Completadas", value: stats.completed, color: "bg-brand-500", text: "text-brand-600", soft: "bg-brand-50" },
    { label: "Canceladas", value: stats.cancelled, color: "bg-red-500", text: "text-red-600", soft: "bg-red-50" },
  ];
  const totalApps = distribution.reduce((a, b) => a + b.value, 0) || 1;
  const trend = [4, 6, 5, 8, 7, 9, 11, 10, 12, 13, 12, 14];
  // Use this key so animations replay on month change
  const animKey = `${stats.daysInMonth}-${stats.totalHours.toFixed(1)}-${stats.confirmed}-${stats.pending}`;
  const avgHours = stats.weekdayHistogram.reduce((a, b) => a + b, 0) / 7 || 0;

  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        {/* Weekly load */}
        <div className="fade-up rounded-2xl border border-mist-200 bg-white p-6" style={{ animationDelay: "40ms" }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Carga semanal</div>
              <div className="text-lg font-semibold tracking-tight text-ink-900">Horas por día de la semana</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">Promedio</div>
              <div className="text-sm font-semibold tabular-nums text-brand-700">{avgHours.toFixed(1)} h</div>
            </div>
          </div>

          <div key={animKey} className="relative mt-6 flex h-44 items-end gap-2 px-1">
            {/* Average line */}
            {avgHours > 0 && (
              <div
                className="pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-brand-400/60"
                style={{ bottom: `${(avgHours / maxBar) * 100}%` }}
              >
                <span className="absolute -top-4 right-0 rounded-md bg-brand-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-brand-700">
                  media
                </span>
              </div>
            )}
            {stats.weekdayHistogram.map((v, i) => {
              const pct = maxBar > 0 ? (v / maxBar) * 100 : 0;
              const isPeak = v === maxBar && v > 0;
              return (
                <div key={i} className="group relative flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  {/* Hover tooltip */}
                  {v > 0 && (
                    <div className="pointer-events-none absolute -top-1 z-20 -translate-y-full rounded-md bg-ink-900 px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow-md transition group-hover:opacity-100">
                      {v.toFixed(1)} h
                      <span className="absolute left-1/2 top-full h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-ink-900" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "bar-grow relative w-full overflow-hidden rounded-t-md transition",
                      isPeak ? "bg-gradient-to-t from-brand-700 via-brand-500 to-cyan-400" : "bg-gradient-to-t from-brand-600 to-cyan-400",
                      "group-hover:from-brand-700 group-hover:to-cyan-300"
                    )}
                    style={{ height: `${pct}%`, minHeight: v > 0 ? 4 : 0, animationDelay: `${120 + i * 70}ms` }}
                  >
                    {/* Glossy highlight */}
                    <span className="absolute inset-x-0 top-0 h-1/2 rounded-t-md bg-gradient-to-b from-white/35 to-transparent" />
                    {isPeak && (
                      <span className="absolute -top-1 left-1/2 inline-flex h-2 w-2 -translate-x-1/2 -translate-y-full rounded-full bg-cyan-400 ring-2 ring-white ring-tick" />
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-0.5 pt-1">
                    <span className="text-[10px] font-semibold text-mist-500">{weekdayLabels[i]}</span>
                    <span className={cn("text-[10px] font-semibold tabular-nums", v > 0 ? "text-ink-900" : "text-mist-400")}>{v.toFixed(0)}h</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribution */}
        <div className="fade-up rounded-2xl border border-mist-200 bg-white p-6" style={{ animationDelay: "120ms" }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Distribución de reservas</div>
              <div className="text-lg font-semibold tracking-tight text-ink-900">Estado del mes</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">Total</div>
              <div className="text-sm font-semibold tabular-nums text-ink-900">{totalApps}</div>
            </div>
          </div>

          <div key={animKey} className="mt-6 flex h-3 overflow-hidden rounded-full bg-mist-100">
            {distribution.map((d, i) => (
              <div
                key={d.label}
                className={cn("segment-grow h-full transition hover:brightness-110", d.color)}
                style={{ width: `${(d.value / totalApps) * 100}%`, animationDelay: `${100 + i * 90}ms` }}
                title={`${d.label}: ${d.value}`}
              />
            ))}
          </div>

          <ul className="mt-5 grid gap-2">
            {distribution.map((d, i) => {
              const pct = totalApps > 0 ? ((d.value / totalApps) * 100).toFixed(0) : "0";
              return (
                <li
                  key={d.label}
                  className="fade-up group flex items-center justify-between rounded-lg border border-transparent px-2 py-1.5 transition hover:border-mist-200 hover:bg-mist-50"
                  style={{ animationDelay: `${250 + i * 60}ms` }}
                >
                  <span className="inline-flex items-center gap-2 text-sm text-ink-800">
                    <span className={cn("inline-flex h-5 w-5 items-center justify-center rounded-md", d.soft)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", d.color)} />
                    </span>
                    {d.label}
                  </span>
                  <span className="inline-flex items-baseline gap-2">
                    <span className="text-[10px] text-mist-500 tabular-nums">{pct}%</span>
                    <span className="text-sm font-semibold tabular-nums text-ink-900">{d.value}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Trend */}
      <div className="fade-up overflow-hidden rounded-2xl border border-mist-200 bg-white p-6" style={{ animationDelay: "200ms" }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Tendencia</div>
            <div className="text-lg font-semibold tracking-tight text-ink-900">
              {role === "profesional" ? "Ingresos planificados · últimos 12 meses" : "Gasto en coberturas · últimos 12 meses"}
            </div>
          </div>
          <div className="text-right">
            <div className="count-pulse text-2xl font-semibold tabular-nums text-ink-900">
              {Math.round(stats.estimatedEarnings).toLocaleString("es")} €
            </div>
            <div className="text-xs font-medium text-emerald-600">
              <span className="inline-flex items-center gap-1">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                  <path d="M6 14l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Mes en curso · +{stats.totalHours.toFixed(0)} h
              </span>
            </div>
          </div>
        </div>
        <div key={animKey + "-line"} className="mt-6">
          <AnimatedTrendChart data={trend} />
        </div>
        <div className="mt-2 flex justify-between text-[10px] font-medium text-mist-400">
          {["Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May"].map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <InsightCard
          icon="↑"
          tone="emerald"
          title="Mejor día"
          value="Miércoles"
          desc="Promedio de 7,4 h y 0 cancelaciones"
          delay="280ms"
        />
        <InsightCard
          icon="↓"
          tone="amber"
          title="Día con menos carga"
          value="Sábado"
          desc="Solo el 8% de las jornadas planificadas"
          delay="340ms"
        />
        <InsightCard
          icon="★"
          tone="brand"
          title={role === "profesional" ? "Clínica más activa" : "Profesional top"}
          value={role === "profesional" ? "Clínica Sanitas Norte" : "Dra. Lucía Martín"}
          desc="14 reservas en el mes en curso"
          delay="400ms"
        />
      </div>
    </div>
  );
}

function AnimatedTrendChart({ data }: { data: number[] }) {
  const w = 600;
  const h = 160;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = w / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = h - ((v - min) / range) * (h - 20) - 10;
    return [x, y] as const;
  });
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  const last = points[points.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-40 w-full" aria-hidden>
      <defs>
        <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(37,99,235,0.34)" />
          <stop offset="100%" stopColor="rgba(37,99,235,0)" />
        </linearGradient>
        <linearGradient id="trendLine" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      {/* Soft grid */}
      {[0.25, 0.5, 0.75].map((p, i) => (
        <line key={i} x1="0" x2={w} y1={h * p} y2={h * p} stroke="#eef2f8" strokeWidth="1" />
      ))}
      <path className="path-fill-in" d={area} fill="url(#trendFill)" />
      <path className="path-draw" d={line} fill="none" stroke="url(#trendLine)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      {/* End-point glow */}
      <circle className="count-pulse" cx={last[0]} cy={last[1]} r="6" fill="#06b6d4" opacity="0.18" />
      <circle className="count-pulse" cx={last[0]} cy={last[1]} r="3.6" fill="#1d4ed8" />
    </svg>
  );
}

function InsightCard({
  icon,
  tone,
  title,
  value,
  desc,
  delay,
}: {
  icon: string;
  tone: "emerald" | "amber" | "brand";
  title: string;
  value: string;
  desc: string;
  delay?: string;
}) {
  const palette = {
    emerald: { ring: "border-emerald-100", chip: "bg-emerald-50 text-emerald-700", text: "text-emerald-700" },
    amber: { ring: "border-amber-100", chip: "bg-amber-50 text-amber-700", text: "text-amber-700" },
    brand: { ring: "border-brand-100", chip: "bg-brand-50 text-brand-700", text: "text-brand-700" },
  }[tone];
  return (
    <div
      className={cn(
        "card-hover fade-up relative overflow-hidden rounded-2xl border bg-white p-5",
        palette.ring
      )}
      style={{ animationDelay: delay }}
    >
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br from-brand-50 to-cyan-50 opacity-60" />
      <div className="relative flex items-start gap-3">
        <span className={cn("inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg font-bold", palette.chip)}>
          {icon}
        </span>
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">{title}</div>
          <div className="mt-0.5 truncate text-base font-semibold tracking-tight text-ink-900">{value}</div>
          <div className="mt-1 text-xs text-mist-500">{desc}</div>
        </div>
      </div>
    </div>
  );
}
