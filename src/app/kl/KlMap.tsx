"use client";

import { useEffect, useRef } from "react";

export type Pin = { n: number; name: string; lat: number; lon: number };

const LEAFLET = "https://unpkg.com/leaflet@1.9.4/dist/leaflet";

/* Leaflet comes from the CDN rather than npm: one page uses it, and a global
   script keeps the sandbox's dependency list untouched. Loaded once, shared. */
let loading: Promise<any> | null = null;
function loadLeaflet(): Promise<any> {
  const w = window as any;
  if (w.L) return Promise.resolve(w.L);
  loading ??= new Promise((resolve, reject) => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = `${LEAFLET}.css`;
    document.head.appendChild(css);
    const js = document.createElement("script");
    js.src = `${LEAFLET}.js`;
    js.onload = () => resolve(w.L);
    js.onerror = reject;
    document.head.appendChild(js);
  });
  return loading;
}

/** Pins that share a spot (drop-off and pick-up at TRX) become one "1·5" marker. */
function merge(pins: Pin[]) {
  const at = new Map<string, { lat: number; lon: number; ns: number[]; names: string[] }>();
  for (const p of pins) {
    const key = `${p.lat},${p.lon}`;
    const m = at.get(key) ?? { lat: p.lat, lon: p.lon, ns: [], names: [] };
    m.ns.push(p.n);
    if (!m.names.includes(p.name)) m.names.push(p.name);
    at.set(key, m);
  }
  return [...at.values()];
}

export default function KlMap({ pins, path = false }: { pins: Pin[]; path?: boolean }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: any;
    let dead = false;
    loadLeaflet().then((L) => {
      if (dead || !el.current) return;
      map = L.map(el.current, { scrollWheelZoom: false, attributionControl: true });
      // Leaflet's stock credit bar is a white strip; keep it one quiet dark line.
      map.attributionControl.setPrefix(false);
      Object.assign(map.attributionControl.getContainer().style, {
        background: "rgba(10,10,10,0.7)",
        color: "#a3a3a3",
        fontSize: "10px",
      });
      // Esri's dark canvas needs no key (CARTO's now watermarks "API KEY REQUIRED").
      // Base and labels are separate layers; the reference layer adds street names.
      const esri = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas";
      L.tileLayer(`${esri}/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`, {
        attribution: "© Esri, © OpenStreetMap",
        maxZoom: 16,
      }).addTo(map);
      L.tileLayer(`${esri}/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`, {
        maxZoom: 16,
      }).addTo(map);

      if (path) {
        L.polyline(
          pins.map((p) => [p.lat, p.lon]),
          { color: "#34d399", weight: 2, opacity: 0.6, dashArray: "4 6" },
        ).addTo(map);
      }

      for (const m of merge(pins)) {
        const label = m.ns.join("·");
        L.marker([m.lat, m.lon], {
          icon: L.divIcon({
            className: "",
            html: `<div style="display:flex;align-items:center;justify-content:center;min-width:24px;height:24px;padding:0 6px;border-radius:8px;background:#34d399;color:#052e16;font:600 12px/1 ui-monospace,monospace;box-shadow:0 0 0 2px #0a0a0a">${label}</div>`,
            iconSize: [24 + (label.length - 1) * 7, 24],
            iconAnchor: [12 + (label.length - 1) * 3.5, 12],
          }),
        })
          .bindPopup(m.names.join(" / "))
          .addTo(map);
      }

      map.fitBounds(
        pins.map((p) => [p.lat, p.lon]),
        { padding: [28, 28], maxZoom: 15 },
      );
    });
    return () => {
      dead = true;
      map?.remove();
    };
  }, [pins, path]);

  return (
    <div
      ref={el}
      className="mt-4 h-56 overflow-hidden rounded-xl bg-neutral-900 ring-1 ring-white/10"
    />
  );
}
