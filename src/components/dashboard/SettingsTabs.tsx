"use client";
import { useState, useTransition, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { AccountSettingsForm, type AccountData } from "@/components/dashboard/AccountSettingsForm";
import { useApp } from "@/components/providers/Providers";
import { changeMyPasswordAction } from "@backend/actions/settings";

type Role = "clinic" | "professional";
type Tab = "cuenta" | "notif" | "seguridad" | "integraciones" | "facturacion";

const COPY = {
  es: {
    tabAccount: "Cuenta", tabNotif: "Notificaciones", tabSecurity: "Seguridad",
    tabIntegrations: "Integraciones", tabBilling: "Facturación", tabPayments: "Pagos y cobros",
    comingSoon: "Próximamente",
    notifTitle: "Cómo te avisamos", notifSubtitle: "Estos son los avisos que SaludCoNet envía hoy.",
    notifAppBold: "Notificaciones en la app", notifAppRest: " (la campana) por cada evento: nuevas cirugías, postulaciones, confirmaciones, invitaciones y cambios.",
    notifEmailBold: "Email automático", notifEmailRest: " en los eventos importantes, al correo de tu cuenta.",
    notifPrefsTitle: "Preferencias por canal, push y SMS", notifPrefsDesc: "Elegir qué recibir por cada vía y un resumen diario.",
    secPwdTitle: "Cambiar contraseña", secPwdSubtitle: "Mínimo 8 caracteres. No pedimos la actual: tu sesión ya te identifica.",
    secNewPwd: "Nueva contraseña", secNewPwdPh: "Mínimo 8 caracteres", secRepeat: "Repetir nueva", secRepeatPh: "Repite tu contraseña",
    secSaving: "Guardando…", secChange: "Cambiar contraseña", secUpdated: "Contraseña actualizada",
    secErrShort: "La contraseña debe tener al menos 8 caracteres.", secErrMismatch: "Las contraseñas no coinciden.",
    sec2faTitle: "Autenticación en dos pasos (2FA)", sec2faSubtitle: "Una capa extra de seguridad al iniciar sesión.",
    sec2faName: "App autenticadora y código por SMS", sec2faDesc: "Pediremos un código adicional al iniciar sesión.",
    secDelTitle: "Eliminar cuenta", secDelSubtitle: "Si necesitas darte de baja, lo gestionamos contigo.",
    secDelText: "Por seguridad, la eliminación de cuenta y de tus datos se gestiona con nuestro equipo. Escríbenos y lo tramitamos.",
    secDelCta: "Solicitar eliminación de cuenta",
    intTitle: "Integraciones", intSubtitle: "Conectaremos SaludCoNet con las herramientas que ya usas.",
    intClinicCal: "Sincroniza tus cirugías con tu calendario", intClinicStripe: "Cobro con tarjeta y SEPA",
    intClinicPaypal: "Pago con PayPal", intClinicWebhooks: "Recibe eventos en tu endpoint HTTP",
    intProCal: "Sincroniza tu disponibilidad y reservas", intProApple: "Suscripción .ics de solo lectura",
    intProStripe: "Recibe pagos directamente en tu cuenta", intProWhatsapp: "Notificaciones en tu WhatsApp",
    billTitle: "Tu plan y facturas", billSubtitle: "La gestión completa está en la sección Suscripción.", billCta: "Ir a Suscripción →",
    payTitle: "Pagos y cobros", paySubtitle: "Aquí gestionarás tus cobros por las jornadas completadas.",
    payAutoTitle: "Cobros automáticos",
    payText: "Cuando habilitemos los pagos podrás añadir tu cuenta bancaria y recibir el cobro tras cada jornada. Mientras tanto, la tarifa se acuerda directamente con la clínica.",
  },
  en: {
    tabAccount: "Account", tabNotif: "Notifications", tabSecurity: "Security",
    tabIntegrations: "Integrations", tabBilling: "Billing", tabPayments: "Payments",
    comingSoon: "Coming soon",
    notifTitle: "How we notify you", notifSubtitle: "These are the alerts SaludCoNet sends today.",
    notifAppBold: "In-app notifications", notifAppRest: " (the bell) for every event: new surgeries, applications, confirmations, invitations and changes.",
    notifEmailBold: "Automatic email", notifEmailRest: " for important events, to your account email.",
    notifPrefsTitle: "Per-channel preferences, push and SMS", notifPrefsDesc: "Choose what to receive on each channel and a daily digest.",
    secPwdTitle: "Change password", secPwdSubtitle: "At least 8 characters. We don't ask for your current one: your session already identifies you.",
    secNewPwd: "New password", secNewPwdPh: "At least 8 characters", secRepeat: "Repeat new", secRepeatPh: "Repeat your password",
    secSaving: "Saving…", secChange: "Change password", secUpdated: "Password updated",
    secErrShort: "The password must be at least 8 characters.", secErrMismatch: "The passwords don't match.",
    sec2faTitle: "Two-factor authentication (2FA)", sec2faSubtitle: "An extra layer of security when signing in.",
    sec2faName: "Authenticator app and SMS code", sec2faDesc: "We'll ask for an additional code when signing in.",
    secDelTitle: "Delete account", secDelSubtitle: "If you need to close your account, we'll handle it with you.",
    secDelText: "For security, account and data deletion is handled by our team. Write to us and we'll process it.",
    secDelCta: "Request account deletion",
    intTitle: "Integrations", intSubtitle: "We'll connect SaludCoNet with the tools you already use.",
    intClinicCal: "Sync your surgeries with your calendar", intClinicStripe: "Card and SEPA payments",
    intClinicPaypal: "Pay with PayPal", intClinicWebhooks: "Receive events on your HTTP endpoint",
    intProCal: "Sync your availability and bookings", intProApple: "Read-only .ics subscription",
    intProStripe: "Receive payments directly in your account", intProWhatsapp: "Notifications on your WhatsApp",
    billTitle: "Your plan and invoices", billSubtitle: "Full management is in the Subscription section.", billCta: "Go to Subscription →",
    payTitle: "Payments", paySubtitle: "Here you'll manage your payouts for completed shifts.",
    payAutoTitle: "Automatic payouts",
    payText: "Once we enable payments you'll be able to add your bank account and get paid after each shift. In the meantime, the rate is agreed directly with the clinic.",
  },
};

type Copy = typeof COPY.es;

export function SettingsTabs({ role = "clinic", account }: { role?: Role; account: AccountData }) {
  const { lang } = useApp();
  const c = COPY[lang];
  const [active, setActive] = useState<Tab>("cuenta");

  const tabsByRole: Record<Role, Array<{ key: Tab; label: string; icon: React.ReactNode }>> = {
    clinic: [
      { key: "cuenta", label: c.tabAccount, icon: <IconUser /> },
      { key: "notif", label: c.tabNotif, icon: <IconBell /> },
      { key: "seguridad", label: c.tabSecurity, icon: <IconShield /> },
      { key: "integraciones", label: c.tabIntegrations, icon: <IconPlug /> },
      { key: "facturacion", label: c.tabBilling, icon: <IconCard /> },
    ],
    professional: [
      { key: "cuenta", label: c.tabAccount, icon: <IconUser /> },
      { key: "notif", label: c.tabNotif, icon: <IconBell /> },
      { key: "facturacion", label: c.tabPayments, icon: <IconCard /> },
      { key: "seguridad", label: c.tabSecurity, icon: <IconShield /> },
      { key: "integraciones", label: c.tabIntegrations, icon: <IconPlug /> },
    ],
  };
  const tabs = tabsByRole[role];

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
        {active === "notif" && <NotificationsPanel c={c} />}
        {active === "seguridad" && <SecurityPanel c={c} />}
        {active === "integraciones" && <IntegrationsPanel role={role} c={c} />}
        {active === "facturacion" && (role === "clinic" ? <BillingPanel c={c} /> : <PaymentsPanelPro c={c} />)}
      </div>
    </div>
  );
}

/* -------------------- Notificaciones (honesto) -------------------- */
function NotificationsPanel({ c }: { c: Copy }) {
  return (
    <div className="space-y-6">
      <Panel title={c.notifTitle} subtitle={c.notifSubtitle}>
        <ul className="space-y-3 text-sm text-ink-800">
          <li className="flex items-start gap-2.5">
            <CheckDot />
            <span><b>{c.notifAppBold}</b>{c.notifAppRest}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckDot />
            <span><b>{c.notifEmailBold}</b>{c.notifEmailRest}</span>
          </li>
        </ul>
        <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-mist-200 bg-mist-50/40 p-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-ink-900">{c.notifPrefsTitle}</div>
            <div className="text-xs text-mist-500">{c.notifPrefsDesc}</div>
          </div>
          <Badge tone="warning">{c.comingSoon}</Badge>
        </div>
      </Panel>
    </div>
  );
}

/* -------------------- Seguridad -------------------- */
function SecurityPanel({ c }: { c: Copy }) {
  const [newPwd, setNewPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok?: boolean; error?: string } | null>(null);

  function changePwd(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (newPwd.length < 8) {
      setMsg({ error: c.secErrShort });
      return;
    }
    if (newPwd !== confirm) {
      setMsg({ error: c.secErrMismatch });
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
        <Panel title={c.secPwdTitle} subtitle={c.secPwdSubtitle}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={c.secNewPwd}>
              <PasswordInput value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder={c.secNewPwdPh} autoComplete="new-password" />
            </Field>
            <Field label={c.secRepeat}>
              <PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={c.secRepeatPh} autoComplete="new-password" />
            </Field>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button type="submit" size="sm" disabled={pending}>{pending ? c.secSaving : c.secChange}</Button>
            {msg?.ok && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M5 12l4.5 4.5L19 7" /></svg>
                {c.secUpdated}
              </span>
            )}
            {msg?.error && <span className="text-xs text-red-600">{msg.error}</span>}
          </div>
        </Panel>
      </form>

      <Panel title={c.sec2faTitle} subtitle={c.sec2faSubtitle}>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-mist-200 bg-mist-50/40 p-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-ink-900">{c.sec2faName}</div>
            <div className="text-xs text-mist-500">{c.sec2faDesc}</div>
          </div>
          <Badge tone="warning">{c.comingSoon}</Badge>
        </div>
      </Panel>

      <Panel title={c.secDelTitle} subtitle={c.secDelSubtitle}>
        <p className="mb-4 text-sm text-mist-500">
          {c.secDelText}
        </p>
        <a
          href="/contact"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-300"
        >
          {c.secDelCta}
        </a>
      </Panel>
    </div>
  );
}

/* -------------------- Integraciones (honesto) -------------------- */
function IntegrationsPanel({ role = "clinic", c }: { role?: Role; c: Copy }) {
  const integrations = role === "clinic"
    ? [
        { name: "Google Calendar", desc: c.intClinicCal },
        { name: "Stripe", desc: c.intClinicStripe },
        { name: "PayPal", desc: c.intClinicPaypal },
        { name: "Webhooks", desc: c.intClinicWebhooks },
      ]
    : [
        { name: "Google Calendar", desc: c.intProCal },
        { name: "Apple Calendar", desc: c.intProApple },
        { name: "Stripe Connect", desc: c.intProStripe },
        { name: "WhatsApp Business", desc: c.intProWhatsapp },
      ];

  return (
    <div className="space-y-6">
      <Panel title={c.intTitle} subtitle={c.intSubtitle}>
        <div className="grid gap-3 md:grid-cols-2">
          {integrations.map((it) => (
            <div key={it.name} className="flex items-start gap-3 rounded-xl border border-mist-200 bg-mist-50/40 p-4">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 ring-1 ring-mist-200">
                <IconPlug />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="truncate text-sm font-semibold text-ink-900">{it.name}</div>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-mist-400">{c.comingSoon}</span>
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
function BillingPanel({ c }: { c: Copy }) {
  return (
    <div className="space-y-6">
      <Panel title={c.billTitle} subtitle={c.billSubtitle}>
        <a
          href="/dashboard/clinic/subscription"
          className="inline-flex h-11 items-center justify-center rounded-full bg-brand-600 px-5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)] hover:bg-brand-700"
        >
          {c.billCta}
        </a>
      </Panel>
    </div>
  );
}

/* -------------------- Pagos y cobros · Profesional (honesto) -------------------- */
function PaymentsPanelPro({ c }: { c: Copy }) {
  return (
    <div className="space-y-6">
      <Panel title={c.payTitle} subtitle={c.paySubtitle}>
        <div className="flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50/50 p-4 dark:border-brand-400/30 dark:bg-brand-500/10">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 ring-1 ring-brand-200 dark:bg-brand-500/20 dark:text-cyan-200 dark:ring-brand-400/30">
            <IconCard />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-ink-900">{c.payAutoTitle}</span>
              <Badge tone="warning">{c.comingSoon}</Badge>
            </div>
            <p className="mt-1 text-sm text-mist-500">
              {c.payText}
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
