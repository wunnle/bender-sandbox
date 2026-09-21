"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SceneArt } from "./Art";
import { SCENES } from "./scenes";

const MAX = SCENES[0].e;
const MIN = SCENES[SCENES.length - 1].e;
const SPAN = 1.6; // decades of fade on either side of the focused scene

const UNITS: [number, string][] = [
  [24, "Ym"], [21, "Zm"], [18, "Em"], [15, "Pm"], [12, "Tm"], [9, "Gm"],
  [6, "Mm"], [3, "km"], [0, "m"], [-3, "mm"], [-6, "µm"], [-9, "nm"],
  [-12, "pm"], [-15, "fm"], [-18, "am"],
];

function humanScale(e: number) {
  const u = UNITS.find(([p]) => e >= p) ?? UNITS[UNITS.length - 1];
  const v = Math.pow(10, e - u[0]);
  const n = v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(0) : v.toFixed(1);
  return `${n} ${u[1]}`;
}

function lightYears(e: number) {
  const ly = Math.pow(10, e) / 9.461e15;
  if (ly < 0.01) return null;
  if (ly > 1e9) return `${(ly / 1e9).toFixed(0)} billion light-years`;
  if (ly > 1e6) return `${(ly / 1e6).toFixed(0)} million light-years`;
  if (ly > 1e3) return `${(ly / 1e3).toFixed(0)} thousand light-years`;
  return `${ly.toFixed(ly < 1 ? 2 : 0)} light-years`;
}

export default function PowersOfTenPage() {
  const [view, setView] = useState(0);
  const [playing, setPlaying] = useState(false);
  const dir = useRef(-1);
  const frame = useRef(0);

  const clamp = useCallback((v: number) => Math.min(MAX, Math.max(MIN, v)), []);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setView((v) => {
        const next = v + dir.current * dt * 0.9;
        if (next <= MIN) {
          dir.current = 1;
          return MIN;
        }
        if (next >= MAX) {
          dir.current = -1;
          return MAX;
        }
        return next;
      });
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [playing]);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const step = ev.shiftKey ? 1 : 0.25;
      if (ev.key === "ArrowDown" || ev.key === "ArrowLeft") {
        setPlaying(false);
        setView((v) => clamp(v - step));
      } else if (ev.key === "ArrowUp" || ev.key === "ArrowRight") {
        setPlaying(false);
        setView((v) => clamp(v + step));
      } else if (ev.key === " ") {
        ev.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clamp]);

  const onWheel = useCallback(
    (ev: React.WheelEvent) => {
      setPlaying(false);
      setView((v) => clamp(v + ev.deltaY * 0.0022));
    },
    [clamp],
  );

  // touch: vertical drag zooms
  const touchY = useRef<number | null>(null);

  const focus = SCENES.reduce((best, s) => (Math.abs(s.e - view) < Math.abs(best.e - view) ? s : best), SCENES[0]);
  const ly = lightYears(view);

  return (
    <main
      className="fixed inset-0 overflow-hidden bg-[#05060c] text-white select-none touch-none"
      onWheel={onWheel}
      onTouchStart={(e) => {
        touchY.current = e.touches[0].clientY;
        setPlaying(false);
      }}
      onTouchMove={(e) => {
        if (touchY.current === null) return;
        const dy = e.touches[0].clientY - touchY.current;
        touchY.current = e.touches[0].clientY;
        setView((v) => clamp(v - dy * 0.012));
      }}
      onTouchEnd={() => {
        touchY.current = null;
      }}
    >
      {/* starfield backdrop */}
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_20%_25%,rgba(120,140,255,0.18),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(255,120,190,0.12),transparent_50%)]" />

      <div className="absolute inset-0 grid place-items-center">
        {SCENES.map((s) => {
          const d = s.e - view;
          if (Math.abs(d) > SPAN) return null;
          const size = Math.pow(10, d) * 72; // vmin
          const t = Math.abs(d) / SPAN;
          const opacity = Math.pow(1 - t, 1.6);
          return (
            <div
              key={s.e}
              className="absolute"
              style={{
                width: `${size}vmin`,
                height: `${size}vmin`,
                opacity,
                filter: t > 0.55 ? `blur(${(t - 0.55) * 14}px)` : undefined,
                willChange: "opacity, width, height",
              }}
            >
              <SceneArt art={s.art} hue={s.hue} seed={s.e + 30} />
            </div>
          );
        })}
      </div>

      {/* frame */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="h-[72vmin] w-[72vmin] rounded-sm border border-white/12" />
      </div>

      {/* header */}
      <header className="absolute left-0 right-0 top-0 p-5 sm:p-8">
        <h1 className="text-[11px] uppercase tracking-[0.35em] text-white/45">Powers of Ten</h1>
        <p className="mt-1 text-[11px] text-white/30">Scroll, drag, or press space</p>
      </header>

      {/* readout */}
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
        <div className="mx-auto max-w-xl">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-3xl sm:text-4xl tabular-nums text-white">
              10<sup className="text-lg sm:text-xl">{Math.round(view)}</sup>
            </span>
            <span className="font-mono text-sm text-white/50">{humanScale(view)}</span>
            {ly && <span className="hidden font-mono text-sm text-white/30 sm:inline">≈ {ly}</span>}
          </div>

          <h2 className="mt-3 text-xl font-medium sm:text-2xl">{focus.title}</h2>
          <p className="mt-1 max-w-lg text-sm leading-relaxed text-white/55">{focus.blurb}</p>

          <div className="mt-5 flex items-center gap-4">
            <button
              onClick={() => setPlaying((p) => !p)}
              className="shrink-0 rounded-full border border-white/20 px-4 py-1.5 text-xs uppercase tracking-widest text-white/80 transition hover:bg-white/10"
            >
              {playing ? "Pause" : "Play"}
            </button>
            <input
              type="range"
              min={MIN}
              max={MAX}
              step={0.01}
              value={view}
              onChange={(e) => {
                setPlaying(false);
                setView(Number(e.target.value));
              }}
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-white"
              aria-label="Scale"
            />
          </div>
          <div className="mt-2 flex justify-between font-mono text-[10px] text-white/25">
            <span>10^{MIN} quark</span>
            <span>10^0 you</span>
            <span>10^{MAX} universe</span>
          </div>
        </div>
      </div>
    </main>
  );
}
