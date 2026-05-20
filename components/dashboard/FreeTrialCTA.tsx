"use client";

import { useState, type CSSProperties } from "react";
import { AnimatedCheckbox } from "@/components/ui/AnimatedCheckbox";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const BENEFITS = [
  { icon: "∞", text: "Reservas ilimitadas durante 14 días" },
  { icon: "★", text: "Acceso a profesionales Elite" },
  { icon: "◎", text: "Multi-sede hasta 5 clínicas" },
  { icon: "♥", text: "Sin tarjeta · sin permanencia" },
];

// Pre-computed confetti trajectories so the render stays deterministic
const CONFETTI = [
  { x: -130, y: -90,  r: -200, c: "#2563eb", d: 0.00 },
  { x:  140, y: -110, r:  220, c: "#06b6d4", d: 0.02 },
  { x: -170, y:  10,  r:  -90, c: "#22d3ee", d: 0.04 },
  { x:  180, y:   0,  r:  120, c: "#a7c5ff", d: 0.06 },
  { x:  -90, y: -150, r: -260, c: "#67e8f9", d: 0.08 },
  { x:  110, y: -160, r:  170, c: "#1d4ed8", d: 0.10 },
  { x:  -60, y:  150, r:   90, c: "#10b981", d: 0.05 },
  { x:   80, y:  150, r:  -60, c: "#f59e0b", d: 0.07 },
  { x: -210, y:  -30, r: -300, c: "#2563eb", d: 0.09 },
  { x:  210, y:  -50, r:  300, c: "#06b6d4", d: 0.11 },
  { x:  -40, y: -180, r:  -45, c: "#22d3ee", d: 0.12 },
  { x:   50, y: -190, r:   45, c: "#1d4ed8", d: 0.14 },
];

export function FreeTrialCTA() {
  const [accepted, setAccepted] = useState(false);
  const [burstKey, setBurstKey] = useState(0);

  const handleToggle = (next: boolean) => {
    setAccepted(next);
    if (next) setBurstKey((k) => k + 1);
  };

  return (
    <div
      className={cn(
        "relative mb-6 overflow-hidden rounded-2xl border p-5 transition-all duration-500 md:p-6",
        accepted
          ? "border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-cyan-50 to-brand-50 shadow-[0_24px_60px_-22px_rgba(16,185,129,0.45)] dark:border-emerald-400/30 dark:from-emerald-500/10 dark:via-cyan-500/10 dark:to-brand-500/15"
          : "border-brand-200 bg-gradient-to-br from-brand-50 via-cyan-50 to-indigo-50 dark:border-brand-400/40 dark:from-brand-500/15 dark:via-cyan-500/10 dark:to-indigo-500/15"
      )}
    >
      <div
        className={cn(
          "absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl transition-colors duration-500",
          accepted ? "bg-emerald-300/40 dark:bg-emerald-400/20" : "bg-brand-200/40 dark:bg-brand-400/20"
        )}
      />

      <div className="relative grid items-stretch gap-5 md:grid-cols-[1.2fr_1fr]">
        {/* Copy + benefits */}
        <div>
          <div className="inline-flex items-center gap-2">
            <Badge tone={accepted ? "success" : "brand"}>
              {accepted ? "Prueba lista" : "14 días gratis"}
            </Badge>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:!text-cyan-300">
              Plan Clínica Pro
            </span>
          </div>

          <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink-900 md:text-2xl">
            {accepted
              ? "¡Genial! Estás a un paso de activar tu prueba"
              : "Empieza tu prueba gratuita de 14 días"}
          </h3>
          <p className="mt-1.5 text-sm text-mist-500 dark:!text-slate-200">
            {accepted
              ? "Confirmamos que quieres activar Clínica Pro durante 14 días sin coste. Pulsa el botón para empezar ahora mismo."
              : "Prueba Clínica Pro sin compromiso. Sin tarjeta, sin permanencia. Cancela cuando quieras."}
          </p>

          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {BENEFITS.map((b, i) => (
              <li
                key={b.text}
                className={cn(
                  "flex items-start gap-2 text-sm text-ink-800 dark:!text-slate-100",
                  accepted && "fade-up"
                )}
                style={accepted ? { animationDelay: `${i * 70}ms` } : undefined}
              >
                <span
                  className={cn(
                    "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors duration-300",
                    accepted
                      ? "bg-emerald-500 text-white"
                      : "bg-white text-brand-700 ring-1 ring-brand-200 dark:bg-white/10 dark:!text-cyan-200 dark:ring-brand-400/30"
                  )}
                >
                  {accepted ? "✓" : b.icon}
                </span>
                <span>{b.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Checkbox + CTA */}
        <div className="relative">
          <div
            className={cn(
              "relative rounded-2xl border bg-white/85 p-4 shadow-soft backdrop-blur transition-all duration-500 dark:bg-white/5",
              accepted
                ? "border-emerald-300/70 ft-celebrate ft-glow dark:border-emerald-400/40"
                : "border-white/70 dark:border-white/10"
            )}
          >
            <div className="relative">
              {burstKey > 0 && (
                <div
                  key={burstKey}
                  aria-hidden
                  className="pointer-events-none absolute left-2.5 top-3 z-0"
                >
                  {CONFETTI.map((p, i) => (
                    <span
                      key={i}
                      className="ft-confetti"
                      style={
                        {
                          background: p.c,
                          animationDelay: `${p.d}s`,
                          "--cx": `${p.x}px`,
                          "--cy": `${p.y}px`,
                          "--cr": `${p.r}deg`,
                        } as CSSProperties
                      }
                    />
                  ))}
                </div>
              )}

              <AnimatedCheckbox
                name="free_trial_consent"
                checked={accepted}
                onCheckedChange={handleToggle}
                className="z-10"
              >
                <span className="text-sm font-medium">
                  Quiero empezar mi prueba gratuita de <strong>14 días</strong> en el plan <strong>Clínica Pro</strong>.
                </span>
              </AnimatedCheckbox>
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-mist-500 dark:!text-slate-300">
              Al activar la prueba aceptas los{" "}
              <a href="#" className="font-semibold text-brand-700 hover:underline dark:!text-cyan-300">
                términos del servicio
              </a>
              . No realizaremos ningún cargo durante el periodo de prueba.
            </p>
          </div>

          <Button
            size="md"
            variant={accepted ? "primary" : "secondary"}
            disabled={!accepted}
            className={cn(
              "mt-3 w-full transition-transform duration-300",
              accepted && "scale-[1.01]"
            )}
          >
            {accepted ? "Activar mi prueba gratuita →" : "Marca la casilla para continuar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
