import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type Tone = "brand" | "neutral" | "success" | "warning" | "danger" | "dark" | "accent";

const tones: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700 border-brand-100",
  neutral: "bg-mist-100 text-ink-800 border-mist-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-100",
  warning: "bg-amber-50 text-amber-700 border-amber-100",
  danger: "bg-red-50 text-red-700 border-red-100",
  dark: "bg-ink-900 text-white border-ink-800",
  accent: "bg-cyan-50 text-cyan-700 border-cyan-100",
};

export function Badge({
  children,
  tone = "neutral",
  className,
  icon,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium tracking-wide",
        tones[tone],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
