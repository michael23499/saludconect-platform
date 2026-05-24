"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  // Si la imagen falla al cargar (p.ej. avatar de Google bloqueado por el
  // referrer, o URL caída), caemos a las iniciales en vez de mostrar el icono
  // de imagen rota.
  const [failed, setFailed] = useState(false);

  const sizes = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
    xl: "h-20 w-20 text-lg",
  };
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const palette = [
    "from-brand-500 to-cyan-500",
    "from-ink-800 to-brand-600",
    "from-brand-700 to-brand-400",
    "from-cyan-500 to-brand-500",
    "from-indigo-600 to-brand-500",
  ];
  const grad = palette[hash % palette.length];
  const showImg = Boolean(src) && !failed;
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center overflow-hidden rounded-full font-semibold text-white bg-gradient-to-br ring-2 ring-white",
        grad,
        sizes[size],
        className
      )}
      aria-label={name}
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        initials
      )}
    </span>
  );
}
