import { memo } from "react";
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
function ArtImpl({ art, hue, seed }: { art: Art; hue: number; seed: number }) {
  const c = (l: number, s = 70) => `hsl(${hue} ${s}% ${l}%)`;
  const common = { viewBox: "0 0 100 100", width: "100%", height: "100%", preserveAspectRatio: "none" as const };

  switch (art) {
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
    case "orbit":
      return (
        <svg {...common}>
          {[14, 24, 34, 44].map((rad, i) => (
            <ellipse key={rad} cx={50} cy={50} rx={rad} ry={rad} fill="none" stroke={c(70)} strokeWidth={0.2} opacity={0.4 - i * 0.05} />
          ))}
          <circle cx={50} cy={50} r={3} fill={c(85, 90)} />
          {[14, 24, 34, 44].map((rad, i) => {
            const a = seed * 1.7 + i * 2.3;
            return <circle key={`p${rad}`} cx={50 + Math.cos(a) * rad} cy={50 + Math.sin(a) * rad} r={1.3} fill={c(75)} />;
          })}
        </svg>
      );
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
    case "planet":
      return (
        <svg {...common}>
          <defs>
            <radialGradient id={`p${seed}`} cx="35%" cy="32%">
              <stop offset="0%" stopColor={c(62, 60)} />
              <stop offset="70%" stopColor={c(34, 55)} />
              <stop offset="100%" stopColor={c(12, 45)} />
            </radialGradient>
          </defs>
          <circle cx={50} cy={50} r={34} fill={`url(#p${seed})`} />
          {dots(seed + 2, 14, 3, 9).map((n) => {
            const x = 50 + (n.x - 50) * 0.6;
            const y = 50 + (n.y - 50) * 0.6;
            return <ellipse key={n.key} cx={x} cy={y} rx={n.r} ry={n.r * 0.6} fill="hsl(130 45% 40%)" opacity={0.45} />;
          })}
          <circle cx={50} cy={50} r={35.5} fill="none" stroke={c(80)} strokeWidth={1.2} opacity={0.3} />
        </svg>
      );
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
