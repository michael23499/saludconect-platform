"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { SelectOption } from "./SelectMenu";

type Props = {
  options: SelectOption[];
  values: string[];
  onChange: (values: string[]) => void;
  /** Si se pasa, emite un <input hidden> por cada valor (FormData.getAll(name)). */
  name?: string;
  placeholder?: string;
  searchable?: boolean;
  searchAfter?: number;
  className?: string;
  ariaLabel?: string;
};

function normalize(options: SelectOption[]) {
  return options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
}

/**
 * Selector de MÚLTIPLES opciones con chips. Mismo lenguaje visual que SelectMenu
 * pero el dropdown NO se cierra al elegir (puedes marcar varias). Útil p.ej. para
 * las especialidades de una clínica.
 */
export function MultiSelectMenu({
  options,
  values,
  onChange,
  name,
  placeholder = "Selecciona…",
  searchable,
  searchAfter = 8,
  className,
  ariaLabel,
}: Props) {
  const normalized = useMemo(() => normalize(options), [options]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  const showSearch = searchable ?? normalized.length > searchAfter;
  const filtered = useMemo(() => {
    if (!query) return normalized;
    const q = query.toLowerCase();
    return normalized.filter((o) => o.label.toLowerCase().includes(q));
  }, [query, normalized]);

  const selected = normalized.filter((o) => values.includes(o.value));

  const toggle = (value: string) => {
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);
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
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open && showSearch) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open, showSearch]);

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      {name && values.map((v) => <input key={v} type="hidden" name={name} value={v} />)}
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border bg-white px-3 py-1.5 text-left text-[15px] outline-none transition",
          open ? "border-brand-500 ring-4 ring-brand-500/15" : "border-mist-200 hover:border-mist-300"
        )}
      >
        {selected.length > 0 ? (
          <span className="flex flex-wrap gap-1.5 py-0.5">
            {selected.map((o) => (
              <span
                key={o.value}
                className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-1 text-[13px] font-medium text-brand-800"
              >
                {o.label}
                <span
                  role="button"
                  tabIndex={-1}
                  aria-label={`Quitar ${o.label}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(o.value);
                  }}
                  className="-mr-0.5 flex h-4 w-4 items-center justify-center rounded text-brand-500 hover:bg-brand-100 hover:text-brand-800"
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </span>
              </span>
            ))}
          </span>
        ) : (
          <span className="py-1 text-mist-400">{placeholder}</span>
        )}
        <svg
          className={cn("h-4 w-4 shrink-0 self-center text-mist-400 transition-transform", open && "rotate-180")}
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
        <div className="combobox-pop absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-mist-200 bg-white shadow-[0_20px_50px_-20px_rgba(15,23,42,0.25)]">
          {showSearch && (
            <div className="border-b border-mist-100 p-2">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar…"
                className="h-9 w-full rounded-lg border border-mist-200 bg-white px-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
              />
            </div>
          )}
          <ul id={`${id}-list`} role="listbox" aria-multiselectable className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3.5 py-2.5 text-sm text-mist-400">Sin resultados</li>
            ) : (
              filtered.map((o) => {
                const isSel = values.includes(o.value);
                return (
                  <li
                    key={o.value}
                    role="option"
                    aria-selected={isSel}
                    onClick={() => toggle(o.value)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 px-3.5 py-2 text-[14px] transition",
                      isSel ? "text-brand-800" : "text-ink-800 hover:bg-brand-50"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition",
                        isSel ? "border-brand-600 bg-brand-600 text-white" : "border-mist-300 bg-white"
                      )}
                    >
                      {isSel && (
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M5 12l4.5 4.5L19 7" />
                        </svg>
                      )}
                    </span>
                    <span className="min-w-0 truncate">{o.label}</span>
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
