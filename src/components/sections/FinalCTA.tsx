"use client";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/components/providers/Providers";

export function FinalCTA() {
  const { t } = useApp();
  return (
    <section className="relative overflow-hidden">
      <div className="bg-hero">
        <div className="bg-grid absolute inset-0 opacity-20" />
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-5 py-20 text-center text-white md:px-8 md:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium backdrop-blur">
            {t.final.pill}
          </div>
          <h2 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
            {t.final.title1}<span className="text-gradient">{t.final.title2}</span>
          </h2>
          <p className="max-w-2xl text-pretty text-white/70 md:text-lg">{t.final.desc}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button href="/registro?rol=clinica" size="lg">
              {t.common.iAmClinic}
            </Button>
            <Button href="/registro?rol=profesional" variant="outline" size="lg">
              {t.common.iAmPro}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
