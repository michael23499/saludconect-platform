"use client";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/components/providers/Providers";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

const COPY = {
  es: {
    eyebrow: "Planes",
    title1: "Simple. ",
    title2: "Transparente. Sin sorpresas.",
    desc: "Los profesionales son gratis. Las clínicas eligen un plan según su tamaño. Sin permanencia, sin comisión por reserva.",
    bestseller: "+320 clínicas lo eligen",
    saving: "Ahorra 2 meses al año",
    proName: "Profesional",
    proTag: "Profesionales sanitarios",
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
    starterTag: "Clínicas pequeñas",
    starterPrice: "79",
    starterDesc: "Hasta 10 reservas activas al mes.",
    starterCta: "Probar 14 días",
    starterFeatures: [
      "Hasta 10 reservas activas/mes",
      "Equipo de hasta 3 profesionales",
      "Panel de gestión de clínica",
      "Búsqueda avanzada con filtros",
      "Mensajería interna y notificaciones",
      "Pagos integrados",
      "Recordatorios automáticos a pacientes",
      "Soporte por email",
    ],
    proCName: "Clínica Pro",
    proCTag: "Clínicas medianas y grandes",
    proCPrice: "149",
    proCDesc: "Reservas ilimitadas y prioridad en solicitudes.",
    proCCta: "Probar 14 días",
    proCFeatures: [
      "Reservas ilimitadas",
      "Multi-sede y multi-usuario",
      "Solicitudes prioritarias",
      "Facturación automática",
      "Soporte prioritario 24/7",
      "Acceso a perfiles Elite",
      "Webhooks e integraciones",
      "Branding personalizado",
      "Reportes y analíticas avanzadas",
    ],
    enterpriseName: "Enterprise",
    enterpriseTag: "Grupos hospitalarios",
    enterprisePrice: "A medida",
    enterpriseDesc: "Volumen alto, SLA, SSO, integraciones.",
    enterpriseCta: "Hablar con ventas",
    enterpriseFeatures: [
      "Volumen ilimitado",
      "SSO y permisos granulares",
      "API y exportes",
      "SLA dedicado",
      "Account manager dedicado",
      "Integraciones a medida",
    ],
    perMonth: "/mes",
    incl: "IVA incl.",
    trial: "Prueba gratuita 14 días",
    cancelAny: "Cancela cuando quieras",
    noCommission: "Sin comisión por reserva",
    everything: "Todo lo del plan anterior, más:",
    compare: "Comparar todas las funcionalidades",
  },
  en: {
    eyebrow: "Plans",
    title1: "Simple. ",
    title2: "Transparent. No surprises.",
    desc: "Professionals are free. Clinics pick a plan based on size. No lock-in, no per-booking fees.",
    bestseller: "+320 clinics on this plan",
    saving: "Save 2 months / year",
    proName: "Professional",
    proTag: "Healthcare professionals",
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
    starterTag: "Small clinics",
    starterPrice: "79",
    starterDesc: "Up to 10 active bookings per month.",
    starterCta: "Start 14-day trial",
    starterFeatures: [
      "Up to 10 active bookings / mo",
      "Team of up to 3 professionals",
      "Clinic management dashboard",
      "Advanced search filters",
      "Internal messaging & notifications",
      "Integrated payments",
      "Automated patient reminders",
      "Email support",
    ],
    proCName: "Clinic Pro",
    proCTag: "Mid-to-large clinics",
    proCPrice: "149",
    proCDesc: "Unlimited bookings and priority on requests.",
    proCCta: "Start 14-day trial",
    proCFeatures: [
      "Unlimited bookings",
      "Multi-site & multi-user",
      "Priority requests",
      "Automated invoicing",
      "Priority 24/7 support",
      "Access to Elite profiles",
      "Webhooks & integrations",
    ],
    enterpriseName: "Enterprise",
    enterpriseTag: "Hospital groups",
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
    compare: "Compare all features",
  },
};

const ICONS: Record<string, ReactNode> = {
  professional: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 21c1-4 4.2-6 7-6s6 2 7 6" />
    </svg>
  ),
  starter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 21V9l8-5 8 5v12" />
      <path d="M10 21v-7h4v7" />
      <path d="M8 11h.01M16 11h.01" strokeWidth="2.4" />
    </svg>
  ),
  pro: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 21V11l5-3 5 3v10" />
      <path d="M13 21V13l4-2 4 2v8" />
      <path d="M6 15h2M6 18h2M16 16h2M16 19h2" />
      <path d="M3 21h18" />
    </svg>
  ),
  enterprise: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" />
      <path d="M10 21v-3h4v3" />
    </svg>
  ),
};

type Tone = "neutral" | "dark";
type Plan = {
  key: "professional" | "starter" | "pro" | "enterprise";
  name: string;
  tag: string;
  price: string;
  currency: string | null;
  desc: string;
  cta: { label: string; href: string };
  features: string[];
  tone: Tone;
  highlight: boolean;
  showPeriod: boolean;
};

export function Pricing() {
  const { lang } = useApp();
  const c = COPY[lang];

  const plans: Plan[] = [
    {
      key: "professional", name: c.proName, tag: c.proTag, price: c.proPrice, currency: null,
      desc: c.proDesc, cta: { label: c.proCta, href: "/registro?rol=profesional" },
      features: c.proFeatures, tone: "neutral", highlight: false, showPeriod: false,
    },
    {
      key: "starter", name: c.starterName, tag: c.starterTag, price: c.starterPrice, currency: "€",
      desc: c.starterDesc, cta: { label: c.starterCta, href: "/registro?rol=clinica" },
      features: c.starterFeatures, tone: "neutral", highlight: false, showPeriod: true,
    },
    {
      key: "pro", name: c.proCName, tag: c.proCTag, price: c.proCPrice, currency: "€",
      desc: c.proCDesc, cta: { label: c.proCCta, href: "/registro?rol=clinica" },
      features: c.proCFeatures, tone: "dark", highlight: true, showPeriod: true,
    },
    {
      key: "enterprise", name: c.enterpriseName, tag: c.enterpriseTag, price: c.enterprisePrice, currency: null,
      desc: c.enterpriseDesc, cta: { label: c.enterpriseCta, href: "/contacto" },
      features: c.enterpriseFeatures, tone: "neutral", highlight: false, showPeriod: false,
    },
  ];

  return (
    <Section className="relative overflow-hidden bg-mist-50">
      <div aria-hidden className="bg-dotgrid absolute inset-0 opacity-50" />
      <div aria-hidden className="absolute -top-32 left-1/2 h-72 w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-200/30 via-cyan-200/30 to-brand-200/30 blur-3xl" />

      <div className="relative">
        <SectionHeading
          eyebrow={c.eyebrow}
          title={<>{c.title1}<span className="text-gradient-brand">{c.title2}</span></>}
          description={c.desc}
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {plans.map((p) => (
            <PricingCard key={p.key} plan={p} copy={c} />
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-mist-500">
          <ReassuranceItem text={c.trial} />
          <ReassuranceItem text={c.cancelAny} />
          <ReassuranceItem text={c.noCommission} />
          <ReassuranceItem text={c.incl} />
        </div>
      </div>
    </Section>
  );
}

function PricingCard({ plan: p, copy: c }: { plan: Plan; copy: (typeof COPY)["es"] }) {
  const dark = p.tone === "dark";

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-3xl border p-6 transition-all duration-300 motion-safe:hover:-translate-y-1",
        dark
          ? "border-brand-400/30 bg-gradient-to-br from-ink-950 via-ink-900 to-brand-900/70 text-white shadow-[0_30px_70px_-30px_rgba(37,99,235,0.55)] motion-safe:hover:shadow-[0_36px_90px_-30px_rgba(37,99,235,0.75)] lg:z-10 lg:scale-[1.02]"
          : "border-mist-200 bg-white motion-safe:hover:border-mist-300 motion-safe:hover:shadow-[var(--shadow-card)]"
      )}
    >
      {dark && (
        <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 rounded-3xl opacity-20" />
      )}
      {dark && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-400/15 blur-3xl"
        />
      )}

      {p.highlight && (
        <span
          className={cn(
            "bestseller-ring bestseller-glow",
            "absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap",
            "rounded-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-brand-400 px-3.5 py-1.5",
            "text-[10px] font-bold uppercase tracking-[0.1em] text-ink-900"
          )}
        >
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="9" cy="8" r="3" />
            <path d="M2.5 19c.7-2.6 3.1-4 6.5-4s5.8 1.4 6.5 4" />
            <circle cx="17" cy="7" r="2.4" />
            <path d="M21.5 17.5c-.5-1.8-2.1-2.7-4.3-2.7" />
          </svg>
          {c.bestseller}
        </span>
      )}

      <div className="relative flex h-full flex-col">
        {/* Icon */}
        <span
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-xl",
            dark
              ? "bg-white/10 text-cyan-300 ring-1 ring-white/15"
              : p.key === "enterprise"
                ? "bg-ink-900 text-cyan-200 ring-1 ring-ink-800"
                : "bg-brand-50 text-brand-700 ring-1 ring-brand-100"
          )}
        >
          <span className="h-5 w-5">{ICONS[p.key]}</span>
        </span>

        {/* Eyebrow */}
        <div
          className={cn(
            "mt-5 text-[11px] font-semibold uppercase tracking-wider",
            dark ? "text-cyan-300" : "text-brand-700"
          )}
        >
          {p.tag}
        </div>

        {/* Title */}
        <div
          className={cn(
            "mt-1 text-xl font-semibold tracking-tight",
            dark ? "text-white" : "text-ink-900"
          )}
        >
          {p.name}
        </div>

        {/* Price block */}
        <div className="mt-5 min-h-[64px]">
          <div className="flex items-baseline gap-1.5">
            {p.currency && (
              <span
                className={cn(
                  "text-xl font-medium",
                  dark ? "text-white/70" : "text-mist-500"
                )}
              >
                {p.currency}
              </span>
            )}
            <span
              className={cn(
                "text-[44px] font-bold leading-none tracking-tight",
                dark ? "text-white" : "text-ink-900"
              )}
            >
              {p.price}
            </span>
            {p.showPeriod && (
              <span
                className={cn(
                  "pb-1 text-sm",
                  dark ? "text-white/60" : "text-mist-500"
                )}
              >
                {c.perMonth}
              </span>
            )}
          </div>
          <p
            className={cn(
              "mt-2 text-sm",
              dark ? "text-white/70" : "text-mist-500"
            )}
          >
            {p.desc}
          </p>
        </div>

        {/* CTA */}
        <Button
          href={p.cta.href}
          size="md"
          variant="secondary"
          className={cn(
            "mt-6 w-full justify-center",
            (p.key === "starter" || p.key === "pro") && "trial-cta"
          )}
        >
          {p.cta.label}
        </Button>

        {/* Divider */}
        <div
          aria-hidden
          className={cn(
            "mt-6 h-px",
            dark
              ? "bg-gradient-to-r from-transparent via-white/15 to-transparent"
              : "bg-gradient-to-r from-transparent via-mist-200 to-transparent"
          )}
        />

        {/* Features */}
        <ul className="mt-5 space-y-2.5">
          {p.features.map((f) => (
            <li
              key={f}
              className={cn(
                "flex items-start gap-2.5 text-[13px]",
                dark ? "text-white/85" : "text-ink-800"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                  dark
                    ? "bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-300/30"
                    : "bg-brand-50 text-brand-700 ring-1 ring-brand-100"
                )}
              >
                <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="3.4" aria-hidden>
                  <path d="M5 12l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="leading-snug">{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ReassuranceItem({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg className="h-3.5 w-3.5 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
        <path d="M5 12l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {text}
    </span>
  );
}
