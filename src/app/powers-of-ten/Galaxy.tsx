/**
 * One galaxy, drawn five times over.
 *
 * 10^21 down to 10^17. The Sun sits at the centre of every frame — which is not
 * the centre of the galaxy — so the core stays up and to the left the whole way
 * down, glowing through the arm, the spur and the cloud. Same picture, five
 * depths into it.
 */

import { Target } from "./Cosmos";

/** Where the galactic centre lies, in frame units, at 10^21. */
const CORE = { x: 32, y: 32 };
/** Direction from us to the core, used by every closer frame. */
const CORE_DIR = Math.atan2(CORE.y - 50, CORE.x - 50);

function rng(seed: number) {
  let s = seed * 5231 + 97;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** The core's glow, pushed out to the top-left corner at the closer levels. */
function CoreGlow({ id, strength }: { id: string; strength: number }) {
  const x = 50 + Math.cos(CORE_DIR) * 70;
  const y = 50 + Math.sin(CORE_DIR) * 70;
  return (
    <>
      <defs>
        <radialGradient id={id} cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ffe9bd" stopOpacity={strength} />
          <stop offset="100%" stopColor="#ffd79a" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={x} cy={y} rx={70} ry={58} fill={`url(#${id})`} />
    </>
  );
}

export function Galaxy({ level }: { level: number }) {
  const r = rng(level * 23 + 11);
  const common = { viewBox: "0 0 100 100", width: "100%", height: "100%", preserveAspectRatio: "none" as const };

  if (level === 21) {
    // the whole disc, seen face on, with us two thirds of the way out
    return (
      <svg {...common}>
        <ellipse cx={CORE.x} cy={CORE.y} rx={52} ry={50} fill="#6d7ac4" opacity={0.08} />
        {Array.from({ length: 1400 }, (_, i) => {
          const t = Math.pow(r(), 0.75) * 3.3;
          const arm = Math.floor(r() * 4) * (Math.PI / 2);
          const a = t * 1.5 + arm + (r() - 0.5) * 0.5;
          const d = 5 + t * 14;
          const young = r() > 0.82;
          return (
            <circle
              key={i}
              cx={CORE.x + Math.cos(a) * d}
              cy={CORE.y + Math.sin(a) * d}
              r={0.2 + r() * 0.45}
              fill={young ? "#bcd6ff" : "#ffeccd"}
              opacity={0.35 + r() * 0.6}
            />
          );
        })}
        {/* the bar and the bulge */}
        <ellipse cx={CORE.x} cy={CORE.y} rx={13} ry={4.5} fill="#ffe3ad" opacity={0.3} transform={`rotate(25 ${CORE.x} ${CORE.y})`} />
        <ellipse cx={CORE.x} cy={CORE.y} rx={6} ry={5} fill="#fff3d6" opacity={0.6} />
        <Target r={6.5} />
      </svg>
    );
  }

  if (level === 20 || level === 19) {
    // an arm, then the minor spur inside it — same band, same core direction
    const dense = level === 20;
    const band = (AXIS: number) => ((AXIS + 90) * Math.PI) / 180;
    const rad = band((CORE_DIR * 180) / Math.PI);
    return (
      <svg {...common}>
        <CoreGlow id={`cg${level}`} strength={dense ? 0.3 : 0.16} />
        {Array.from({ length: dense ? 900 : 420 }, (_, i) => {
          const t = (r() - 0.5) * 170;
          const spread = dense ? 22 : 46;
          const off = (r() - 0.5) * spread + Math.sin(t / 34) * (dense ? 9 : 4);
          const x = 50 + Math.cos(rad) * t - Math.sin(rad) * off;
          const y = 50 + Math.sin(rad) * t + Math.cos(rad) * off;
          const young = r() > (dense ? 0.72 : 0.86);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={0.22 + r() * (young ? 0.75 : 0.42)}
              fill={young ? "#c4dcff" : "#ffeed2"}
              opacity={0.3 + r() * 0.65}
            />
          );
        })}
        {/* dust lanes along the arm */}
        {dense &&
          Array.from({ length: 5 }, (_, i) => {
            const off = (i - 2) * 9;
            const x1 = 50 - Math.cos(rad) * 90 - Math.sin(rad) * off;
            const y1 = 50 - Math.sin(rad) * 90 + Math.cos(rad) * off;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x1 + Math.cos(rad) * 180}
                y2={y1 + Math.sin(rad) * 180}
                stroke="#1a1426"
                strokeWidth={2.5 + r() * 3}
                opacity={0.3}
              />
            );
          })}
        <Target r={6.5} />
      </svg>
    );
  }

  if (level === 18) {
    // a molecular cloud in that spur: dark gas, and the stars lighting it up
    return (
      <svg {...common}>
        <CoreGlow id="cg18" strength={0.1} />
        {Array.from({ length: 26 }, (_, i) => (
          <ellipse
            key={`n${i}`}
            cx={r() * 100}
            cy={r() * 100}
            rx={8 + r() * 22}
            ry={6 + r() * 16}
            fill={i % 3 === 0 ? "#3a1d3f" : "#141026"}
            opacity={0.5}
          />
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <ellipse key={`g${i}`} cx={r() * 100} cy={r() * 100} rx={5 + r() * 12} ry={4 + r() * 9} fill="#b0468a" opacity={0.1} />
        ))}
        {Array.from({ length: 150 }, (_, i) => {
          const young = r() > 0.75;
          return (
            <circle
              key={i}
              cx={r() * 100}
              cy={r() * 100}
              r={0.3 + r() * (young ? 1.1 : 0.5)}
              fill={young ? "#cfe3ff" : "#ffeed2"}
              opacity={0.4 + r() * 0.6}
            />
          );
        })}
        <Target r={6.5} />
      </svg>
    );
  }

  // level 17 — the nearest stars, us in the middle
  const stars = Array.from({ length: 17 }, () => {
    const a = r() * Math.PI * 2;
    const d = 10 + Math.pow(r(), 0.6) * 42;
    const warm = r();
    return {
      x: 50 + Math.cos(a) * d,
      y: 50 + Math.sin(a) * d,
      s: 0.5 + r() * 1.5,
      c: warm > 0.7 ? "#bdd6ff" : warm > 0.35 ? "#fff0cf" : "#ffb98a",
    };
  });
  return (
    <svg {...common}>
      <CoreGlow id="cg17" strength={0.07} />
      {stars.map((s, i) => (
        <g key={i}>
          <circle cx={s.x} cy={s.y} r={s.s * 3.5} fill={s.c} opacity={0.12} />
          <circle cx={s.x} cy={s.y} r={s.s} fill={s.c} />
        </g>
      ))}
      {/* the Sun, at the centre as always */}
      <circle cx={50} cy={50} r={5} fill="#fff1c9" opacity={0.18} />
      <circle cx={50} cy={50} r={1.5} fill="#fff8e4" />
      <Target r={7} />
    </svg>
  );
}
