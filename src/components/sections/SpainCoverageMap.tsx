"use client";

import { useState } from "react";
import { SPAIN_COMMUNITIES } from "./spain-communities";

/**
 * Mapa de cobertura de España con las 17 comunidades autónomas (fronteras
 * internas = "detalle de separación"), fuente @svg-maps/spain. Estética de
 * clínica: fondo claro, azul de marca suave, hover por comunidad y pines de
 * ubicación con pulso sutil. Los rótulos se dibujan en una CAPA SUPERIOR como
 * pastilla (tooltip) para que nunca queden tapados ni se monten con un marcador.
 */

// Encuadre recortado a la península + Baleares (bbox x[241-612] y[1-276]) para
// que llene el marco; dejamos una franja libre a la izquierda para el recuadro
// de Canarias. Las coordenadas de comunidades y pines no cambian (mismo sistema).
const FOCUS_VB = "150 -12 470 304";
// Canarias (bbox x[0-129] y[489-543]) reubicada al recuadro inferior izquierdo.
const CANARY_TF = "translate(162 -104.5) scale(0.68)";

type Kind = "hub" | "pin" | "dot";
type Loc = { name: string; x: number; y: number; kind: Kind };

// Ciudades-hub con pin grande (una por comunidad → sin solapes).
const CITIES: Loc[] = [
  { name: "Madrid", x: 391, y: 120, kind: "hub" },
  { name: "Barcelona", x: 542, y: 78, kind: "pin" },
  { name: "Zaragoza", x: 475, y: 89, kind: "pin" },
  { name: "Valencia", x: 481, y: 162, kind: "pin" },
  { name: "Murcia", x: 453, y: 206, kind: "pin" },
  { name: "Sevilla", x: 370, y: 230, kind: "pin" },
  { name: "Bilbao", x: 424, y: 33, kind: "pin" },
  { name: "A Coruña", x: 276, y: 40, kind: "pin" },
  { name: "Palma", x: 570, y: 161, kind: "pin" },
];

// Resto de comunidades (capitales) con marcador discreto: presencia en las 17.
const SECONDARY: Loc[] = [
  { name: "Oviedo", x: 335, y: 20, kind: "dot" },
  { name: "Santander", x: 386, y: 25, kind: "dot" },
  { name: "Pamplona", x: 451, y: 44, kind: "dot" },
  { name: "Logroño", x: 429, y: 57, kind: "dot" },
  { name: "Valladolid", x: 350, y: 82, kind: "dot" },
  { name: "Toledo", x: 408, y: 149, kind: "dot" },
  { name: "Mérida", x: 329, y: 166, kind: "dot" },
];
// Las Palmas dentro del recuadro de Canarias (coords ya reubicadas).
const CANARY_DOT: Loc = { name: "Las Palmas", x: 212, y: 244, kind: "dot" };

const ALL_LOCS: Loc[] = [...CITIES, ...SECONDARY, CANARY_DOT];

const H = 30; // alto del pin base
function pinScale(kind: Kind) {
  return kind === "hub" ? 1.0 : 0.82;
}

// Posición (baseline) del rótulo según el tipo y la latitud del marcador.
function labelPos(loc: Loc): { x: number; y: number } {
  if (loc.kind === "hub") return { x: loc.x, y: loc.y + 19 }; // debajo del pin (la punta apunta hacia arriba)
  if (loc.kind === "pin") return loc.y < 70 ? { x: loc.x, y: loc.y + 18 } : { x: loc.x, y: loc.y - H * pinScale(loc.kind) - 8 };
  return loc.y < 70 ? { x: loc.x, y: loc.y + 14 } : { x: loc.x, y: loc.y - 9 };
}

function PinMarker({ loc, onEnter, onLeave }: { loc: Loc; onEnter: () => void; onLeave: () => void }) {
  const s = pinScale(loc.kind);
  const W = 24;
  const tx = loc.x - (W / 2) * s;
  const ty = loc.y - H * s;
  const color = loc.kind === "hub" ? "#052f59" : "#0e7490";
  return (
    <g onMouseEnter={onEnter} onMouseLeave={onLeave} style={{ cursor: "default" }}>
      <circle cx={loc.x} cy={loc.y} r={loc.kind === "hub" ? 7 : 5.5} fill={color} opacity="0.16" className="scn-ping" />
      <ellipse cx={loc.x} cy={loc.y + 1} rx={loc.kind === "hub" ? 3.4 : 2.7} ry={loc.kind === "hub" ? 1.5 : 1.2} fill="#052f59" opacity="0.2" />
      <g transform={`translate(${tx} ${ty}) scale(${s})`} filter="url(#scn-shadow)">
        <path d="M12 0C6.5 0 2 4.4 2 9.9 2 17 12 30 12 30S22 17 22 9.9C22 4.4 17.5 0 12 0z" fill={color} />
        <circle cx="12" cy="10" r="4.4" fill="#fff" />
        <circle cx="12" cy="10" r="2" fill={loc.kind === "hub" ? "#01abd4" : "#22d3ee"} />
      </g>
    </g>
  );
}

function DotMarker({ loc, onEnter, onLeave }: { loc: Loc; onEnter: () => void; onLeave: () => void }) {
  return (
    <g onMouseEnter={onEnter} onMouseLeave={onLeave} style={{ cursor: "default" }}>
      <circle cx={loc.x} cy={loc.y} r={6} fill="#0e7490" opacity="0.14" className="scn-ping" />
      <circle cx={loc.x} cy={loc.y} r={3.6} fill="#0e7490" stroke="#fff" strokeWidth={1.3} />
    </g>
  );
}

// Rótulo como pastilla en la capa superior (encima de todo, no captura eventos).
function CityLabel({ loc }: { loc: Loc }) {
  const { x, y } = labelPos(loc);
  const fs = loc.kind === "dot" ? 11 : 13;
  const w = loc.name.length * fs * 0.6 + 16;
  const h = fs + 9;
  return (
    <g style={{ pointerEvents: "none" }}>
      <rect x={x - w / 2} y={y - h + 4} width={w} height={h} rx={h / 2} fill="#ffffff" stroke="#aec8e1" strokeWidth={1} filter="url(#scn-shadow)" />
      <text x={x} y={y - 1} textAnchor="middle" style={{ fontSize: fs, fontWeight: 700, fill: "#052f59" }}>
        {loc.name}
      </text>
    </g>
  );
}

export function SpainCoverageMap() {
  const [hoverCity, setHoverCity] = useState<string | null>(null);
  const [hoverRegion, setHoverRegion] = useState<string | null>(null);

  // Un solo rótulo a la vez para que nunca se solapen: el que está bajo el
  // cursor; si no hay ninguno, el hub (Madrid).
  const labelled = hoverCity
    ? ALL_LOCS.filter((l) => l.name === hoverCity)
    : ALL_LOCS.filter((l) => l.kind === "hub");

  return (
    <section className="relative overflow-hidden border-y border-mist-100 bg-gradient-to-b from-white to-mist-50 py-20 md:py-28 dark:border-white/10 dark:from-[#070d1f] dark:to-[#0a1633]">
      <div className="pointer-events-none absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-brand-100/50 blur-3xl dark:bg-brand-500/15" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[420px] w-[420px] rounded-full bg-cyan-100/50 blur-3xl dark:bg-cyan-500/10" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-5 md:px-8 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="text-center lg:text-left">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700 dark:border-brand-400/30 dark:bg-brand-500/15 dark:text-cyan-200">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-7-7.5-7-12a7 7 0 0 1 14 0c0 4.5-7 12-7 12z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            Cobertura nacional
          </div>
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-ink-900 md:text-5xl dark:text-white">
            Talento sanitario en <span className="text-gradient-brand">toda España</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-pretty text-mist-500 md:text-lg lg:mx-0 dark:text-white/70">
            Conectamos clínicas y profesionales sanitarios de punta a punta del país: las 17 comunidades, península, Baleares y Canarias. Estés donde estés, la red llega.
          </p>
          <div className="mt-8 grid max-w-sm grid-cols-3 gap-4 lg:mx-0">
            {[
              { v: "17", l: "comunidades" },
              { v: "50", l: "provincias" },
              { v: "2", l: "archipiélagos" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-mist-200 bg-white px-3 py-3 shadow-[var(--shadow-soft)] dark:border-white/10 dark:bg-white/5 dark:shadow-none">
                <div className="text-2xl font-semibold tracking-tight text-ink-900 dark:text-white">{s.v}</div>
                <div className="text-[11px] uppercase tracking-wider text-mist-500 dark:text-white/55">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <svg viewBox={FOCUS_VB} className="h-auto w-full max-w-[660px] lg:mx-auto" role="img" aria-label="Mapa de cobertura de España por comunidades autónomas">
            <defs>
              <linearGradient id="scn-fill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#dbeafe" />
                <stop offset="100%" stopColor="#bcd5ec" />
              </linearGradient>
              <linearGradient id="scn-fill-hi" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7ec9e3" />
                <stop offset="100%" stopColor="#43a3c9" />
              </linearGradient>
              <filter id="scn-shadow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="1.5" stdDeviation="1.6" floodColor="#052f59" floodOpacity="0.35" />
              </filter>
            </defs>

            {/* Comunidades peninsulares + Baleares — fronteras = detalle de separación */}
            <g strokeLinejoin="round">
              {SPAIN_COMMUNITIES.filter((c) => c.id !== "canary-islands").map((c) => (
                <path
                  key={c.id}
                  d={c.path}
                  fill={hoverRegion === c.id ? "url(#scn-fill-hi)" : "url(#scn-fill)"}
                  stroke="#ffffff"
                  strokeWidth={0.9}
                  strokeOpacity={0.95}
                  onMouseEnter={() => setHoverRegion(c.id)}
                  onMouseLeave={() => setHoverRegion(null)}
                  style={{ transition: "fill .2s ease" }}
                >
                  <title>{c.name}</title>
                </path>
              ))}
            </g>

            {/* Canarias en recuadro (convención de mapas españoles) */}
            <g>
              <rect x={155} y={206} width={96} height={62} rx={8} fill="none" stroke="#7ba0c8" strokeWidth={1} strokeDasharray="3 4" opacity={0.7} />
              <g transform={CANARY_TF} strokeLinejoin="round">
                {SPAIN_COMMUNITIES.filter((c) => c.id === "canary-islands").map((c) => (
                  <path
                    key={c.id}
                    d={c.path}
                    fill={hoverRegion === c.id ? "url(#scn-fill-hi)" : "url(#scn-fill)"}
                    stroke="#ffffff"
                    strokeWidth={1.3}
                    strokeOpacity={0.95}
                    onMouseEnter={() => setHoverRegion(c.id)}
                    onMouseLeave={() => setHoverRegion(null)}
                    style={{ transition: "fill .2s ease" }}
                  >
                    <title>{c.name}</title>
                  </path>
                ))}
              </g>
              <text x={159} y={218} style={{ fontSize: 8, fontWeight: 600, fill: "#6b7790", letterSpacing: 0.5 }}>CANARIAS</text>
            </g>

            {/* Marcadores discretos del resto de comunidades */}
            {SECONDARY.map((c) => (
              <DotMarker key={c.name} loc={c} onEnter={() => setHoverCity(c.name)} onLeave={() => setHoverCity(null)} />
            ))}
            <DotMarker loc={CANARY_DOT} onEnter={() => setHoverCity(CANARY_DOT.name)} onLeave={() => setHoverCity(null)} />

            {/* Pines (hubs principales) */}
            {CITIES.map((c) => (
              <PinMarker key={c.name} loc={c} onEnter={() => setHoverCity(c.name)} onLeave={() => setHoverCity(null)} />
            ))}

            {/* Capa de rótulos (encima de todo) */}
            {labelled.map((l) => (
              <CityLabel key={l.name} loc={l} />
            ))}
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes scnPing {
          0%   { transform: scale(0.6); opacity: 0.4; }
          70%  { transform: scale(2.6); opacity: 0; }
          100% { opacity: 0; }
        }
        .scn-ping { transform-box: fill-box; transform-origin: center; animation: scnPing 3s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) { .scn-ping { animation: none; } }
      `}</style>
    </section>
  );
}
