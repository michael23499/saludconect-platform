"use client";
import { useState, useTransition, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { AccountSettingsForm, type AccountData } from "@/components/dashboard/AccountSettingsForm";
import { changeMyPasswordAction } from "@backend/actions/settings";

type Role = "clinic" | "professional";
type Tab = "cuenta" | "notif" | "seguridad" | "integraciones" | "facturacion";

const TABS_BY_ROLE: Record<Role, Array<{ key: Tab; label: string; icon: React.ReactNode }>> = {
  clinic: [
    { key: "cuenta", label: "Cuenta", icon: <IconUser /> },
    { key: "notif", label: "Notificaciones", icon: <IconBell /> },
    { key: "seguridad", label: "Seguridad", icon: <IconShield /> },
    { key: "integraciones", label: "Integraciones", icon: <IconPlug /> },
    { key: "facturacion", label: "Facturación", icon: <IconCard /> },
  ],
  professional: [
    { key: "cuenta", label: "Cuenta", icon: <IconUser /> },
    { key: "notif", label: "Notificaciones", icon: <IconBell /> },
    { key: "facturacion", label: "Pagos y cobros", icon: <IconCard /> },
    { key: "seguridad", label: "Seguridad", icon: <IconShield /> },
    { key: "integraciones", label: "Integraciones", icon: <IconPlug /> },
  ],
};

export function SettingsTabs({ role = "clinic", account }: { role?: Role; account: AccountData }) {
  const [active, setActive] = useState<Tab>("cuenta");
  const tabs = TABS_BY_ROLE[role];

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <nav className="space-y-1">
        {tabs.map((t) => {
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
                isActive ? "bg-brand-50 text-brand-700" : "text-ink-800 hover:bg-mist-50",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg border",
                  isActive ? "border-brand-200 bg-white text-brand-700" : "border-mist-200 bg-mist-50 text-ink-700",
                )}
              >
                {t.icon}
              </span>
              {t.label}
            </button>
          );
        })}
      </nav>

      <div>
        {active === "cuenta" && <AccountSettingsForm account={account} />}
        {active === "notif" && <NotificationsPanel />}
        {active === "seguridad" && <SecurityPanel />}
        {active === "integraciones" && <IntegrationsPanel role={role} />}
        {active === "facturacion" && (role === "clinic" ? <BillingPanel /> : <PaymentsPanelPro />)}
      </div>
    </div>
  );
}

/* -------------------- Notificaciones (honesto) -------------------- */
function NotificationsPanel() {
  return (
    <div className="space-y-6">
      <Panel title="Cómo te avisamos" subtitle="Estos son los avisos que SaludCoNet envía hoy.">
        <ul className="space-y-3 text-sm text-ink-800">
          <li className="flex items-start gap-2.5">
            <CheckDot />
            <span><b>Notificaciones en la app</b> (la campana) por cada evento: nuevas cirugías, postulaciones, confirmaciones, invitaciones y cambios.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckDot />
            <span><b>Email automático</b> en los eventos importantes, al correo de tu cuenta.</span>
          </li>
        </ul>
        <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-mist-200 bg-mist-50/40 p-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-ink-900">Preferencias por canal, push y SMS</div>
            <div className="text-xs text-mist-500">Elegir qué recibir por cada vía y un resumen diario.</div>
          </div>
          <Badge tone="warning">Próximamente</Badge>
        </div>
      </Panel>
    </div>
  );
}

/* -------------------- Seguridad -------------------- */
function SecurityPanel() {
  const [newPwd, setNewPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok?: boolean; error?: string } | null>(null);

  function changePwd(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (newPwd.length < 8) {
      setMsg({ error: "La contraseña debe tener al menos 8 caracteres." });
      return;
    }
    if (newPwd !== confirm) {
      setMsg({ error: "Las contraseñas no coinciden." });
      return;
    }
    startTransition(async () => {
      const res = await changeMyPasswordAction(newPwd);
      if ("error" in res) setMsg({ error: res.error });
      else {
        setMsg({ ok: true });
        setNewPwd("");
        setConfirm("");
      }
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={changePwd}>
        <Panel title="Cambiar contraseña" subtitle="Mínimo 8 caracteres. No pedimos la actual: tu sesión ya te identifica.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nueva contraseña">
              <PasswordInput value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
            </Field>
            <Field label="Repetir nueva">
              <PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repite tu contraseña" autoComplete="new-password" />
            </Field>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button type="submit" size="sm" disabled={pending}>{pending ? "Guardando…" : "Cambiar contraseña"}</Button>
            {msg?.ok && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M5 12l4.5 4.5L19 7" /></svg>
                Contraseña actualizada
              </span>
            )}
            {msg?.error && <span className="text-xs text-red-600">{msg.error}</span>}
          </div>
        </Panel>
      </form>

      <Panel title="Autenticación en dos pasos (2FA)" subtitle="Una capa extra de seguridad al iniciar sesión.">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-mist-200 bg-mist-50/40 p-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-ink-900">App autenticadora y código por SMS</div>
            <div className="text-xs text-mist-500">Pediremos un código adicional al iniciar sesión.</div>
          </div>
          <Badge tone="warning">Próximamente</Badge>
        </div>
      </Panel>

      <Panel title="Eliminar cuenta" subtitle="Si necesitas darte de baja, lo gestionamos contigo.">
        <p className="mb-4 text-sm text-mist-500">
          Por seguridad, la eliminación de cuenta y de tus datos se gestiona con nuestro equipo. Escríbenos y lo tramitamos.
        </p>
        <a
          href="/contact"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-300"
        >
          Solicitar eliminación de cuenta
        </a>
      </Panel>
    </div>
  );
}

/* -------------------- Integraciones (honesto) -------------------- */
function IntegrationsPanel({ role = "clinic" }: { role?: Role }) {
  const integrations = role === "clinic"
    ? [
        { name: "Google Calendar", desc: "Sincroniza tus cirugías con tu calendario", status: "proximamente" },
        { name: "Stripe", desc: "Cobro con tarjeta y SEPA", status: "proximamente" },
        { name: "PayPal", desc: "Pago con PayPal", status: "proximamente" },
        { name: "Webhooks", desc: "Recibe eventos en tu endpoint HTTP", status: "proximamente" },
      ]
    : [
        { name: "Google Calendar", desc: "Sincroniza tu disponibilidad y reservas", status: "proximamente" },
        { name: "Apple Calendar", desc: "Suscripción .ics de solo lectura", status: "proximamente" },
        { name: "Stripe Connect", desc: "Recibe pagos directamente en tu cuenta", status: "proximamente" },
        { name: "WhatsApp Business", desc: "Notificaciones en tu WhatsApp", status: "proximamente" },
      ];

  return (
    <div className="space-y-6">
      <Panel title="Integraciones" subtitle="Conectaremos SaludCoNet con las herramientas que ya usas.">
        <div className="grid gap-3 md:grid-cols-2">
          {integrations.map((it) => (
            <div key={it.name} className="flex items-start gap-3 rounded-xl border border-mist-200 bg-mist-50/40 p-4">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 ring-1 ring-mist-200">
                <IconPlug />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="truncate text-sm font-semibold text-ink-900">{it.name}</div>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-mist-400">Próximamente</span>
                </div>
                <div className="text-xs text-mist-500">{it.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* -------------------- Facturación · Clínica -------------------- */
function BillingPanel() {
  return (
    <div className="space-y-6">
      <Panel title="Tu plan y facturas" subtitle="La gestión completa está en la sección Suscripción.">
        <a
          href="/dashboard/clinic/subscription"
          className="inline-flex h-11 items-center justify-center rounded-full bg-brand-600 px-5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)] hover:bg-brand-700"
        >
          Ir a Suscripción →
        </a>
      </Panel>
    </div>
  );
}

/* -------------------- Pagos y cobros · Profesional (honesto) -------------------- */
function PaymentsPanelPro() {
  return (
    <div className="space-y-6">
      <Panel title="Pagos y cobros" subtitle="Aquí gestionarás tus cobros por las jornadas completadas.">
        <div className="flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50/50 p-4 dark:border-brand-400/30 dark:bg-brand-500/10">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 ring-1 ring-brand-200 dark:bg-brand-500/20 dark:text-cyan-200 dark:ring-brand-400/30">
            <IconCard />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-ink-900">Cobros automáticos</span>
              <Badge tone="warning">Próximamente</Badge>
            </div>
            <p className="mt-1 text-sm text-mist-500">
              Cuando habilitemos los pagos podrás añadir tu cuenta bancaria y recibir el cobro tras cada jornada. Mientras tanto, la tarifa se acuerda directamente con la clínica.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}

/* -------------------- helpers -------------------- */
function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-mist-200 bg-white p-6">
      <header className="mb-5">
        <h3 className="text-base font-semibold tracking-tight text-ink-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-mist-500">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

function CheckDot() {
  return (
    <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
      <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4.5 4.5L19 7" /></svg>
    </span>
  );
}

/* -------------------- icons -------------------- */
function IconUser() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21a7 7 0 0114 0" />
    </svg>
  );
}
function IconBell() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M18 16v-5a6 6 0 10-12 0v5l-2 2h16l-2-2z" strokeLinejoin="round" />
      <path d="M10 21h4" strokeLinecap="round" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" strokeLinejoin="round" />
    </svg>
  );
}
function IconPlug() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 2v6M15 2v6M7 8h10v4a5 5 0 01-10 0V8zM12 17v5" />
    </svg>
  );
}
function IconCard() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18M7 15h3" />
    </svg>
  );
}
