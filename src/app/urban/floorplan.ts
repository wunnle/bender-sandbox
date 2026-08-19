// Urban Cafe floor plan, traced from Sinan's layout sketch.
// The sketch was 1288x938; everything here is already scaled to the 320x180
// backbuffer. Walls enclose the main room, with a doorway in the bottom wall
// leading down to the open seating area.

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type SolidKind = "wall" | "counter" | "table";

export interface Solid extends Rect {
  kind: SolidKind;
  /** Round tables render as blobs rather than boxes. */
  round?: boolean;
  /** Shown when the player stands next to it. */
  prompt?: string;
}

export const WALLS: Solid[] = [
  { kind: "wall", x: 0, y: 0, w: 320, h: 7 },
  { kind: "wall", x: 0, y: 0, w: 8, h: 118 },
  { kind: "wall", x: 312, y: 0, w: 8, h: 118 },
  // Bottom wall, split by the doorway at x 189..238.
  { kind: "wall", x: 0, y: 111, w: 189, h: 7 },
  { kind: "wall", x: 238, y: 111, w: 82, h: 7 },
];

export const FURNITURE: Solid[] = [
  // Bar counters
  { kind: "counter", x: 31, y: 20, w: 156, h: 16, prompt: "ORDER A COFFEE" },
  { kind: "counter", x: 217, y: 20, w: 79, h: 16, prompt: "PASTRY CASE" },

  // Main room tables
  { kind: "table", x: 38, y: 54, w: 13, h: 12, round: true, prompt: "A FREE TABLE" },
  { kind: "table", x: 84, y: 47, w: 47, h: 22, prompt: "THE BIG TABLE" },
  { kind: "table", x: 38, y: 85, w: 13, h: 12, round: true, prompt: "A FREE TABLE" },
  { kind: "table", x: 106, y: 85, w: 13, h: 12, round: true, prompt: "A FREE TABLE" },
  { kind: "table", x: 272, y: 48, w: 24, h: 51, prompt: "THE LONG BENCH" },

  // Lower seating area, past the doorway
  { kind: "table", x: 239, y: 119, w: 81, h: 11, prompt: "WINDOW LEDGE" },
  { kind: "table", x: 122, y: 140, w: 13, h: 12, round: true, prompt: "A FREE TABLE" },
  { kind: "table", x: 170, y: 140, w: 13, h: 12, round: true, prompt: "A FREE TABLE" },
  { kind: "table", x: 291, y: 140, w: 13, h: 12, round: true, prompt: "A FREE TABLE" },
];

export const SOLIDS: Solid[] = [...WALLS, ...FURNITURE];

/** Where the player starts the day — just inside the door. */
export const SPAWN = { x: 213, y: 104 };

export function overlaps(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/** Nearest interactable within `pad` pixels of the player's body, or null. */
export function interactableNear(body: Rect, pad = 4): Solid | null {
  const probe = { x: body.x - pad, y: body.y - pad, w: body.w + pad * 2, h: body.h + pad * 2 };
  let best: Solid | null = null;
  let bestDist = Infinity;
  for (const s of FURNITURE) {
    if (!s.prompt || !overlaps(probe, s)) continue;
    const dx = body.x + body.w / 2 - (s.x + s.w / 2);
    const dy = body.y + body.h / 2 - (s.y + s.h / 2);
    const d = dx * dx + dy * dy;
    if (d < bestDist) {
      bestDist = d;
      best = s;
    }
  }
  return best;
}
