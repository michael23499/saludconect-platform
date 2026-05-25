import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Pricing } from "@/components/sections/Pricing";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { LiveRequestCard } from "@/components/clinics/LiveRequestCard";
import { getDict } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDict()).pages.clinics;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function ClinicasPage() {
  const t = (await getDict()).pages.clinics;
  return (
    <>
      <section className="relative overflow-hidden bg-hero text-white">
        <div className="bg-grid absolute inset-0 opacity-25" />
        <div className="absolute -bottom-32 left-[-10%] h-[420px] w-[420px] rounded-full bg-brand-500/30 blur-3xl" />
        <div className="absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-5 py-20 md:grid-cols-[1.2fr_1fr] md:px-8 md:py-28">
          <div>
            <Badge tone="accent">{t.badge}</Badge>
            <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              {t.heroTitlePre}<span className="text-gradient">{t.heroTitleHi}</span>
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-white/70 md:text-lg">
              {t.heroDesc}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/register?rol=clinic" size="lg">{t.ctaTrial}</Button>
              <Button href="/search" variant="outline" size="lg">{t.ctaExplore}</Button>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-6">
              {t.heroStats.map((s) => (
                <div key={s.l}>
                  <div className="text-2xl font-semibold tracking-tight">{s.v}</div>
                  <div className="text-xs text-white/60">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <LiveRequestCard />
        </div>
      </section>

      <Section className="bg-white">
        <SectionHeading
          eyebrow={t.benefitsEyebrow}
          title={<>{t.benefitsTitlePre}<span className="text-gradient-brand">{t.benefitsTitleHi}</span></>}
          description={t.benefitsDesc}
        />
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {t.benefits.map((b, i) => (
            <div key={b.t} className="card-hover relative overflow-hidden rounded-2xl border border-mist-200 bg-mist-50/40 p-6">
              <div className="text-xs font-mono font-semibold text-brand-600">B/{String(i + 1).padStart(2, "0")}</div>
              <h3 className="mt-2 text-[17px] font-semibold tracking-tight text-ink-900">{b.t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-mist-500">{b.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-mist-50">
        <SectionHeading
          eyebrow={t.featuresEyebrow}
          title={t.featuresTitle}
        />
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {t.features.map((f, i) => (
            <div key={f.t} className="flex items-start gap-4 rounded-2xl border border-mist-200 bg-white p-6">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl text-brand-700">
                {FEATURE_ICONS[i]}
              </span>
              <div>
                <h3 className="text-[16px] font-semibold tracking-tight text-ink-900">{f.t}</h3>
                <p className="mt-1 text-sm text-mist-500">{f.d}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Pricing />
      <FinalCTA />
    </>
  );
}

const FEATURE_ICONS = ["◧", "◐", "◑", "◯", "◍", "◫"];
