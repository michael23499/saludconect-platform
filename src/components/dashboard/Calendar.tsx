import { cn } from "@/lib/cn";

type State = "free" | "morning" | "afternoon" | "both" | "blocked" | "reserved";

const TILE: Record<State, string> = {
  free: "bg-white border-mist-200 text-ink-800 hover:border-brand-300",
  morning: "bg-brand-50 border-brand-100 text-brand-800",
  afternoon: "bg-cyan-50 border-cyan-100 text-cyan-800",
  both: "bg-gradient-to-br from-brand-50 to-cyan-50 border-brand-100 text-ink-900",
  blocked: "bg-mist-100 border-mist-200 text-mist-400 line-through",
  reserved: "bg-ink-900 border-ink-900 text-white",
};

const LEGEND: Array<{ k: State; l: string }> = [
  { k: "morning", l: "Mañana" },
  { k: "afternoon", l: "Tarde" },
  { k: "both", l: "Día completo" },
  { k: "reserved", l: "Reservado" },
  { k: "blocked", l: "Bloqueado" },
];

export function MonthCalendar({
  month = "Mayo 2026",
  startDay = 4, // viernes = 4 (lun=0)
  days = 31,
  data,
}: {
  month?: string;
  startDay?: number;
  days?: number;
  data?: Record<number, State>;
}) {
  const cells: Array<{ d: number | null; s?: State }> = [];
  for (let i = 0; i < startDay; i++) cells.push({ d: null });
  for (let d = 1; d <= days; d++) cells.push({ d, s: data?.[d] || "free" });
  return (
    <div className="rounded-2xl border border-mist-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Calendario</div>
          <div className="text-lg font-semibold tracking-tight text-ink-900">{month}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-mist-200 text-ink-700 hover:bg-mist-50">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button className="inline-flex h-9 items-center justify-center rounded-lg border border-mist-200 px-3 text-xs font-medium text-ink-800 hover:bg-mist-50">
            Hoy
          </button>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-mist-200 text-ink-700 hover:bg-mist-50">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5 text-xs">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
          <div key={d} className="py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-mist-500">
            {d}
          </div>
        ))}
        {cells.map((c, i) => (
          <div
            key={i}
            className={cn(
              "aspect-square rounded-xl border p-1.5 text-[12px] font-medium transition",
              c.d ? TILE[c.s || "free"] : "border-transparent bg-transparent"
            )}
          >
            {c.d}
            {c.s === "morning" && <div className="mt-1 h-1 rounded-full bg-brand-400" />}
            {c.s === "afternoon" && <div className="mt-1 h-1 rounded-full bg-cyan-400" />}
            {c.s === "both" && (
              <div className="mt-1 flex gap-0.5">
                <div className="h-1 flex-1 rounded-full bg-brand-400" />
                <div className="h-1 flex-1 rounded-full bg-cyan-400" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {LEGEND.map((l) => (
          <span key={l.k} className="inline-flex items-center gap-1.5 text-xs text-mist-500">
            <span className={cn("h-3 w-3 rounded-md border", TILE[l.k])} />
            {l.l}
          </span>
        ))}
      </div>
    </div>
  );
}
