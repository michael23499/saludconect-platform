import Link from "next/link";
import { cn } from "@/lib/cn";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "dark";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all whitespace-nowrap select-none disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)] hover:shadow-[0_14px_30px_-10px_rgba(37,99,235,0.7)]",
  secondary:
    "bg-white text-ink-900 border border-mist-200 hover:bg-mist-50 hover:border-mist-300",
  ghost:
    "bg-transparent text-ink-800 hover:bg-mist-100",
  outline:
    "bg-transparent text-white border border-white/30 hover:bg-white/10 hover:border-white/60",
  dark:
    "bg-ink-900 text-white hover:bg-ink-800",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-7 text-base",
};

type Common = { variant?: Variant; size?: Size; className?: string; children: ReactNode };

type ButtonAsButton = Common & ComponentProps<"button"> & { href?: undefined };
type ButtonAsLink = Common & { href: string } & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">;

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", className, children } = props;
  const cls = cn(base, variants[variant], sizes[size], className);
  if ("href" in props && props.href) {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } = props as ButtonAsButton;
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
