"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* ------------------------------------------------------------------ */
/* shared bits                                                         */
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

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@$*<>/\\|{}[]";
const rand = (n: number) => Math.floor(Math.random() * n);

function chars(text: string) {
  return Array.from(text);
}

function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
      <header className="mb-6 flex items-baseline justify-between gap-4">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/40">
          {title}
        </h2>
        <p className="font-mono text-[11px] text-white/25">{hint}</p>
      </header>
      <div className="flex min-h-[9rem] items-center justify-center">
        {children}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 01 — weight wave                                                    */
/* ------------------------------------------------------------------ */

function WeightWave({ text }: { text: string }) {
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  useRaf((t) => {
    refs.current.forEach((el, i) => {
      if (!el) return;
      const p = Math.sin(t * 2.2 - i * 0.42);
      el.style.fontVariationSettings = `"wght" ${Math.round(200 + (p + 1) * 350)}`;
      el.style.transform = `translateY(${(-p * 6).toFixed(2)}px)`;
      el.style.opacity = `${0.55 + (p + 1) * 0.22}`;
    });
  });
  return (
    <p className="flex flex-wrap justify-center text-5xl sm:text-7xl">
      {chars(text).map((c, i) => (
        <span
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="inline-block will-change-transform"
        >
          {c === " " ? " " : c}
        </span>
      ))}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* 02 — scramble decode                                                */
/* ------------------------------------------------------------------ */

function Scramble({ text }: { text: string }) {
  const [out, setOut] = useState(text);
  const [run, setRun] = useState(0);

  useEffect(() => {
    const target = chars(text);
    let frame = 0;
    const id = setInterval(() => {
      frame += 1;
      setOut(
        target
          .map((c, i) => {
            if (c === " ") return " ";
            const settle = i * 2.6 + 6;
            if (frame > settle) return c;
            return GLYPHS[rand(GLYPHS.length)];
          })
          .join(""),
      );
      if (frame > target.length * 2.6 + 8) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, [text, run]);

  return (
    <button
      onClick={() => setRun((n) => n + 1)}
      className="cursor-pointer break-all text-center font-mono text-3xl uppercase text-emerald-300 sm:text-5xl"
    >
      {out}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* 03 — pointer repel                                                  */
/* ------------------------------------------------------------------ */

function Repel({ text }: { text: string }) {
  const box = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const pointer = useRef({ x: -9999, y: -9999 });
  const state = useRef<{ x: number; y: number; w: number }[]>([]);

  useRaf(() => {
    const rect = box.current?.getBoundingClientRect();
    if (!rect) return;
    refs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = cx - pointer.current.x;
      const dy = cy - pointer.current.y;
      const dist = Math.hypot(dx, dy);
      const force = Math.max(0, 1 - dist / 190);
      const push = force * force * 70;
      const s = (state.current[i] ??= { x: 0, y: 0, w: 0 });
      const tx = dist ? (dx / dist) * push : 0;
      const ty = dist ? (dy / dist) * push : 0;
      s.x += (tx - s.x) * 0.16;
      s.y += (ty - s.y) * 0.16;
      s.w += (force - s.w) * 0.16;
      el.style.transform = `translate(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px) scale(${(1 + s.w * 0.35).toFixed(3)})`;
      el.style.fontVariationSettings = `"wght" ${Math.round(300 + s.w * 600)}`;
      el.style.color = `hsl(${(20 + s.w * 260).toFixed(0)} 90% ${(65 + s.w * 20).toFixed(0)}%)`;
    });
  });

  return (
    <div
      ref={box}
      onPointerMove={(e) => (pointer.current = { x: e.clientX, y: e.clientY })}
      onPointerLeave={() => (pointer.current = { x: -9999, y: -9999 })}
      className="flex w-full flex-wrap justify-center py-6 text-5xl sm:text-7xl"
    >
      {chars(text).map((c, i) => (
        <span
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="inline-block will-change-transform"
        >
          {c === " " ? " " : c}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 04 — split flap                                                     */
/* ------------------------------------------------------------------ */

function Flap({ target, delay }: { target: string; delay: number }) {
  const [face, setFace] = useState(target);
  const [spin, setSpin] = useState(false);

  useEffect(() => {
    if (target === " ") {
      setFace(" ");
      return;
    }
    let ticks = 0;
    const total = 8 + delay * 3;
    setSpin(true);
    const id = setInterval(() => {
      ticks += 1;
      if (ticks >= total) {
        setFace(target);
        setSpin(false);
        clearInterval(id);
      } else {
        setFace(GLYPHS[rand(GLYPHS.length)]);
      }
    }, 55);
    return () => clearInterval(id);
  }, [target, delay]);

  return (
    <span
      className="inline-flex h-[1.35em] w-[0.78em] items-center justify-center rounded-[3px] bg-neutral-900 font-mono text-amber-200 shadow-[inset_0_-1px_0_rgba(255,255,255,0.12)] ring-1 ring-white/10"
      style={{
        transform: spin ? "rotateX(38deg)" : "rotateX(0deg)",
        transition: "transform 55ms linear",
      }}
    >
      {face === " " ? " " : face}
    </span>
  );
}

function SplitFlap({ text }: { text: string }) {
  return (
    <p
      className="flex flex-wrap justify-center gap-[3px] text-4xl uppercase sm:text-6xl"
      style={{ perspective: "600px" }}
    >
      {chars(text).map((c, i) => (
        <Flap key={`${text}-${i}`} target={c.toUpperCase()} delay={i} />
      ))}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* 05 — liquid stretch                                                 */
/* ------------------------------------------------------------------ */

function Liquid({ text }: { text: string }) {
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  useRaf((t) => {
    refs.current.forEach((el, i) => {
      if (!el) return;
      const p = Math.sin(t * 1.8 - i * 0.55);
      const q = Math.cos(t * 1.1 - i * 0.3);
      el.style.transform = `scale(${(1 + p * 0.35).toFixed(3)}, ${(1 - p * 0.28).toFixed(3)}) skewY(${(q * 7).toFixed(2)}deg)`;
    });
  });
  return (
    <p className="flex flex-wrap justify-center text-5xl font-black sm:text-7xl">
      {chars(text).map((c, i) => (
        <span
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="inline-block origin-bottom bg-gradient-to-b from-white to-white/30 bg-clip-text text-transparent will-change-transform"
        >
          {c === " " ? " " : c}
        </span>
      ))}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* 06 — extruded 3d                                                    */
/* ------------------------------------------------------------------ */

function Extrude({ text }: { text: string }) {
  const el = useRef<HTMLParagraphElement>(null);
  useRaf((t) => {
    const node = el.current;
    if (!node) return;
    const a = Math.sin(t * 0.9);
    const b = Math.cos(t * 0.7);
    const layers: string[] = [];
    for (let i = 1; i <= 18; i++) {
      const hue = 260 + i * 4;
      layers.push(
        `${(a * i * 0.9).toFixed(2)}px ${(b * i * 0.9).toFixed(2)}px 0 hsl(${hue} 70% ${Math.max(12, 46 - i * 2)}%)`,
      );
    }
    node.style.textShadow = layers.join(", ");
    node.style.transform = `rotate(${(a * 3).toFixed(2)}deg)`;
  });
  return (
    <p
      ref={el}
      className="text-center text-5xl font-black uppercase tracking-tight text-white sm:text-7xl"
    >
      {text}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* 07 — glitch channels                                                */
/* ------------------------------------------------------------------ */

function Glitch({ text }: { text: string }) {
  const [slices, setSlices] = useState<
    { top: number; height: number; shift: number }[]
  >([]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const burst = Math.random() < 0.45;
      setSlices(
        burst
          ? Array.from({ length: 3 + rand(4) }, () => ({
              top: rand(100),
              height: 4 + rand(16),
              shift: rand(40) - 20,
            }))
          : [],
      );
      timer = setTimeout(tick, burst ? 60 + rand(90) : 200 + rand(700));
    };
    tick();
    return () => clearTimeout(timer);
  }, []);

  const base =
    "absolute inset-0 flex items-center justify-center text-5xl font-black uppercase sm:text-7xl";

  return (
    <div className="relative h-32 w-full select-none">
      <div className={`${base} text-cyan-400 mix-blend-screen`} style={{ transform: "translateX(-3px)" }}>
        {text}
      </div>
      <div className={`${base} text-rose-500 mix-blend-screen`} style={{ transform: "translateX(3px)" }}>
        {text}
      </div>
      <div className={`${base} text-white`}>{text}</div>
      {slices.map((s, i) => (
        <div
          key={i}
          className={`${base} text-white`}
          style={{
            clipPath: `inset(${s.top}% 0 ${Math.max(0, 100 - s.top - s.height)}% 0)`,
            transform: `translateX(${s.shift}px)`,
          }}
        >
          {text}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 08 — outline marquee                                                */
/* ------------------------------------------------------------------ */

function Marquee({ text }: { text: string }) {
  const row = (dir: "left" | "right", filled: boolean) => (
    <div className="flex w-full overflow-hidden">
      <div
        className="flex shrink-0 gap-8 whitespace-nowrap py-1 text-4xl font-black uppercase sm:text-6xl"
        style={{
          animation: `marquee-${dir} 14s linear infinite`,
        }}
      >
        {Array.from({ length: 8 }, (_, i) => (
          <span
            key={i}
            className={filled ? "text-white" : "text-transparent"}
            style={
              filled
                ? undefined
                : { WebkitTextStroke: "1px rgba(255,255,255,0.5)" }
            }
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full -space-y-2" style={{ transform: "skewY(-4deg)" }}>
      {row("left", false)}
      {row("right", true)}
      {row("left", false)}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 09 — kinetic reveal                                                 */
/* ------------------------------------------------------------------ */

function Reveal({ text }: { text: string }) {
  const [run, setRun] = useState(0);
  const [on, setOn] = useState(false);

  useLayoutEffect(() => {
    setOn(false);
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, [text, run]);

  return (
    <button
      onClick={() => setRun((n) => n + 1)}
      className="flex cursor-pointer flex-wrap justify-center text-5xl font-semibold sm:text-7xl"
      style={{ perspective: "800px" }}
    >
      {chars(text).map((c, i) => (
        <span
          key={i}
          className="inline-block"
          style={{
            opacity: on ? 1 : 0,
            filter: on ? "blur(0px)" : "blur(12px)",
            transform: on
              ? "translateY(0) rotateX(0deg) scale(1)"
              : "translateY(60px) rotateX(-80deg) scale(1.4)",
            transition: `all 700ms cubic-bezier(.16,1,.3,1) ${i * 45}ms`,
          }}
        >
          {c === " " ? " " : c}
        </span>
      ))}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* page                                                                */
/* ------------------------------------------------------------------ */

export default function TypePage() {
  const [text, setText] = useState("KINETIC");
  const value = useMemo(() => text.trim() || "TYPE", [text]);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value.slice(0, 18)),
    [],
  );

  return (
    <main className="min-h-screen bg-[#08080b] px-4 py-12 text-white sm:px-8">
      <style>{`
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: .001ms !important; transition-duration: .001ms !important; }
        }
      `}</style>

      <div className="mx-auto max-w-4xl">
        <header className="mb-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/35">
            sandbox / typography
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
            Nine ways to move a word
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/45">
            Type below — every experiment retargets live. Click the ones marked
            replay.
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
          <Card title="01 — weight wave" hint="variable axis">
            <WeightWave text={value} />
          </Card>
          <Card title="02 — decode" hint="click to replay">
            <Scramble text={value} />
          </Card>
          <Card title="03 — repel field" hint="move the pointer">
            <Repel text={value} />
          </Card>
          <Card title="04 — split flap" hint="retargets on edit">
            <SplitFlap text={value} />
          </Card>
          <Card title="05 — liquid stretch" hint="non-uniform scale">
            <Liquid text={value} />
          </Card>
          <Card title="06 — extrusion" hint="18 shadow layers">
            <Extrude text={value} />
          </Card>
          <Card title="07 — channel glitch" hint="random slices">
            <Glitch text={value} />
          </Card>
          <Card title="08 — outline marquee" hint="skewed loop">
            <Marquee text={value} />
          </Card>
          <Card title="09 — kinetic reveal" hint="click to replay">
            <Reveal text={value} />
          </Card>
        </div>

        <footer className="py-12 text-center font-mono text-[11px] text-white/25">
          built in the sandbox
        </footer>
      </div>
    </main>
  );
}
