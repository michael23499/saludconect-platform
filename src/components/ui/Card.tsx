import { cn } from "@/lib/cn";
import type { ReactNode, ElementType } from "react";

export function Card({
  children,
  className,
  hover = false,
  as,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  as?: ElementType;
}) {
  const Comp: ElementType = as || "div";
  return (
    <Comp
      className={cn(
        "rounded-2xl border border-mist-200 bg-white p-6 shadow-[var(--shadow-soft)]",
        hover && "card-hover",
        className
      )}
    >
      {children}
    </Comp>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mb-4 flex items-start justify-between gap-3", className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn("text-lg font-semibold text-ink-900", className)}>{children}</h3>;
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-sm text-mist-500", className)}>{children}</p>;
}
