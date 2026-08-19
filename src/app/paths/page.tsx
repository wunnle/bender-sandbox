"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* shared                                                              */
/* ------------------------------------------------------------------ */

function useRaf(cb: (t: number) => void) {
  const saved = useRef(cb);
  saved.current = cb;
  useEffect(() => {
    let id = 0;
    const start = performance.now();
    const loop = (now: number) => {
      saved.current((now - start) / 1000);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);
}

const repeat = (text: string, n: number, sep = " • ") =>
  Array.from({ length: n }, () => text).join(sep) + sep;

/** Sample a parametric curve into an SVG path string. */
function trace(
  steps: number,
  fn: (u: number) => [number, number],
  close = true,
) {
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const [x, y] = fn(i / steps);
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return `M${pts.join(" L")}${close ? " Z" : ""}`;
}

const TAU = Math.PI * 2;

/**
 * Text flowing along a fixed path, driven by startOffset.
 * `d` is in the given viewBox space; the guide stroke is optional.
 */
function PathType({
  d,
  viewBox,
  text,
  reps,
  speed = 70,
  size = 15,
  className = "fill-white",
  tracking = "0.25em",
  guide = true,
}: {
  d: string;
  viewBox: string;
  text: string;
  reps: number;
  speed?: number;
  size?: number;
  className?: string;
  tracking?: string;
  guide?: boolean;
}) {
  const raw = useId();
  const id = raw.replace(/:/g, "");
  const [o1, setO1] = useState(0);
  useRaf((t) => {
    setO1((-t * speed) % 6000);
  });
  return (
    <svg viewBox={viewBox} className="h-full w-full">
      <defs>
        <path id={`p-${id}`} d={d} fill="none" />
      </defs>
      {guide && (
        <use href={`#p-${id}`} className="stroke-white/[0.08]" strokeWidth={1} />
      )}
      <text
        className={`${className} font-mono`}
        style={{ fontSize: size, letterSpacing: tracking }}
      >
        <textPath href={`#p-${id}`} startOffset={o1}>
          {repeat(text.toUpperCase(), reps)}
        </textPath>
      </text>
    </svg>
  );
}

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
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
      <header className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/40">
          {title}
        </h2>
        <p className="font-mono text-[11px] text-white/25">{hint}</p>
      </header>
      <div className={tall ? "h-[24rem]" : "h-[15rem]"}>{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 01 — rose curve                                                     */
/* ------------------------------------------------------------------ */

function Rose({ text }: { text: string }) {
  const d = useMemo(
    () =>
      trace(1400, (u) => {
        const a = u * TAU;
        const r = 150 * Math.cos(5 * a);
        return [200 + Math.cos(a) * r, 200 + Math.sin(a) * r];
      }),
    [],
  );
  return (
    <PathType
      d={d}
      viewBox="0 0 400 400"
      text={text}
      reps={40}
      size={13}
      speed={80}
      className="fill-rose-300"
    />
  );
}

/* ------------------------------------------------------------------ */
/* 02 — lissajous                                                      */
/* ------------------------------------------------------------------ */

function Lissajous({ text }: { text: string }) {
  const d = useMemo(
    () =>
      trace(1200, (u) => {
        const t = u * TAU;
        return [200 + 160 * Math.sin(3 * t + Math.PI / 2), 200 + 160 * Math.sin(2 * t)];
      }),
    [],
  );
  return (
    <PathType
      d={d}
      viewBox="0 0 400 400"
      text={text}
      reps={34}
      size={14}
      speed={95}
      className="fill-cyan-300"
    />
  );
}

/* ------------------------------------------------------------------ */
/* 03 — spirograph                                                     */
/* ------------------------------------------------------------------ */

function Spirograph({ text }: { text: string }) {
  const d = useMemo(() => {
    const R = 120,
      r = 41,
      p = 78;
    return trace(3600, (u) => {
      const t = u * TAU * 41;
      return [
        200 + (R - r) * Math.cos(t) + p * Math.cos(((R - r) / r) * t),
        200 + (R - r) * Math.sin(t) - p * Math.sin(((R - r) / r) * t),
      ];
    }, false);
  }, []);
  return (
    <PathType
      d={d}
      viewBox="0 0 400 400"
      text={text}
      reps={90}
      size={11}
      speed={120}
      tracking="0.15em"
      className="fill-violet-300"
      guide={false}
    />
  );
}

/* ------------------------------------------------------------------ */
/* 04 — cardioid                                                       */
/* ------------------------------------------------------------------ */

function Cardioid({ text }: { text: string }) {
  const d = useMemo(
    () =>
      trace(900, (u) => {
        const a = u * TAU;
        const r = 95 * (1 - Math.cos(a));
        return [230 + Math.cos(a) * r, 200 + Math.sin(a) * r];
      }),
    [],
  );
  return (
    <PathType
      d={d}
      viewBox="0 0 400 400"
      text={text}
      reps={26}
      size={15}
      speed={70}
      className="fill-amber-200"
    />
  );
}

/* ------------------------------------------------------------------ */
/* 05 — trefoil knot                                                   */
/* ------------------------------------------------------------------ */

function Trefoil({ text }: { text: string }) {
  const d = useMemo(
    () =>
      trace(1200, (u) => {
        const t = u * TAU;
        return [
          200 + 48 * (Math.sin(t) + 2 * Math.sin(2 * t)),
          200 + 48 * (Math.cos(t) - 2 * Math.cos(2 * t)),
        ];
      }),
    [],
  );
  return (
    <PathType
      d={d}
      viewBox="0 0 400 400"
      text={text}
      reps={30}
      size={15}
      speed={85}
      className="fill-emerald-300"
    />
  );
}

/* ------------------------------------------------------------------ */
/* 06 — nested polygons                                                */
/* ------------------------------------------------------------------ */

function polygon(n: number, r: number, rot: number) {
  return trace(n, (u) => {
    const a = u * TAU + rot;
    return [200 + Math.cos(a) * r, 200 + Math.sin(a) * r];
  });
}

function Polygons({ text }: { text: string }) {
  const raw = useId();
  const id = raw.replace(/:/g, "");
  const rings = useMemo(
    () => [
      { n: 6, r: 170, size: 16, reps: 10, dur: 30, dir: 1, cls: "fill-white" },
      { n: 5, r: 128, size: 14, reps: 8, dur: 22, dir: -1, cls: "fill-cyan-300" },
      { n: 4, r: 88, size: 12, reps: 6, dur: 15, dir: 1, cls: "fill-rose-300" },
      { n: 3, r: 50, size: 10, reps: 4, dur: 10, dir: -1, cls: "fill-amber-300" },
    ],
    [],
  );
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full">
      <defs>
        {rings.map((r, i) => (
          <path key={i} id={`pg-${id}-${i}`} d={polygon(r.n, r.r, -Math.PI / 2)} fill="none" />
        ))}
      </defs>
      {rings.map((r, i) => (
        <g
          key={i}
          style={{
            transformOrigin: "200px 200px",
            animation: `spin-${r.dir > 0 ? "cw" : "ccw"} ${r.dur}s linear infinite`,
          }}
        >
          <use href={`#pg-${id}-${i}`} className="stroke-white/[0.08]" strokeWidth={1} />
          <text
            className={`${r.cls} font-mono`}
            style={{ fontSize: r.size, letterSpacing: "0.28em" }}
          >
            <textPath href={`#pg-${id}-${i}`}>{repeat(text.toUpperCase(), r.reps)}</textPath>
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* 07 — superellipse morph                                             */
/* ------------------------------------------------------------------ */

function superellipse(n: number, r: number) {
  return trace(600, (u) => {
    const a = u * TAU;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const k = 2 / n;
    return [
      200 + Math.sign(c) * Math.abs(c) ** k * r,
      200 + Math.sign(s) * Math.abs(s) ** k * r,
    ];
  });
}

function Morph({ text }: { text: string }) {
  const raw = useId();
  const id = raw.replace(/:/g, "");
  const path = useRef<SVGPathElement>(null);
  const [offset, setOffset] = useState(0);
  useRaf((t) => {
    const n = 2 + (Math.sin(t * 0.6) + 1) * 4;
    path.current?.setAttribute("d", superellipse(n, 150));
    setOffset((-t * 80) % 6000);
  });
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full">
      <defs>
        <path ref={path} id={`se-${id}`} d={superellipse(2, 150)} fill="none" />
      </defs>
      <use href={`#se-${id}`} className="stroke-white/[0.08]" strokeWidth={1} />
      <text className="fill-lime-300 font-mono" style={{ fontSize: 15, letterSpacing: "0.25em" }}>
        <textPath href={`#se-${id}`} startOffset={offset}>
          {repeat(text.toUpperCase(), 22)}
        </textPath>
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* 08 — breathing blob                                                 */
/* ------------------------------------------------------------------ */

function Blob({ text }: { text: string }) {
  const raw = useId();
  const id = raw.replace(/:/g, "");
  const path = useRef<SVGPathElement>(null);
  const [offset, setOffset] = useState(0);

  const shape = useCallback(
    (t: number) =>
      trace(720, (u) => {
        const a = u * TAU;
        const r =
          132 +
          16 * Math.sin(3 * a + t * 1.1) +
          10 * Math.sin(5 * a - t * 0.7) +
          8 * Math.sin(t * 0.9);
        return [200 + Math.cos(a) * r, 200 + Math.sin(a) * r];
      }),
    [],
  );

  useRaf((t) => {
    path.current?.setAttribute("d", shape(t));
    setOffset((-t * 60) % 6000);
  });

  return (
    <svg viewBox="0 0 400 400" className="h-full w-full">
      <defs>
        <path ref={path} id={`bl-${id}`} d={shape(0)} fill="none" />
      </defs>
      <use href={`#bl-${id}`} className="stroke-white/[0.08]" strokeWidth={1} />
      <text className="fill-fuchsia-300 font-mono" style={{ fontSize: 15, letterSpacing: "0.28em" }}>
        <textPath href={`#bl-${id}`} startOffset={offset}>
          {repeat(text.toUpperCase(), 22)}
        </textPath>
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* 09 — wave field                                                     */
/* ------------------------------------------------------------------ */

function WaveField({ text }: { text: string }) {
  const raw = useId();
  const id = raw.replace(/:/g, "");
  const rows = 6;
  const paths = useMemo(
    () =>
      Array.from({ length: rows }, (_, i) =>
        trace(
          200,
          (u) => {
            const x = u * 900;
            return [x, 40 + i * 44 + Math.sin(x / 90 + i * 0.9) * 18];
          },
          false,
        ),
      ),
    [],
  );
  const [offsets, setOffsets] = useState<number[]>(() => Array(rows).fill(0));
  useRaf((t) => {
    setOffsets(
      Array.from({ length: rows }, (_, i) => {
        const dir = i % 2 ? 1 : -1;
        return ((dir * t * (55 + i * 14)) % 4000) - (dir > 0 ? 2000 : 0);
      }),
    );
  });
  return (
    <svg viewBox="0 0 900 300" className="h-full w-full">
      <defs>
        {paths.map((d, i) => (
          <path key={i} id={`wf-${id}-${i}`} d={d} fill="none" />
        ))}
      </defs>
      {paths.map((_, i) => (
        <text
          key={i}
          className="font-mono font-black uppercase"
          style={{
            fontSize: 26,
            letterSpacing: "0.1em",
            fill: `hsl(${190 + i * 26} 85% ${72 - i * 4}%)`,
            opacity: 1 - i * 0.09,
          }}
        >
          <textPath href={`#wf-${id}-${i}`} startOffset={offsets[i]}>
            {repeat(text.toUpperCase(), 20)}
          </textPath>
        </text>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* 10 — looping cycloid coil                                           */
/* ------------------------------------------------------------------ */

function Coil({ text }: { text: string }) {
  const d = useMemo(
    () =>
      trace(
        1600,
        (u) => {
          const t = u * TAU * 8;
          return [30 + t * 16 - 46 * Math.sin(t), 150 - 46 * Math.cos(t)];
        },
        false,
      ),
    [],
  );
  return (
    <PathType
      d={d}
      viewBox="0 0 900 300"
      text={text}
      reps={60}
      size={17}
      speed={110}
      tracking="0.12em"
      className="fill-orange-300"
    />
  );
}

/* ------------------------------------------------------------------ */
/* page                                                                */
/* ------------------------------------------------------------------ */

export default function PathsPage() {
  const [text, setText] = useState("CURVE");
  const value = useMemo(() => text.trim() || "PATH", [text]);
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value.slice(0, 16)),
    [],
  );

  return (
    <main className="min-h-screen bg-[#08080b] px-4 py-12 text-white sm:px-8">
      <style>{`
        @keyframes spin-cw  { to { transform: rotate(360deg); } }
        @keyframes spin-ccw { to { transform: rotate(-360deg); } }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: .001ms !important; }
        }
      `}</style>

      <div className="mx-auto max-w-4xl">
        <header className="mb-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/35">
            sandbox / typography III
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
            Ten curves to hang a word on
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/45">
            All parametric — the maths generates the path, the type just rides
            it.{" "}
            <a href="/type" className="underline decoration-white/30 underline-offset-4">
              Set I
            </a>
            ,{" "}
            <a href="/marquee" className="underline decoration-white/30 underline-offset-4">
              set II
            </a>
            .
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
          <Card title="01 — rose curve" hint="r = cos 5θ" tall>
            <Rose text={value} />
          </Card>
          <Card title="02 — lissajous" hint="3:2 ratio" tall>
            <Lissajous text={value} />
          </Card>
          <Card title="03 — spirograph" hint="hypotrochoid, 41 laps" tall>
            <Spirograph text={value} />
          </Card>
          <Card title="04 — cardioid" hint="r = 1 − cos θ" tall>
            <Cardioid text={value} />
          </Card>
          <Card title="05 — trefoil knot" hint="crossing loops" tall>
            <Trefoil text={value} />
          </Card>
          <Card title="06 — nested polygons" hint="6/5/4/3, alternating spin" tall>
            <Polygons text={value} />
          </Card>
          <Card title="07 — superellipse morph" hint="circle ⇄ square, live d" tall>
            <Morph text={value} />
          </Card>
          <Card title="08 — breathing blob" hint="summed harmonics" tall>
            <Blob text={value} />
          </Card>
          <Card title="09 — wave field" hint="six phase-shifted rows">
            <WaveField text={value} />
          </Card>
          <Card title="10 — cycloid coil" hint="looping spring">
            <Coil text={value} />
          </Card>
        </div>

        <footer className="py-12 text-center font-mono text-[11px] text-white/25">
          built in the sandbox
        </footer>
      </div>
    </main>
  );
}
