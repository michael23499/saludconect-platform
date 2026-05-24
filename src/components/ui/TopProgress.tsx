"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Barra de progreso superior para dar feedback inmediato al navegar entre
 * secciones (estilo "app nativa"). No depende de librerías:
 *  - START: intercepta clicks en enlaces internos (antes de que cambie la ruta).
 *  - FINISH: se completa cuando `usePathname` cambia (la navegación terminó).
 * Para navegaciones instantáneas se ve un barrido corto; para las lentas,
 * la barra "trickelea" hasta ~90% mientras el servidor responde.
 */
export function TopProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  const trickle = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safety = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRender = useRef(true);

  function clearTimers() {
    if (trickle.current) clearInterval(trickle.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (safety.current) clearTimeout(safety.current);
    trickle.current = hideTimer.current = safety.current = null;
  }

  function start() {
    clearTimers();
    setVisible(true);
    setProgress(8);
    trickle.current = setInterval(() => {
      setProgress((p) => (p < 90 ? p + (90 - p) * 0.12 : p));
    }, 220);
    // Si la navegación no cambia el pathname (p.ej. solo query string), evita
    // que la barra quede colgada.
    safety.current = setTimeout(finish, 6000);
  }

  function finish() {
    clearTimers();
    setProgress(100);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 280);
  }

  // START — click en un enlace interno
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const anchor = (e.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      const target = anchor.getAttribute("target");
      if (target && target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return; // externo
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return; // misma página (no hay navegación)
      }
      start();
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FINISH — el pathname cambió: la navegación terminó
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Limpieza al desmontar
  useEffect(() => clearTimers, []);

  if (!visible && progress === 0) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]">
      <div
        className="h-full rounded-r-full bg-gradient-to-r from-brand-600 via-cyan-500 to-cyan-400 shadow-[0_0_10px_rgba(1,171,212,0.7)]"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
          transition: "width 220ms ease, opacity 280ms ease",
        }}
      />
    </div>
  );
}
