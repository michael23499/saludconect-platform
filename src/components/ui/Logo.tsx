import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({
  className,
  variant = "dark",
  withWordmark = true,
}: {
  className?: string;
  variant?: "dark" | "light";
  withWordmark?: boolean;
}) {
  const text = variant === "dark" ? "text-ink-900" : "text-white";
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-cyan-500 shadow-[0_10px_24px_-8px_rgba(37,99,235,0.6)] transition group-hover:scale-[1.03]">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 3v18" />
          <path d="M3 12h18" />
          <circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none" />
        </svg>
        <span className="pointer-events-none absolute -inset-0.5 -z-10 rounded-xl bg-cyan-400/30 blur-md opacity-0 transition group-hover:opacity-100" />
      </span>
      {withWordmark && (
        <span className={cn("text-[17px] font-semibold tracking-tight", text)}>
          Salud<span className="text-brand-500">Co</span>Net
        </span>
      )}
    </Link>
  );
}
