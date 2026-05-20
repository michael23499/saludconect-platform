import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-20 md:py-28", className)}>
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className
      )}
    >
      {eyebrow && (
        <div
          className={cn(
            "mb-4 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700"
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          {eyebrow}
        </div>
      )}
      <h2 className="text-balance text-3xl font-semibold tracking-tight text-ink-900 md:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-pretty text-base text-mist-500 md:text-lg">{description}</p>
      )}
    </div>
  );
}
