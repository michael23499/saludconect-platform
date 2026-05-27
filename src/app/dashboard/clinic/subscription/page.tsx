import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { FreeTrialCTA } from "@/components/dashboard/FreeTrialCTA";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { NAV_CLINICA } from "@/lib/dashboard-nav";
import { getDict } from "@/lib/i18n-server";
import { buildDashboardUser } from "@/lib/dashboard-user";
import { requireRole } from "@backend/auth/guards";

export const metadata = { title: "Suscripción · SaludCoNet" };

export default async function SuscripcionPage() {
  const me = await requireRole("clinic");
  const dict = (await getDict()).dashboard;
  const p = dict.prof;
  const m = dict.misc;
  const isAdmin = me.profile.role === "admin";
  const planFeatures = [
    { ok: true, label: p.feat1 },
    { ok: true, label: p.feat2 },
    { ok: true, label: p.feat3 },
    { ok: true, label: p.feat4 },
    { ok: true, label: p.feat5 },
    { ok: false, label: p.feat6 },
    { ok: false, label: p.feat7 },
  ];
  const user = buildDashboardUser(me.profile, { isAdmin, roleLabel: "Clínica" });

  return (
    <DashboardShell role="Clínica" user={user} nav={NAV_CLINICA}>
      <PageHeader
        backHref="/dashboard/clinic"
        backLabel={p.back}
        title={p.subTitle}
        subtitle={p.subSub}
      />

      {/* Activación de prueba gratuita */}
      <FreeTrialCTA />

      {/* Pasarelas de pago próximamente */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-dashed border-brand-300 bg-gradient-to-br from-brand-50 via-cyan-50 to-indigo-50 p-5 dark:border-brand-400/40 dark:from-brand-500/15 dark:via-cyan-500/10 dark:to-indigo-500/15 md:p-6">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-200/40 blur-3xl dark:bg-brand-400/20" />
        <div className="relative grid items-center gap-4 md:grid-cols-[1fr_auto]">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 shadow-sm ring-1 ring-brand-200 dark:bg-brand-500/20 dark:!text-cyan-200 dark:ring-brand-400/30">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M7 15h3" strokeLinecap="round" /></svg>
            </span>
            <div>
              <div className="inline-flex items-center gap-2">
                <Badge tone="brand">{m.comingSoon}</Badge>
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:!text-cyan-300">
                  {p.subGateways}
                </span>
              </div>
              <h3 className="mt-1.5 text-base font-semibold tracking-tight text-ink-900 md:text-lg">
                {p.subGatewaysTitle}
              </h3>
              <p className="mt-1 text-sm text-mist-500 dark:!text-slate-200">{p.subGatewaysText}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <Button variant="secondary" size="sm">{p.subNotify}</Button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Plan actual: sin plan activo todavía */}
        <div className="relative overflow-hidden rounded-2xl border border-mist-200 bg-gradient-to-br from-ink-950 via-ink-900 to-brand-800 p-6 text-white md:p-7">
          <div className="bg-grid absolute inset-0 opacity-20" />
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">{p.subPlanLabel}</div>
                <div className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">{p.subNoPlan}</div>
              </div>
              <Badge tone="neutral">{p.subValidation}</Badge>
            </div>
            <p className="mt-4 max-w-md text-sm text-white/70">{p.subNoPlanText}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button size="md" variant="outline" disabled>{p.subActivateSoon}</Button>
            </div>
          </div>
        </div>

        {/* Qué incluye el plan */}
        <div className="rounded-2xl border border-mist-200 bg-white p-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{p.subPlanPro}</div>
          <div className="mt-1 text-lg font-semibold tracking-tight text-ink-900">{p.subWhatIncludes}</div>
          <ul className="mt-4 space-y-2.5">
            {planFeatures.map((f) => (
              <li key={f.label} className="flex items-start gap-2.5">
                {f.ok ? (
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l4.5 4.5L19 7" /></svg>
                  </span>
                ) : (
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mist-100 text-mist-400">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" /></svg>
                  </span>
                )}
                <span className={f.ok ? "text-sm text-ink-800" : "text-sm text-mist-500"}>{f.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Facturas */}
      <div className="mt-6 rounded-2xl border border-mist-200 bg-white">
        <div className="border-b border-mist-100 p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">{p.subInvoices}</div>
          <div className="text-lg font-semibold tracking-tight text-ink-900">{p.subYourInvoices}</div>
        </div>
        <div className="p-8 text-center text-sm text-mist-500">{p.subNoInvoices}</div>
      </div>
    </DashboardShell>
  );
}
