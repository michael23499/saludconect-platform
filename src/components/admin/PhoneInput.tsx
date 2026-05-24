"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { COUNTRIES, flagUrl, parsePhone, type Country } from "@/lib/countries";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Solo dígitos, agrupados de 3 en 3 para legibilidad: "627117935" → "627 117 935". */
const groupDigits = (s: string) => s.replace(/\D/g, "").replace(/(\d{3})(?=\d)/g, "$1 ");

export function PhoneInput({
  value,
  onChange,
  placeholder,
  d,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  d?: Record<string, string>;
}) {
  const [{ country, number }, setState] = useState(() => {
    const p = parsePhone(value);
    return { country: p.country, number: groupDigits(p.number) };
  });
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState({ left: 0, top: 0, width: 300 });
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    // NO escuchamos "scroll": cerraba el desplegable al intentar scrollear la
    // propia lista de países. El cierre lo maneja el backdrop (click fuera).
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, [open]);

  function emit(c: Country, n: string) {
    onChange(n.trim() ? `${c.dial} ${n.trim()}` : "");
  }
  function toggle() {
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setCoords({ left: r.left, top: r.bottom + 6, width: Math.max(r.width, 300) });
    setQuery("");
    setOpen((v) => !v);
  }

  const filtered = query.trim()
    ? COUNTRIES.filter((c) => norm(c.name).includes(norm(query)) || c.dial.includes(query.trim()))
    : COUNTRIES;

  return (
    <div>
      <div className="flex h-11 w-full items-stretch">
        <button
          ref={btnRef}
          type="button"
          onClick={toggle}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex shrink-0 items-center gap-1.5 rounded-l-sm border border-mist-200 bg-mist-50/60 px-3 text-sm text-ink-700 transition hover:bg-mist-100"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={flagUrl(country.code)} alt={country.name} width={20} height={15} className="w-5 rounded-sm" />
          <span className="font-medium">{country.dial}</span>
          <svg className="h-3.5 w-3.5 text-mist-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
        </button>
        <input
          type="tel"
          inputMode="tel"
          value={number}
          onChange={(e) => { const n = groupDigits(e.target.value); setState((s) => ({ ...s, number: n })); emit(country, n); }}
          placeholder={placeholder ?? "600 000 000"}
          className="min-w-0 flex-1 rounded-r-sm border border-l-0 border-mist-200 bg-white px-3.5 text-sm text-ink-900 outline-none transition placeholder:text-mist-400 focus:border-brand-500"
        />
      </div>

      {open && typeof document !== "undefined" && createPortal(
        <>
          <div className="fixed inset-0" style={{ zIndex: 110 }} onClick={() => setOpen(false)} aria-hidden />
          <div
            style={{ position: "fixed", left: coords.left, top: coords.top, width: coords.width, zIndex: 120, maxHeight: "min(340px, 60vh)", display: "flex", flexDirection: "column" }}
            className="scale-in overflow-hidden rounded-md border border-mist-200 bg-white text-left shadow-xl"
          >
            <div className="shrink-0 border-b border-mist-100 p-2">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={d?.searchCountry ?? "Buscar país…"}
                className="h-9 w-full rounded-sm border border-mist-200 px-3 text-sm text-ink-900 outline-none focus:border-brand-500"
              />
            </div>
            <ul role="listbox" className="py-1" style={{ maxHeight: 240, overflowY: "auto" }}>
              {filtered.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => { setState((s) => ({ ...s, country: c })); setOpen(false); emit(c, number); }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-mist-50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={flagUrl(c.code)} alt="" width={20} height={15} className="w-5 rounded-sm" />
                    <span className="flex-1 truncate text-ink-800">{c.name}</span>
                    <span className="text-mist-500">{c.dial}</span>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && <li className="px-3 py-4 text-center text-sm text-mist-400">{d?.noCountryResults ?? "Sin resultados"}</li>}
            </ul>
          </div>
        </>,
        document.body,
      )}
    </div>
  );
}
