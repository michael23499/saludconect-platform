import { cn } from "@/lib/cn";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const SIZES: Record<Size, { box: string; stroke: number }> = {
  xs: { box: "h-3 w-3", stroke: 5 },
  sm: { box: "h-4 w-4", stroke: 5 },
  md: { box: "h-5 w-5", stroke: 5 },
  lg: { box: "h-8 w-8", stroke: 4 },
  xl: { box: "h-14 w-14", stroke: 3.5 },
};

type Props = {
  size?: Size;
  className?: string;
  label?: string;
  /** Si quieres forzar color sólido en vez del gradiente brand→cyan */
  solid?: boolean;
};

/**
 * Spinner con identidad visual del proyecto: arco con gradiente brand→cyan
 * que rota. Si `solid` es true usa `currentColor` (útil para overlays sobre
 * fondos de color).
 */
export function Spinner({ size = "md", className, label = "Cargando…", solid = false }: Props) {
  const { box, stroke } = SIZES[size];
  const gradId = `spinner-grad-${size}`;
  return (
    <span
      role="status"
      aria-label={label}
      className={cn("inline-block animate-spin", box, className)}
    >
      <svg viewBox="0 0 50 50" className="h-full w-full" aria-hidden>
        {!solid && (
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--color-brand-600)" />
              <stop offset="100%" stopColor="var(--color-accent-400)" />
            </linearGradient>
          </defs>
        )}
        {/* Track sutil (anillo de fondo) */}
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.12"
          strokeWidth={stroke}
        />
        {/* Arco activo con gradiente brand→cyan */}
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={solid ? "currentColor" : `url(#${gradId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray="80 50"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}

/**
 * Overlay de página completa con spinner centrado y texto opcional.
 * Para usar dentro de `loading.tsx`.
 */
export function PageLoader({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center bg-mesh-light px-6">
      <div className="bg-dotgrid absolute inset-0 opacity-40" />
      <div className="relative flex flex-col items-center gap-4">
        <Spinner size="xl" label={label} />
        <p className="text-sm font-medium text-mist-500">{label}</p>
      </div>
    </div>
  );
}
