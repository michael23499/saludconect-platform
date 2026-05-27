"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { useApp } from "@/components/providers/Providers";

const LBL = {
  es: { select: "Selecciona…", search: "Buscar…", noResults: "Sin resultados" },
  en: { select: "Select…", search: "Search…", noResults: "No results" },
};

export type SelectOption = string | { value: string; label: string; hint?: string };

type Props = {
  options: SelectOption[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  name?: string;
  searchable?: boolean;
  searchAfter?: number;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
};

function normalize(options: SelectOption[]) {
  return options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
}

export function SelectMenu({
  options,
  defaultValue = "",
  value: controlled,
  onChange,
  placeholder,
  name,
  searchable,
  searchAfter = 8,
  className,
  disabled,
  ariaLabel,
}: Props) {
  const { lang } = useApp();
  const L = LBL[lang];
  const ph = placeholder ?? L.select;
  const normalized = useMemo(() => normalize(options), [options]);
  const [inner, setInner] = useState(defaultValue);
  const value = controlled !== undefined ? controlled : inner;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  // Al elegir una opción el dropdown se cierra de forma síncrona; el click puede
  // "reasignarse" al trigger (ghost click) y reabrirlo. Marcamos el instante del
  // cierre para que el trigger ignore ese click fantasma inmediato.
  const closedAtRef = useRef(0);
  const id = useId();

  const showSearch = searchable ?? normalized.length > searchAfter;

  const filtered = useMemo(() => {
    if (!query) return normalized;
    const q = query.toLowerCase();
    return normalized.filter((o) => o.label.toLowerCase().includes(q));
  }, [query, normalized]);

  const current = normalized.find((o) => o.value === value);

  const setValue = (next: string) => {
    if (controlled === undefined) setInner(next);
    onChange?.(next);
  };

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(filtered.length - 1, i < 0 ? 0 : i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(0, (i < 0 ? 0 : i) - 1));
      } else if (e.key === "Home") {
        e.preventDefault();
        setActiveIdx(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setActiveIdx(filtered.length - 1);
      } else if (e.key === "Enter") {
        if (activeIdx >= 0 && filtered[activeIdx]) {
          e.preventDefault();
          setValue(filtered[activeIdx].value);
          setOpen(false);
          setQuery("");
          triggerRef.current?.focus();
        }
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, filtered, activeIdx]);

  useEffect(() => {
    if (!open) return;
    if (showSearch) setTimeout(() => inputRef.current?.focus(), 0);
    const i = normalized.findIndex((o) => o.value === value);
    // Sincroniza el índice activo y limpia la búsqueda al abrir el menú.
    // setState puntual de apertura (no cascada): falso positivo de la regla.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIdx(i >= 0 ? i : 0);
    setQuery("");
  }, [open, showSearch, normalized, value]);

  useEffect(() => {
    if (!open || activeIdx < 0) return;
    const node = listRef.current?.querySelector<HTMLLIElement>(`[data-idx="${activeIdx}"]`);
    node?.scrollIntoView({ block: "nearest" });
  }, [activeIdx, open]);

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={ariaLabel}
        onClick={() => {
          if (disabled) return;
          // Ignora el click fantasma que llega al trigger justo tras elegir una
          // opción (si no, reabriría el menú recién cerrado).
          if (Date.now() - closedAtRef.current < 300) return;
          setOpen((o) => !o);
        }}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 text-left text-[15px] outline-none transition",
          open
            ? "border-brand-500 ring-4 ring-brand-500/15"
            : "border-mist-200 hover:border-mist-300",
          current ? "text-ink-900 font-medium" : "text-mist-400",
          disabled && "cursor-not-allowed bg-mist-50 opacity-60"
        )}
      >
        <span className="truncate">{current?.label || ph}</span>
        <svg
          className={cn("h-4 w-4 shrink-0 text-mist-400 transition-transform", open && "rotate-180")}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          className="combobox-pop absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-mist-200 bg-white shadow-[0_20px_50px_-20px_rgba(15,23,42,0.25)]"
        >
          {showSearch && (
            <div className="border-b border-mist-100 p-2">
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIdx(0);
                  }}
                  placeholder={L.search}
                  className="h-9 w-full rounded-lg border border-mist-200 bg-white pl-8 pr-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
                />
              </div>
            </div>
          )}
          <ul
            ref={listRef}
            id={`${id}-list`}
            role="listbox"
            className="max-h-64 overflow-y-auto py-1"
            tabIndex={-1}
          >
            {filtered.length === 0 ? (
              <li className="px-3.5 py-2.5 text-sm text-mist-400">{L.noResults}</li>
            ) : (
              filtered.map((o, idx) => {
                const selected = o.value === value;
                const active = idx === activeIdx;
                return (
                  <li
                    key={o.value}
                    role="option"
                    aria-selected={selected}
                    data-idx={idx}
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => {
                      setValue(o.value);
                      setOpen(false);
                      setQuery("");
                      closedAtRef.current = Date.now();
                      triggerRef.current?.focus();
                    }}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-2 px-3.5 py-2 text-[14px] transition",
                      active
                        ? "bg-brand-50 text-brand-800 dark:bg-white/10 dark:text-white"
                        : selected
                          ? "text-brand-800 dark:text-cyan-300"
                          : "text-ink-800"
                    )}
                  >
                    <span className="min-w-0 truncate">
                      {o.label}
                      {o.hint && <span className="ml-2 text-xs text-mist-400">{o.hint}</span>}
                    </span>
                    {selected && (
                      <svg className="h-4 w-4 shrink-0 text-brand-600 dark:text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
                        <path d="M5 12l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
