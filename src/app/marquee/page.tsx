"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* shared                                                              */
/* ------------------------------------------------------------------ */

function useRaf(cb: (t: number, dt: number) => void) {
  const saved = useRef(cb);
  saved.current = cb;
  useEffect(() => {
    let id = 0;
    let last = performance.now();
    const start = last;
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      saved.current((now - start) / 1000, dt);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);
}

const repeat = (text: string, n: number, sep = " • ") =>
  Array.from({ length: n }, () => text).join(sep) + sep;

function Card({
  title,
  hint,
  children,
  tall,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
  tall?: boolean;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
      <header className="mb-6 flex items-baseline justify-between gap-4">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/40">
          {title}
        </h2>
        <p className="font-mono text-[11px] text-white/25">{hint}</p>
      </header>
      <div
        className={`flex items-center justify-center ${tall ? "min-h-[20rem]" : "min-h-[11rem]"}`}
      >
        {children}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 01 — rotating ring                                                  */
/* ------------------------------------------------------------------ */

function Ring({ text }: { text: string }) {
  const id = useId().replace(/:/g, "");
  const body = repeat(text.toUpperCase(), 4);
  return (
    <svg viewBox="0 0 320 320" className="h-72 w-72">
      <defs>
        <path
          id={`ring-${id}`}
          fill="none"
          d="M160,160 m-120,0 a120,120 0 1,1 240,0 a120,120 0 1,1 -240,0"
        />
      </defs>
      <g style={{ transformOrigin: "160px 160px", animation: "spin-cw 18s linear infinite" }}>
        <text className="fill-white font-mono text-[19px] tracking-[0.32em]">
          <textPath href={`#ring-${id}`}>{body}</textPath>
        </text>
      </g>
      <circle cx="160" cy="160" r="92" className="fill-none stroke-white/10" />
      <circle cx="160" cy="160" r="6" className="fill-white/70" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* 02 — counter-rotating orbits                                        */
/* ------------------------------------------------------------------ */

function Orbits({ text }: { text: string }) {
  const id = useId().replace(/:/g, "");
  const rings = [
    { r: 140, size: 20, reps: 4, dur: 26, dir: "cw", cls: "fill-white" },
    { r: 104, size: 16, reps: 4, dur: 17, dir: "ccw", cls: "fill-cyan-300" },
    { r: 70, size: 13, reps: 3, dur: 11, dir: "cw", cls: "fill-rose-400" },
    { r: 40, size: 10, reps: 2, dur: 7, dir: "ccw", cls: "fill-amber-300" },
  ];
  return (
    <svg viewBox="0 0 320 320" className="h-80 w-80">
      <defs>
        {rings.map((r, i) => (
          <path
            key={i}
            id={`orb-${id}-${i}`}
            fill="none"
            d={`M160,160 m-${r.r},0 a${r.r},${r.r} 0 1,1 ${r.r * 2},0 a${r.r},${r.r} 0 1,1 -${r.r * 2},0`}
          />
        ))}
      </defs>
      {rings.map((r, i) => (
        <g
          key={i}
          style={{
            transformOrigin: "160px 160px",
            animation: `spin-${r.dir} ${r.dur}s linear infinite`,
          }}
        >
          <text
            className={`${r.cls} font-mono tracking-[0.3em]`}
            style={{ fontSize: r.size }}
          >
            <textPath href={`#orb-${id}-${i}`}>
              {repeat(text.toUpperCase(), r.reps)}
            </textPath>
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* 03 — spiral                                                         */
/* ------------------------------------------------------------------ */

function spiralPath(turns: number, r0: number, r1: number) {
  const pts: string[] = [];
  const steps = turns * 90;
  for (let i = 0; i <= steps; i++) {
    const a = (i / 90) * Math.PI * 2;
    const r = r0 + ((r1 - r0) * i) / steps;
    pts.push(`${(160 + Math.cos(a) * r).toFixed(2)},${(160 + Math.sin(a) * r).toFixed(2)}`);
  }
  return `M${pts.join(" L")}`;
}

function Spiral({ text }: { text: string }) {
  const id = useId().replace(/:/g, "");
  const d = useMemo(() => spiralPath(5, 14, 150), []);
  const [offset, setOffset] = useState(0);
  useRaf((t) => setOffset((-t * 60) % 4000));
  return (
    <svg viewBox="0 0 320 320" className="h-80 w-80">
      <defs>
        <path id={`sp-${id}`} d={d} fill="none" />
      </defs>
      <use href={`#sp-${id}`} className="stroke-white/[0.07]" strokeWidth={1} />
      <text className="fill-emerald-300 font-mono text-[13px] tracking-[0.22em]">
        <textPath href={`#sp-${id}`} startOffset={offset}>
          {repeat(text.toUpperCase(), 22)}
        </textPath>
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* 04 — sine wave path                                                 */
/* ------------------------------------------------------------------ */

function Wave({ text }: { text: string }) {
  const id = useId().replace(/:/g, "");
  const d = useMemo(() => {
    const pts: string[] = [];
    for (let x = 0; x <= 800; x += 8) {
      pts.push(`${x},${(80 + Math.sin(x / 70) * 42).toFixed(2)}`);
    }
    return `M${pts.join(" L")}`;
  }, []);
  const [offset, setOffset] = useState(0);
  useRaf((t) => setOffset((-t * 90) % 3000));
  return (
    <svg viewBox="0 0 800 160" className="w-full">
      <defs>
        <path id={`wv-${id}`} d={d} fill="none" />
      </defs>
      <use href={`#wv-${id}`} className="stroke-white/10" strokeWidth={1} />
      <text className="fill-white font-black uppercase" style={{ fontSize: 38 }}>
        <textPath href={`#wv-${id}`} startOffset={offset}>
          {repeat(text, 14)}
        </textPath>
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* 05 — lemniscate (infinity loop)                                     */
/* ------------------------------------------------------------------ */

function Infinity8({ text }: { text: string }) {
  const id = useId().replace(/:/g, "");
  const d = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 360; i++) {
      const t = (i / 360) * Math.PI * 2;
      const s = 1 + Math.sin(t) ** 2;
      pts.push(
        `${(200 + (130 * Math.cos(t)) / s).toFixed(2)},${(90 + (130 * Math.sin(t) * Math.cos(t)) / s).toFixed(2)}`,
      );
    }
    return `M${pts.join(" L")} Z`;
  }, []);
  const [offset, setOffset] = useState(0);
  useRaf((t) => setOffset((-t * 70) % 2000));
  return (
    <svg viewBox="0 0 400 180" className="w-full max-w-lg">
      <defs>
        <path id={`inf-${id}`} d={d} fill="none" />
      </defs>
      <use href={`#inf-${id}`} className="stroke-white/10" strokeWidth={1} />
      <text className="fill-fuchsia-300 font-mono text-[15px] tracking-[0.25em]">
        <textPath href={`#inf-${id}`} startOffset={offset}>
          {repeat(text.toUpperCase(), 10)}
        </textPath>
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* 06 — 3d cylinder                                                    */
/* ------------------------------------------------------------------ */

function Cylinder({ text }: { text: string }) {
  const n = 14;
  const radius = 210;
  return (
    <div className="w-full" style={{ perspective: "700px" }}>
      <div
        className="relative mx-auto h-40 w-full"
        style={{
          transformStyle: "preserve-3d",
          animation: "spin-y 16s linear infinite",
        }}
      >
        {Array.from({ length: n }, (_, i) => (
          <div
            key={i}
            className="absolute inset-0 flex items-center justify-center whitespace-nowrap text-3xl font-black uppercase sm:text-4xl"
            style={{
              transform: `rotateY(${(360 / n) * i}deg) translateZ(${radius}px)`,
              color: `hsl(${(i * 360) / n} 80% 70%)`,
            }}
          >
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 07 — radial word wheel                                              */
/* ------------------------------------------------------------------ */

function Wheel({ text }: { text: string }) {
  const spokes = 16;
  return (
    <div className="relative h-72 w-72">
      <div
        className="absolute inset-0"
        style={{ animation: "spin-ccw 24s linear infinite" }}
      >
        {Array.from({ length: spokes }, (_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 origin-left whitespace-nowrap font-mono text-sm uppercase tracking-[0.3em]"
            style={{
              transform: `rotate(${(360 / spokes) * i}deg) translateX(28px)`,
              color: `rgba(255,255,255,${0.25 + (i % 4) * 0.25})`,
            }}
          >
            {text}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(8,8,11,1)_14%,transparent_46%)]" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 08 — scan band                                                      */
/* ------------------------------------------------------------------ */

function ScanBand({ text }: { text: string }) {
  const [x, setX] = useState(0);
  useRaf((t) => setX((t * 26) % 130));
  const line = (
    <div className="flex gap-8 whitespace-nowrap text-4xl font-black uppercase sm:text-6xl">
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i}>{text}</span>
      ))}
    </div>
  );
  return (
    <div className="relative w-full overflow-hidden">
      <div className="text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.45)" }}>
        <div style={{ animation: "marquee-left 18s linear infinite" }}>{line}</div>
      </div>
      <div
        className="absolute inset-0 text-amber-300"
        style={{ clipPath: `inset(0 ${Math.max(0, 100 - x)}% 0 ${Math.max(0, x - 22)}%)` }}
      >
        <div style={{ animation: "marquee-left 18s linear infinite" }}>{line}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 09 — velocity marquee                                               */
/* ------------------------------------------------------------------ */

function Velocity({ text }: { text: string }) {
  const track = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const vel = useRef(0);
  const boost = useRef(0);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      boost.current += e.deltaY * 0.35;
    };
    const node = track.current?.parentElement;
    node?.addEventListener("wheel", onWheel, { passive: true });
    return () => node?.removeEventListener("wheel", onWheel);
  }, []);

  useRaf((_, dt) => {
    boost.current *= 0.92;
    vel.current = 90 + boost.current;
    offset.current -= vel.current * dt;
    const half = (track.current?.scrollWidth ?? 2) / 2;
    if (offset.current <= -half) offset.current += half;
    if (offset.current > 0) offset.current -= half;
    if (track.current) {
      track.current.style.transform = `translateX(${offset.current.toFixed(2)}px) skewX(${(-boost.current * 0.02).toFixed(2)}deg)`;
    }
  });

  return (
    <div className="w-full cursor-ns-resize overflow-hidden">
      <div
        ref={track}
        className="flex w-max gap-8 whitespace-nowrap text-4xl font-black uppercase text-lime-300 sm:text-6xl"
      >
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i}>{text}</span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 10 — vertical columns                                               */
/* ------------------------------------------------------------------ */

function Columns({ text }: { text: string }) {
  const cols = [
    { dur: 9, dir: "up", cls: "text-white/85" },
    { dur: 14, dir: "down", cls: "text-white/30" },
    { dur: 7, dir: "up", cls: "text-cyan-300/70" },
    { dur: 18, dir: "down", cls: "text-white/50" },
  ];
  return (
    <div className="flex h-64 w-full justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
      {cols.map((c, i) => (
        <div key={i} className="overflow-hidden">
          <div
            className={`flex flex-col items-center gap-4 text-2xl font-black uppercase ${c.cls}`}
            style={{
              writingMode: "vertical-rl",
              animation: `scroll-${c.dir} ${c.dur}s linear infinite`,
            }}
          >
            {Array.from({ length: 12 }, (_, k) => (
              <span key={k}>{text}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* page                                                                */
/* ------------------------------------------------------------------ */

export default function MarqueePage() {
  const [text, setText] = useState("ORBIT");
  const value = useMemo(() => text.trim() || "MARQUEE", [text]);
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value.slice(0, 16)),
    [],
  );

  return (
    <main className="min-h-screen bg-[#08080b] px-4 py-12 text-white sm:px-8">
      <style>{`
        @keyframes spin-cw  { to { transform: rotate(360deg); } }
        @keyframes spin-ccw { to { transform: rotate(-360deg); } }
        @keyframes spin-y   { to { transform: rotateY(360deg); } }
        @keyframes marquee-left { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes scroll-up   { from { transform: translateY(0); } to { transform: translateY(-50%); } }
        @keyframes scroll-down { from { transform: translateY(-50%); } to { transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: .001ms !important; }
        }
      `}</style>

      <div className="mx-auto max-w-4xl">
        <header className="mb-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/35">
            sandbox / typography II
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
            Ten marquees that go in circles
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/45">
            Loops on paths, rings, spirals and cylinders. Scroll over #09 to
            shove it.{" "}
            <a href="/type" className="underline decoration-white/30 underline-offset-4">
              The first nine live here.
            </a>
          </p>
          <input
            value={text}
            onChange={onChange}
            spellCheck={false}
            className="mt-6 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 font-mono text-lg outline-none placeholder:text-white/25 focus:border-white/40"
            placeholder="type something…"
          />
        </header>

        <div className="grid gap-5">
          <Card title="01 — text ring" hint="svg textPath" tall>
            <Ring text={value} />
          </Card>
          <Card title="02 — counter orbits" hint="four rings" tall>
            <Orbits text={value} />
          </Card>
          <Card title="03 — spiral" hint="startOffset scroll" tall>
            <Spiral text={value} />
          </Card>
          <Card title="04 — sine path" hint="wave marquee">
            <Wave text={value} />
          </Card>
          <Card title="05 — lemniscate" hint="figure-eight loop">
            <Infinity8 text={value} />
          </Card>
          <Card title="06 — cylinder" hint="14 faces in 3d">
            <Cylinder text={value} />
          </Card>
          <Card title="07 — word wheel" hint="radial spokes" tall>
            <Wheel text={value} />
          </Card>
          <Card title="08 — scan band" hint="clip-path sweep">
            <ScanBand text={value} />
          </Card>
          <Card title="09 — velocity" hint="scroll to shove">
            <Velocity text={value} />
          </Card>
          <Card title="10 — columns" hint="vertical writing-mode" tall>
            <Columns text={value} />
          </Card>
        </div>

        <footer className="py-12 text-center font-mono text-[11px] text-white/25">
          built in the sandbox
        </footer>
      </div>
    </main>
  );
}
