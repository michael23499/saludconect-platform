"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

type Status = "verificado" | "pendiente" | "caducado" | "por-caducar" | "vacio";
type CatId = "identidad" | "titulacion" | "seguros" | "fiscal" | "otros";

type Doc = {
  id: string;
  name: string;
  cat: CatId;
  status: Status;
  size?: string;
  ext?: "pdf" | "jpg" | "png";
  updatedAt?: string;
  expiresAt?: string;
  notes?: string;
};

const CATEGORIES: { id: CatId | "todos"; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "identidad", label: "Identidad" },
  { id: "titulacion", label: "Titulación" },
  { id: "seguros", label: "Seguros" },
  { id: "fiscal", label: "Fiscal" },
  { id: "otros", label: "Otros" },
];

const DOCS: Doc[] = [
  {
    id: "dni",
    name: "DNI / NIE",
    cat: "identidad",
    status: "verificado",
    size: "1,2 MB",
    ext: "pdf",
    updatedAt: "12 Mar 2026",
    expiresAt: "08 Sep 2030",
  },
  {
    id: "foto",
    name: "Foto profesional",
    cat: "identidad",
    status: "vacio",
    notes: "Mejora tu visibilidad un 38%.",
  },
  {
    id: "titulacion",
    name: "Título universitario en Medicina",
    cat: "titulacion",
    status: "verificado",
    size: "2,4 MB",
    ext: "pdf",
    updatedAt: "02 Feb 2026",
  },
  {
    id: "especialidad",
    name: "Especialidad en Cardiología (MIR)",
    cat: "titulacion",
    status: "verificado",
    size: "1,8 MB",
    ext: "pdf",
    updatedAt: "02 Feb 2026",
  },
  {
    id: "colegiacion",
    name: "Colegiación COMM 28-12345",
    cat: "titulacion",
    status: "verificado",
    size: "0,7 MB",
    ext: "pdf",
    updatedAt: "10 Mar 2026",
    expiresAt: "31 Dic 2026",
  },
  {
    id: "svca",
    name: "Certificado SVCA / ACLS",
    cat: "titulacion",
    status: "por-caducar",
    size: "0,9 MB",
    ext: "pdf",
    updatedAt: "20 Jun 2024",
    expiresAt: "20 Jun 2026",
    notes: "Caduca en 31 días.",
  },
  {
    id: "rc",
    name: "Seguro de responsabilidad civil",
    cat: "seguros",
    status: "por-caducar",
    size: "0,5 MB",
    ext: "pdf",
    updatedAt: "01 Jul 2025",
    expiresAt: "30 Jun 2026",
    notes: "Caduca en 41 días.",
  },
  {
    id: "iban",
    name: "Certificado de titularidad bancaria",
    cat: "fiscal",
    status: "verificado",
    size: "0,3 MB",
    ext: "pdf",
    updatedAt: "10 Mar 2026",
  },
  {
    id: "modelo037",
    name: "Modelo 037 - Alta autónomos",
    cat: "fiscal",
    status: "pendiente",
    size: "1,1 MB",
    ext: "pdf",
    updatedAt: "Hoy",
    notes: "En revisión por el equipo.",
  },
  {
    id: "cv",
    name: "Curriculum Vitae",
    cat: "otros",
    status: "verificado",
    size: "0,8 MB",
    ext: "pdf",
    updatedAt: "15 Feb 2026",
  },
];

const STATUS_META: Record<Status, { label: string; tone: "success" | "warning" | "danger" | "neutral" | "brand"; dot: string }> = {
  verificado: { label: "Verificado", tone: "success", dot: "bg-emerald-500" },
  pendiente: { label: "En revisión", tone: "brand", dot: "bg-brand-500" },
  "por-caducar": { label: "Por caducar", tone: "warning", dot: "bg-amber-500" },
  caducado: { label: "Caducado", tone: "danger", dot: "bg-red-500" },
  vacio: { label: "Sin subir", tone: "neutral", dot: "bg-mist-300" },
};

function FileIcon({ ext, status }: { ext?: Doc["ext"]; status: Status }) {
  const color =
    status === "verificado" ? "from-emerald-100 to-emerald-50 text-emerald-700" :
    status === "pendiente" ? "from-brand-100 to-brand-50 text-brand-700" :
    status === "por-caducar" ? "from-amber-100 to-amber-50 text-amber-700" :
    status === "caducado" ? "from-red-100 to-red-50 text-red-700" :
    "from-mist-100 to-mist-50 text-mist-500";
  return (
    <div className={cn("relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-mist-200 bg-gradient-to-br", color)}>
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" />
        <path d="M14 3v5h5" />
      </svg>
      {ext && (
        <span className="absolute -bottom-1 right-1 rounded-md bg-white px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest text-ink-800 shadow-sm">
          {ext}
        </span>
      )}
    </div>
  );
}

export function DocumentsView() {
  const [cat, setCat] = useState<CatId | "todos">("todos");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"lista" | "tarjetas">("lista");

  const visible = useMemo(() => {
    return DOCS.filter((d) => {
      if (cat !== "todos" && d.cat !== cat) return false;
      if (query.trim() && !d.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
      return true;
    });
  }, [cat, query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { todos: DOCS.length };
    for (const d of DOCS) c[d.cat] = (c[d.cat] || 0) + 1;
    return c;
  }, []);

  return (
    <div className="mt-6 rounded-2xl border border-mist-200 bg-white">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-mist-200 p-3 md:flex-row md:items-center md:justify-between md:p-4">
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5 md:overflow-visible md:pb-0">
          {CATEGORIES.map((c) => {
            const active = cat === c.id;
            const count = c.id === "todos" ? counts.todos : counts[c.id] || 0;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCat(c.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  active
                    ? "bg-ink-900 text-white"
                    : "border border-mist-200 bg-white text-ink-800 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700",
                )}
              >
                {c.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[10px] font-bold",
                    active ? "bg-white/20 text-white" : "bg-mist-100 text-mist-500",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64 md:flex-none">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3-3" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar documento…"
              className="h-9 w-full rounded-full border border-mist-200 bg-mist-50 pl-9 pr-3 text-sm text-ink-900 placeholder:text-mist-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
          <div className="inline-flex h-9 items-center rounded-full border border-mist-200 bg-mist-50 p-0.5">
            <button
              type="button"
              onClick={() => setView("lista")}
              aria-pressed={view === "lista"}
              aria-label="Vista en lista"
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-full transition",
                view === "lista" ? "bg-white text-ink-900 shadow-sm" : "text-mist-500 hover:text-ink-800",
              )}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setView("tarjetas")}
              aria-pressed={view === "tarjetas"}
              aria-label="Vista en tarjetas"
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-full transition",
                view === "tarjetas" ? "bg-white text-ink-900 shadow-sm" : "text-mist-500 hover:text-ink-800",
              )}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Upload zone */}
      <div className="border-b border-mist-200 p-4">
        <button
          type="button"
          className="group flex w-full items-center gap-4 rounded-2xl border-2 border-dashed border-mist-200 bg-mist-50/40 p-4 text-left transition hover:border-brand-300 hover:bg-brand-50/50"
        >
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm transition group-hover:scale-105">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="M17 8l-5-5-5 5" />
              <path d="M12 3v12" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-ink-900">Subir un nuevo documento</div>
            <div className="text-xs text-mist-500">
              Arrastra archivos o haz click. Soportamos PDF, JPG y PNG hasta 10 MB.
            </div>
          </div>
          <span className="hidden rounded-full bg-brand-600 px-4 py-2 text-xs font-semibold text-white sm:inline-flex">
            Examinar
          </span>
        </button>
      </div>

      {/* Documents */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-mist-100 text-mist-500">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3-3" />
            </svg>
          </div>
          <div className="text-sm font-semibold text-ink-900">Sin documentos que mostrar</div>
          <div className="text-xs text-mist-500">Prueba a cambiar el filtro o limpia la búsqueda.</div>
        </div>
      ) : view === "lista" ? (
        <ul className="divide-y divide-mist-100">
          {visible.map((d) => {
            const meta = STATUS_META[d.status];
            return (
              <li key={d.id} className="flex flex-col gap-3 p-4 transition hover:bg-mist-50/50 md:flex-row md:items-center md:gap-4">
                <FileIcon ext={d.ext} status={d.status} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="truncate text-sm font-semibold text-ink-900">{d.name}</div>
                    <Badge tone={meta.tone}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} aria-hidden />
                      {meta.label}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-mist-500">
                    {d.size && <span>{d.size}</span>}
                    {d.updatedAt && <span>Actualizado: {d.updatedAt}</span>}
                    {d.expiresAt && <span>Caduca: {d.expiresAt}</span>}
                    {d.notes && <span className="font-medium text-amber-700">{d.notes}</span>}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {d.status === "vacio" ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      Subir
                    </button>
                  ) : (
                    <>
                      <RowAction label="Ver">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </RowAction>
                      <RowAction label="Descargar">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <path d="M7 10l5 5 5-5" />
                          <path d="M12 15V3" />
                        </svg>
                      </RowAction>
                      <RowAction label="Reemplazar">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                          <path d="M21 3v5h-5" />
                          <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                          <path d="M3 21v-5h5" />
                        </svg>
                      </RowAction>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((d) => {
            const meta = STATUS_META[d.status];
            return (
              <div
                key={d.id}
                className="flex flex-col gap-3 rounded-2xl border border-mist-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <FileIcon ext={d.ext} status={d.status} />
                  <Badge tone={meta.tone}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} aria-hidden />
                    {meta.label}
                  </Badge>
                </div>
                <div>
                  <div className="line-clamp-2 text-sm font-semibold text-ink-900">{d.name}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-mist-500">
                    {d.size && <span>{d.size}</span>}
                    {d.updatedAt && <span>· {d.updatedAt}</span>}
                  </div>
                  {d.expiresAt && (
                    <div className="mt-1 text-[11px] text-mist-500">Caduca: {d.expiresAt}</div>
                  )}
                  {d.notes && (
                    <div className="mt-1 text-[11px] font-medium text-amber-700">{d.notes}</div>
                  )}
                </div>
                <div className="mt-auto flex items-center gap-1.5">
                  {d.status === "vacio" ? (
                    <button
                      type="button"
                      className="flex-1 rounded-full bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700"
                    >
                      Subir documento
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="flex-1 rounded-full border border-mist-200 px-3 py-1.5 text-xs font-medium text-ink-800 transition hover:bg-mist-50"
                      >
                        Ver
                      </button>
                      <button
                        type="button"
                        className="flex-1 rounded-full bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-ink-800"
                      >
                        Reemplazar
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer help */}
      <div className="flex flex-col items-start gap-3 border-t border-mist-200 bg-mist-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8h.01M11 12h1v5h1" />
            </svg>
          </span>
          <div>
            <div className="text-sm font-semibold text-ink-900">¿Qué documentos necesito?</div>
            <div className="text-xs text-mist-500">
              Cuanta más documentación verificada, más reservas. Revisa la guía o escríbenos.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/contacto"
            className="inline-flex items-center gap-1.5 rounded-full border border-mist-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-800 transition hover:border-brand-300 hover:text-brand-700"
          >
            Soporte
          </a>
          <a
            href="/como-funciona"
            className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-ink-800"
          >
            Ver guía
          </a>
        </div>
      </div>
    </div>
  );
}

function RowAction({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-mist-200 bg-white text-ink-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
    >
      {children}
    </button>
  );
}
