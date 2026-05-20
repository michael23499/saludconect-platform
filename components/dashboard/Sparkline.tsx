import { useId } from "react";
import { cn } from "@/lib/cn";

export function Sparkline({
  data,
  className,
  color = "#2563eb",
  fillFrom = "rgba(37,99,235,0.20)",
  fillTo = "rgba(37,99,235,0)",
  height = 36,
  animate = true,
  animationDelay = 0,
}: {
  data: number[];
  className?: string;
  color?: string;
  fillFrom?: string;
  fillTo?: string;
  height?: number;
  animate?: boolean;
  animationDelay?: number;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  if (data.length < 2) return null;
  const w = 100;
  const h = height;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = w / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return [x, y] as const;
  });
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  const id = `sl-${uid}`;
  const [lastX, lastY] = points[points.length - 1];
  const delayStyle = animationDelay ? { animationDelay: `${animationDelay}ms` } : undefined;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={cn("h-9 w-full", className)} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={fillFrom} />
          <stop offset="100%" stopColor={fillTo} />
        </linearGradient>
      </defs>
      <path
        d={area}
        fill={`url(#${id})`}
        className={animate ? "path-fill-in" : undefined}
        style={delayStyle}
      />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        className={animate ? "path-draw" : undefined}
        style={delayStyle}
      />
      {animate ? (
        <g className="path-fill-in" style={delayStyle ? { ...delayStyle, animationDelay: `${animationDelay + 1300}ms` } : { animationDelay: "1300ms" }}>
          <circle cx={lastX} cy={lastY} r="4" fill={color} opacity="0.18">
            <animate attributeName="r" values="3;6;3" dur="2.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.25;0;0.25" dur="2.2s" repeatCount="indefinite" />
          </circle>
          <circle cx={lastX} cy={lastY} r="2" fill={color} />
        </g>
      ) : (
        <circle cx={lastX} cy={lastY} r="2" fill={color} />
      )}
    </svg>
  );
}

export function KpiSparkCard({
  label,
  value,
  hint,
  tone = "neutral",
  spark,
  sparkColor = "#2563eb",
  sparkFillFrom = "rgba(37,99,235,0.20)",
  index = 0,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "up" | "down";
  spark: number[];
  sparkColor?: string;
  sparkFillFrom?: string;
  index?: number;
}) {
  const stagger = index * 90;
  return (
    <div
      className="card-hover group relative overflow-hidden rounded-2xl border border-mist-200 bg-white p-5"
      style={{ animationDelay: `${stagger}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-mist-500">{label}</div>
          <div
            className="count-pulse mt-2 text-3xl font-semibold tracking-tight text-ink-900 tabular-nums"
            style={{ animationDelay: `${stagger + 120}ms` }}
          >
            {value}
          </div>
          {hint && (
            <div
              className={cn(
                "count-pulse mt-1 inline-flex items-center gap-1 text-xs font-medium",
                tone === "up" && "text-emerald-600",
                tone === "down" && "text-red-600",
                tone === "neutral" && "text-mist-500"
              )}
              style={{ animationDelay: `${stagger + 240}ms` }}
            >
              {tone === "up" && (
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M6 14l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              )}
              {tone === "down" && (
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M6 10l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              )}
              {hint}
            </div>
          )}
        </div>
      </div>
      <div className="-mx-1 -mb-1 mt-3 transition-transform duration-300 group-hover:-translate-y-0.5">
        <Sparkline data={spark} color={sparkColor} fillFrom={sparkFillFrom} animationDelay={stagger + 200} />
      </div>
    </div>
  );
}
