"use client";
import { LEVELS, BADGES, type ReputationLevel, type ReputationBadge as Badge } from "@/lib/reputation";
import { useApp } from "@/components/providers/Providers";
import { cn } from "@/lib/cn";

export function LevelChip({ level, className }: { level: ReputationLevel; className?: string }) {
  const { lang } = useApp();
  const L = LEVELS[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
        L.color,
        className
      )}
      title={L.description[lang]}
    >
      <LevelGem level={level} />
      {L.label[lang]}
    </span>
  );
}

export function LevelGem({ level, size = 12 }: { level: ReputationLevel; size?: number }) {
  // diamond shape colored per level
  const grad: Record<ReputationLevel, string> = {
    rookie: "from-mist-300 to-mist-400",
    rising: "from-amber-300 to-amber-500",
    trusted: "from-brand-400 to-brand-600",
    top: "from-cyan-300 to-brand-500",
    expert: "from-indigo-400 to-brand-600",
    elite: "from-cyan-400 via-brand-500 to-indigo-500",
  };
  return (
    <span
      className={cn("inline-block rotate-45 rounded-[2px] bg-gradient-to-br", grad[level])}
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}

export function BadgeChip({ b }: { b: Badge }) {
  const { lang } = useApp();
  const meta = BADGES[b];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium", meta.tone)}>
      <span>{meta.icon}</span>
      {meta[lang]}
    </span>
  );
}

export function StarRow({ value }: { value: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full;
        const hf = i === full && half;
        return (
          <svg key={i} viewBox="0 0 24 24" className="h-3.5 w-3.5" fill={filled ? "currentColor" : hf ? "url(#half)" : "none"} stroke="currentColor" strokeWidth="1.5" style={{ color: "#f59e0b" }}>
            {hf && (
              <defs>
                <linearGradient id="half">
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
            )}
            <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 7L12 17.8 5.8 21.2 7 14.2l-5-4.9 6.9-1L12 2z" strokeLinejoin="round" />
          </svg>
        );
      })}
    </span>
  );
}
