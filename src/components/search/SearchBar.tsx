"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useApp } from "@/components/providers/Providers";

type Option = string;

type FieldKey = "ciudad" | "profesion" | "especialidad" | "turno";

const COPY = {
  es: {
    q: { label: "Qué buscas", ph: "Nombre, especialidad, ciudad…" },
    ciudad: { label: "Ciudad", ph: "Cualquier ciudad" },
    profesion: { label: "Profesión", ph: "Cualquier profesión" },
    especialidad: { label: "Especialidad", ph: "Cualquier especialidad" },
    turno: { label: "Turno", ph: "Cualquier turno" },
    search: "Buscar",
    clear: "Limpiar todo",
    chips: "Sugerencias",
    liveOnline: "324 profesionales online",
    liveBookings: "4 jornadas reservadas en los últimos 5 min",
    verified: "100% verificados",
    noOption: "Cualquiera",
  },
  en: {
    q: { label: "What you need", ph: "Name, specialty, city…" },
    ciudad: { label: "City", ph: "Any city" },
    profesion: { label: "Profession", ph: "Any profession" },
    especialidad: { label: "Specialty", ph: "Any specialty" },
    turno: { label: "Shift", ph: "Any shift" },
    search: "Search",
    clear: "Clear all",
    chips: "Try",
    liveOnline: "324 professionals online",
    liveBookings: "4 bookings in the last 5 min",
    verified: "100% verified",
    noOption: "Any",
  },
};

export function SearchBar({
  initial,
  ciudades,
  profesiones,
  especialidades,
  turnos = ["Mañana", "Tarde", "Ambos"],
}: {
  initial: Partial<Record<"q" | FieldKey, string>>;
  ciudades: Option[];
  profesiones: Option[];
  especialidades: Option[];
  turnos?: Option[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { lang } = useApp();
  const t = COPY[lang];

  const [q, setQ] = useState(initial.q || "");
  const [ciudad, setCiudad] = useState(initial.ciudad || "");
  const [profesion, setProfesion] = useState(initial.profesion || "");
  const [especialidad, setEspecialidad] = useState(initial.especialidad || "");
  const [turno, setTurno] = useState(initial.turno || "");
  const [openField, setOpenField] = useState<FieldKey | null>(null);
  const [isPending, startTransition] = useTransition();
  const initializedRef = useRef(false);

  const buildUrl = (overrides?: Record<string, string>) => {
    const params = new URLSearchParams();
    const final = { q, ciudad, profesion, especialidad, turno, ...overrides };
    Object.entries(final).forEach(([k, v]) => { if (v) params.set(k, v); });
    return `/search${params.toString() ? `?${params.toString()}` : ""}`;
  };

  const submit = (overrides?: Record<string, string>) => {
    router.push(buildUrl(overrides));
  };

  // Live search: debounced URL push as the user types `q`.
  // Only auto-navigates when we're already on /search (so the home hero
  // doesn't whisk users away on first keystroke).
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }
    if (pathname !== "/search") return;
    const handle = setTimeout(() => {
      startTransition(() => {
        router.replace(buildUrl({ q }));
      });
    }, 250);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const clearAll = () => {
    setQ(""); setCiudad(""); setProfesion(""); setEspecialidad(""); setTurno("");
    router.push("/search");
  };

  const hasAny = q || ciudad || profesion || especialidad || turno;

  return (
    <div className="relative">
      {/* Glow ring */}
      <div className="pointer-events-none absolute -inset-1 rounded-[28px] bg-gradient-to-r from-brand-500/40 via-cyan-400/30 to-brand-500/40 opacity-60 blur-xl" />
      <div className="relative rounded-[26px] border border-white/15 bg-white/[0.06] p-2 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <div className="rounded-[20px] bg-white p-2">
          {/* Top row: full-width search input */}
          <div className="border-b border-mist-100 pb-2">
            <SearchField label={t.q.label} icon={<IconSearch />}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
                placeholder={t.q.ph}
                className="block w-full bg-transparent text-[14px] font-medium text-ink-900 placeholder:text-mist-400 outline-none focus:outline-none focus-visible:shadow-none"
              />
            </SearchField>
          </div>

          {/* Bottom row: filters + CTA */}
          <div className="mt-2 grid gap-2 md:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:gap-x-1">
            <Combobox
              label={t.ciudad.label}
              placeholder={t.ciudad.ph}
              value={ciudad}
              onChange={(v) => { setCiudad(v); submit({ ciudad: v }); }}
              options={ciudades}
              noOption={t.noOption}
              icon={<IconPin />}
              open={openField === "ciudad"}
              onOpenChange={(o) => setOpenField(o ? "ciudad" : null)}
              divider
            />
            <Combobox
              label={t.profesion.label}
              placeholder={t.profesion.ph}
              value={profesion}
              onChange={(v) => { setProfesion(v); submit({ profesion: v }); }}
              options={profesiones}
              noOption={t.noOption}
              icon={<IconBriefcase />}
              open={openField === "profesion"}
              onOpenChange={(o) => setOpenField(o ? "profesion" : null)}
              divider
            />
            <Combobox
              label={t.especialidad.label}
              placeholder={t.especialidad.ph}
              value={especialidad}
              onChange={(v) => { setEspecialidad(v); submit({ especialidad: v }); }}
              options={especialidades}
              noOption={t.noOption}
              icon={<IconHeart />}
              open={openField === "especialidad"}
              onOpenChange={(o) => setOpenField(o ? "especialidad" : null)}
              divider
            />
            <Combobox
              label={t.turno.label}
              placeholder={t.turno.ph}
              value={turno}
              onChange={(v) => { setTurno(v); submit({ turno: v }); }}
              options={turnos}
              noOption={t.noOption}
              icon={<IconClock />}
              open={openField === "turno"}
              onOpenChange={(o) => setOpenField(o ? "turno" : null)}
            />

            <button
              type="button"
              onClick={() => submit()}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 px-6 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(37,99,235,0.7)] transition hover:from-brand-700 hover:to-brand-600 md:col-span-2 lg:col-span-1 lg:h-auto lg:self-stretch"
            >
              <IconSearch className="h-4 w-4" />
              {t.search}
            </button>
          </div>
        </div>
      </div>

      {/* Fila inferior: chips de sugerencia o resumen de resultados.
          Se oculta cuando hay un combobox abierto para no quedar asomada bajo el dropdown. */}
      <div
        aria-hidden={openField !== null}
        className={cn(
          "transition-opacity duration-150",
          openField !== null && "pointer-events-none opacity-0"
        )}
      >
        {!hasAny ? (
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/70">
            <span className="inline-flex items-center gap-2">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="font-medium text-white/90">{t.liveOnline}</span>
            </span>
            <span className="hidden text-white/25 md:inline">·</span>
            <span>{t.liveBookings}</span>
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-medium text-white/90 backdrop-blur">
              <svg className="h-3 w-3 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
                <path d="M5 12l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t.verified}
            </span>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2 text-xs text-white/70">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
              <circle cx="12" cy="12" r="9" /><path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {lang === "es" ? "Resultados actualizados a continuación." : "Results updated below."}
            <button
              type="button"
              onClick={clearAll}
              className="ml-auto text-white/60 underline-offset-4 hover:text-white hover:underline"
            >
              {t.clear}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchField({
  label,
  icon,
  children,
  className,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("group relative flex items-center gap-3 rounded-2xl px-4 py-3 transition hover:bg-mist-50 focus-within:bg-mist-50", className)}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-100 group-focus-within:bg-brand-100">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-mist-500">{label}</div>
        <div className="-mt-0.5">{children}</div>
      </div>
    </div>
  );
}

function Combobox({
  label,
  placeholder,
  value,
  onChange,
  options,
  noOption,
  icon,
  divider = false,
  open: controlledOpen,
  onOpenChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  noOption: string;
  icon: React.ReactNode;
  divider?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const filtered = options.filter((o) => o.toLowerCase().includes(query.toLowerCase()));

  return (
    <div ref={ref} className={cn("relative", divider && "lg:border-r lg:border-mist-100")}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-mist-50",
          "focus:outline-none focus-visible:bg-mist-50 focus-visible:shadow-none",
          open && "bg-mist-50"
        )}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-100">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-mist-500">{label}</span>
          <span className={cn("block truncate text-[14px] font-medium", value ? "text-ink-900" : "text-mist-400")}>
            {value || placeholder}
          </span>
        </span>
        <svg className={cn("h-3.5 w-3.5 shrink-0 text-mist-400 transition", open && "rotate-180 text-brand-600")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop that visually pushes everything below the dropdown */}
          <div
            className="fixed inset-0 z-[55] bg-ink-950/30 backdrop-blur-[3px] md:bg-ink-950/10 md:backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          <div
            role="listbox"
            className="combobox-pop absolute left-0 right-0 top-[calc(100%+10px)] z-[60] w-[280px] overflow-hidden rounded-2xl border border-mist-200 bg-white shadow-[0_24px_60px_-20px_rgba(10,22,51,0.45),0_8px_20px_-8px_rgba(10,22,51,0.22)] md:left-auto md:w-[320px]"
            style={{ maxWidth: "calc(100vw - 32px)" }}
          >
            {/* Header with label + search */}
            <div className="border-b border-mist-100 bg-mist-50/60 px-3 py-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-mist-500">
                  <span className="grid h-5 w-5 place-items-center rounded-md bg-white text-brand-600 ring-1 ring-mist-200">
                    {icon}
                  </span>
                  {label}
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar"
                  className="inline-flex h-5 w-5 items-center justify-center rounded-md text-mist-400 hover:bg-white hover:text-ink-700"
                >
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" /></svg>
                </button>
              </div>
              {options.length > 5 && (
                <div className="relative">
                  <svg className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mist-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <circle cx="11" cy="11" r="7" /><path d="M20 20l-3-3" strokeLinecap="round" />
                  </svg>
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`Buscar ${label.toLowerCase()}…`}
                    className="w-full rounded-lg border border-mist-200 bg-white pl-8 pr-3 py-2 text-[13px] text-ink-900 outline-none placeholder:text-mist-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
                  />
                </div>
              )}
            </div>

            {/* Options list */}
            <div className="max-h-[260px] overflow-y-auto p-1.5">
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); setQuery(""); }}
                role="option"
                aria-selected={!value}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-[13.5px] font-medium transition",
                  !value ? "bg-brand-50 text-brand-700" : "text-ink-800 hover:bg-mist-50"
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-mist-300" />
                  {noOption}
                </span>
                {!value && <CheckIcon />}
              </button>

              {filtered.length > 0 && <div className="my-1 h-px bg-mist-100" />}

              {filtered.map((o) => {
                const active = value === o;
                // Highlight matched substring
                const q = query.trim();
                let display: React.ReactNode = o;
                if (q) {
                  const i = o.toLowerCase().indexOf(q.toLowerCase());
                  if (i >= 0) {
                    display = (
                      <>
                        {o.slice(0, i)}
                        <mark className="rounded bg-brand-100 px-0.5 text-brand-800">{o.slice(i, i + q.length)}</mark>
                        {o.slice(i + q.length)}
                      </>
                    );
                  }
                }
                return (
                  <button
                    key={o}
                    type="button"
                    onClick={() => { onChange(o); setOpen(false); setQuery(""); }}
                    role="option"
                    aria-selected={active}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-[13.5px] transition",
                      active ? "bg-brand-600 font-semibold text-white shadow-[0_6px_14px_-6px_rgba(37,99,235,0.5)]" : "text-ink-800 hover:bg-mist-50"
                    )}
                  >
                    <span className="truncate">{display}</span>
                    {active && (
                      <svg className="h-4 w-4 shrink-0 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
                        <path d="M5 12l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                );
              })}

              {filtered.length === 0 && (
                <div className="py-6 text-center">
                  <div className="mx-auto inline-flex h-9 w-9 items-center justify-center rounded-xl bg-mist-100 text-mist-400">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3-3" strokeLinecap="round" /></svg>
                  </div>
                  <div className="mt-2 text-xs font-medium text-ink-800">Sin coincidencias</div>
                  <div className="text-[11px] text-mist-500">Prueba con otra palabra clave</div>
                </div>
              )}
            </div>

            {/* Footer count */}
            {options.length > 0 && (
              <div className="border-t border-mist-100 bg-mist-50/60 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-mist-500">
                {filtered.length} de {options.length}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function IconSearch({ className }: { className?: string }) {
  return (
    <svg className={cn("h-4 w-4", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  );
}
function IconPin() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 22s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12z" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function IconBriefcase() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
function IconHeart() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M20.8 5.3a5 5 0 0 0-7.1 0L12 7l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21l8.8-8.6a5 5 0 0 0 0-7.1z" strokeLinejoin="round" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg className="h-4 w-4 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
      <path d="M5 12l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
