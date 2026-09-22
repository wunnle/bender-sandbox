import { memo } from "react";
import { Aerial } from "./Aerial";
import type { Art } from "./scenes";

function rng(seed: number) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function dots(seed: number, n: number, minR: number, maxR: number) {
  const r = rng(seed);
  return Array.from({ length: n }, (_, i) => ({
    key: i,
    x: r() * 100,
    y: r() * 100,
    r: minR + r() * (maxR - minR),
    o: 0.25 + r() * 0.75,
  }));
}

/** Semi-major axes in metres, with a fixed position on the dial so the frames agree. */
const PLANETS = [
  { name: "Mercury", a: 5.79e10, color: "#b9b2ab", t: 2.1 },
  { name: "Venus", a: 1.082e11, color: "#e6cb95", t: 0.6 },
  { name: "Earth", a: 1.496e11, color: "#7cc0ea", t: 3.5 },
  { name: "Mars", a: 2.279e11, color: "#d5875b", t: 4.9 },
  { name: "Jupiter", a: 7.785e11, color: "#dcb68d", t: 1.2 },
  { name: "Saturn", a: 1.434e12, color: "#ead7a8", t: 5.6 },
  { name: "Uranus", a: 2.871e12, color: "#a6dde2", t: 2.75 },
  { name: "Neptune", a: 4.495e12, color: "#7d93e0", t: 0.25 },
];

/** Which orbit each frame is named for, and so which one gets the bright line. */
const LEAD: Record<number, string> = {
  11: "Mercury",
  12: "Earth",
  13: "Neptune",
  14: "Kuiper",
};

/** Everything draws inside a 100x100 box; the parent scales it. */
function ArtImpl({ art, hue, seed, e }: { art: Art; hue: number; seed: number; e: number }) {
  const c = (l: number, s = 70) => `hsl(${hue} ${s}% ${l}%)`;
  const common = { viewBox: "0 0 100 100", width: "100%", height: "100%", preserveAspectRatio: "none" as const };

  switch (art) {
    case "aerial":
      return <Aerial level={e} />;
    case "web": {
      const nodes = dots(seed, 70, 0.3, 1.4);
      const r = rng(seed + 5);
      return (
        <svg {...common}>
          {nodes.map((n) => {
            const m = nodes[Math.floor(r() * nodes.length)];
            return <line key={`l${n.key}`} x1={n.x} y1={n.y} x2={m.x} y2={m.y} stroke={c(60)} strokeWidth={0.12} opacity={0.35} />;
          })}
          {nodes.map((n) => (
            <circle key={n.key} cx={n.x} cy={n.y} r={n.r} fill={c(80)} opacity={n.o} />
          ))}
        </svg>
      );
    }
    case "field":
      return (
        <svg {...common}>
          {dots(seed, 90, 0.4, 1.8).map((n) => (
            <ellipse key={n.key} cx={n.x} cy={n.y} rx={n.r} ry={n.r * 0.55} fill={c(78)} opacity={n.o} transform={`rotate(${n.x * 3.6} ${n.x} ${n.y})`} />
          ))}
        </svg>
      );
    case "galaxy": {
      const r = rng(seed);
      const arms = Array.from({ length: 900 }, () => {
        const t = r() * 3.2;
        const arm = Math.floor(r() * 2) * Math.PI;
        const a = t * 2.1 + arm + (r() - 0.5) * 0.45;
        const rad = 4 + t * 15;
        return { x: 50 + Math.cos(a) * rad, y: 50 + Math.sin(a) * rad * 0.42, r: 0.25 + r() * 0.5, o: 0.2 + r() * 0.7 };
      });
      return (
        <svg {...common}>
          <ellipse cx={50} cy={50} rx={22} ry={10} fill={c(60)} opacity={0.12} />
          <ellipse cx={50} cy={50} rx={7} ry={4.5} fill={c(88, 60)} opacity={0.5} />
          {arms.map((n, i) => (
            <circle key={i} cx={n.x} cy={n.y} r={n.r} fill={c(85)} opacity={n.o} />
          ))}
        </svg>
      );
    }
    case "cloud":
      return (
        <svg {...common}>
          {dots(seed, 40, 6, 20).map((n) => (
            <circle key={n.key} cx={n.x} cy={n.y} r={n.r} fill={c(55)} opacity={0.07} />
          ))}
          {dots(seed + 3, 60, 0.3, 1.1).map((n) => (
            <circle key={`s${n.key}`} cx={n.x} cy={n.y} r={n.r} fill={c(90)} opacity={n.o} />
          ))}
        </svg>
      );
    case "orbit": {
      // Every planet whose orbit lands inside this frame, at its real distance:
      // radius in frame units = a / 10^e * 100. Whichever orbit the frame is named
      // for gets the bright line; the rest are drawn faintly behind it.
      const u = (a: number) => a * Math.pow(10, 2 - e);
      const visible = PLANETS.map((p) => ({ ...p, r: u(p.a) })).filter((p) => p.r > 1.4 && p.r < 71);
      const lead = visible.find((p) => p.name === LEAD[e]);
      const kuiper = { inner: u(4.5e12), outer: u(7.5e12) };
      const heliopause = u(1.8e13);
      const r = rng(seed);
      return (
        <svg {...common} preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id={`og${seed}`}>
              <stop offset="0%" stopColor={lead?.color ?? "#fff"} stopOpacity={0.85} />
              <stop offset="100%" stopColor={lead?.color ?? "#fff"} stopOpacity={0} />
            </radialGradient>
            <linearGradient id={`ot${seed}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={lead?.color ?? "#fff"} stopOpacity={0.12} />
              <stop offset="60%" stopColor={lead?.color ?? "#fff"} stopOpacity={0.5} />
              <stop offset="100%" stopColor="#ffffff" stopOpacity={1} />
            </linearGradient>
          </defs>

          {/* the heliopause, where the solar wind finally stops */}
          {heliopause > 2 && heliopause < 90 && (
            <circle cx={50} cy={50} r={heliopause} fill="none" stroke="#8fb4d8" strokeWidth={1.6} opacity={0.12} />
          )}
          {/* the Kuiper belt as a band of ice rather than a line */}
          {kuiper.outer > 3 && kuiper.inner < 71 &&
            Array.from({ length: 150 }, (_, i) => {
              const ang = r() * Math.PI * 2;
              const rad = kuiper.inner + r() * (kuiper.outer - kuiper.inner);
              return (
                <circle
                  key={`k${i}`}
                  cx={50 + Math.cos(ang) * rad}
                  cy={50 + Math.sin(ang) * rad * 0.99}
                  r={0.3 + r() * 0.35}
                  fill="#bcd6e6"
                  opacity={LEAD[e] === "Kuiper" ? 0.75 : 0.3}
                />
              );
            })}

          {/* the other planets' orbits */}
          {visible.map((p) => (
            <circle
              key={p.name}
              cx={50}
              cy={50}
              r={p.r}
              fill="none"
              stroke={p.color}
              strokeWidth={p === lead ? 2.2 : 0.22}
              opacity={p === lead ? 0.13 : 0.4}
            />
          ))}
          {/* the named orbit, brightening around toward its planet */}
          {lead && (
            <circle
              cx={50}
              cy={50}
              r={lead.r}
              fill="none"
              stroke={`url(#ot${seed})`}
              strokeWidth={0.6}
              transform={`rotate(${(lead.t * 180) / Math.PI - 45} 50 50)`}
            />
          )}

          <circle cx={50} cy={50} r={2.6} fill="#fff3cf" opacity={0.25} />
          <circle cx={50} cy={50} r={1} fill="#fff8e2" />

          {visible.map((p) => {
            const x = 50 + Math.cos(p.t) * p.r;
            const y = 50 + Math.sin(p.t) * p.r;
            return (
              <g key={`b${p.name}`}>
                {p === lead && <circle cx={x} cy={y} r={5} fill={`url(#og${seed})`} />}
                <circle cx={x} cy={y} r={p === lead ? 1.5 : 0.9} fill={p.color} />
              </g>
            );
          })}
        </svg>
      );
    }
    case "star":
      return (
        <svg {...common}>
          <defs>
            <radialGradient id={`g${seed}`}>
              <stop offset="0%" stopColor={c(95, 100)} />
              <stop offset="55%" stopColor={c(62, 100)} />
              <stop offset="78%" stopColor={c(45, 95)} />
              <stop offset="100%" stopColor={c(45, 95)} stopOpacity={0} />
            </radialGradient>
          </defs>
          <circle cx={50} cy={50} r={48} fill={`url(#g${seed})`} />
          {dots(seed + 1, 30, 1.5, 5).map((n) => (
            <circle key={n.key} cx={25 + n.x * 0.5} cy={25 + n.y * 0.5} r={n.r} fill={c(88, 100)} opacity={0.25} />
          ))}
        </svg>
      );
    case "planet": {
      const r = rng(seed);
      return (
        <svg {...common} preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id={`p${seed}`} cx="36%" cy="32%">
              <stop offset="0%" stopColor="hsl(200 75% 48%)" />
              <stop offset="68%" stopColor="hsl(212 78% 32%)" />
              <stop offset="100%" stopColor="hsl(222 70% 14%)" />
            </radialGradient>
            <clipPath id={`pc${seed}`}>
              <circle cx={50} cy={50} r={38} />
            </clipPath>
          </defs>
          <circle cx={50} cy={50} r={41} fill="hsl(200 90% 60%)" opacity={0.18} />
          <circle cx={50} cy={50} r={38} fill={`url(#p${seed})`} />
          <g clipPath={`url(#pc${seed})`} fill="hsl(105 38% 40%)" opacity={0.92}>
            {/* Africa + Europe, facing us */}
            <path d="M52 30 L61 31 L64 38 L60 45 L59 56 L53 66 L48 60 L46 48 L48 38 Z" />
            <path d="M50 24 L62 25 L60 29 L51 28 Z" />
            {/* Asia, curving off the limb */}
            <path d="M64 28 L80 30 L86 38 L76 42 L66 39 L63 33 Z" />
            {/* the Americas, just turning away */}
            <path d="M28 30 L36 33 L34 41 L38 47 L35 62 L30 55 L31 43 L26 37 Z" />
            {/* Australia */}
            <path d="M76 56 L84 57 L83 63 L76 62 Z" />
          </g>
          <g clipPath={`url(#pc${seed})`}>
            {Array.from({ length: 11 }, (_, i) => {
              const y = 14 + r() * 72;
              const x = 14 + r() * 72;
              const w = 6 + r() * 16;
              return <ellipse key={i} cx={x} cy={y} rx={w} ry={2 + r() * 2.5} fill="white" opacity={0.16 + r() * 0.16} />;
            })}
            {/* night side */}
            <circle cx={70} cy={62} r={44} fill="hsl(230 60% 6%)" opacity={0.35} />
          </g>
        </svg>
      );
    }
    case "region": {
      // 1,000 km: Great Britain is almost exactly that, end to end, so it fills the
      // frame. It is positioned so the estuary at the centre is where the aerial
      // frames nested inside this one pick up — sea to the lower right, as there.
      const r = rng(seed);
      return (
        <svg {...common}>
          <rect width={100} height={100} fill="#16293a" />
          {/* shallow water over the continental shelf */}
          <rect width={100} height={100} fill="#1c3242" />
          <g transform="translate(-13 -11)">
            {/* mainland Europe, across the narrow sea */}
            <path d="M78 66 L120 60 L124 120 L74 120 C 74 104, 72 86, 78 74 Z" fill="#3a4632" />
            <path d="M78 66 L120 60" fill="none" stroke="#2a4658" strokeWidth={0.9} />
            {/* Ireland */}
            <path d="M8 44 C 16 40, 24 42, 26 48 C 28 56, 22 62, 14 62 C 6 62, 2 54, 8 44 Z" fill="#3f5236" />
            {/* Great Britain */}
            <path
              d="M48 3 L54 6 L50 10 L58 14 L60 19 L56 24 L51 27 L57 29 L59 33 L62 40 L58 44 L64 47
                 L69 52 L74 56 L70 60 L66 62 L70 65 L62 68 L54 70 L46 71 L38 73 L28 79 L20 84
                 L25 80 L33 75 L40 71 L34 68 L26 67 L30 63 L26 60 L32 57 L36 55 L33 52 L38 50
                 L36 46 L33 42 L36 38 L30 36 L33 32 L28 30 L32 27 L26 24 L30 20 L24 17 L30 14
                 L34 10 L40 6 Z"
              fill="#43593a"
            />
            {/* uplands down the spine */}
            {Array.from({ length: 26 }, (_, i) => {
              const t = i / 25;
              const x = 34 + Math.sin(t * 6) * 5 + r() * 6;
              const y = 8 + t * 58;
              return <ellipse key={i} cx={x} cy={y} rx={2 + r() * 3} ry={1.5 + r() * 2} fill="#4e6343" opacity={0.75} />;
            })}
          </g>
          {/* the estuary the city sits on, dead centre */}
          <path d="M50 50 C 56 51, 62 54, 70 58" fill="none" stroke="#24405a" strokeWidth={1.6} />
          <ellipse cx={50} cy={50} rx={4.5} ry={3} fill="#54524a" />
          {/* other towns */}
          {Array.from({ length: 11 }, (_, i) => {
            const x = 14 + r() * 44;
            const y = 4 + r() * 76;
            return <ellipse key={`c${i}`} cx={x} cy={y} rx={0.9 + r() * 1.8} ry={0.7 + r() * 1.3} fill="#54524a" opacity={0.8} />;
          })}
        </svg>
      );
    }
    case "neutrino":
      // no size to draw — only the tracks of things that pass straight through
      return (
        <svg {...common}>
          {Array.from({ length: 7 }, (_, i) => {
            const off = i * 17 - 22;
            return (
              <line
                key={i}
                x1={off - 20}
                y1={-10}
                x2={off + 40}
                y2={110}
                stroke={c(80)}
                strokeWidth={0.35}
                opacity={0.45}
                strokeDasharray="6 5"
              />
            );
          })}
          {/* the matter they ignore */}
          {dots(seed, 10, 0.4, 1).map((n) => (
            <circle key={n.key} cx={n.x} cy={n.y} r={n.r} fill={c(60)} opacity={0.22} />
          ))}
        </svg>
      );
    case "nearearth":
      // Earth arrives from the 10^7 frame nested inside this one; only orbits are drawn here.
      return (
        <svg {...common} preserveAspectRatio="xMidYMid meet">
          {/* geostationary ring, 42,164 km — genuinely to scale in this frame */}
          <circle cx={50} cy={50} r={42} fill="none" stroke={c(80)} strokeWidth={0.3} opacity={0.35} strokeDasharray="2 3" />
          {[0.4, 1.9, 3.5, 4.8].map((a, i) => (
            <circle key={i} cx={50 + Math.cos(a) * 42} cy={50 + Math.sin(a) * 42} r={0.7} fill={c(90)} opacity={0.8} />
          ))}
          <circle cx={50} cy={50} r={7.1} fill="none" stroke={c(70)} strokeWidth={0.2} opacity={0.25} />
        </svg>
      );
    case "none":
      return null;
    case "land": {
      const r = rng(seed);
      const path = Array.from({ length: 5 }, (_, i) => {
        const pts = Array.from({ length: 9 }, (_, j) => `${(j / 8) * 100},${10 + i * 20 + (r() - 0.5) * 26}`);
        return pts.join(" ");
      });
      return (
        <svg {...common}>
          <rect width={100} height={100} fill={c(22, 35)} opacity={0.5} />
          {path.map((p, i) => (
            <polyline key={i} points={p} fill="none" stroke={c(55)} strokeWidth={0.5} opacity={0.5} />
          ))}
          {dots(seed + 4, 25, 0.6, 2.2).map((n) => (
            <circle key={n.key} cx={n.x} cy={n.y} r={n.r} fill={c(75)} opacity={0.4} />
          ))}
        </svg>
      );
    }
    case "grid": {
      const r = rng(seed);
      return (
        <svg {...common}>
          {Array.from({ length: 120 }, (_, i) => {
            const x = (i % 12) * 8.3 + 1;
            const y = Math.floor(i / 12) * 10 + 1;
            if (r() > 0.78) return null;
            return <rect key={i} x={x} y={y} width={5 + r() * 2.5} height={6 + r() * 2.5} fill={c(60)} opacity={0.2 + r() * 0.5} rx={0.4} />;
          })}
          {[25, 50, 75].map((v) => (
            <line key={v} x1={0} y1={v} x2={100} y2={v} stroke={c(85)} strokeWidth={0.4} opacity={0.25} />
          ))}
        </svg>
      );
    }
    case "figure":
      // An adult is 1.7 m, so at 170 units tall they genuinely overflow this
      // one-metre frame — top and bottom are drawn outside the viewBox on purpose.
      return (
        <svg {...common} preserveAspectRatio="xMidYMid meet" style={{ overflow: "visible" }}>
          <g fill={c(78)} opacity={0.92}>
            <circle cx={50} cy={-21} r={13} />
            <rect x={44} y={-9} width={12} height={10} rx={5} />
            <rect x={35} y={-1} width={30} height={62} rx={12} />
            <rect x={23} y={2} width={11} height={56} rx={5.5} />
            <rect x={66} y={2} width={11} height={56} rx={5.5} />
            <rect x={37} y={54} width={12} height={78} rx={6} />
            <rect x={51} y={54} width={12} height={78} rx={6} />
            <rect x={35} y={126} width={16} height={8} rx={3} />
            <rect x={49} y={126} width={16} height={8} rx={3} />
          </g>
        </svg>
      );
    case "skin": {
      const r = rng(seed);
      return (
        <svg {...common}>
          <rect width={100} height={100} fill={c(70, 45)} opacity={0.35} />
          {Array.from({ length: 16 }, (_, i) => {
            const pts = Array.from({ length: 12 }, (_, j) => {
              const t = (j / 11) * Math.PI * 2;
              const rad = 8 + i * 3.4 + Math.sin(t * 3 + i) * 2.5;
              return `${50 + Math.cos(t) * rad},${50 + Math.sin(t) * rad * 0.8}`;
            });
            return <polygon key={i} points={pts.join(" ")} fill="none" stroke={c(45, 50)} strokeWidth={0.45} opacity={0.35 + r() * 0.2} />;
          })}
        </svg>
      );
    }
    case "cells": {
      const r = rng(seed);
      return (
        <svg {...common}>
          {Array.from({ length: 18 }, (_, i) => {
            const x = r() * 100;
            const y = r() * 100;
            const rad = 6 + r() * 9;
            return (
              <g key={i}>
                <ellipse cx={x} cy={y} rx={rad} ry={rad * (0.7 + r() * 0.4)} fill={c(60)} opacity={0.22} />
                <ellipse cx={x} cy={y} rx={rad} ry={rad * 0.85} fill="none" stroke={c(80)} strokeWidth={0.5} opacity={0.55} />
                <circle cx={x + rad * 0.2} cy={y - rad * 0.15} r={rad * 0.3} fill={c(85)} opacity={0.4} />
              </g>
            );
          })}
        </svg>
      );
    }
    case "virus": {
      const r = rng(seed);
      return (
        <svg {...common}>
          {Array.from({ length: 7 }, (_, i) => {
            const x = 12 + r() * 76;
            const y = 12 + r() * 76;
            const rad = 7 + r() * 6;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={rad} fill={c(55)} opacity={0.35} stroke={c(85)} strokeWidth={0.5} />
                {Array.from({ length: 14 }, (_, j) => {
                  const a = (j / 14) * Math.PI * 2;
                  return (
                    <line key={j} x1={x + Math.cos(a) * rad} y1={y + Math.sin(a) * rad} x2={x + Math.cos(a) * (rad + 3)} y2={y + Math.sin(a) * (rad + 3)} stroke={c(85)} strokeWidth={0.5} opacity={0.7} />
                  );
                })}
              </g>
            );
          })}
        </svg>
      );
    }
    case "helix":
      return (
        <svg {...common}>
          {Array.from({ length: 44 }, (_, i) => {
            const y = i * 2.3;
            const a = i * 0.42 + seed;
            const x1 = 50 + Math.sin(a) * 26;
            const x2 = 50 - Math.sin(a) * 26;
            return (
              <g key={i}>
                <line x1={x1} y1={y} x2={x2} y2={y} stroke={c(70)} strokeWidth={0.7} opacity={0.35 + Math.abs(Math.cos(a)) * 0.4} />
                <circle cx={x1} cy={y} r={1.6} fill={c(85)} />
                <circle cx={x2} cy={y} r={1.6} fill={c(55)} />
              </g>
            );
          })}
        </svg>
      );
    case "atom":
      return (
        <svg {...common}>
          <defs>
            <radialGradient id={`a${seed}`}>
              <stop offset="0%" stopColor={c(70)} stopOpacity={0.45} />
              <stop offset="60%" stopColor={c(60)} stopOpacity={0.15} />
              <stop offset="100%" stopColor={c(60)} stopOpacity={0} />
            </radialGradient>
          </defs>
          <circle cx={50} cy={50} r={46} fill={`url(#a${seed})`} />
          {[0, 60, 120].map((rot) => (
            <ellipse key={rot} cx={50} cy={50} rx={38} ry={13} fill="none" stroke={c(80)} strokeWidth={0.4} opacity={0.5} transform={`rotate(${rot} 50 50)`} />
          ))}
          {dots(seed + 7, 8, 1, 1.8).map((n) => (
            <circle key={n.key} cx={n.x} cy={n.y} r={n.r} fill={c(92)} opacity={0.9} />
          ))}
          <circle cx={50} cy={50} r={1.6} fill={c(90, 90)} />
        </svg>
      );
    case "desert": {
      const r = rng(seed);
      return (
        <svg {...common}>
          {Array.from({ length: 14 }, (_, i) => (
            <circle key={i} cx={r() * 100} cy={r() * 100} r={0.15 + r() * 0.3} fill={c(70)} opacity={0.18} />
          ))}
          <line x1={0} y1={50} x2={100} y2={50} stroke={c(70)} strokeWidth={0.15} opacity={0.12} />
        </svg>
      );
    }
    case "string": {
      const r = rng(seed);
      return (
        <svg {...common}>
          {Array.from({ length: 9 }, (_, i) => {
            const y = 8 + i * 10.5;
            const amp = 3 + r() * 7;
            const k = 1 + Math.floor(r() * 3);
            const pts = Array.from({ length: 41 }, (_, j) => {
              const x = (j / 40) * 100;
              return `${x},${y + Math.sin((j / 40) * Math.PI * 2 * k + i) * amp}`;
            });
            return <polyline key={i} points={pts.join(" ")} fill="none" stroke={c(78)} strokeWidth={0.55} opacity={0.3 + r() * 0.45} />;
          })}
        </svg>
      );
    }
    case "foam": {
      const r = rng(seed);
      return (
        <svg {...common}>
          {Array.from({ length: 46 }, (_, i) => {
            const x = r() * 100;
            const y = r() * 100;
            const rad = 2 + r() * 11;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={rad}
                fill="none"
                stroke={`hsl(${hue + (r() - 0.5) * 80} 70% 72%)`}
                strokeWidth={0.35}
                opacity={0.2 + r() * 0.5}
              />
            );
          })}
          {Array.from({ length: 18 }, (_, i) => (
            <circle key={`d${i}`} cx={r() * 100} cy={r() * 100} r={0.5 + r() * 0.9} fill={c(88)} opacity={0.5} />
          ))}
        </svg>
      );
    }
    case "void":
      return (
        <svg {...common}>
          {dots(seed, 6, 0.2, 0.5).map((n) => (
            <circle key={n.key} cx={n.x} cy={n.y} r={n.r} fill={c(70)} opacity={0.25} />
          ))}
        </svg>
      );
    case "nucleus": {
      const r = rng(seed);
      return (
        <svg {...common}>
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const rad = 8 + r() * 12;
            return <circle key={i} cx={50 + Math.cos(a) * rad} cy={50 + Math.sin(a) * rad} r={9} fill={i % 2 ? c(55) : c(70, 40)} opacity={0.8} />;
          })}
        </svg>
      );
    }
    case "quark":
      return (
        <svg {...common}>
          {Array.from({ length: 3 }, (_, i) => {
            const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
            const x = 50 + Math.cos(a) * 18;
            const y = 50 + Math.sin(a) * 18;
            return <circle key={i} cx={x} cy={y} r={6} fill={`hsl(${hue + i * 70} 75% 65%)`} opacity={0.85} />;
          })}
          {Array.from({ length: 30 }, (_, i) => {
            const a = i * 1.1 + seed;
            return (
              <path
                key={`g${i}`}
                d={`M${50 + Math.cos(a) * 18} ${50 + Math.sin(a) * 18} Q50 50 ${50 + Math.cos(a + 2.1) * 18} ${50 + Math.sin(a + 2.1) * 18}`}
                fill="none"
                stroke={c(80)}
                strokeWidth={0.3}
                opacity={0.3}
              />
            );
          })}
        </svg>
      );
  }
}

export const SceneArt = memo(ArtImpl);
