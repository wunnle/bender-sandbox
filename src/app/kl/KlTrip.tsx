"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BEFORE, mapsHref, NUMBERED, SECTIONS, SOURCES, type NumberedStop } from "./data";

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

/** A place added on the device. Lives only in localStorage. */
type Custom = { id: string; s: number; name: string; time: string; note: string; lat: number; lon: number };
type TripStop = NumberedStop & { id?: string };

const STORE = "kl-trip:places";

function loadCustom(): Custom[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE) ?? "[]");
    return Array.isArray(raw)
      ? raw.filter((c) => typeof c?.lat === "number" && typeof c?.lon === "number" && SECTIONS[c?.s])
      : [];
  } catch {
    return [];
  }
}

/** Added places number on from the built-in stops, in the order they were added. */
const toStops = (custom: Custom[]): TripStop[] => [
  ...NUMBERED,
  ...custom.map((c, i) => ({
    id: c.id,
    s: c.s,
    n: NUMBERED.length + i + 1,
    time: c.time,
    name: c.name,
    kind: "Added",
    notes: c.note ? [c.note] : [],
    where: { lat: c.lat, lon: c.lon },
  })),
];

type Pin = { key: string; s: number; lat: number; lon: number; ns: number[] };

/** Stops sharing a spot within a section (drop-off and pick-up at TRX) become one "1·6" pin. */
function toPins(stops: TripStop[]): Pin[] {
  const at = new Map<string, Pin>();
  for (const stop of stops) {
    if (!("lat" in stop.where)) continue;
    const { lat, lon } = stop.where;
    const key = `${stop.s}|${lat},${lon}`;
    const pin = at.get(key) ?? { key, s: stop.s, lat, lon, ns: [] };
    pin.ns.push(stop.n);
    at.set(key, pin);
  }
  return [...at.values()];
}

type PinState = "active" | "on" | "off";

/* A zero-size anchor with a self-centring label, so "1·6" and "8" both sit on their point. */
function pinHtml(pin: Pin, state: PinState) {
  const big = state === "active";
  return `<div style="position:absolute;transform:translate(-50%,-50%);width:max-content;min-width:${big ? 30 : 24}px;height:${big ? 30 : 24}px;padding:0 6px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;border-radius:8px;background:${SECTIONS[pin.s].color};color:#0a0a0a;font:600 ${big ? 13 : 12}px/1 ui-monospace,monospace;box-shadow:0 0 0 2px ${big ? "#fff" : "#0a0a0a"};opacity:${state === "off" ? 0.35 : 1}">${pin.ns.join("·")}</div>`;
}

const DRAFT_HTML = `<div style="position:absolute;transform:translate(-50%,-50%);width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:#fff;color:#0a0a0a;font:700 18px/1 ui-sans-serif,sans-serif;box-shadow:0 0 0 2px #0a0a0a">+</div>`;

type Hit = { name: string; sub: string; lat: number; lon: number };

/**
 * OSM's Nominatim: free and keyless. Its policy allows search-on-submit but not
 * autocomplete, so this only runs when the form is submitted. Biased, not bounded,
 * to Greater KL.
 */
async function search(q: string): Promise<Hit[]> {
  const url =
    "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&accept-language=en&viewbox=101.50,3.30,101.85,2.95&q=" +
    encodeURIComponent(q);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`search ${res.status}`);
  const rows: any[] = await res.json();
  return rows.map((r) => {
    const parts = String(r.display_name).split(", ");
    return {
      name: r.name || parts[0],
      sub: parts.slice(1, 4).join(", "),
      lat: Number(r.lat),
      lon: Number(r.lon),
    };
  });
}

export default function KlTrip() {
  const mapEl = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef(new Map<string, any>());
  const lines = useRef(new Map<number, any>());
  const draftMarker = useRef<any>(null);
  /** Set when something other than the strip picks a stop, so the strip follows. */
  const scrollTo = useRef<{ n: number; instant: boolean } | null>(null);

  const [ready, setReady] = useState(false);
  const [section, setSection] = useState(0);
  const [active, setActive] = useState(NUMBERED[0].n);
  const [panel, setPanel] = useState<null | "info" | "add">(null);
  const [custom, setCustom] = useState<Custom[]>([]);

  // Add-place form.
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [draft, setDraft] = useState<{ lat: number; lon: number } | null>(null);
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [target, setTarget] = useState(0);

  // Read after mount, so the server render and the first client render agree.
  useEffect(() => setCustom(loadCustom()), []);

  const persist = (next: Custom[]) => {
    setCustom(next);
    localStorage.setItem(STORE, JSON.stringify(next));
  };

  const all = useMemo(() => toStops(custom), [custom]);
  const pins = useMemo(() => toPins(all), [all]);
  const byN = (n: number) => all.find((s) => s.n === n);
  const stops = all.filter((s) => s.s === section);

  /** Keep pins clear of the header and the card strip, which both float over the map. */
  const pad = () => ({
    paddingTopLeft: [24, (header.current?.offsetHeight ?? 0) + 32],
    paddingBottomRight: [24, (strip.current?.offsetHeight ?? 0) + 40],
  });

  const fitSection = (i: number) => {
    const pts = pins.filter((p) => p.s === i).map((p) => [p.lat, p.lon]);
    if (map.current && pts.length) map.current.fitBounds(pts, { ...pad(), maxZoom: 15 });
  };

  const pickSection = (i: number) => {
    setSection(i);
    setActive(all.find((s) => s.s === i)!.n);
    strip.current?.scrollTo({ left: 0 });
    fitSection(i);
  };

  const pickStop = (n: number) => {
    const s = byN(n)?.s ?? section;
    scrollTo.current = { n, instant: s !== section };
    setSection(s);
    setActive(n);
  };

  const openAdd = () => {
    setPanel((p) => (p === "add" ? null : "add"));
    setTarget(section);
  };

  const resetForm = () => {
    setQuery("");
    setHits(null);
    setSearchError(false);
    setDraft(null);
    setName("");
    setTime("");
    setNote("");
  };

  const closePanel = () => {
    setPanel(null);
    resetForm();
  };

  const runSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearchError(false);
    try {
      setHits(await search(query.trim()));
    } catch {
      setHits(null);
      setSearchError(true);
    } finally {
      setSearching(false);
    }
  };

  const chooseHit = (h: Hit) => {
    setDraft({ lat: h.lat, lon: h.lon });
    setName(h.name);
    setHits(null);
    map.current?.setView([h.lat, h.lon], 16);
  };

  const save = () => {
    if (!draft || !name.trim()) return;
    const next: Custom[] = [
      ...custom,
      {
        id: crypto.randomUUID(),
        s: target,
        name: name.trim(),
        time: time.trim(),
        note: note.trim(),
        lat: draft.lat,
        lon: draft.lon,
      },
    ];
    persist(next);
    const n = NUMBERED.length + next.length;
    closePanel();
    scrollTo.current = { n, instant: true };
    setSection(target);
    setActive(n);
  };

  const remove = (id: string) => {
    const gone = all.find((s) => s.id === id);
    persist(custom.filter((c) => c.id !== id));
    if (gone?.n === active) setActive(NUMBERED.find((s) => s.s === section)!.n);
  };

  // Markers and the map are bound once; route their events through the latest closures.
  const pickStopRef = useRef(pickStop);
  pickStopRef.current = pickStop;
  const mapClickRef = useRef((_lat: number, _lon: number) => {});
  mapClickRef.current = (lat, lon) => {
    if (panel === "add") setDraft({ lat, lon });
  };

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
      m.on("click", (e: any) => mapClickRef.current(e.latlng.lat, e.latlng.lng));

      // The walking line follows the planned order, so it is drawn from the built-in stops only.
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

      m.fitBounds(
        toPins(NUMBERED).filter((p) => p.s === 0).map((p) => [p.lat, p.lon]),
        { ...pad(), maxZoom: 15 },
      );
      setReady(true);
    });
    return () => {
      dead = true;
      map.current?.remove();
      map.current = null;
      markers.current.clear();
      lines.current.clear();
      draftMarker.current = null;
    };
    // Built once; later changes go through the refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rebuild markers whenever the set of places changes.
  useEffect(() => {
    if (!ready || !map.current) return;
    const L = (window as any).L;
    markers.current.forEach((mk) => mk.remove());
    markers.current.clear();
    for (const pin of pins) {
      const mk = L.marker([pin.lat, pin.lon], {
        icon: L.divIcon({ className: "", html: pinHtml(pin, "off"), iconSize: [0, 0] }),
      })
        .on("click", () => pickStopRef.current(pin.ns[0]))
        .addTo(map.current);
      markers.current.set(pin.key, mk);
    }
  }, [ready, pins]);

  // Restyle pins for the current section and stop, and keep the active one in view.
  useEffect(() => {
    if (!ready || !map.current) return;
    const L = (window as any).L;
    for (const pin of pins) {
      const state: PinState = pin.ns.includes(active) ? "active" : pin.s === section ? "on" : "off";
      const mk = markers.current.get(pin.key);
      mk?.setIcon(L.divIcon({ className: "", html: pinHtml(pin, state), iconSize: [0, 0] }));
      mk?.setZIndexOffset(state === "active" ? 1000 : state === "on" ? 500 : 0);
    }
    lines.current.forEach((line, i) => line.setStyle({ opacity: i === section ? 0.8 : 0.2 }));

    const where = byN(active)?.where;
    if (where && "lat" in where && panel !== "add") map.current.panInside([where.lat, where.lon], pad());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, pins, section, active]);

  // The pin being placed: a white "+" that follows search picks and map taps.
  useEffect(() => {
    if (!ready || !map.current) return;
    const L = (window as any).L;
    draftMarker.current?.remove();
    draftMarker.current = draft
      ? L.marker([draft.lat, draft.lon], {
          icon: L.divIcon({ className: "", html: DRAFT_HTML, iconSize: [0, 0] }),
          zIndexOffset: 2000,
          interactive: false,
        }).addTo(map.current)
      : null;
  }, [ready, draft]);

  // A pin tap (possibly in another section) brings its card to the middle of the strip.
  useEffect(() => {
    const want = scrollTo.current;
    if (!want) return;
    scrollTo.current = null;
    strip.current
      ?.querySelector(`[data-n="${want.n}"]`)
      ?.scrollIntoView({ inline: "center", block: "nearest", behavior: want.instant ? "instant" : "smooth" });
  }, [section, active, custom]);

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
  // 16px text: iOS Safari zooms the page into any focused input smaller than that.
  const field =
    "min-w-0 flex-1 rounded-lg bg-white/5 px-3 py-2 text-base text-white placeholder:text-neutral-500 ring-1 ring-white/10 outline-none focus:ring-white/30";

  return (
    <main className="fixed inset-0 overflow-hidden bg-neutral-950 text-neutral-200">
      {/* Inline, because leaflet.css paints .leaflet-container #ddd and loads after Tailwind. */}
      <div ref={mapEl} className="absolute inset-0" style={{ background: "#0a0a0a" }} />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] p-3 pt-[max(env(safe-area-inset-top),12px)]">
        <div
          ref={header}
          className="pointer-events-auto mx-auto max-w-xl rounded-xl bg-neutral-950/80 p-3 shadow-lg ring-1 ring-white/10 backdrop-blur-md"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] text-neutral-400">Friday, 9 October 2026</p>
              <h1 className="font-semibold tracking-tight text-white">
                {panel === "add" ? "Add a place" : "Kuala Lumpur day trip"}
              </h1>
            </div>
            {panel ? (
              <button
                onClick={closePanel}
                className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-200 ring-1 ring-white/20"
              >
                Close
              </button>
            ) : (
              <div className="flex shrink-0 gap-1.5">
                <button
                  onClick={openAdd}
                  aria-label="Add a place"
                  className="flex h-[30px] w-[30px] items-center justify-center rounded-lg text-lg leading-none text-white ring-1 ring-white/20"
                >
                  +
                </button>
                <button
                  onClick={() => setPanel("info")}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-amber-300 ring-1 ring-amber-400/40"
                >
                  Before Friday
                </button>
              </div>
            )}
          </div>

          {panel === "info" && (
            <div className="mt-3 max-h-[60dvh] overflow-y-auto text-sm leading-relaxed">
              <ul className="list-disc space-y-1.5 pl-5 text-neutral-200">
                {BEFORE.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-neutral-400">
                Merdeka 118 has no exact coordinates, so it has a card but no pin. Places you add are
                saved in this browser only.
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
          )}

          {panel === "add" && (
            <div className="mt-3 max-h-[55dvh] space-y-3 overflow-y-auto">
              <form onSubmit={runSearch} className="flex gap-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search a place in KL"
                  enterKeyHint="search"
                  className={field}
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="shrink-0 rounded-lg bg-white/10 px-3 text-sm font-medium text-white disabled:opacity-50"
                >
                  {searching ? "…" : "Search"}
                </button>
              </form>

              {searchError && <p className="text-xs text-red-300">Search failed — try again, or tap the map.</p>}
              {hits && hits.length === 0 && <p className="text-xs text-neutral-400">No results. Tap the map instead.</p>}
              {hits && hits.length > 0 && (
                <ul className="overflow-hidden rounded-lg ring-1 ring-white/10">
                  {hits.map((h, i) => (
                    <li key={`${h.lat},${h.lon},${i}`}>
                      <button
                        onClick={() => chooseHit(h)}
                        className="block w-full border-b border-white/5 px-3 py-2 text-left last:border-0 hover:bg-white/5"
                      >
                        <span className="block text-sm text-white">{h.name}</span>
                        <span className="block truncate text-xs text-neutral-500">{h.sub}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <p className="text-xs text-neutral-400">
                {draft
                  ? "Pin placed. Tap the map to move it."
                  : "Or tap anywhere on the map to drop a pin."}
              </p>

              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className={`${field} w-full`} />

              <div className="grid grid-cols-4 gap-1.5">
                {SECTIONS.map((s, i) => (
                  <button
                    key={s.key}
                    onClick={() => setTarget(i)}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition ${
                      i === target ? "bg-white/10 text-white ring-1 ring-white/20" : "text-neutral-400"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="Time"
                  className={`${field} w-24 flex-none`}
                />
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className={field} />
              </div>

              <button
                onClick={save}
                disabled={!draft || !name.trim()}
                className="w-full rounded-lg bg-white py-2 text-sm font-semibold text-neutral-950 disabled:bg-white/10 disabled:text-neutral-500"
              >
                {draft ? (name.trim() ? "Add to the plan" : "Give it a name") : "Pick a location first"}
              </button>
            </div>
          )}

          {!panel && (
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

      {/* Hidden while adding, so the map is free to tap. */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-[1000] pb-[calc(env(safe-area-inset-bottom)+22px)] transition-opacity ${
          panel === "add" ? "invisible opacity-0" : ""
        }`}
      >
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
                {stop.notes.length > 0 && (
                  <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-neutral-300">
                    {stop.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                )}
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
                  {stop.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Remove ${stop.name}?`)) remove(stop.id!);
                      }}
                      className="ml-auto rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-300 ring-1 ring-red-400/30 hover:bg-red-400/10"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
