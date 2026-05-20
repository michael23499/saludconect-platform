"use client";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useApp } from "@/components/providers/Providers";

export function Hero() {
  const { t } = useApp();
  return (
    <section className="relative overflow-hidden bg-hero text-white">
      <div className="bg-grid absolute inset-0 opacity-25" />
      <div className="absolute -top-32 right-[-10%] h-[480px] w-[480px] rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute -bottom-32 left-[-10%] h-[420px] w-[420px] rounded-full bg-brand-500/30 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-5 py-20 md:grid-cols-[1.05fr_0.95fr] md:gap-10 md:px-8 md:py-28">
        <div className="fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium tracking-wide backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            {t.hero.pill}
          </div>

          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            {t.hero.title1}
            <span className="text-gradient">{t.hero.title2}</span>
            {t.hero.title3}
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-[17px] text-white/70 md:text-lg">
            {t.hero.desc}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button href="/registro?rol=clinica" size="lg">
              {t.common.iAmClinic}
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Button>
            <Button href="/registro?rol=profesional" variant="outline" size="lg">
              {t.common.iAmPro}
            </Button>
          </div>

          <div className="mt-10 flex items-center gap-5">
            <div className="flex -space-x-2">
              {["Lucía Martín", "Andrés Cano", "Marta Vives", "Jorge Pol", "Inés Vera"].map((n) => (
                <Avatar key={n} name={n} size="sm" className="ring-2 ring-ink-900" />
              ))}
            </div>
            <div className="text-sm text-white/70">
              <div className="font-medium text-white">{t.hero.pros}</div>
              <div>{t.hero.prosSub}</div>
            </div>
          </div>
        </div>

        <div className="relative fade-up">
          <div className="absolute inset-0 -z-10 translate-y-6 rounded-3xl bg-gradient-to-br from-brand-500/30 to-cyan-400/30 blur-3xl" />
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur-xl">
            <div className="rounded-2xl bg-white p-5 text-ink-900 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">{t.hero.cardTitle}</div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {t.common.available}
                </span>
              </div>
              <div className="mt-4 flex items-start gap-4">
                <Avatar name="Clínica Sanitas Norte" size="lg" />
                <div>
                  <div className="text-[15px] font-semibold">Clínica Sanitas Norte</div>
                  <div className="text-sm text-mist-500">Madrid · Centro · Cardiología</div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-mist-200 bg-mist-50/60 px-3 py-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">Fecha</div>
                  <div className="mt-0.5 text-sm font-semibold text-ink-900">Mié 28 May</div>
                </div>
                <div className="rounded-xl border border-mist-200 bg-mist-50/60 px-3 py-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-500">Turno</div>
                  <div className="mt-0.5 text-sm font-semibold text-ink-900">Mañana · 8 h</div>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <button className="flex-1 rounded-xl border border-mist-200 px-3 py-2.5 text-sm font-medium text-ink-800 hover:bg-mist-50">{t.hero.reject}</button>
                <button className="flex-1 rounded-xl bg-brand-600 px-3 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)] hover:bg-brand-700">{t.hero.accept}</button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/95 p-4 text-ink-900 shadow-xl">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-mist-500">{t.hero.stat1}</div>
                <div className="mt-1.5 text-2xl font-semibold">{t.hero.stat1v}</div>
                <div className="mt-1 text-xs text-emerald-600">{t.hero.stat1d}</div>
              </div>
              <div className="rounded-2xl bg-white/95 p-4 text-ink-900 shadow-xl">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-mist-500">{t.hero.stat2}</div>
                <div className="mt-1.5 text-2xl font-semibold">{t.hero.stat2v}</div>
                <div className="mt-1 text-xs text-mist-500">{t.hero.stat2d}</div>
              </div>
            </div>
          </div>

          {/* Floating notification — positioned outside the card to the bottom-left so it doesn't overlap */}
          <div className="pointer-events-none absolute -bottom-5 -left-4 z-20 hidden lg:-left-16 xl:block animate-float">
            <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-white/15 bg-ink-900/90 px-4 py-3 text-xs text-white shadow-2xl backdrop-blur-xl">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
              </span>
              <Avatar name="Lucía Martín" size="sm" className="ring-2 ring-ink-900" />
              <div>
                <div className="font-semibold leading-tight">Dra. Lucía Martín</div>
                <div className="leading-tight text-white/60">Cardiología · 4.9 ★</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10 bg-ink-950/40">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-5 py-6 md:flex-row md:px-8">
          <span className="text-xs font-medium uppercase tracking-[0.22em] text-white/50">
            {t.hero.trust}
          </span>
          <div className="flex flex-wrap items-center gap-x-10 gap-y-3 text-white/55">
            {["Sanitas", "Quirón", "Vithas", "HM Hospitales", "Ribera", "Asisa"].map((b) => (
              <span key={b} className="text-[15px] font-semibold tracking-tight">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
