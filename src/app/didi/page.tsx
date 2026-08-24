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

/**
 * Lip outline. In the show the mouth stays nearly shut — a narrow slit, not a
 * cavity — so `open` only ever nudges the halves a few units apart.
 */
function lipPath(open: number) {
  const gap = open * 7; // how far each lip pulls back from the seam
  return [
    // upper lip: left corner -> cupid's bow -> right corner
    `M -100 0`,
    `C -92 -44 -50 -66 -16 -34`,
    `C -6 -25 6 -25 16 -34`,
    `C 50 -66 92 -44 100 0`,
    // lower lip back to the left corner
    `C 94 ${52 + gap} 48 ${76 + gap} 0 ${78 + gap}`,
    `C -48 ${76 + gap} -94 ${52 + gap} -100 0`,
    `Z`,
  ].join(" ");
}

/** The slit between the lips, where the waveform "teeth" show through. */
function slitPath(open: number) {
  const h = 7 + open * 11;
  return [
    `M -78 0`,
    `C -50 -${h} 50 -${h} 78 0`,
    `C 50 ${h * 1.6} -50 ${h * 1.6} -78 0`,
    `Z`,
  ].join(" ");
}

export default function DiDiPage() {
  const lipsRef = useRef<SVGPathElement>(null);
  const slitRef = useRef<SVGPathElement>(null);
  const waveRef = useRef<SVGPolylineElement>(null);
  const bodyRef = useRef<SVGGElement>(null);
  const glowRef = useRef<SVGEllipseElement>(null);
  const sparkRef = useRef<SVGGElement>(null);
  const clipRef = useRef<SVGPathElement>(null);
  const tipRef = useRef<SVGCircleElement>(null);

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
      slitRef.current?.setAttribute("d", slitPath(env));
      glowRef.current?.setAttribute("opacity", String(0.1 + env * 0.35));

      // antenna tip: dark bead at rest, bursting into a starburst as she speaks
      sparkRef.current?.setAttribute("opacity", talkingRef.current ? env.toFixed(2) : "0");
      sparkRef.current?.setAttribute("transform", `rotate(${(t * 90) % 360} 0 0) scale(${0.7 + env * 0.6})`);
      tipRef.current?.setAttribute("opacity", String(1 - env * 0.8));

      // waveform "teeth" — a sharp zigzag along the slit, like a cel-drawn scanline
      const pts: string[] = [];
      const steps = 4;
      for (let i = 0; i <= steps; i++) {
        const x = -58 + (i / steps) * 116;
        const taper = Math.cos((x / 70) * (Math.PI / 2)); // fade to nothing at the corners
        const zig = i % 2 === 0 ? 1 : -1;
        const y = taper * zig * (3 + env * 8) * (0.65 + 0.35 * Math.sin(i * 1.7 - t * 9));
        pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      }
      waveRef.current?.setAttribute("points", pts.join(" "));

      // keep the clip in lockstep with the slit so the zigzag stays inside the mouth
      clipRef.current?.setAttribute("d", slitPath(env));

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
            <stop offset="0%" stopColor="#c8113a" />
            <stop offset="55%" stopColor="#b00d31" />
            <stop offset="100%" stopColor="#8e0724" />
          </linearGradient>
          <filter id="soft" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <clipPath id="mouthClip">
            <path ref={clipRef} d={slitPath(0.2)} />
          </clipPath>
        </defs>

        {/* hover shadow on the "floor" */}
        <ellipse cx="250" cy="378" rx="96" ry="12" fill="#000" opacity="0.45" filter="url(#soft)" />

        <g ref={bodyRef} transform="translate(250 210)">
          <ellipse ref={glowRef} cx="0" cy="0" rx="130" ry="72" fill="#ff2d5e" opacity="0.3" filter="url(#soft)" />

          {/* antenna off the right corner, tip flaring when she speaks */}
          <path d="M 92 -14 L 150 -86" stroke="#140208" strokeWidth="3" fill="none" strokeLinecap="round" />
          <g transform="translate(150 -86)">
            <circle ref={tipRef} cx="0" cy="0" r="5" fill="#140208" />
            <g ref={sparkRef} opacity="0">
              {Array.from({ length: 8 }, (_, i) => (
                <line
                  key={i}
                  x1="0"
                  y1="0"
                  x2={(Math.cos((i * Math.PI) / 4) * 18).toFixed(1)}
                  y2={(Math.sin((i * Math.PI) / 4) * 18).toFixed(1)}
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              ))}
              <circle cx="0" cy="0" r="4" fill="none" stroke="#fff" strokeWidth="2" />
            </g>
          </g>

          <path ref={lipsRef} d={lipPath(0.2)} fill="url(#lipGrad)" stroke="#140208" strokeWidth="4" strokeLinejoin="round" />
          <path ref={slitRef} d={slitPath(0.2)} fill="#fdf6ee" stroke="#140208" strokeWidth="2" />
          <g clipPath="url(#mouthClip)">
            <polyline
              ref={waveRef}
              points=""
              fill="none"
              stroke="#140208"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          {/* cel highlight on the lower lip */}
          <ellipse cx="26" cy="52" rx="28" ry="7" fill="#fff" opacity="0.16" />
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
