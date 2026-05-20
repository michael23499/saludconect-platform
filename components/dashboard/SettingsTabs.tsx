"use client";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Checkbox } from "@/components/ui/Input";
import { SelectMenu } from "@/components/ui/SelectMenu";

type Role = "clinica" | "profesional";
type Tab = "cuenta" | "notif" | "seguridad" | "integraciones" | "facturacion";

const TABS_BY_ROLE: Record<Role, Array<{ key: Tab; label: string; icon: React.ReactNode }>> = {
  clinica: [
    { key: "cuenta", label: "Cuenta", icon: <IconUser /> },
    { key: "notif", label: "Notificaciones", icon: <IconBell /> },
    { key: "seguridad", label: "Seguridad", icon: <IconShield /> },
    { key: "integraciones", label: "Integraciones", icon: <IconPlug /> },
    { key: "facturacion", label: "Facturación", icon: <IconCard /> },
  ],
  profesional: [
    { key: "cuenta", label: "Cuenta", icon: <IconUser /> },
    { key: "notif", label: "Notificaciones", icon: <IconBell /> },
    { key: "facturacion", label: "Pagos y cobros", icon: <IconCard /> },
    { key: "seguridad", label: "Seguridad", icon: <IconShield /> },
    { key: "integraciones", label: "Integraciones", icon: <IconPlug /> },
  ],
};

export function SettingsTabs({ role = "clinica" }: { role?: Role }) {
  const [active, setActive] = useState<Tab>("cuenta");
  const tabs = TABS_BY_ROLE[role];

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      {/* Vertical tabs */}
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
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-ink-800 hover:bg-mist-50"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg border",
                  isActive
                    ? "border-brand-200 bg-white text-brand-700"
                    : "border-mist-200 bg-mist-50 text-ink-700"
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
        {active === "cuenta" && (role === "clinica" ? <AccountPanel /> : <AccountPanelPro />)}
        {active === "notif" && <NotificationsPanel role={role} />}
        {active === "seguridad" && <SecurityPanel />}
        {active === "integraciones" && <IntegrationsPanel role={role} />}
        {active === "facturacion" && (role === "clinica" ? <BillingPanel /> : <PaymentsPanelPro />)}
      </div>
    </div>
  );
}

/* -------------------- Cuenta -------------------- */
function AccountPanel() {
  const [name, setName] = useState("Clínica Mediterránea");
  const [email, setEmail] = useState("info@clinicamediterranea.es");
  const [phone, setPhone] = useState("+34 91 555 12 34");
  const [city, setCity] = useState("Madrid");
  const [address, setAddress] = useState("Calle Alcalá 200, 28028 Madrid");
  const [bio, setBio] = useState("Clínica privada multidisciplinar en el centro de Madrid. Atención cardiológica, fisioterapia y enfermería.");
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2000); }}
    >
      <Panel title="Perfil de la clínica" subtitle="Datos visibles para los profesionales que reserves.">
        <div className="flex items-center gap-4">
          <Avatar name={name} size="xl" />
          <div className="flex flex-col gap-2">
            <Button variant="secondary" size="sm" type="button">Cambiar logo</Button>
            <span className="text-xs text-mist-500">JPG o PNG · máx. 2 MB</span>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Nombre de la clínica"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Email corporativo"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Field label="Teléfono"><Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
          <Field label="Ciudad">
            <SelectMenu options={["Madrid", "Barcelona", "Valencia", "Sevilla", "Bilbao", "Zaragoza"]} value={city} onChange={setCity} />
          </Field>
          <Field label="Dirección" className="md:col-span-2"><Input value={address} onChange={(e) => setAddress(e.target.value)} /></Field>
          <Field label="Descripción pública" className="md:col-span-2"><Textarea value={bio} onChange={(e) => setBio(e.target.value)} /></Field>
        </div>
      </Panel>

      <Panel title="Datos fiscales" subtitle="Aparecen en las facturas emitidas.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Razón social"><Input defaultValue="Clínica Mediterránea S.L." /></Field>
          <Field label="CIF / NIF"><Input defaultValue="B-12345678" /></Field>
          <Field label="Dirección fiscal" className="md:col-span-2"><Input defaultValue="Calle Alcalá 200, 28028 Madrid" /></Field>
        </div>
      </Panel>

      <FooterActions saved={saved} />
    </form>
  );
}

/* -------------------- Cuenta · Profesional -------------------- */
function AccountPanelPro() {
  const [name, setName] = useState("Dra. Lucía Martín");
  const [email, setEmail] = useState("lucia.martin@saludconet.demo");
  const [phone, setPhone] = useState("+34 612 345 678");
  const [city, setCity] = useState("Madrid");
  const [specialty, setSpecialty] = useState("Cardiología");
  const [profession, setProfession] = useState("Médico/a");
  const [colegio, setColegio] = useState("28-12345-MAD");
  const [bio, setBio] = useState("Cardióloga clínica con 12 años de experiencia. Especialista en ecocardiografía, Holter de 24 h y consulta de alta resolución.");
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2000); }}
    >
      <Panel title="Perfil profesional" subtitle="Estos datos son visibles para las clínicas que te encuentren.">
        <div className="flex items-center gap-4">
          <Avatar name={name} size="xl" />
          <div className="flex flex-col gap-2">
            <Button variant="secondary" size="sm" type="button">Cambiar foto</Button>
            <span className="text-xs text-mist-500">JPG o PNG · máx. 2 MB · fondo neutro</span>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Nombre completo"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Field label="Teléfono"><Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
          <Field label="Ciudad base">
            <SelectMenu options={["Madrid", "Barcelona", "Valencia", "Sevilla", "Bilbao", "Zaragoza", "Málaga"]} value={city} onChange={setCity} />
          </Field>
          <Field label="Profesión">
            <SelectMenu
              options={["Médico/a", "Enfermero/a", "Fisioterapeuta", "Odontólogo/a", "Psicólogo/a", "Auxiliar de enfermería"]}
              value={profession}
              onChange={setProfession}
            />
          </Field>
          <Field label="Especialidad principal">
            <SelectMenu
              options={["Cardiología", "Pediatría", "Odontología", "Fisioterapia", "Enfermería", "Anestesia", "Ginecología", "Psicología"]}
              value={specialty}
              onChange={setSpecialty}
            />
          </Field>
          <Field label="Nº de colegiado"><Input value={colegio} onChange={(e) => setColegio(e.target.value)} /></Field>
          <Field label="Idiomas">
            <SelectMenu options={["Español", "Español · Inglés", "Español · Inglés · Portugués", "Español · Inglés · Francés"]} defaultValue="Español · Inglés · Portugués" />
          </Field>
          <Field label="Biografía pública" className="md:col-span-2">
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} />
          </Field>
        </div>
      </Panel>

      <Panel title="Visibilidad de tu perfil" subtitle="Decide quién puede encontrarte y reservarte.">
        <ToggleRow label="Perfil visible en buscador público" desc="Las clínicas verificadas pueden verte y enviarte solicitudes." defaultChecked />
        <ToggleRow label="Aceptar reservas automáticamente" desc="Solo de clínicas con valoración 4,5★ o superior." />
        <ToggleRow label="Modo vacaciones" desc="Tu perfil aparece como 'no disponible' hasta una fecha que tú elijas." />
      </Panel>

      <FooterActions saved={saved} />
    </form>
  );
}

/* -------------------- Pagos y cobros · Profesional -------------------- */
function PaymentsPanelPro() {
  const [saved, setSaved] = useState(false);
  const [iban, setIban] = useState("ES76 0049 1500 0512 3456 7890");
  const [regime, setRegime] = useState("Autónomo");
  const [nif, setNif] = useState("12345678-A");
  const [address, setAddress] = useState("Calle Alcalá 200, 28028 Madrid");

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2000); }}
    >
      <Panel title="Cuenta bancaria para cobros" subtitle="Donde recibirás tus pagos por jornadas completadas.">
        <div className="grid gap-4">
          <Field label="IBAN" hint="Cuenta a tu nombre o de tu sociedad.">
            <Input value={iban} onChange={(e) => setIban(e.target.value)} className="font-mono" />
          </Field>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12l4.5 4.5L19 7" /></svg>
              </span>
              <div>
                <div className="text-sm font-semibold text-emerald-800">IBAN verificado por Stripe</div>
                <div className="text-xs text-emerald-700/80">Tus pagos llegan en 2-3 días laborables tras el cierre de cada jornada.</div>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Datos fiscales" subtitle="Aparecen en las facturas que emites a las clínicas.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Régimen fiscal">
            <SelectMenu options={["Autónomo", "Sociedad limitada (S.L.)", "Cooperativa"]} value={regime} onChange={setRegime} />
          </Field>
          <Field label="NIF / DNI"><Input value={nif} onChange={(e) => setNif(e.target.value)} /></Field>
          <Field label="Dirección fiscal" className="md:col-span-2">
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </Field>
          <Field label="IVA aplicable">
            <SelectMenu options={["Exento (servicios médicos)", "21% general", "10% reducido"]} defaultValue="Exento (servicios médicos)" />
          </Field>
          <Field label="Retención IRPF">
            <SelectMenu options={["Sin retención", "7% (nuevos autónomos)", "15% (régimen general)"]} defaultValue="15% (régimen general)" />
          </Field>
        </div>
      </Panel>

      <Panel title="Facturación automática" subtitle="Generamos las facturas por ti al cierre de cada jornada.">
        <ToggleRow label="Generar factura automáticamente" desc="Al confirmarse una jornada se emite la factura a nombre de la clínica." defaultChecked />
        <ToggleRow label="Enviar copia a mi email" desc="Recibirás un PDF en tu correo." defaultChecked />
        <ToggleRow label="Numeración personalizada" desc="Usa tu propio prefijo (ej. 2026/0001)." />
      </Panel>

      <Panel title="Historial de cobros" subtitle="Últimos pagos recibidos.">
        <ul className="divide-y divide-mist-100">
          {[
            { date: "12 may 2026", concept: "Clínica Sanitas Norte · Cardiología", amount: "510,00 €", status: "Cobrado" },
            { date: "21 abr 2026", concept: "Centro Médico Bilbao · Cardiología", amount: "360,00 €", status: "Cobrado" },
            { date: "13 abr 2026", concept: "Hospital HM Madrid · Cardiología", amount: "520,00 €", status: "Cobrado" },
          ].map((r) => (
            <li key={r.date + r.concept} className="flex items-center justify-between gap-3 py-3 text-sm">
              <div>
                <div className="font-semibold text-ink-900">{r.concept}</div>
                <div className="text-xs text-mist-500">{r.date}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold tabular-nums text-ink-900">{r.amount}</span>
                <Badge tone="success">{r.status}</Badge>
                <button type="button" className="text-xs font-semibold text-brand-700 hover:text-brand-800">Factura</button>
              </div>
            </li>
          ))}
        </ul>
        <button type="button" className="mt-4 text-xs font-semibold text-brand-700 hover:text-brand-800">
          Ver historial completo →
        </button>
      </Panel>

      <FooterActions saved={saved} />
    </form>
  );
}

/* -------------------- Notificaciones -------------------- */
function NotificationsPanel({ role = "clinica" }: { role?: Role }) {
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2000); }}
    >
      <Panel
        title="Canales de notificación"
        subtitle="Elige cómo prefieres recibir cada tipo de evento."
      >
        <NotifTable role={role} />
      </Panel>

      <Panel title="Resumen diario" subtitle="Recibe un resumen al final del día con tu actividad.">
        <ToggleRow
          label="Email resumen"
          desc="Cada día a las 19:00 con próximas reservas, mensajes y solicitudes."
          defaultChecked
        />
        <ToggleRow
          label="WhatsApp Business"
          desc="Resumen vía WhatsApp (próximamente)."
          disabled
          comingSoon
        />
      </Panel>

      <Panel title="Modo no molestar" subtitle="Pausa notificaciones push fuera del horario laboral.">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Activar de"><Input type="time" defaultValue="20:00" /></Field>
          <Field label="Hasta"><Input type="time" defaultValue="08:00" /></Field>
          <Field label="Días">
            <SelectMenu
              options={["Lun a Vie", "Todos los días", "Sólo fin de semana"]}
              defaultValue="Lun a Vie"
            />
          </Field>
        </div>
      </Panel>

      <FooterActions saved={saved} />
    </form>
  );
}

function NotifTable({ role = "clinica" }: { role?: Role }) {
  const rows = role === "clinica"
    ? [
        { label: "Nueva solicitud de reserva", email: true, push: true, sms: false },
        { label: "Reserva confirmada", email: true, push: true, sms: false },
        { label: "Mensaje recibido", email: false, push: true, sms: false },
        { label: "Documento caduca pronto", email: true, push: true, sms: true },
        { label: "Factura disponible", email: true, push: false, sms: false },
        { label: "Actualizaciones del producto", email: false, push: false, sms: false },
      ]
    : [
        { label: "Nueva solicitud de clínica", email: true, push: true, sms: true },
        { label: "Reserva confirmada", email: true, push: true, sms: false },
        { label: "Mensaje recibido", email: false, push: true, sms: false },
        { label: "Cancelación o reprogramación", email: true, push: true, sms: true },
        { label: "Nueva valoración recibida", email: true, push: true, sms: false },
        { label: "Recordatorio 24 h antes de jornada", email: true, push: true, sms: true },
        { label: "Documento caduca pronto", email: true, push: false, sms: false },
        { label: "Pago recibido", email: true, push: true, sms: false },
        { label: "Actualizaciones del producto", email: false, push: false, sms: false },
      ];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-[11px] font-semibold uppercase tracking-wider text-mist-500">
          <tr>
            <th className="py-2 pr-3">Evento</th>
            <th className="px-3 py-2 text-center">Email</th>
            <th className="px-3 py-2 text-center">Push</th>
            <th className="px-3 py-2 text-center">SMS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-mist-100">
          {rows.map((r) => (
            <tr key={r.label}>
              <td className="py-3 pr-3 text-ink-800">{r.label}</td>
              <td className="px-3 py-3 text-center"><MiniToggle defaultChecked={r.email} /></td>
              <td className="px-3 py-3 text-center"><MiniToggle defaultChecked={r.push} /></td>
              <td className="px-3 py-3 text-center"><MiniToggle defaultChecked={r.sms} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------- Seguridad -------------------- */
function SecurityPanel() {
  const [saved, setSaved] = useState(false);
  return (
    <form
      className="space-y-6"
      onSubmit={(e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2000); }}
    >
      <Panel title="Cambiar contraseña" subtitle="Recomendado cada 90 días.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Contraseña actual" className="md:col-span-2"><Input type="password" placeholder="•••••••••" /></Field>
          <Field label="Nueva contraseña"><Input type="password" placeholder="Mínimo 10 caracteres" /></Field>
          <Field label="Repetir nueva"><Input type="password" placeholder="Repite tu contraseña" /></Field>
        </div>
      </Panel>

      <Panel title="Autenticación en dos pasos (2FA)" subtitle="Añade una capa extra de seguridad.">
        <ToggleRow
          label="App autenticadora (Google Authenticator, 1Password…)"
          desc="Pediremos un código de 6 dígitos al iniciar sesión."
        />
        <ToggleRow
          label="Código por SMS"
          desc="Te enviaremos un código al teléfono asociado."
        />
      </Panel>

      <Panel title="Sesiones activas" subtitle="Dispositivos con sesión abierta.">
        <ul className="divide-y divide-mist-100">
          {[
            { device: "MacBook Pro · Chrome", where: "Madrid · IP 88.21.x.x", when: "Activa ahora", current: true },
            { device: "iPhone 15 · Safari", where: "Madrid · IP 88.21.x.x", when: "hace 4 h", current: false },
            { device: "iPad · Chrome", where: "Toledo · IP 79.10.x.x", when: "hace 3 días", current: false },
          ].map((s) => (
            <li key={s.device} className="flex items-center justify-between gap-3 py-3">
              <div>
                <div className="text-sm font-semibold text-ink-900">
                  {s.device}
                  {s.current && <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Sesión actual</span>}
                </div>
                <div className="text-xs text-mist-500">{s.where} · {s.when}</div>
              </div>
              {!s.current && (
                <button type="button" className="rounded-lg border border-red-100 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50">Cerrar sesión</button>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <button type="button" className="text-xs font-semibold text-red-700 hover:text-red-800">Cerrar todas las demás sesiones →</button>
        </div>
      </Panel>

      <Panel title="Eliminar cuenta" subtitle="Esta acción es irreversible. Te enviaremos un email de confirmación.">
        <button type="button" className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100">
          Solicitar eliminación de cuenta
        </button>
      </Panel>

      <FooterActions saved={saved} />
    </form>
  );
}

/* -------------------- Integraciones -------------------- */
function IntegrationsPanel({ role = "clinica" }: { role?: Role }) {
  const integrations = role === "clinica"
    ? [
        { name: "Google Calendar", desc: "Sincroniza reservas con tu calendario", status: "conectado" },
        { name: "Microsoft Outlook", desc: "Sincroniza reservas con Outlook", status: "disponible" },
        { name: "Stripe", desc: "Cobro con tarjeta y SEPA", status: "proximamente" },
        { name: "PayPal", desc: "Pago con PayPal", status: "proximamente" },
        { name: "Slack", desc: "Notificaciones en tu canal", status: "disponible" },
        { name: "Zapier", desc: "Conecta con +5.000 apps", status: "disponible" },
        { name: "Webhooks", desc: "Recibe eventos en tu endpoint HTTP", status: "disponible" },
        { name: "API REST", desc: "Acceso programático completo", status: "disponible" },
      ]
    : [
        { name: "Google Calendar", desc: "Sincroniza tu disponibilidad y reservas", status: "conectado" },
        { name: "Apple Calendar", desc: "Suscripción .ics de solo lectura", status: "disponible" },
        { name: "Microsoft Outlook", desc: "Sincroniza reservas con Outlook", status: "disponible" },
        { name: "Stripe Connect", desc: "Recibe pagos directamente en tu cuenta", status: "conectado" },
        { name: "PayPal", desc: "Cobra también vía PayPal", status: "disponible" },
        { name: "Holded · Quipu", desc: "Exporta facturas a tu gestor", status: "disponible" },
        { name: "WhatsApp Business", desc: "Notificaciones en tu WhatsApp", status: "proximamente" },
        { name: "Webhooks", desc: "Recibe eventos en tu endpoint HTTP", status: "disponible" },
      ];

  return (
    <div className="space-y-6">
      <Panel
        title="Integraciones disponibles"
        subtitle="Conecta SaludCoNet con las herramientas que ya usas."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {integrations.map((it) => (
            <div key={it.name} className="card-hover flex items-start gap-3 rounded-xl border border-mist-200 bg-mist-50/40 p-4">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 ring-1 ring-mist-200">
                <IconPlug />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="truncate text-sm font-semibold text-ink-900">{it.name}</div>
                  {it.status === "conectado" && <Badge tone="success">Conectado</Badge>}
                  {it.status === "proximamente" && <Badge tone="warning">Próximamente</Badge>}
                </div>
                <div className="text-xs text-mist-500">{it.desc}</div>
                <div className="mt-3">
                  {it.status === "conectado" ? (
                    <button className="text-xs font-semibold text-red-700 hover:text-red-800">Desconectar</button>
                  ) : it.status === "proximamente" ? (
                    <button className="text-xs font-medium text-mist-400" disabled>Próximamente</button>
                  ) : (
                    <button className="rounded-lg border border-mist-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-800 hover:bg-white">
                      Conectar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* -------------------- Facturación -------------------- */
function BillingPanel() {
  return (
    <div className="space-y-6">
      <Panel title="Tu plan y facturas" subtitle="La gestión completa está en la sección Suscripción.">
        <a
          href="/dashboard/clinica/suscripcion"
          className="inline-flex h-11 items-center justify-center rounded-full bg-brand-600 px-5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)] hover:bg-brand-700"
        >
          Ir a Suscripción →
        </a>
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

function FooterActions({ saved }: { saved: boolean }) {
  return (
    <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-mist-200 bg-white/90 p-3 shadow-[var(--shadow-card)] backdrop-blur">
      <div className="ml-2 text-xs text-mist-500">
        {saved ? (
          <span className="inline-flex items-center gap-1.5 text-emerald-700">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M5 12l4.5 4.5L19 7" /></svg>
            Cambios guardados
          </span>
        ) : (
          "Recuerda guardar los cambios antes de salir"
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" type="reset">Cancelar</Button>
        <Button size="sm" type="submit">Guardar cambios</Button>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  defaultChecked,
  disabled,
  comingSoon,
}: {
  label: string;
  desc?: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  comingSoon?: boolean;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 py-3", disabled && "opacity-60")}>
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          {label}
          {comingSoon && <Badge tone="warning">Próximamente</Badge>}
        </div>
        {desc && <div className="text-xs text-mist-500">{desc}</div>}
      </div>
      <MiniToggle defaultChecked={defaultChecked} disabled={disabled} />
    </div>
  );
}

function MiniToggle({ defaultChecked, disabled }: { defaultChecked?: boolean; disabled?: boolean }) {
  const [on, setOn] = useState(!!defaultChecked);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => setOn((s) => !s)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        on ? "bg-brand-600" : "bg-mist-300",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
          on ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
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
