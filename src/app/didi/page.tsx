"use client";

import { useEffect, useRef, useState } from "react";

const LINES = [
  "Dear Diary...",
  "Judy, you simply must tell me everything.",
  "He looked at you? At the space mall?",
  "Oh, that is positively electric.",
  "I shall keep this in strictest confidence.",
  "Mmm-hmm. Go on, go on.",
  "Your father will never know. Not from me.",
  "I have 40 gigabytes of secrets, dear.",
];

/** Lip outline as a function of how open the mouth is (0 = closed, 1 = wide). */
function lipPath(open: number) {
  const gap = 6 + open * 30; // half-height of the mouth opening
  const cupid = 10 + open * 3;
  return [
    // upper lip: left corner -> cupid's bow -> right corner
    `M -100 0`,
    `C -78 -${28 + open * 6} -40 -${34 + cupid} -14 -${16 + open * 4}`,
    `C -6 -${10 + open * 2} 6 -${10 + open * 2} 14 -${16 + open * 4}`,
    `C 40 -${34 + cupid} 78 -${28 + open * 6} 100 0`,
    // lower lip back to the left corner
    `C 74 ${34 + open * 18} 40 ${gap + 26} 0 ${gap + 30}`,
    `C -40 ${gap + 26} -74 ${34 + open * 18} -100 0`,
    `Z`,
  ].join(" ");
}

/** Inner mouth cavity, where the waveform "teeth" live. */
function cavityPath(open: number) {
  const h = 2 + open * 26;
  return [
    `M -74 0`,
    `C -46 -${h} 46 -${h} 74 0`,
    `C 46 ${h * 1.15} -46 ${h * 1.15} -74 0`,
    `Z`,
  ].join(" ");
}

export default function DiDiPage() {
  const lipsRef = useRef<SVGPathElement>(null);
  const cavityRef = useRef<SVGPathElement>(null);
  const waveRef = useRef<SVGPolylineElement>(null);
  const bodyRef = useRef<SVGGElement>(null);
  const glowRef = useRef<SVGEllipseElement>(null);

  const [line, setLine] = useState(LINES[0]);
  const [talking, setTalking] = useState(true);
  const talkingRef = useRef(true);
  talkingRef.current = talking;

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    // a few detuned oscillators make the mouth read as speech, not a metronome
    const speech = (t: number) =>
      0.5 +
      0.28 * Math.sin(t * 7.1) +
      0.16 * Math.sin(t * 11.7 + 1.3) +
      0.09 * Math.sin(t * 19.3 + 2.6);

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const env = talkingRef.current
        ? Math.max(0, Math.min(1, speech(t))) * (0.55 + 0.45 * Math.max(0, Math.sin(t * 1.9)))
        : 0.02 + 0.02 * Math.sin(t * 2);

      lipsRef.current?.setAttribute("d", lipPath(env));
      cavityRef.current?.setAttribute("d", cavityPath(env));
      glowRef.current?.setAttribute("opacity", String(0.15 + env * 0.5));

      // waveform "teeth" — a scanline across the cavity, amplitude driven by env
      const pts: string[] = [];
      for (let i = 0; i <= 72; i++) {
        const x = -72 + (i / 72) * 144;
        const taper = Math.cos((x / 82) * (Math.PI / 2)); // fade to nothing at the corners
        const y =
          taper *
          (10 + env * 22) *
          (Math.sin(i * 0.55 - t * 14) * 0.6 +
            Math.sin(i * 1.31 + t * 9) * 0.3 +
            Math.sin(i * 2.7 - t * 21) * 0.18) *
          (talkingRef.current ? 1 : 0.15);
        pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      }
      waveRef.current?.setAttribute("points", pts.join(" "));

      // idle float — bob, drift and a lazy tilt
      const bob = Math.sin(t * 0.9) * 14;
      const drift = Math.sin(t * 0.53 + 1.1) * 22;
      const tilt = Math.sin(t * 0.41) * 5;
      bodyRef.current?.setAttribute(
        "transform",
        `translate(${(250 + drift).toFixed(1)} ${(210 + bob).toFixed(1)}) rotate(${tilt.toFixed(2)})`,
      );

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!talking) return;
    const id = setInterval(() => {
      setLine((prev) => {
        let next = prev;
        while (next === prev) next = LINES[Math.floor(Math.random() * LINES.length)];
        return next;
      });
    }, 3600);
    return () => clearInterval(id);
  }, [talking]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-[radial-gradient(ellipse_at_50%_35%,#2a1b4d_0%,#120a24_55%,#07030f_100%)] p-6 text-white">
      <svg viewBox="0 0 500 420" className="w-full max-w-xl drop-shadow-[0_0_40px_rgba(255,40,90,0.25)]">
        <defs>
          <linearGradient id="lipGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff5b7f" />
            <stop offset="45%" stopColor="#e3123f" />
            <stop offset="100%" stopColor="#8c0322" />
          </linearGradient>
          <radialGradient id="cavityGrad">
            <stop offset="0%" stopColor="#3c0212" />
            <stop offset="100%" stopColor="#12000a" />
          </radialGradient>
          <filter id="soft" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* hover shadow on the "floor" */}
        <ellipse cx="250" cy="378" rx="96" ry="12" fill="#000" opacity="0.45" filter="url(#soft)" />

        <g ref={bodyRef} transform="translate(250 210)">
          <ellipse ref={glowRef} cx="0" cy="0" rx="130" ry="72" fill="#ff2d5e" opacity="0.3" filter="url(#soft)" />
          <path ref={lipsRef} d={lipPath(0.2)} fill="url(#lipGrad)" stroke="#4d0113" strokeWidth="2.5" />
          <path ref={cavityRef} d={cavityPath(0.2)} fill="url(#cavityGrad)" />
          <polyline
            ref={waveRef}
            points=""
            fill="none"
            stroke="#7dffe6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* highlight on the upper lip */}
          <ellipse cx="-42" cy="-22" rx="20" ry="7" fill="#fff" opacity="0.35" transform="rotate(-18 -42 -22)" />
          <ellipse cx="34" cy="30" rx="26" ry="6" fill="#fff" opacity="0.18" />
        </g>
      </svg>

      <p className="min-h-[2.5rem] max-w-md text-center font-mono text-lg text-rose-200">
        {talking ? `"${line}"` : "…listening."}
      </p>

      <button
        onClick={() => setTalking((v) => !v)}
        className="rounded-full border border-rose-400/40 bg-rose-500/10 px-5 py-2 text-sm text-rose-200 transition hover:bg-rose-500/20"
      >
        {talking ? "Hush, Di-Di" : "Say something"}
      </button>

      <p className="text-xs text-white/35">Di-Di — Judy Jetson&rsquo;s interactive diary</p>
    </main>
  );
}
