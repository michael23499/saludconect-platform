"use client";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/components/providers/Providers";

const COPY = {
  es: {
    eyebrow: "Planes",
    title1: "Simple. ",
    title2: "Transparente. Sin sorpresas.",
    desc: "Los profesionales son gratis. Las clínicas eligen un plan según su tamaño. Sin permanencia, sin comisión por reserva.",
    proName: "Profesional",
    proTag: "Para todos los profesionales sanitarios",
    proPrice: "Gratis",
    proDesc: "Para siempre. Sin tarjeta de crédito.",
    proCta: "Crear perfil",
    proFeatures: [
      "Perfil profesional verificado",
      "Calendario y gestión de disponibilidad",
      "Reservas y mensajería ilimitadas",
      "Pagos sin comisión",
      "Documentación cifrada",
      "Sistema de reputación y badges",
    ],
    starterName: "Clínica Starter",
    starterTag: "Para clínicas pequeñas",
    starterPrice: "79",
    starterDesc: "Hasta 10 reservas activas al mes.",
    starterCta: "Probar 14 días",
    starterFeatures: [
      "10 reservas activas",
      "Búsqueda avanzada con filtros",
      "Mensajería interna",
      "Pagos integrados",
      "Soporte por email",
    ],
    proCName: "Clínica Pro",
    proCTag: "El más elegido",
    proCPrice: "149",
    proCDesc: "Reservas ilimitadas y prioridad en solicitudes.",
    proCCta: "Probar 14 días",
    proCFeatures: [
      "Reservas ilimitadas",
      "Multi-sede y multi-usuario",
      "Solicitudes prioritarias",
      "Facturación automática",
      "Soporte prioritario",
      "Acceso a perfiles Elite",
    ],
    enterpriseName: "Enterprise",
    enterpriseTag: "Cadenas y grupos hospitalarios",
    enterprisePrice: "A medida",
    enterpriseDesc: "Volumen alto, SLA, SSO, integraciones.",
    enterpriseCta: "Hablar con ventas",
    enterpriseFeatures: [
      "Volumen ilimitado",
      "SSO y permisos granulares",
      "API y exportes",
      "SLA dedicado",
      "Account manager",
    ],
    perMonth: "/mes",
    incl: "IVA incl.",
    trial: "Prueba gratuita 14 días",
    cancelAny: "Cancela cuando quieras",
    noCommission: "Sin comisión por reserva",
    everything: "Todo lo del plan anterior, más:",
  },
  en: {
    eyebrow: "Plans",
    title1: "Simple. ",
    title2: "Transparent. No surprises.",
    desc: "Professionals are free. Clinics pick a plan based on size. No lock-in, no per-booking fees.",
    proName: "Professional",
    proTag: "For every healthcare professional",
    proPrice: "Free",
    proDesc: "Forever. No credit card.",
    proCta: "Create profile",
    proFeatures: [
      "Verified professional profile",
      "Availability and calendar",
      "Unlimited bookings and chat",
      "No commission on bookings",
      "Encrypted document vault",
      "Reputation system & badges",
    ],
    starterName: "Clinic Starter",
    starterTag: "For small clinics",
    starterPrice: "79",
    starterDesc: "Up to 10 active bookings per month.",
    starterCta: "Start 14-day trial",
    starterFeatures: [
      "10 active bookings",
      "Advanced search filters",
      "Internal messaging",
      "Integrated payments",
      "Email support",
    ],
    proCName: "Clinic Pro",
    proCTag: "Most chosen",
    proCPrice: "149",
    proCDesc: "Unlimited bookings and priority on requests.",
    proCCta: "Start 14-day trial",
    proCFeatures: [
      "Unlimited bookings",
      "Multi-site & multi-user",
      "Priority requests",
      "Automated invoicing",
      "Priority support",
      "Access to Elite profiles",
    ],
    enterpriseName: "Enterprise",
    enterpriseTag: "Hospital groups and chains",
    enterprisePrice: "Custom",
    enterpriseDesc: "High volume, SLA, SSO, integrations.",
    enterpriseCta: "Talk to sales",
    enterpriseFeatures: [
      "Unlimited volume",
      "SSO & granular permissions",
      "API & exports",
      "Dedicated SLA",
      "Account manager",
    ],
    perMonth: "/mo",
    incl: "VAT included",
    trial: "14-day free trial",
    cancelAny: "Cancel anytime",
    noCommission: "No per-booking fee",
    everything: "Everything in the previous plan, plus:",
  },
};

export function Pricing() {
  const { lang } = useApp();
  const c = COPY[lang];

  const plans = [
    {
      name: c.proName, tag: c.proTag, price: c.proPrice, currency: null, desc: c.proDesc,
      cta: { label: c.proCta, href: "/registro?rol=profesional" }, features: c.proFeatures,
      tone: "neutral" as const, highlight: false,
    },
    {
      name: c.starterName, tag: c.starterTag, price: c.starterPrice, currency: "€", desc: c.starterDesc,
      cta: { label: c.starterCta, href: "/registro?rol=clinica" }, features: c.starterFeatures,
      tone: "neutral" as const, highlight: false,
    },
    {
      name: c.proCName, tag: c.proCTag, price: c.proCPrice, currency: "€", desc: c.proCDesc,
      cta: { label: c.proCCta, href: "/registro?rol=clinica" }, features: c.proCFeatures,
      tone: "dark" as const, highlight: true,
    },
    {
      name: c.enterpriseName, tag: c.enterpriseTag, price: c.enterprisePrice, currency: null, desc: c.enterpriseDesc,
      cta: { label: c.enterpriseCta, href: "/contacto" }, features: c.enterpriseFeatures,
      tone: "neutral" as const, highlight: false,
    },
  ];

  return (
    <Section className="bg-mist-50">
      <SectionHeading
        eyebrow={c.eyebrow}
        title={<>{c.title1}<span className="text-gradient-brand">{c.title2}</span></>}
        description={c.desc}
      />

      <div className="mt-14 grid gap-3 lg:grid-cols-4">
        {plans.map((p) => (
          <div
            key={p.name}
            className={
              p.tone === "dark"
                ? "relative flex flex-col rounded-3xl border border-brand-300/40 bg-gradient-to-br from-ink-950 to-ink-900 p-6 text-white shadow-[0_30px_60px_-30px_rgba(37,99,235,0.55)]"
                : "relative flex flex-col rounded-3xl border border-mist-200 bg-white p-6"
            }
          >
            {p.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-400 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-900">
                {p.tag}
              </span>
            )}
            <div className={p.tone === "dark" ? "text-[11px] font-semibold uppercase tracking-wider text-cyan-300" : "text-[11px] font-semibold uppercase tracking-wider text-brand-700"}>
              {p.tag}
            </div>
            <div className={p.tone === "dark" ? "mt-1 text-xl font-semibold tracking-tight" : "mt-1 text-xl font-semibold tracking-tight text-ink-900"}>
              {p.name}
            </div>

            <div className="mt-5 flex items-end gap-1.5">
              {p.currency && (
                <span className={p.tone === "dark" ? "pb-2 text-base text-white/60" : "pb-2 text-base text-mist-500"}>
                  {p.currency}
                </span>
              )}
              <span className={p.tone === "dark" ? "text-4xl font-semibold tracking-tight" : "text-4xl font-semibold tracking-tight text-ink-900"}>
                {p.price}
              </span>
              {p.currency && (
                <span className={p.tone === "dark" ? "pb-2 text-sm text-white/60" : "pb-2 text-sm text-mist-500"}>
                  {c.perMonth}
                </span>
              )}
            </div>
            <p className={p.tone === "dark" ? "mt-2 text-sm text-white/70" : "mt-2 text-sm text-mist-500"}>{p.desc}</p>

            <Button
              href={p.cta.href}
              size="md"
              variant={p.tone === "dark" ? "primary" : "secondary"}
              className="mt-6 w-full justify-center"
            >
              {p.cta.label}
            </Button>

            <ul className="mt-6 space-y-2.5 border-t border-white/5 pt-5">
              {p.features.map((f) => (
                <li key={f} className={p.tone === "dark" ? "flex items-start gap-2.5 text-[13px] text-white/85" : "flex items-start gap-2.5 text-[13px] text-ink-800"}>
                  <svg className={p.tone === "dark" ? "mt-0.5 h-4 w-4 shrink-0 text-cyan-400" : "mt-0.5 h-4 w-4 shrink-0 text-brand-600"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
                    <path d="M5 12l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-mist-500">
        <span className="inline-flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12l4.5 4.5L19 7" /></svg>
          {c.trial}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12l4.5 4.5L19 7" /></svg>
          {c.cancelAny}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12l4.5 4.5L19 7" /></svg>
          {c.noCommission}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12l4.5 4.5L19 7" /></svg>
          {c.incl}
        </span>
      </div>
    </Section>
  );
}
