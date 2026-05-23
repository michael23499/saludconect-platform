"use client";
import { useEffect } from "react";

/**
 * One IntersectionObserver for the whole page. Watches every `.fade-up`
 * element and adds the `.in` modifier when it enters the viewport, so the
 * CSS animation runs on scroll instead of on mount.
 *
 * Users with `prefers-reduced-motion: reduce` get the final state
 * immediately — the global media query in globals.css already short-circuits
 * the animation, so we just need to make sure opacity isn't stuck at 0.
 */
export function RevealObserver() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      document.querySelectorAll<HTMLElement>(".fade-up").forEach((el) => el.classList.add("in"));
      return;
    }

    const observed = new WeakSet<Element>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );

    const scan = () => {
      document.querySelectorAll<HTMLElement>(".fade-up").forEach((el) => {
        if (observed.has(el)) return;
        observed.add(el);
        io.observe(el);
      });
    };

    scan();

    // Re-scan when new nodes appear (route changes, tab switches like
    // JourneyTabs that swap step lists, etc.).
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
