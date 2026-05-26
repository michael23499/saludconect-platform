/**
 * Estrellas de solo lectura para mostrar una puntuación media. Rellena hasta el
 * entero más cercano y, opcionalmente, muestra el valor y el nº de valoraciones.
 * Para el control interactivo (dejar valoración) ver StarInput en ReviewModal.
 */
export function Stars({
  value,
  count,
  size = "sm",
}: {
  value: number;
  count?: number;
  size?: "sm" | "md";
}) {
  const full = Math.round(value);
  const px = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <span className="inline-flex items-center gap-1.5" title={`${value.toFixed(1)} / 5`}>
      <span className="inline-flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            className={`${px} ${i <= full ? "text-amber-400" : "text-mist-300"}`}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M12 2.3l2.95 5.98 6.6.96-4.77 4.65 1.13 6.57L12 17.98l-5.91 3.11 1.13-6.57L2.45 9.24l6.6-.96z" />
          </svg>
        ))}
      </span>
      {count != null && count > 0 && (
        <span className="text-xs font-semibold text-ink-700">
          {value.toFixed(1)} <span className="font-normal text-mist-500">({count})</span>
        </span>
      )}
    </span>
  );
}
