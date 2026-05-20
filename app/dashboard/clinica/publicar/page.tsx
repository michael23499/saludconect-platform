import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { NAV_CLINICA, USER_CLINICA } from "@/lib/dashboard-nav";
import { PublishNeedForm } from "@/components/dashboard/PublishNeedForm";
import { CIUDADES, PROFESIONES, ESPECIALIDADES } from "@/lib/mock-professionals";

export const metadata = { title: "Publicar necesidad · SaludCoNet" };

export default function PublicarNecesidadPage() {
  return (
    <DashboardShell role="Clínica" user={USER_CLINICA} nav={NAV_CLINICA}>
      <PageHeader
        title="Publicar nueva necesidad"
        subtitle="Describe el perfil que buscas. Notificaremos a profesionales compatibles en tu zona."
        actions={
          <>
            <Button href="/dashboard/clinica" variant="secondary" size="sm">
              ← Volver al panel
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Form */}
        <PublishNeedForm
          ciudades={CIUDADES}
          profesiones={PROFESIONES}
          especialidades={ESPECIALIDADES}
        />

        {/* Side: tips + visibility */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-mist-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Alcance estimado</div>
              <Badge tone="brand">Plan Pro</Badge>
            </div>
            <div className="mt-3 text-3xl font-semibold tracking-tight text-ink-900">
              ~ 312 <span className="text-base font-normal text-mist-500">profesionales</span>
            </div>
            <div className="mt-1 text-xs text-mist-500">
              Con los criterios actuales, tu necesidad será visible para esta red.
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-mist-200 bg-mist-50/60 p-2.5">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">Hoy</div>
                <div className="text-sm font-semibold text-ink-900">48</div>
              </div>
              <div className="rounded-lg border border-mist-200 bg-mist-50/60 p-2.5">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">Semana</div>
                <div className="text-sm font-semibold text-ink-900">187</div>
              </div>
              <div className="rounded-lg border border-mist-200 bg-mist-50/60 p-2.5">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">Mes</div>
                <div className="text-sm font-semibold text-ink-900">312</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-mist-200 bg-white p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Consejos</div>
            <ul className="mt-3 space-y-3 text-sm">
              {[
                ["Sé específico con la fecha", "Las solicitudes con fecha concreta reciben 3× más respuestas."],
                ["Indica tarifa orientativa", "Aumenta la confianza y filtra perfiles compatibles."],
                ["Describe el equipo y la sede", "Genera ofertas más alineadas con tu cultura."],
              ].map(([t, d]) => (
                <li key={t} className="flex items-start gap-2.5">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M5 12l4.5 4.5L19 7" /></svg>
                  </span>
                  <div>
                    <div className="text-[13.5px] font-semibold text-ink-900">{t}</div>
                    <div className="text-xs text-mist-500">{d}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-5 dark:border-amber-500/30 dark:from-amber-500/15 dark:via-orange-500/10 dark:to-rose-500/10">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-amber-200/40 blur-2xl dark:bg-amber-400/20" />
            <div className="relative flex items-start gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-[0_8px_18px_-8px_rgba(245,158,11,0.7)]">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
                </svg>
              </span>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">¿Necesitas urgencia?</div>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-800 dark:text-amber-50">
                  Marca <b>Cobertura urgente</b> y notificaremos por push y email a los profesionales más cercanos en menos de 5 minutos.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}
