"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { modalInputCls } from "@/components/ui/Modal";
import type { GeoResult } from "@/app/api/geocode/route";

export function AddressAutocomplete({
  value,
  onSelect,
  onTextChange,
  d,
}: {
  value: string;
  /** Se llama al elegir una sugerencia (dirección + ciudad + CP + lat/lng). */
  onSelect: (r: GeoResult) => void;
  /** Se llama al teclear (texto libre), por si guardas lo escrito sin elegir. */
  onTextChange?: (v: string) => void;
  d?: Record<string, string>;
}) {
  const [text, setText] = useState(value);
  const [results, setResults] = useState<GeoResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState({ left: 0, top: 0, width: 320 });
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  function place() {
    const r = inputRef.current?.getBoundingClientRect();
    if (r) setCoords({ left: r.left, top: r.bottom + 4, width: r.width });
  }

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  function onChange(v: string) {
    setText(v);
    onTextChange?.(v);
    clearTimeout(debounce.current);
    if (v.trim().length < 3) { setResults([]); setOpen(false); return; }
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(v.trim())}`);
        const data: GeoResult[] = res.ok ? await res.json() : [];
        setResults(data);
        place();
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500); // debounce holgado: respeta el límite de Nominatim (~1 req/s)
  }

  function pick(r: GeoResult) {
    setText(r.address);
    setOpen(false);
    onSelect(r);
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder={d?.addressPlaceholder ?? "Empieza a escribir una dirección…"}
        className={modalInputCls}
        autoComplete="off"
      />
      {loading && (
        <svg className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-mist-400" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.3" /><path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
      )}

      {open && results.length > 0 && typeof document !== "undefined" && createPortal(
        <>
          <div className="fixed inset-0" style={{ zIndex: 110 }} onClick={() => setOpen(false)} aria-hidden />
          <ul
            style={{ position: "fixed", left: coords.left, top: coords.top, width: coords.width, zIndex: 120 }}
            className="scale-in max-h-64 overflow-auto rounded-md border border-mist-200 bg-white py-1 text-left shadow-xl"
          >
            {results.map((r, i) => (
              <li key={`${r.lat},${r.lng},${i}`}>
                <button
                  type="button"
                  onClick={() => pick(r)}
                  className="flex w-full items-start gap-2.5 px-3 py-2 text-left text-sm hover:bg-mist-50"
                >
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-mist-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-6-5.3-6-10a6 6 0 0112 0c0 4.7-6 10-6 10z" /><circle cx="12" cy="11" r="2" /></svg>
                  <span className="text-ink-800">{r.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </>,
        document.body,
      )}
    </div>
  );
}
