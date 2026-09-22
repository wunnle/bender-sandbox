/**
 * One cosmic web, drawn six times over.
 *
 * 10^27 down to 10^22 is a single picture: the same filament runs at the same
 * angle through every frame, and the bright knot at the centre of each one is
 * what the next frame opens into. A thin ring marks that knot, so you can see
 * where you are about to go before you go there.
 */

const AXIS = -28; // the filament's angle, held across every level

function rng(seed: number) {
  let s = seed * 6971 + 41;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** Marks the centre tenth — the part of this picture the next frame opens into. */
export function Target({ r = 6.5 }: { r?: number }) {
  return (
    <g opacity={0.5}>
      <circle cx={50} cy={50} r={r} fill="none" stroke="#cdd6ff" strokeWidth={0.3} />
      {[0, 90, 180, 270].map((a) => (
        <line
          key={a}
          x1={50 + Math.cos((a * Math.PI) / 180) * (r + 1.2)}
          y1={50 + Math.sin((a * Math.PI) / 180) * (r + 1.2)}
          x2={50 + Math.cos((a * Math.PI) / 180) * (r + 3.2)}
          y2={50 + Math.sin((a * Math.PI) / 180) * (r + 3.2)}
          stroke="#cdd6ff"
          strokeWidth={0.3}
        />
      ))}
    </g>
  );
}

export function Cosmos({ level }: { level: number }) {
  const r = rng(level * 17 + 3);
  const common = { viewBox: "0 0 100 100", width: "100%", height: "100%", preserveAspectRatio: "none" as const };

  if (level >= 26) {
    // 10^27 / 10^26 — the web itself, coarse then half as coarse
    const n = level === 27 ? 60 : 30;
    const nodes = Array.from({ length: n }, () => ({ x: r() * 100, y: r() * 100, m: 0.4 + r() * 1.5 }));
    // pull a few nodes onto the filament axis so the structure reads as threads
    const rad = (AXIS * Math.PI) / 180;
    const onAxis = Array.from({ length: level === 27 ? 14 : 9 }, (_, i) => {
      const t = (i / (level === 27 ? 13 : 8) - 0.5) * 150;
      return { x: 50 + Math.cos(rad) * t + (r() - 0.5) * 8, y: 50 + Math.sin(rad) * t + (r() - 0.5) * 8, m: 1 + r() * 1.6 };
    });
    const all = [...nodes, ...onAxis];
    return (
      <svg {...common}>
        {all.map((a, i) => {
          const b = all[(i * 7 + 3) % all.length];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > 34) return null;
          return <line key={`l${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#8f9bd8" strokeWidth={0.18} opacity={0.3} />;
        })}
        {all.map((a, i) => (
          <circle key={i} cx={a.x} cy={a.y} r={a.m * (level === 27 ? 0.5 : 0.8)} fill="#c9d2ff" opacity={0.55 + r() * 0.4} />
        ))}
        {/* the knot we are heading into */}
        <circle cx={50} cy={50} r={level === 27 ? 4 : 7} fill="#aab8ff" opacity={0.18} />
        <Target r={level === 27 ? 5.5 : 6.5} />
      </svg>
    );
  }

  if (level === 25) {
    // one filament, end to end, with its densest knot at the centre
    const rad = (AXIS * Math.PI) / 180;
    return (
      <svg {...common}>
        <g>
          {Array.from({ length: 260 }, (_, i) => {
            const t = (r() - 0.5) * 160;
            const spread = 5 + Math.abs(t) * 0.22;
            const off = (r() - 0.5) * spread * 2;
            const x = 50 + Math.cos(rad) * t - Math.sin(rad) * off;
            const y = 50 + Math.sin(rad) * t + Math.cos(rad) * off;
            return <circle key={i} cx={x} cy={y} r={0.3 + r() * 0.8} fill="#cdd6ff" opacity={0.35 + r() * 0.55} />;
          })}
        </g>
        <ellipse
          cx={50}
          cy={50}
          rx={11}
          ry={7}
          fill="#96a6ff"
          opacity={0.14}
          transform={`rotate(${AXIS} 50 50)`}
        />
        <Target />
      </svg>
    );
  }

  if (level === 24) {
    // the supercluster — hundreds of galaxies, densest where we are going
    return (
      <svg {...common}>
        {Array.from({ length: 240 }, (_, i) => {
          const a = r() * Math.PI * 2;
          const d = Math.pow(r(), 0.55) * 62;
          const x = 50 + Math.cos(a) * d;
          const y = 50 + Math.sin(a) * d * 0.8;
          const s = 0.5 + r() * 1.3;
          return (
            <ellipse
              key={i}
              cx={x}
              cy={y}
              rx={s}
              ry={s * (0.4 + r() * 0.5)}
              fill="#dbe2ff"
              opacity={0.4 + r() * 0.5}
              transform={`rotate(${r() * 180} ${x} ${y})`}
            />
          );
        })}
        <ellipse cx={50} cy={50} rx={14} ry={11} fill="#8ea0ff" opacity={0.1} />
        <Target />
      </svg>
    );
  }

  if (level === 23) {
    // one cluster, swimming in X-ray gas
    return (
      <svg {...common}>
        <defs>
          <radialGradient id="clg">
            <stop offset="0%" stopColor="#7f6adf" stopOpacity={0.38} />
            <stop offset="100%" stopColor="#7f6adf" stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx={50} cy={50} r={46} fill="url(#clg)" />
        {Array.from({ length: 80 }, (_, i) => {
          const a = r() * Math.PI * 2;
          const d = Math.pow(r(), 0.6) * 46;
          const x = 50 + Math.cos(a) * d;
          const y = 50 + Math.sin(a) * d;
          const s = 0.8 + r() * 2.4;
          return (
            <ellipse
              key={i}
              cx={x}
              cy={y}
              rx={s}
              ry={s * (0.35 + r() * 0.55)}
              fill={r() > 0.6 ? "#ffe6c4" : "#e3e9ff"}
              opacity={0.55 + r() * 0.45}
              transform={`rotate(${r() * 180} ${x} ${y})`}
            />
          );
        })}
        <Target />
      </svg>
    );
  }

  // level 22 — the Local Group: two big spirals and a scatter of dwarfs
  const spiral = (cx: number, cy: number, size: number, tilt: number, hue: string) => (
    <g transform={`rotate(${tilt} ${cx} ${cy})`}>
      <ellipse cx={cx} cy={cy} rx={size} ry={size * 0.38} fill={hue} opacity={0.16} />
      {Array.from({ length: 220 }, (_, i) => {
        const t = r() * 3.1;
        const a = t * 2.2 + Math.floor(r() * 2) * Math.PI + (r() - 0.5) * 0.4;
        const d = size * 0.12 + t * size * 0.29;
        return (
          <circle
            key={i}
            cx={cx + Math.cos(a) * d}
            cy={cy + Math.sin(a) * d * 0.38}
            r={0.18 + r() * 0.3}
            fill={hue}
            opacity={0.35 + r() * 0.6}
          />
        );
      })}
      <ellipse cx={cx} cy={cy} rx={size * 0.16} ry={size * 0.09} fill="#fff4d8" opacity={0.5} />
    </g>
  );

  return (
    <svg {...common}>
      {spiral(24, 26, 26, -18, "#cfd8ff")}
      {spiral(50, 50, 17, 22, "#e8e2ff")}
      {spiral(74, 72, 9, 40, "#d6cfff")}
      {Array.from({ length: 16 }, (_, i) => {
        const x = r() * 100;
        const y = r() * 100;
        return <circle key={i} cx={x} cy={y} r={0.7 + r() * 1.4} fill="#c8cfe8" opacity={0.3 + r() * 0.35} />;
      })}
      <Target r={7} />
    </svg>
  );
}
