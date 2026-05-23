"use client";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import type { ReservaPro, ReservaClinica, ReservaStatus } from "@/lib/mock-reservas";

type Reserva = (ReservaPro & { counterpart: string }) | (ReservaClinica & { counterpart: string });

type Role = "professional" | "clinic";

const STATUS_BADGE: Record<ReservaStatus, "success" | "warning" | "brand" | "danger"> = {
  confirmada: "success",
  pendiente: "warning",
  completada: "brand",
  cancelada: "danger",
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return {
    weekday: date.toLocaleDateString("es", { weekday: "short" }),
    day: String(d).padStart(2, "0"),
    monthShort: date.toLocaleDateString("es", { month: "short" }),
    full: date.toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
  };
}

const TABS: Array<{ k: "todas" | ReservaStatus; label: string }> = [
  { k: "todas", label: "Todas" },
  { k: "pendiente", label: "Pendientes" },
  { k: "confirmada", label: "Confirmadas" },
  { k: "completada", label: "Completadas" },
  { k: "cancelada", label: "Canceladas" },
];

export function ReservasView({
  role,
  items,
}: {
  role: Role;
  items: Array<ReservaPro | ReservaClinica>;
}) {
  const enriched = useMemo<Reserva[]>(
    () =>
      items.map((r) => {
        if ("clinic" in r) return { ...r, counterpart: r.clinic };
        return { ...r, counterpart: r.professional };
      }),
    [items]
  );

  const [tab, setTab] = useState<(typeof TABS)[number]["k"]>("todas");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(enriched[0]?.id ?? null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { todas: enriched.length, confirmada: 0, pendiente: 0, completada: 0, cancelada: 0 };
    for (const r of enriched) c[r.status]++;
    return c;
  }, [enriched]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enriched
      .filter((r) => tab === "todas" || r.status === tab)
      .filter((r) => {
        if (!q) return true;
        const blob = [r.counterpart, r.city, "specialty" in r ? r.specialty : r.role, r.shift]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return blob.includes(q);
      })
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.start.localeCompare(b.start)));
  }, [enriched, tab, query]);

  const selected = useMemo(
    () => filtered.find((r) => r.id === selectedId) ?? filtered[0] ?? null,
    [filtered, selectedId]
  );

  const totalRevenue = useMemo(
    () =>
      enriched
        .filter((r) => r.status === "confirmada" || r.status === "completada")
        .reduce((acc, r) => acc + r.fee, 0),
    [enriched]
  );

  return (
    <div className="space-y-4 md:space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">
        <KpiTile label="Pendientes" value={counts.pendiente} tone="warning" hint="Requieren respuesta" />
        <KpiTile label="Confirmadas" value={counts.confirmada} tone="success" hint={`${counts.completada} ya completadas`} />
        <KpiTile label={role === "professional" ? "Ingresos" : "Gasto"} value={`${totalRevenue.toLocaleString("es")} €`} tone="brand" hint="Conf. + completadas" />
        <KpiTile label="Canceladas" value={counts.cancelada} tone="danger" hint="Histórico del año" />
      </div>

      {/* Tab bar */}
      <div className="rounded-2xl border border-mist-200 bg-white p-3 md:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="-mx-3 overflow-x-auto px-3 md:mx-0 md:overflow-visible md:px-0">
            <div className="flex items-center gap-1 whitespace-nowrap">
              {TABS.map((t) => (
                <button
                  key={t.k}
                  onClick={() => {
                    setTab(t.k);
                    setSelectedId(null);
                  }}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition md:px-3",
                    tab === t.k ? "bg-ink-900 text-white" : "text-mist-500 hover:bg-mist-50 hover:text-ink-900"
                  )}
                >
                  {t.label}
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[10px]", tab === t.k ? "bg-white/15 text-white" : "bg-mist-100 text-ink-800")}>
                    {counts[t.k]}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={role === "professional" ? "Buscar clínica, ciudad…" : "Buscar profesional, especialidad…"}
              className="h-9 w-full rounded-lg border border-mist-200 bg-white pl-9 pr-3 text-xs text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 md:w-64"
            />
            <svg className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mist-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" /><path d="M20 20l-3-3" />
            </svg>
          </div>
        </div>
      </div>

      {/* List + Detail */}
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-mist-200 bg-white">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-base font-semibold text-ink-900">Sin reservas que coincidan</div>
              <p className="mt-1 text-sm text-mist-500">Cambia los filtros o limpia la búsqueda.</p>
            </div>
          ) : (
            <ul className="divide-y divide-mist-100">
              {filtered.map((r) => (
                <ReservaRow
                  key={r.id}
                  r={r}
                  role={role}
                  active={selected?.id === r.id}
                  onClick={() => setSelectedId(r.id)}
                />
              ))}
            </ul>
          )}
        </div>

        {selected ? (
          <ReservaDetail r={selected} role={role} />
        ) : (
          <div className="rounded-2xl border border-dashed border-mist-300 bg-white p-12 text-center">
            <div className="text-sm font-medium text-mist-500">Selecciona una reserva para ver el detalle.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiTile({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone: "brand" | "success" | "warning" | "danger";
}) {
  const dot = {
    brand: "bg-brand-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
  }[tone];
  return (
    <div className="rounded-2xl border border-mist-200 bg-white p-3.5 md:p-5">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-mist-500">
        <span className={cn("inline-block h-1.5 w-1.5 rounded-full", dot)} />
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-1.5 text-xl font-semibold tracking-tight text-ink-900 md:mt-2 md:text-2xl">{value}</div>
      {hint && <div className="mt-1 hidden text-xs text-mist-500 md:block">{hint}</div>}
    </div>
  );
}

function ReservaRow({
  r,
  role,
  active,
  onClick,
}: {
  r: Reserva;
  role: Role;
  active: boolean;
  onClick: () => void;
}) {
  const d = formatDate(r.date);
  const subtitle = "specialty" in r ? r.specialty : r.role;
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex w-full items-center gap-3 p-4 text-left transition md:gap-4 md:p-5",
          active ? "bg-brand-50/50" : "hover:bg-mist-50"
        )}
      >
        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-mist-200 bg-gradient-to-b from-mist-50 to-white md:h-14 md:w-14">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">{d.weekday}</div>
          <div className="text-base font-semibold leading-none text-ink-900 md:text-lg">{d.day}</div>
          <div className="mt-0.5 text-[9px] uppercase tracking-wider text-mist-500">{d.monthShort}</div>
        </div>
        <Avatar name={r.counterpart} size="md" className="hidden sm:inline-flex" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="truncate text-sm font-semibold text-ink-900">{r.counterpart}</div>
            <Badge tone={STATUS_BADGE[r.status]}>{r.status}</Badge>
            {role === "clinic" && "level" in r && (
              <Badge tone="brand" className="!text-[10px]">{r.level}</Badge>
            )}
          </div>
          <div className="text-xs text-mist-500">{subtitle} · {r.city}</div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 text-[11px]">
            <span className="font-medium text-ink-800">{r.shift} · {r.start}–{r.end}</span>
            <span className="font-semibold text-brand-700 tabular-nums">{r.fee} €</span>
          </div>
        </div>
        <svg className="hidden h-4 w-4 text-mist-400 md:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
    </li>
  );
}

function ReservaDetail({ r, role }: { r: Reserva; role: Role }) {
  const d = formatDate(r.date);
  const subtitle = "specialty" in r ? r.specialty : r.role;
  return (
    <div className="rounded-2xl border border-mist-200 bg-white p-5 md:p-6 lg:sticky lg:top-24">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Detalle</div>
          <div className="mt-1 text-xl font-semibold tracking-tight text-ink-900">{r.counterpart}</div>
          <div className="text-xs text-mist-500">{subtitle} · {r.city}</div>
        </div>
        <Badge tone={STATUS_BADGE[r.status]}>{r.status}</Badge>
      </div>

      <div className="mt-5 rounded-xl border border-mist-200 bg-mist-50/40 p-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">Fecha</div>
        <div className="mt-1 text-sm font-semibold capitalize text-ink-900">{d.full}</div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-lg border border-mist-200 bg-white px-2.5 py-1.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">Turno</div>
            <div className="text-[13px] font-semibold text-ink-900">{r.shift}</div>
          </div>
          <div className="rounded-lg border border-mist-200 bg-white px-2.5 py-1.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">Horario</div>
            <div className="text-[13px] font-semibold tabular-nums text-ink-900">{r.start} – {r.end}</div>
          </div>
          <div className="rounded-lg border border-mist-200 bg-white px-2.5 py-1.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">Horas</div>
            <div className="text-[13px] font-semibold text-ink-900">{r.hours} h</div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/40 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-brand-700">{role === "professional" ? "Tarifa acordada" : "Coste estimado"}</div>
            <div className="text-lg font-semibold tabular-nums text-ink-900">{r.fee.toLocaleString("es")} €</div>
            <div className="text-[11px] text-mist-500">{r.rateLabel}</div>
          </div>
          {role === "clinic" && "rating" in r && (
            <div className="text-right">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">Valoración</div>
              <div className="text-base font-semibold text-ink-900">★ {r.rating.toFixed(1)}</div>
            </div>
          )}
        </div>
      </div>

      {r.message && (
        <div className="mt-4 rounded-xl border border-mist-200 p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">Mensaje recibido</div>
          <p className="mt-1 text-sm text-ink-800">{r.message}</p>
        </div>
      )}
      {r.notes && (
        <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50/60 p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">Notas</div>
          <p className="mt-1 text-xs text-ink-800">{r.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        {r.status === "pendiente" ? (
          <>
            <button className="rounded-lg border border-red-100 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50">Rechazar</button>
            <button className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700">Aceptar reserva</button>
          </>
        ) : r.status === "confirmada" ? (
          <>
            <button className="rounded-lg border border-mist-200 bg-white px-3 py-2 text-xs font-medium text-ink-800 hover:bg-mist-50">Reprogramar</button>
            <button className="rounded-lg bg-ink-900 px-3 py-2 text-xs font-semibold text-white hover:bg-ink-800">Abrir chat</button>
          </>
        ) : r.status === "completada" ? (
          <>
            <button className="rounded-lg border border-mist-200 bg-white px-3 py-2 text-xs font-medium text-ink-800 hover:bg-mist-50">Descargar factura</button>
            <button className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700">Dejar valoración</button>
          </>
        ) : (
          <button className="col-span-2 rounded-lg border border-mist-200 bg-white px-3 py-2 text-xs font-medium text-ink-800 hover:bg-mist-50">
            Solicitar nueva reserva
          </button>
        )}
      </div>
    </div>
  );
}
