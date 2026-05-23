import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Input";
import { PROFESSIONALS, CIUDADES, PROFESIONES, ESPECIALIDADES } from "@/lib/mock-professionals";
import { ProfessionalCard } from "@/components/reputation/ProfessionalCard";
import { SearchBar } from "@/components/search/SearchBar";
import { ActiveFilters } from "@/components/search/ActiveFilters";
import { Pagination } from "@/components/search/Pagination";
import { SidebarFilters } from "@/components/search/SidebarFilters";

const NIVEL_MIN_SCORE: Record<string, number> = {
  rising: 200,
  trusted: 400,
  top: 600,
  expert: 800,
};

const PER_PAGE = 8;

export const metadata = { title: "Buscar talento sanitario · SaludCoNet" };

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    ciudad?: string;
    especialidad?: string;
    profesion?: string;
    turno?: string;
    disp?: string;
    nivel?: string;
    expmin?: string;
    tarifa?: string;
    verificado?: string;
    rating?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const disp = sp.disp === "ocupado" ? "ocupado" : sp.disp === "disponible" ? "disponible" : "";
  const minScore = sp.nivel ? NIVEL_MIN_SCORE[sp.nivel] ?? 0 : 0;
  const expMin = sp.expmin ? parseInt(sp.expmin, 10) || 0 : 0;
  const rateMin = sp.tarifa ? parseInt(sp.tarifa, 10) || 0 : 0;
  const onlyVerified = sp.verificado === "1";
  const onlyHighRated = sp.rating === "1";

  const filtered = PROFESSIONALS.filter((p) => {
    if (sp.ciudad && p.city !== sp.ciudad) return false;
    if (sp.especialidad && p.specialty !== sp.especialidad) return false;
    if (sp.profesion && p.profession !== sp.profesion) return false;
    if (sp.turno && p.shift !== sp.turno && p.shift !== "Ambos") return false;
    if (disp === "disponible" && !p.available) return false;
    if (disp === "ocupado" && p.available) return false;
    if (minScore && p.rep.score < minScore) return false;
    if (expMin && p.experience < expMin) return false;
    if (rateMin && p.rateRange.length < rateMin) return false;
    if (onlyVerified && !p.verified) return false;
    if (onlyHighRated && p.rep.rating < 4.5) return false;
    if (sp.q) {
      const q = sp.q.toLowerCase();
      const blob = [p.name, p.specialty, p.profession, p.city, ...p.tags].join(" ").toLowerCase();
      if (!blob.includes(q)) return false;
    }
    return true;
  }).sort((a, b) => b.rep.score - a.rep.score);

  // Pagination
  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));
  const requestedPage = parseInt(sp.page || "1", 10);
  const page = Math.min(Math.max(1, Number.isFinite(requestedPage) ? requestedPage : 1), pageCount);
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (sp.q) params.set("q", sp.q);
    if (sp.ciudad) params.set("ciudad", sp.ciudad);
    if (sp.profesion) params.set("profesion", sp.profesion);
    if (sp.especialidad) params.set("especialidad", sp.especialidad);
    if (sp.turno) params.set("turno", sp.turno);
    if (disp) params.set("disp", disp);
    if (sp.nivel) params.set("nivel", sp.nivel);
    if (sp.expmin) params.set("expmin", sp.expmin);
    if (sp.tarifa) params.set("tarifa", sp.tarifa);
    if (onlyVerified) params.set("verificado", "1");
    if (onlyHighRated) params.set("rating", "1");
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/search${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-mist-50">
      <section className="relative bg-hero text-white">
        {/* Background blobs in their own clipped wrapper so the SearchBar
            dropdowns can overflow the section without being cut. */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="bg-grid absolute inset-0 opacity-25" />
          <div className="absolute -top-40 right-[-10%] h-[460px] w-[460px] rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-40 left-[-10%] h-[460px] w-[460px] rounded-full bg-brand-500/25 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-5 py-14 md:px-8 md:py-20">
          <div className="max-w-3xl">
            <Badge tone="accent">Marketplace sanitario</Badge>
            <h1 className="mt-4 text-balance text-3xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              Encuentra el profesional ideal <span className="text-gradient">cuando lo necesites</span>
            </h1>
            <p className="mt-3 max-w-xl text-white/70 md:text-lg">
              Filtra por ciudad, especialidad, turno y disponibilidad. Todos verificados, ordenados por reputación.
            </p>
          </div>

          <div className="mt-10">
            <SearchBar
              initial={sp}
              ciudades={CIUDADES}
              profesiones={PROFESIONES}
              especialidades={ESPECIALIDADES}
            />
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <ActiveFilters />
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside>
            <SidebarFilters
              initial={{
                disp,
                nivel: sp.nivel,
                expmin: sp.expmin,
                tarifa: sp.tarifa,
                verificado: sp.verificado,
                rating: sp.rating,
              }}
            />
          </aside>

          <div>
            <div className="mb-5 flex items-center justify-between">
              <div className="text-sm text-mist-500">
                <span className="font-semibold text-ink-900">{total}</span> profesionales encontrados
                {total > 0 && (
                  <span className="ml-1 text-mist-400">
                    · página {page} de {pageCount}
                  </span>
                )}
              </div>
              <Select defaultValue="reputacion" className="!h-9 !w-auto !text-xs">
                <option value="reputacion">Ordenar: Reputación</option>
                <option>Mejor valorados</option>
                <option>Más experiencia</option>
                <option>Más reservas completadas</option>
                <option>Respuesta más rápida</option>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {pageItems.map((p) => (
                <ProfessionalCard key={p.id} p={p} />
              ))}
            </div>

            {total === 0 && (
              <div className="rounded-2xl border border-dashed border-mist-300 bg-white p-12 text-center">
                <div className="text-base font-semibold text-ink-900">Sin resultados</div>
                <p className="mt-1 text-sm text-mist-500">Prueba a quitar filtros o ampliar la ciudad.</p>
              </div>
            )}

            <Pagination
              page={page}
              pageCount={pageCount}
              total={total}
              perPage={PER_PAGE}
              buildHref={buildHref}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
