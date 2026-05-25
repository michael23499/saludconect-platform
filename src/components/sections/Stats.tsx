import { CountUp } from "@/components/ui/CountUp";
import { getDict } from "@/lib/i18n-server";

type StatItem = {
  l: string;
  to: number;
  mode?: "number" | "duration";
  suffix?: string;
  prefix?: string;
  accent: string;
  glow: string;
  icon: React.ReactNode;
};

const STATS_META: Omit<StatItem, "l">[] = [
  {
    to: 5000,
    suffix: "+",
    accent: "from-ink-900 to-brand-600",
    glow: "rgba(10,22,51,0.30)",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="9" r="3.5" />
        <path d="M3 20a6 6 0 0112 0" strokeLinecap="round" />
        <circle cx="17" cy="10" r="2.5" />
        <path d="M14 20a4 4 0 018 0" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: 320,
    suffix: "+",
    accent: "from-brand-700 to-brand-500",
    glow: "rgba(30,64,175,0.28)",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 21V8l8-5 8 5v13" strokeLinejoin="round" />
        <path d="M9 21v-7h6v7" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: 252, // 4h 12m in minutes
    mode: "duration",
    accent: "from-brand-600 to-brand-400",
    glow: "rgba(37,99,235,0.28)",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: 96,
    suffix: "%",
    accent: "from-brand-500 to-brand-300",
    glow: "rgba(74,130,255,0.30)",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 12l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export async function Stats() {
  const labels = (await getDict()).sections.stats.labels;
  const STATS: StatItem[] = STATS_META.map((s, i) => ({ ...s, l: labels[i] }));
  return (
    <section className="relative overflow-hidden border-y border-mist-200 bg-white">
      {/* Subtle ambient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(60% 60% at 15% 50%, rgba(37,99,235,0.06) 0%, transparent 70%), radial-gradient(60% 60% at 85% 50%, rgba(6,182,212,0.06) 0%, transparent 70%)",
        }}
      />
      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-2 gap-x-4 gap-y-8 px-5 py-12 md:grid-cols-4 md:gap-x-6 md:gap-y-10 md:px-8 md:py-14">
        {STATS.map((s, i) => (
          <div
            key={s.l}
            className="stats-card fade-up group relative"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            {/* Glow on hover */}
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-4 rounded-3xl opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: `radial-gradient(50% 50% at 50% 50%, ${s.glow} 0%, transparent 70%)` }}
            />

            <div className="relative flex items-start gap-3">
              <span
                className={`mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${s.accent} text-white shadow-[0_8px_22px_-10px_rgba(37,99,235,0.55)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]`}
              >
                {s.icon}
              </span>
              <div className="min-w-0">
                <div
                  className={`bg-gradient-to-br ${s.accent} bg-clip-text text-3xl font-semibold tracking-tight md:text-4xl`}
                  style={{ color: "transparent" }}
                >
                  <CountUp
                    to={s.to}
                    duration={1700 + i * 150}
                    mode={s.mode}
                    suffix={s.suffix}
                    prefix={s.prefix}
                  />
                </div>
                <div className="mt-1 text-sm text-mist-500">{s.l}</div>
                {/* Animated accent underline */}
                <span
                  aria-hidden
                  className={`mt-2 block h-px w-12 origin-left scale-x-0 bg-gradient-to-r ${s.accent} transition-transform duration-700 group-hover:scale-x-100`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
