"use client";

import { useEffect, useRef, useState } from "react";
import { BEFORE, mapsHref, NUMBERED, SECTIONS, SOURCES } from "./data";

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

type Pin = { key: string; s: number; lat: number; lon: number; ns: number[] };

/** Stops sharing a spot within a section (drop-off and pick-up at TRX) become one "1·5" pin. */
const PINS: Pin[] = (() => {
  const at = new Map<string, Pin>();
  for (const stop of NUMBERED) {
    if (!("lat" in stop.where)) continue;
    const { lat, lon } = stop.where;
    const key = `${stop.s}|${lat},${lon}`;
    const pin = at.get(key) ?? { key, s: stop.s, lat, lon, ns: [] };
    pin.ns.push(stop.n);
    at.set(key, pin);
  }
  return [...at.values()];
})();

type PinState = "active" | "on" | "off";

/* A zero-size anchor with a self-centring label, so "1·5" and "8" both sit on their point. */
function pinHtml(pin: Pin, state: PinState) {
  const big = state === "active";
  return `<div style="position:absolute;transform:translate(-50%,-50%);width:max-content;min-width:${big ? 30 : 24}px;height:${big ? 30 : 24}px;padding:0 6px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;border-radius:8px;background:${SECTIONS[pin.s].color};color:#0a0a0a;font:600 ${big ? 13 : 12}px/1 ui-monospace,monospace;box-shadow:0 0 0 2px ${big ? "#fff" : "#0a0a0a"};opacity:${state === "off" ? 0.35 : 1}">${pin.ns.join("·")}</div>`;
}

export default function KlTrip() {
  const mapEl = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef(new Map<string, any>());
  const lines = useRef(new Map<number, any>());
  /** Set when something other than the strip picks a stop, so the strip follows. */
  const scrollTo = useRef<{ n: number; instant: boolean } | null>(null);

  const [ready, setReady] = useState(false);
  const [section, setSection] = useState(0);
  const [active, setActive] = useState(NUMBERED[0].n);
  const [info, setInfo] = useState(false);

  const stops = NUMBERED.filter((s) => s.s === section);

  /** Keep pins clear of the header and the card strip, which both float over the map. */
  const pad = () => ({
    paddingTopLeft: [24, (header.current?.offsetHeight ?? 0) + 32],
    paddingBottomRight: [24, (strip.current?.offsetHeight ?? 0) + 40],
  });

  const fitSection = (i: number) => {
    const pts = PINS.filter((p) => p.s === i).map((p) => [p.lat, p.lon]);
    if (map.current && pts.length) map.current.fitBounds(pts, { ...pad(), maxZoom: 15 });
  };

  const pickSection = (i: number) => {
    setSection(i);
    setActive(NUMBERED.find((s) => s.s === i)!.n);
    strip.current?.scrollTo({ left: 0 });
    fitSection(i);
  };

  const pickStop = (n: number) => {
    const s = NUMBERED[n - 1].s;
    scrollTo.current = { n, instant: s !== section };
    setSection(s);
    setActive(n);
  };
  // Markers are bound once; route their clicks through the latest closure.
  const pickStopRef = useRef(pickStop);
  pickStopRef.current = pickStop;

  useEffect(() => {
    let dead = false;
    loadLeaflet().then((L) => {
      if (dead || !mapEl.current) return;
      const m = L.map(mapEl.current, { zoomControl: false });
      map.current = m;

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright" style="color:inherit">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(m);
      // OSM's standard style is light; inverting and turning the hue back round
      // gives a dark map that keeps water blue and parks green.
      m.getPane("tilePane").style.filter =
        "invert(1) hue-rotate(180deg) brightness(0.95) contrast(0.85) saturate(0.6)";
      m.attributionControl.setPrefix(false);
      Object.assign(m.attributionControl.getContainer().style, {
        background: "rgba(10,10,10,0.7)",
        color: "#a3a3a3",
        fontSize: "10px",
      });

      SECTIONS.forEach((sec, i) => {
        if (!sec.path) return;
        const pts = NUMBERED.filter((s) => s.s === i && "lat" in s.where).map((s) => {
          const w = s.where as { lat: number; lon: number };
          return [w.lat, w.lon];
        });
        lines.current.set(
          i,
          L.polyline(pts, { color: sec.color, weight: 2.5, opacity: 0.8, dashArray: "4 7" }).addTo(m),
        );
      });

      for (const pin of PINS) {
        const mk = L.marker([pin.lat, pin.lon], {
          icon: L.divIcon({ className: "", html: pinHtml(pin, "off"), iconSize: [0, 0] }),
        })
          .on("click", () => pickStopRef.current(pin.ns[0]))
          .addTo(m);
        markers.current.set(pin.key, mk);
      }

      fitSection(0);
      setReady(true);
    });
    return () => {
      dead = true;
      map.current?.remove();
      map.current = null;
      markers.current.clear();
      lines.current.clear();
    };
    // Built once; later changes go through the refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restyle pins for the current section and stop, and keep the active one in view.
  useEffect(() => {
    if (!ready || !map.current) return;
    for (const pin of PINS) {
      const state: PinState = pin.ns.includes(active) ? "active" : pin.s === section ? "on" : "off";
      const mk = markers.current.get(pin.key);
      mk.setIcon((window as any).L.divIcon({ className: "", html: pinHtml(pin, state), iconSize: [0, 0] }));
      mk.setZIndexOffset(state === "active" ? 1000 : state === "on" ? 500 : 0);
    }
    lines.current.forEach((line, i) => line.setStyle({ opacity: i === section ? 0.8 : 0.2 }));

    const where = NUMBERED[active - 1].where;
    if ("lat" in where) map.current.panInside([where.lat, where.lon], pad());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, section, active]);

  // A pin tap (possibly in another section) brings its card to the middle of the strip.
  useEffect(() => {
    const want = scrollTo.current;
    if (!want) return;
    scrollTo.current = null;
    strip.current
      ?.querySelector(`[data-n="${want.n}"]`)
      ?.scrollIntoView({ inline: "center", block: "nearest", behavior: want.instant ? "instant" : "smooth" });
  }, [section, active]);

  // Swiping the strip selects whichever card settles in the middle.
  const settle = useRef<ReturnType<typeof setTimeout>>(undefined);
  const onScroll = () => {
    clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      const el = strip.current;
      if (!el) return;
      const mid = el.getBoundingClientRect().left + el.clientWidth / 2;
      let best = active;
      let dist = Infinity;
      el.querySelectorAll<HTMLElement>("[data-n]").forEach((card) => {
        const r = card.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - mid);
        if (d < dist) {
          dist = d;
          best = Number(card.dataset.n);
        }
      });
      if (best !== active) setActive(best);
    }, 120);
  };

  const sec = SECTIONS[section];

  return (
    <main className="fixed inset-0 overflow-hidden bg-neutral-950 text-neutral-200">
      {/* Inline, because leaflet.css paints .leaflet-container #ddd and loads after Tailwind. */}
      <div ref={mapEl} className="absolute inset-0" style={{ background: "#0a0a0a" }} />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] p-3 pt-[max(env(safe-area-inset-top),12px)]">
        <div
          ref={header}
          className="pointer-events-auto mx-auto max-w-xl rounded-xl bg-neutral-950/80 p-3 shadow-lg ring-1 ring-white/10 backdrop-blur-md"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] text-neutral-400">Friday, 9 October 2026</p>
              <h1 className="font-semibold tracking-tight text-white">Kuala Lumpur day trip</h1>
            </div>
            <button
              onClick={() => setInfo((v) => !v)}
              aria-expanded={info}
              className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium ring-1 transition ${
                info ? "bg-amber-400 text-amber-950 ring-amber-400" : "text-amber-300 ring-amber-400/40"
              }`}
            >
              {info ? "Close" : "Before Friday"}
            </button>
          </div>

          {info ? (
            <div className="mt-3 max-h-[60dvh] overflow-y-auto text-sm leading-relaxed">
              <ul className="list-disc space-y-1.5 pl-5 text-neutral-200">
                {BEFORE.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-neutral-400">
                Meeples and Merdeka 118 have no exact coordinates, so they have cards but no pins.
              </p>
              <h2 className="mt-4 text-[11px] font-medium uppercase tracking-wide text-neutral-500">Sources</h2>
              <ul className="mt-1 space-y-1 text-xs">
                {SOURCES.map(([label, href]) => (
                  <li key={href}>
                    <a href={href} target="_blank" rel="noreferrer" className="text-neutral-400 underline-offset-2 hover:text-white hover:underline">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <>
              <div className="mt-3 grid grid-cols-4 gap-1.5">
                {SECTIONS.map((s, i) => (
                  <button
                    key={s.key}
                    onClick={() => pickSection(i)}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition ${
                      i === section ? "bg-white/10 text-white" : "text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
                    {s.label}
                  </button>
                ))}
              </div>
              {sec.sub && <p className="mt-2 text-[11px] text-neutral-400">{sec.sub}</p>}
            </>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1000] pb-[calc(env(safe-area-inset-bottom)+22px)]">
        <div
          ref={strip}
          onScroll={onScroll}
          className="pointer-events-auto flex snap-x snap-mandatory items-end gap-3 overflow-x-auto px-[7.5vw] [scrollbar-width:none] sm:px-[calc(50vw-12rem)]"
        >
          {stops.map((stop) => {
            const on = stop.n === active;
            const pinned = "lat" in stop.where;
            return (
              <article
                key={stop.n}
                data-n={stop.n}
                onClick={() => !on && pickStop(stop.n)}
                className={`max-h-[42dvh] w-[85vw] max-w-sm shrink-0 snap-center overflow-y-auto rounded-xl bg-neutral-950/85 p-4 shadow-lg ring-1 backdrop-blur-md transition ${
                  on ? "ring-white/30" : "cursor-pointer opacity-70 ring-white/10"
                }`}
              >
                <div className="flex items-center gap-2 text-xs">
                  {pinned && (
                    <span
                      className="flex h-5 min-w-5 items-center justify-center rounded-md px-1 font-mono text-[11px] font-semibold text-neutral-950"
                      style={{ background: sec.color }}
                    >
                      {stop.n}
                    </span>
                  )}
                  <span className="font-medium uppercase tracking-wide" style={{ color: sec.color }}>
                    {stop.kind}
                  </span>
                  <span className="ml-auto font-mono text-neutral-400">{stop.time}</span>
                </div>
                <h3 className="mt-2 font-semibold text-white">{stop.name}</h3>
                {stop.walk && <p className="mt-0.5 text-xs text-neutral-500">↓ {stop.walk}</p>}
                <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-neutral-300">
                  {stop.notes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
                <div className="mt-3 flex items-center gap-3">
                  <a
                    href={mapsHref(stop.where)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-200 ring-1 ring-white/15 hover:bg-white/5"
                  >
                    Open in Google Maps
                  </a>
                  {!pinned && <span className="text-xs text-neutral-500">Not pinned</span>}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
