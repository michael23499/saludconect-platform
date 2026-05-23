"use client";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  name?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

export function AnimatedCheckbox({
  name,
  defaultChecked = false,
  checked: controlledChecked,
  onCheckedChange,
  required = false,
  children,
  className,
}: Props) {
  const id = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : uncontrolled;
  const [rippling, setRippling] = useState(false);

  const toggle = () => {
    const next = !checked;
    if (!isControlled) setUncontrolled(next);
    onCheckedChange?.(next);
    setRippling(true);
    window.setTimeout(() => setRippling(false), 650);
  };

  return (
    <label
      htmlFor={id}
      className={cn(
        "group relative flex cursor-pointer items-start gap-3 text-sm text-ink-800 select-none",
        className
      )}
    >
      <input
        id={id}
        name={name}
        type="checkbox"
        required={required}
        checked={checked}
        onChange={toggle}
        className="peer sr-only"
      />

      {/* Visual box */}
      <span className="relative mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center">
        {/* Ripple ring on toggle */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 rounded-md",
            rippling && "ac-ripple"
          )}
        />

        {/* Box outline */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 rounded-md border-2 transition-all duration-200",
            checked
              ? "border-brand-600 bg-gradient-to-br from-brand-500 to-cyan-500 shadow-[0_4px_10px_-4px_rgba(37,99,235,0.55)]"
              : "border-mist-300 bg-white group-hover:border-brand-400 peer-focus-visible:border-brand-500"
          )}
        />

        {/* Tick mark */}
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className={cn(
            "relative h-3.5 w-3.5 text-white transition-transform duration-200",
            checked ? "scale-100" : "scale-50"
          )}
          fill="none"
          stroke="currentColor"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            className={checked ? "ac-tick" : ""}
            style={{
              strokeDasharray: 24,
              strokeDashoffset: checked ? 0 : 24,
            }}
          />
        </svg>

        {/* Bump on toggle */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 rounded-md",
            checked && rippling && "ac-bump"
          )}
        />
      </span>

      <span
        className={cn(
          "transition-colors duration-200",
          checked ? "text-ink-900" : "text-ink-800"
        )}
      >
        {children}
      </span>
    </label>
  );
}
