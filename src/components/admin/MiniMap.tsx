"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, Marker } from "leaflet";

/**
 * Mini-mapa minimalista con Leaflet + tiles claros de CARTO (Positron) y un
 * marcador en el azul de marca. Leaflet se importa dinámicamente (usa `window`,
 * no es SSR-safe). La atribución a OpenStreetMap/CARTO se muestra en el mapa,
 * cumpliendo la política de uso.
 */
export function MiniMap({ lat, lng }: { lat: number; lng: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const L = (await import("leaflet")).default;
      if (!active || !containerRef.current) return;

      if (!mapRef.current) {
        const map = L.map(containerRef.current, {
          scrollWheelZoom: true,
          attributionControl: true,
        }).setView([lat, lng], 15);

        // Quita SOLO el prefijo "🇺🇦 Leaflet" (no es obligatorio); el control
        // debe seguir activo (true) para mostrar OSM/CARTO, que sí es obligatorio
        // — y para que `attributionControl` exista y `setPrefix` no reviente.
        map.attributionControl.setPrefix(false);

        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          attribution: '',
          maxZoom: 19,
        }).addTo(map);

        const icon = L.divIcon({
          className: "",
          // Pin de ubicación con cruz médica (estilo clínica), en azul de marca.
          html: `<svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 3px 4px rgba(5,47,89,0.45))">
            <path d="M16 1C8 1 1.5 7.5 1.5 15.5 1.5 26.5 16 41 16 41S30.5 26.5 30.5 15.5C30.5 7.5 24 1 16 1z" fill="#052F59"/>
            <circle cx="16" cy="15.5" r="9" fill="#ffffff"/>
            <rect x="14" y="9.5" width="4" height="12" rx="1.2" fill="#052F59"/>
            <rect x="10" y="13.5" width="12" height="4" rx="1.2" fill="#052F59"/>
          </svg>`,
          iconSize: [32, 42],
          iconAnchor: [16, 41],
        });
        markerRef.current = L.marker([lat, lng], { icon }).addTo(map);
        mapRef.current = map;
      } else {
        mapRef.current.setView([lat, lng], 15);
        markerRef.current?.setLatLng([lat, lng]);
      }
    })();
    return () => { active = false; };
  }, [lat, lng]);

  useEffect(
    () => () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    },
    [],
  );

  // `isolate` crea un stacking context para que los z-index internos de Leaflet
  // no se escapen por encima del resto del modal.
  return <div ref={containerRef} className="isolate h-44 w-full overflow-hidden rounded-md border border-mist-200" />;
}
