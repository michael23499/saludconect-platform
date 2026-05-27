"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { useApp } from "@/components/providers/Providers";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/Modal";
import { AnimatedCheckbox } from "@/components/ui/AnimatedCheckbox";
import {
  readConsent,
  writeConsent,
  OPEN_PREFS_EVENT,
  type ConsentCategories,
} from "@/lib/cookie-consent";

type View = "hidden" | "banner" | "prefs";

/**
 * Aviso de consentimiento de cookies (RGPD/LSSI). Aparece como tarjeta inferior
 * no bloqueante en la primera visita y permite aceptar todo, rechazar o
 * personalizar por categorías. La decisión se guarda en una cookie propia
 * (ver `@/lib/cookie-consent`). Se monta una sola vez en el layout raíz.
 */
export function CookieConsent() {
  const { t } = useApp();
  const c = t.cookieConsent;

  const [view, setView] = useState<View>("hidden");
  // Animación de entrada de la tarjeta (igual patrón que el panel del chat).
  const [shown, setShown] = useState(false);
  // Toggles del panel de personalización. Las técnicas no se listan aquí: son
  // siempre activas.
  const [analytics, setAnalytics] = useState(false);
  const [functional, setFunctional] = useState(false);

  // Primera carga: si no hay decisión válida, mostramos el banner. Leemos en
  // efecto (cliente) para no provocar hydration mismatch — en SSR no se pinta.
  // setState puntual de inicialización desde un sistema externo (la cookie),
  // no una cascada: falso positivo de la regla.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!readConsent()) setView("banner");
  }, []);

  // Permite reabrir el panel de preferencias desde cualquier parte (footer,
  // página de política de cookies…) precargando la última decisión.
  useEffect(() => {
    const open = () => {
      const current = readConsent();
      setAnalytics(current?.analytics ?? false);
      setFunctional(current?.functional ?? false);
      setView("prefs");
    };
    window.addEventListener(OPEN_PREFS_EVENT, open);
    return () => window.removeEventListener(OPEN_PREFS_EVENT, open);
  }, []);

  // Dispara la transición de entrada cuando aparece el banner. Tanto el
  // setState(true) (en el callback de rAF) como el reset (en el cleanup) quedan
  // fuera del cuerpo síncrono del efecto, así que no provocan cascada.
  useEffect(() => {
    if (view !== "banner") return;
    const id = requestAnimationFrame(() => setShown(true));
    return () => {
      cancelAnimationFrame(id);
      setShown(false);
    };
  }, [view]);

  const decide = useCallback((categories: ConsentCategories) => {
    writeConsent(categories);
    setView("hidden");
  }, []);

  const acceptAll = useCallback(() => decide({ analytics: true, functional: true }), [decide]);
  const rejectAll = useCallback(() => decide({ analytics: false, functional: false }), [decide]);
  const savePrefs = useCallback(() => decide({ analytics, functional }), [decide, analytics, functional]);

  const openPrefs = useCallback(() => {
    const current = readConsent();
    setAnalytics(current?.analytics ?? false);
    setFunctional(current?.functional ?? false);
    setView("prefs");
  }, []);

  return (
    <>
      {/* Banner inferior no bloqueante, centrado y ancho. El contenedor ocupa el
          ancho para centrar la tarjeta; pointer-events-none deja pasar los clics
          fuera de ella. z-40 para quedar por debajo del botón de chat (z-50). */}
      {view === "banner" && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-3 sm:bottom-6">
          <div
            role="dialog"
            aria-label={c.title}
            aria-live="polite"
            className={cn(
              "pointer-events-auto w-full max-w-5xl rounded-2xl border border-mist-200 bg-white p-5 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.4)] sm:p-6",
              "transition-all duration-300",
              shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            )}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
              <div className="flex items-start gap-3.5 lg:flex-1">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <CookieIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-[15px] font-semibold text-ink-900">{c.title}</h2>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-mist-500">{c.body}</p>
                  <a
                    href="/legal/cookies"
                    className="mt-2 inline-block text-[13px] font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
                  >
                    {c.policy}
                  </a>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:shrink-0 lg:flex-nowrap lg:justify-end">
                <button
                  type="button"
                  onClick={acceptAll}
                  className="order-1 inline-flex h-10 flex-1 items-center justify-center rounded-full bg-brand-600 px-6 text-sm font-semibold text-white transition hover:bg-brand-700 sm:order-none sm:flex-none"
                >
                  {c.acceptAll}
                </button>
                <button
                  type="button"
                  onClick={rejectAll}
                  className="order-2 inline-flex h-10 flex-1 items-center justify-center rounded-full border border-mist-200 bg-white px-6 text-sm font-semibold text-ink-800 transition hover:bg-mist-50 sm:order-none sm:flex-none"
                >
                  {c.reject}
                </button>
                <button
                  type="button"
                  onClick={openPrefs}
                  className="order-3 inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-medium text-mist-500 transition hover:text-brand-700 sm:order-none"
                >
                  {c.customize}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panel de personalización por categorías. */}
      {view === "prefs" && (
        <Modal onClose={() => setView(readConsent() ? "hidden" : "banner")} labelledBy="cookie-prefs-title" maxWidth={520}>
          <ModalHeader
            icon={<CookieIcon className="h-7 w-7" />}
            title={c.prefsTitle}
            onClose={() => setView(readConsent() ? "hidden" : "banner")}
            titleId="cookie-prefs-title"
            closeLabel={c.close}
          />
          <ModalBody>
            <p className="text-sm text-mist-500">{c.prefsIntro}</p>

            {/* Técnicas: siempre activas, no se pueden desactivar. */}
            <div className="rounded-xl border border-mist-200 bg-mist-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-ink-900">{c.necessaryTitle}</span>
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
                  {c.alwaysActive}
                </span>
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-mist-500">{c.necessaryDesc}</p>
            </div>

            <CategoryToggle
              title={c.analyticsTitle}
              desc={c.analyticsDesc}
              checked={analytics}
              onChange={setAnalytics}
            />
            <CategoryToggle
              title={c.functionalTitle}
              desc={c.functionalDesc}
              checked={functional}
              onChange={setFunctional}
            />
          </ModalBody>
          <ModalFooter>
            <button
              type="button"
              onClick={savePrefs}
              className="inline-flex h-10 items-center justify-center rounded-full border border-mist-200 bg-white px-4 text-sm font-semibold text-ink-800 transition hover:bg-mist-50"
            >
              {c.save}
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className="inline-flex h-10 items-center justify-center rounded-full bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              {c.acceptAll}
            </button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
}

function CategoryToggle({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="rounded-xl border border-mist-200 p-4">
      <AnimatedCheckbox checked={checked} onCheckedChange={onChange}>
        <span className="block text-sm font-semibold text-ink-900">{title}</span>
        <span className="mt-1 block text-[13px] leading-relaxed text-mist-500">{desc}</span>
      </AnimatedCheckbox>
    </div>
  );
}

function CookieIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-4-4 4 4 0 0 1-4-4 2 2 0 0 0-2-2z" />
      <path d="M8.5 9.5h.01M14.5 8.5h.01M9 15h.01M15.5 14h.01M12 12.5h.01" />
    </svg>
  );
}
