"use client";
import { useState, useEffect, useId } from "react";
import { cn } from "@/lib/cn";

type Range = "3m" | "6m" | "12m";

const SERIES: Record<Range, { data: number[]; labels: string[]; subtitle: string; total: number; trend: string }> = {
  "3m": {
    data: [42, 51, 38, 60, 72, 55, 80, 67, 90, 84, 95, 88, 103],
    labels: ["Sem -12", "Sem -9", "Sem -6", "Sem -3", "Hoy"],
    subtitle: "Reservas confirmadas · últimos 3 meses",
    total: 925,
    trend: "+22,8%",
  },
  "6m": {
    data: [88, 95, 102, 118, 126, 140, 155, 168, 182, 196, 210, 228],
    labels: ["Dic", "Ene", "Feb", "Mar", "Abr", "May"],
    subtitle: "Reservas confirmadas · últimos 6 meses",
    total: 1808,
    trend: "+20,5%",
  },
  "12m": {
    data: [180, 215, 240, 268, 290, 312, 348, 372, 410, 432, 478, 520],
    labels: ["Jun", "Ago", "Oct", "Dic", "Feb", "Abr"],
    subtitle: "Reservas confirmadas · últimos 12 meses",
    total: 4565,
    trend: "+18,4%",
  },
};

const TABS: Array<{ value: Range; label: string }> = [
  { value: "3m", label: "3 m" },
  { value: "6m", label: "6 m" },
  { value: "12m", label: "12 m" },
];

export function ActivityChart() {
  const [range, setRange] = useState<Range>("3m");
  const [animKey, setAnimKey] = useState(0);
  const series = SERIES[range];

  // Trigger animation on range change
  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [range]);

  return (
    <div className="rounded-2xl border border-mist-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Actividad</div>
          <div className="text-lg font-semibold tracking-tight text-ink-900">{series.subtitle}</div>
          <div className="mt-1 flex items-center gap-2 text-xs">
            <span className="font-semibold text-ink-900">{series.total.toLocaleString("es-ES")}</span>
            <span className="text-mist-500">reservas</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 14l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {series.trend}
            </span>
          </div>
        </div>

        {/* Segmented tabs with sliding thumb */}
        <SegmentedTabs value={range} onChange={setRange} />
      </div>

      <div className="mt-6">
        <AnimatedAreaChart key={animKey} data={series.data} />
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-mist-400">
        {series.labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
}

function SegmentedTabs({ value, onChange }: { value: Range; onChange: (v: Range) => void }) {
  const idx = TABS.findIndex((t) => t.value === value);
  const widthPct = 100 / TABS.length;
  return (
    <div className="relative inline-flex rounded-lg border border-mist-200 bg-mist-50 p-1 text-xs font-medium">
      {/* Sliding thumb */}
      <span
        className="absolute top-1 bottom-1 rounded-md bg-white shadow-sm ring-1 ring-mist-200 transition-all duration-300 ease-[cubic-bezier(.22,.61,.36,1)]"
        style={{ width: `calc(${widthPct}% - 0.25rem)`, left: `calc(${idx * widthPct}% + 0.125rem)` }}
        aria-hidden
      />
      {TABS.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          aria-pressed={value === t.value}
          className={cn(
            "relative z-10 inline-flex h-7 items-center justify-center px-3 transition-colors duration-200",
            value === t.value ? "text-ink-900" : "text-mist-500 hover:text-ink-800"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function AnimatedAreaChart({ data }: { data: number[] }) {
  const id = useId().replace(/:/g, "");
  const w = 600;
  const h = 140;
  const padTop = 8;
  const padBot = 6;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = w / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = h - padBot - ((v - min) / range) * (h - padTop - padBot);
    return [x, y] as const;
  });
  const line = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  // Length estimate for stroke-dasharray animation
  const lineLen = points.reduce((acc, p, i) => {
    if (i === 0) return acc;
    const [x1, y1] = points[i - 1];
    const [x2, y2] = p;
    return acc + Math.hypot(x2 - x1, y2 - y1);
  }, 0);

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="h-32 w-full overflow-visible"
      aria-hidden
    >
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(37,99,235,0.30)" />
          <stop offset="100%" stopColor="rgba(37,99,235,0)" />
        </linearGradient>
        <clipPath id={`clip-${id}`}>
          <rect className="reveal-clip" x="0" y="0" width={w} height={h} />
        </clipPath>
      </defs>
      <g clipPath={`url(#clip-${id})`}>
        <path d={area} fill={`url(#grad-${id})`} className="area-fade" />
      </g>
      <path
        d={line}
        fill="none"
        stroke="#2563eb"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        className="line-draw"
        style={{
          strokeDasharray: lineLen,
          strokeDashoffset: lineLen,
        }}
      />
      {points.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="2.5"
          fill="#2563eb"
          className="dot-pop"
          style={{ animationDelay: `${0.6 + i * 0.03}s` }}
          opacity="0"
        />
      ))}
    </svg>
  );
}
