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
      // one orbit per frame, drawn as the bright thing in the picture; the tighter
      // orbits arrive from the frames nested inside this one
      const a = seed * 1.7;
      const px = 50 + Math.cos(a) * 40;
      const py = 50 + Math.sin(a) * 40;
      return (
        <svg {...common} preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id={`og${seed}`}>
              <stop offset="0%" stopColor={c(85, 95)} stopOpacity={0.9} />
              <stop offset="100%" stopColor={c(85, 95)} stopOpacity={0} />
            </radialGradient>
            <linearGradient id={`ot${seed}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={c(85, 95)} stopOpacity={0.15} />
              <stop offset="60%" stopColor={c(85, 95)} stopOpacity={0.55} />
              <stop offset="100%" stopColor={c(92, 100)} stopOpacity={1} />
            </linearGradient>
          </defs>
          {/* the orbit itself: a soft halo under a crisp, brightening line */}
          <circle cx={50} cy={50} r={40} fill="none" stroke={c(75, 90)} strokeWidth={2.4} opacity={0.14} />
          <circle
            cx={50}
            cy={50}
            r={40}
            fill="none"
            stroke={`url(#ot${seed})`}
            strokeWidth={0.55}
            transform={`rotate(${(a * 180) / Math.PI - 45} 50 50)`}
          />
          {/* the previous decade's orbit, a tenth of the size */}
          <circle cx={50} cy={50} r={4} fill="none" stroke={c(70)} strokeWidth={0.25} opacity={0.3} />
          <circle cx={50} cy={50} r={1.6} fill={c(88, 95)} opacity={0.85} />
          {/* the body riding the line */}
          <circle cx={px} cy={py} r={5} fill={`url(#og${seed})`} />
          <circle cx={px} cy={py} r={1.5} fill={c(92, 100)} />
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
    case "moon": {
      const r = rng(seed);
      return (
        <svg {...common} preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id={`m${seed}`} cx="38%" cy="34%">
              <stop offset="0%" stopColor="hsl(45 12% 82%)" />
              <stop offset="72%" stopColor="hsl(45 10% 62%)" />
              <stop offset="100%" stopColor="hsl(45 12% 34%)" />
            </radialGradient>
            <clipPath id={`mc${seed}`}>
              <circle cx={50} cy={50} r={40} />
            </clipPath>
          </defs>
          <circle cx={50} cy={50} r={40} fill={`url(#m${seed})`} />
          <g clipPath={`url(#mc${seed})`}>
            {/* maria */}
            {[[38, 36, 15], [58, 30, 9], [62, 58, 12], [34, 60, 7]].map(([x, y, rad], i) => (
              <ellipse key={`s${i}`} cx={x} cy={y} rx={rad} ry={rad * 0.8} fill="hsl(230 12% 42%)" opacity={0.45} />
            ))}
            {/* craters */}
            {Array.from({ length: 26 }, (_, i) => {
              const a = r() * Math.PI * 2;
              const d = Math.sqrt(r()) * 38;
              const x = 50 + Math.cos(a) * d;
              const y = 50 + Math.sin(a) * d;
              const rad = 1 + r() * 4.5;
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r={rad} fill="hsl(45 10% 45%)" opacity={0.5} />
                  <circle cx={x - rad * 0.2} cy={y - rad * 0.2} r={rad * 0.8} fill="hsl(45 14% 78%)" opacity={0.28} />
                </g>
              );
            })}
          </g>
        </svg>
      );
    }
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
      return (
        <svg {...common} preserveAspectRatio="xMidYMid meet">
          <g fill={c(78)} opacity={0.9}>
            <circle cx={50} cy={17} r={8} />
            <rect x={42} y={27} width={16} height={34} rx={7} />
            <rect x={31} y={29} width={9} height={30} rx={4.5} />
            <rect x={60} y={29} width={9} height={30} rx={4.5} />
            <rect x={42.5} y={60} width={7} height={34} rx={3.5} />
            <rect x={50.5} y={60} width={7} height={34} rx={3.5} />
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
