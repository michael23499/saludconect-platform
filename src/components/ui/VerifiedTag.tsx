/**
 * Insignia "Verificado" sutil y pulida: un check blanco dentro de un círculo
 * verde (estilo sello de verificación) + texto verde pequeño, sin fondo de pill.
 * Para fichas/listas de técnicos en el directorio y paneles. Dark-safe.
 */
export function VerifiedTag({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400"
      title={label}
    >
      <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-white">
        <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12l5 5L20 7" />
        </svg>
      </span>
      {label}
    </span>
  );
}
