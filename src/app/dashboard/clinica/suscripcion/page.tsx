import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { FreeTrialCTA } from "@/components/dashboard/FreeTrialCTA";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { NAV_CLINICA, USER_CLINICA } from "@/lib/dashboard-nav";

export const metadata = { title: "Suscripción · SaludCoNet" };

const INVOICES = [
  { id: "INV-2026-005", date: "15 may 2026", concept: "Plan Clínica Pro · Mayo", amount: "149,00 €", status: "pagada" as const },
  { id: "INV-2026-004", date: "15 abr 2026", concept: "Plan Clínica Pro · Abril", amount: "149,00 €", status: "pagada" as const },
  { id: "INV-2026-003", date: "15 mar 2026", concept: "Plan Clínica Pro · Marzo", amount: "149,00 €", status: "pagada" as const },
  { id: "INV-2026-002", date: "15 feb 2026", concept: "Plan Clínica Pro · Febrero", amount: "149,00 €", status: "pagada" as const },
  { id: "INV-2026-001", date: "15 ene 2026", concept: "Plan Clínica Pro · Enero", amount: "149,00 €", status: "pagada" as const },
];

const PLAN_FEATURES = [
  { ok: true, label: "Reservas ilimitadas" },
  { ok: true, label: "Multi-sede (hasta 5)" },
  { ok: true, label: "Solicitudes prioritarias" },
  { ok: true, label: "Acceso a perfiles Elite" },
  { ok: true, label: "Facturación automática" },
  { ok: true, label: "Soporte prioritario" },
  { ok: false, label: "SSO empresarial (Enterprise)" },
  { ok: false, label: "Account manager dedicado (Enterprise)" },
];

const USAGE = [
  { label: "Reservas este mes", current: 28, max: null, percent: 0 },
  { label: "Sedes activas", current: 3, max: 5, percent: 60 },
  { label: "Usuarios del equipo", current: 5, max: 10, percent: 50 },
  { label: "Mensajes enviados", current: 142, max: null, percent: 0 },
];

export default function SuscripcionPage() {
  return (
    <DashboardShell role="Clínica" user={USER_CLINICA} nav={NAV_CLINICA}>
      <PageHeader
        title="Suscripción y facturación"
        subtitle="Gestiona tu plan, métodos de pago y descarga tus facturas."
      />

      {/* Free trial activation */}
      <FreeTrialCTA />

      {/* Payment gateways coming soon */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-dashed border-brand-300 bg-gradient-to-br from-brand-50 via-cyan-50 to-indigo-50 p-5 dark:border-brand-400/40 dark:from-brand-500/15 dark:via-cyan-500/10 dark:to-indigo-500/15 md:p-6">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-200/40 blur-3xl dark:bg-brand-400/20" />
        <div className="relative grid items-center gap-4 md:grid-cols-[1fr_auto]">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 shadow-sm ring-1 ring-brand-200 dark:bg-brand-500/20 dark:!text-cyan-200 dark:ring-brand-400/30">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M7 15h3" strokeLinecap="round" /></svg>
            </span>
            <div>
              <div className="inline-flex items-center gap-2">
                <Badge tone="brand">Próximamente</Badge>
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:!text-cyan-300">
                  Pasarelas de pago
                </span>
              </div>
              <h3 className="mt-1.5 text-base font-semibold tracking-tight text-ink-900 md:text-lg">
                Stripe y PayPal vienen en camino
              </h3>
              <p className="mt-1 text-sm text-mist-500 dark:!text-slate-200">
                Estamos integrando ambas pasarelas para que puedas pagar tu suscripción con tarjeta, transferencia SEPA y PayPal de forma totalmente segura. Mientras tanto, gestionamos los cobros por transferencia bancaria.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="inline-flex h-9 items-center gap-2 rounded-xl border border-mist-200 bg-white px-3 text-xs font-semibold text-ink-800 dark:border-brand-400/30 dark:bg-brand-500/10 dark:!text-slate-100">
                  <span className="text-[15px] font-bold text-[#635BFF]">stripe</span>
                  <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700">En camino</span>
                </div>
                <div className="inline-flex h-9 items-center gap-2 rounded-xl border border-mist-200 bg-white px-3 text-xs font-semibold text-ink-800 dark:border-brand-400/30 dark:bg-brand-500/10 dark:!text-slate-100">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="#003087" aria-hidden>
                    <path d="M7 6h6.5c2.4 0 4 1.3 3.8 3.7-.3 3.1-2.8 4.6-5.6 4.6h-2L8.7 19H6L7 6zm2 6h2.2c1.4 0 2.6-.6 2.8-2.2.1-1.1-.6-1.7-1.8-1.7H10l-1 3.9z" />
                  </svg>
                  <span className="font-bold text-[#003087]">PayPal</span>
                  <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700">En camino</span>
                </div>
                <span className="text-xs text-mist-500 dark:!text-slate-300">ETA: Jun 2026</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <Button variant="secondary" size="sm">Notificarme cuando esté listo</Button>
            <button type="button" className="text-xs font-semibold text-brand-700 hover:text-brand-800 dark:!text-cyan-300">
              Ver hoja de ruta →
            </button>
          </div>
        </div>
      </div>

      {/* Current plan */}
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative overflow-hidden rounded-2xl border border-mist-200 bg-gradient-to-br from-ink-950 via-ink-900 to-brand-800 p-6 text-white md:p-7">
          <div className="bg-grid absolute inset-0 opacity-20" />
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl" />

          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Plan actual</div>
                <div className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Clínica Pro</div>
              </div>
              <Badge tone="success">Activa</Badge>
            </div>

            <div className="mt-5 flex items-end gap-1.5">
              <span className="text-4xl font-semibold tracking-tight md:text-5xl">149 €</span>
              <span className="pb-2 text-sm text-white/60">/mes · IVA incl.</span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Inicio</div>
                <div className="mt-1 text-sm font-semibold">15 ene 2026</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Renovación</div>
                <div className="mt-1 text-sm font-semibold">15 jun 2026</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Método pago</div>
                <div className="mt-1 text-sm font-semibold">Transferencia</div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button size="md" variant="outline">Cambiar de plan</Button>
              <button className="inline-flex h-11 items-center justify-center rounded-full border border-white/20 px-5 text-sm font-medium text-white/80 transition hover:border-red-300 hover:bg-red-500/10 hover:text-red-200">
                Cancelar suscripción
              </button>
            </div>
          </div>
        </div>

        {/* Plan features */}
        <div className="rounded-2xl border border-mist-200 bg-white p-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Incluido en tu plan</div>
          <div className="mt-1 text-lg font-semibold tracking-tight text-ink-900">Funcionalidades</div>
          <ul className="mt-4 space-y-2.5">
            {PLAN_FEATURES.map((f) => (
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

      {/* Usage */}
      <div className="mt-6 rounded-2xl border border-mist-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Uso del plan</div>
            <div className="text-lg font-semibold tracking-tight text-ink-900">Tu actividad este mes</div>
          </div>
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {USAGE.map((u) => (
            <div key={u.label}>
              <div className="text-xs text-mist-500">{u.label}</div>
              <div className="mt-1 flex items-end gap-1">
                <span className="text-2xl font-semibold tracking-tight text-ink-900">{u.current}</span>
                {u.max && <span className="pb-1 text-xs text-mist-400">/ {u.max}</span>}
                {!u.max && <span className="pb-1 text-xs text-emerald-600">ilimitado</span>}
              </div>
              {u.max && (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-mist-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-400" style={{ width: `${u.percent}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Payment method */}
      <div className="mt-6 rounded-2xl border border-mist-200 bg-white">
        <div className="flex items-center justify-between border-b border-mist-100 p-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Método de pago actual</div>
            <div className="text-lg font-semibold tracking-tight text-ink-900">Transferencia bancaria</div>
          </div>
          <Button variant="secondary" size="sm" disabled>+ Añadir tarjeta (próximamente)</Button>
        </div>
        <div className="p-5">
          <div className="rounded-xl border border-mist-200 bg-mist-50/40 p-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-ink-800 ring-1 ring-mist-200">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 10h16M4 14h16M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" /></svg>
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink-900">SEPA · Banco Santander</div>
                <div className="text-xs text-mist-500">**** **** **** 4521 · titular Clínica Mediterránea S.L.</div>
              </div>
              <span className="ml-auto text-xs text-mist-500">Predeterminado</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-mist-500">
            Cuando Stripe y PayPal estén disponibles podrás cambiar el método de pago desde aquí con 1 click.
          </p>
        </div>
      </div>

      {/* Invoices */}
      <div className="mt-6 rounded-2xl border border-mist-200 bg-white">
        <div className="flex items-center justify-between border-b border-mist-100 p-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">Historial de facturas</div>
            <div className="text-lg font-semibold tracking-tight text-ink-900">Últimos 5 meses</div>
          </div>
          <button className="text-xs font-semibold text-brand-700 hover:text-brand-800">Descargar todas</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-mist-50/60 text-left text-[11px] font-semibold uppercase tracking-wider text-mist-500">
              <tr>
                <th className="px-5 py-2.5">Factura</th>
                <th className="px-5 py-2.5">Fecha</th>
                <th className="px-5 py-2.5">Concepto</th>
                <th className="px-5 py-2.5">Importe</th>
                <th className="px-5 py-2.5">Estado</th>
                <th className="px-5 py-2.5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist-100">
              {INVOICES.map((inv) => (
                <tr key={inv.id} className="hover:bg-mist-50/50">
                  <td className="px-5 py-3 font-mono text-xs text-ink-800">{inv.id}</td>
                  <td className="px-5 py-3 text-mist-500">{inv.date}</td>
                  <td className="px-5 py-3 text-ink-800">{inv.concept}</td>
                  <td className="px-5 py-3 font-semibold text-ink-900">{inv.amount}</td>
                  <td className="px-5 py-3"><Badge tone="success">{inv.status}</Badge></td>
                  <td className="px-5 py-3 text-right">
                    <button className="rounded-lg border border-mist-200 px-3 py-1.5 text-xs font-medium text-ink-800 hover:bg-mist-50">
                      Descargar PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
