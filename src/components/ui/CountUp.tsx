"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Mode = "number" | "duration";

type Props = {
  to: number;
  from?: number;
  duration?: number;
  /** Built-in formatting mode. Use "duration" when value is in minutes ("X h Y m"). */
  mode?: Mode;
  prefix?: string;
  suffix?: string;
  /** Decimal places when mode is "number". */
  decimals?: number;
  /** Replay each time it scrolls into view. Default false. */
  replay?: boolean;
  className?: string;
};

function formatValue(n: number, mode: Mode, decimals: number) {
  if (mode === "duration") {
    const h = Math.floor(n / 60);
    const m = Math.round(n % 60);
    return `${h} h ${m} m`;
  }
  return n.toLocaleString("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function CountUp({
  to,
  from = 0,
  duration = 1600,
  mode = "number",
  prefix,
  suffix,
  decimals = 0,
  replay = false,
  className,
}: Props) {
  const [value, setValue] = useState<number>(from);
  const ref = useRef<HTMLSpanElement | null>(null);
  const playedRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const start = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      // Reduced motion: saltamos al valor final sin animar. Va dentro de start()
      // (lo invoca el observer al entrar en vista), no en el cuerpo del effect.
      if (reduce) {
        setValue(to);
        return;
      }
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        const eased = easeOutCubic(p);
        setValue(from + (to - from) * eased);
        if (p < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            if (!playedRef.current || replay) {
              playedRef.current = true;
              start();
            }
          } else if (replay) {
            setValue(from);
            playedRef.current = false;
          }
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [to, from, duration, replay]);

  const formatted = formatValue(value, mode, decimals);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
