/**
 * One aerial view, drawn five times over.
 *
 * Every frame covers the centre tenth of the frame above it, so levels 5 down to
 * 1 read as a single photograph being zoomed rather than five unrelated diagrams:
 * the same street angle, the same palette, the same block growing into buildings
 * and then into a garden. Each level only draws detail that would be visible at
 * its own scale — the finer stuff arrives from the frame nested inside it.
 */

const GRASS = "#2f3d2c";
const LAND = "#3a3a33";
const ROOF = "#4a4038";
const ROAD = "#6d6a63";
const WATER = "#1c3242";

function rng(seed: number) {
  let s = seed * 7919 + 13;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** The street grid, angled the same way at every level. */
const ANGLE = 8;

function Streets({ spacing, major, width }: { spacing: number; major?: number; width: number }) {
  const lines = [];
  for (let v = -60; v <= 160; v += spacing) {
    const isMajor = major !== undefined && Math.round(v / spacing) % major === 0;
    const w = isMajor ? width * 1.9 : width;
    lines.push(<line key={`h${v}`} x1={-60} y1={v} x2={160} y2={v} stroke={ROAD} strokeWidth={w} />);
    lines.push(<line key={`v${v}`} x1={v} y1={-60} x2={v} y2={160} stroke={ROAD} strokeWidth={w} />);
  }
  return <g transform={`rotate(${ANGLE} 50 50)`}>{lines}</g>;
}

export function Aerial({ level }: { level: number }) {
  const r = rng(level * 31 + 7);
  const common = { viewBox: "0 0 100 100", width: "100%", height: "100%", preserveAspectRatio: "none" as const };

  if (level === 5) {
    // 100 km: coast, motorways, the urban stain
    return (
      <svg {...common}>
        <rect width={100} height={100} fill={GRASS} />
        <path d="M100 0 L100 46 L74 58 L52 66 L30 82 L18 100 L100 100 Z" fill={WATER} />
        <path d="M100 0 L100 46 L74 58 L52 66 L30 82 L18 100" fill="none" stroke="#2a4658" strokeWidth={1.2} />
        {/* hills and fields */}
        {Array.from({ length: 22 }, (_, i) => (
          <ellipse key={i} cx={r() * 100} cy={r() * 70} rx={6 + r() * 12} ry={4 + r() * 8} fill="#36452f" opacity={0.55} />
        ))}
        {/* the built-up area, centred on the frame below */}
        <ellipse cx={50} cy={50} rx={17} ry={13} fill={LAND} opacity={0.85} />
        <ellipse cx={62} cy={40} rx={7} ry={5} fill={LAND} opacity={0.6} />
        <ellipse cx={38} cy={61} rx={6} ry={4} fill={LAND} opacity={0.55} />
        {/* motorways converging on the city */}
        {[[-10, 18], [112, 22], [20, 110], [96, 96], [4, 70]].map(([x, y], i) => (
          <line key={i} x1={x} y1={y} x2={50} y2={50} stroke={ROAD} strokeWidth={0.7} opacity={0.8} />
        ))}
      </svg>
    );
  }

  if (level === 4) {
    // 10 km: the city proper — river, park, arterial grid
    return (
      <svg {...common}>
        <rect width={100} height={100} fill={LAND} />
        <path d="M-5 22 C 20 30, 26 46, 48 54 S 82 72, 105 70 L105 84 C 80 86, 60 70, 44 64 S 12 42, -5 34 Z" fill={WATER} />
        <ellipse cx={72} cy={26} rx={13} ry={9} fill={GRASS} />
        <ellipse cx={22} cy={74} rx={9} ry={7} fill={GRASS} />
        <Streets spacing={10} major={3} width={0.5} />
        {Array.from({ length: 40 }, (_, i) => (
          <rect key={i} x={r() * 96} y={r() * 96} width={1.5 + r() * 3} height={1.5 + r() * 3} fill={ROOF} opacity={0.5} />
        ))}
      </svg>
    );
  }

  if (level === 3) {
    // 1 km: blocks and their courtyards
    return (
      <svg {...common}>
        <rect width={100} height={100} fill={LAND} />
        <g transform={`rotate(${ANGLE} 50 50)`}>
          {Array.from({ length: 144 }, (_, i) => {
            const bx = (i % 12) * 10 - 10;
            const by = Math.floor(i / 12) * 10 - 10;
            return <rect key={i} x={bx + 1.4} y={by + 1.4} width={7.2} height={7.2} fill={ROOF} opacity={0.35 + r() * 0.4} rx={0.3} />;
          })}
        </g>
        <Streets spacing={10} major={5} width={1.4} />
        <ellipse cx={78} cy={20} rx={8} ry={6} fill={GRASS} opacity={0.9} />
      </svg>
    );
  }

  if (level === 2) {
    // 100 m: one block — individual buildings, a courtyard, street trees
    return (
      <svg {...common}>
        <rect width={100} height={100} fill={LAND} />
        <g transform={`rotate(${ANGLE} 50 50)`}>
          {/* the road edges that were single lines one frame up */}
          {[-5, 95].map((v) => (
            <g key={v}>
              <rect x={-20} y={v} width={140} height={14} fill={ROAD} />
              <rect x={v} y={-20} width={14} height={140} fill={ROAD} />
            </g>
          ))}
          {/* buildings around a green courtyard */}
          {Array.from({ length: 16 }, (_, i) => {
            const side = Math.floor(i / 4);
            const t = (i % 4) * 18 + 12;
            const d = 14;
            const pos: Record<number, [number, number, number, number]> = {
              0: [t, d, 16, 13],
              1: [t, 73, 16, 13],
              2: [d, t, 13, 16],
              3: [73, t, 13, 16],
            };
            const [x, y, w, h] = pos[side];
            return <rect key={i} x={x} y={y} width={w} height={h} fill={ROOF} opacity={0.55 + r() * 0.4} rx={0.6} />;
          })}
          <rect x={30} y={30} width={40} height={40} fill={GRASS} opacity={0.75} rx={1} />
          {/* street trees */}
          {Array.from({ length: 14 }, (_, i) => (
            <circle key={`t${i}`} cx={8 + r() * 84} cy={8 + r() * 84} r={1.6 + r() * 1.1} fill="#3f5c35" opacity={0.85} />
          ))}
        </g>
      </svg>
    );
  }

  // level 1 — 10 m: the garden in the middle of that courtyard
  return (
    <svg {...common}>
      <rect width={100} height={100} fill={GRASS} />
      {Array.from({ length: 90 }, (_, i) => (
        <circle key={i} cx={r() * 100} cy={r() * 100} r={0.6 + r() * 1.2} fill="#37492f" opacity={0.6} />
      ))}
      {/* a paved path running past the middle */}
      <path d="M-5 78 C 25 74, 40 62, 56 56 S 88 44, 105 46 L105 56 C 86 54, 70 62, 58 66 S 24 84, -5 88 Z" fill="#6b6257" opacity={0.8} />
      {/* the corner of a house */}
      <rect x={-8} y={-10} width={34} height={26} fill={ROOF} rx={1} />
      <rect x={-8} y={-10} width={34} height={26} fill="none" stroke="#2a241f" strokeWidth={0.6} rx={1} />
      {/* a tree, canopy about four metres across */}
      <circle cx={76} cy={26} r={19} fill="#31492a" />
      <circle cx={71} cy={21} r={11} fill="#3d5a33" opacity={0.75} />
      <ellipse cx={86} cy={44} rx={17} ry={9} fill="#141a12" opacity={0.35} />
      {/* a table and two chairs, beside the person standing at centre */}
      <circle cx={33} cy={62} r={7} fill="#7a6a56" />
      <circle cx={23} cy={62} r={3} fill="#6a5b49" />
      <circle cx={43} cy={62} r={3} fill="#6a5b49" />
    </svg>
  );
}
