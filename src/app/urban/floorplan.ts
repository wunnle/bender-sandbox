// Urban Cafe floor plan, traced from Sinan's layout sketch.
// The sketch's proportions were rough and left too much dead floor through the
// middle, so the room is pulled in to a 256x180 backbuffer. Walls enclose the
// main room, with a doorway in the bottom wall leading to the seating area.

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
  { kind: "wall", x: 0, y: 0, w: 256, h: 7 },
  { kind: "wall", x: 0, y: 0, w: 8, h: 118 },
  { kind: "wall", x: 248, y: 0, w: 8, h: 118 },
  // Bottom wall, split by the doorway at x 152..190.
  { kind: "wall", x: 0, y: 111, w: 152, h: 7 },
  { kind: "wall", x: 190, y: 111, w: 66, h: 7 },
];

/** The big table Qral works at — referenced when placing him and his laptop. */
export const BIG_TABLE: Solid = {
  kind: "table",
  x: 84,
  y: 58,
  w: 47,
  h: 20,
  prompt: "QRAL, THE OWNER",
};

export const FURNITURE: Solid[] = [
  // Bar counters
  { kind: "counter", x: 31, y: 20, w: 118, h: 16, prompt: "ORDER A COFFEE" },
  { kind: "counter", x: 169, y: 20, w: 79, h: 16, prompt: "PASTRY CASE" },

  // Main room tables
  { kind: "table", x: 38, y: 54, w: 13, h: 12, round: true, prompt: "A FREE TABLE" },
  BIG_TABLE,
  { kind: "table", x: 38, y: 88, w: 13, h: 12, round: true, prompt: "A FREE TABLE" },
  { kind: "table", x: 106, y: 88, w: 13, h: 12, round: true, prompt: "A FREE TABLE" },
  { kind: "table", x: 224, y: 48, w: 24, h: 51, prompt: "THE LONG BENCH" },

  // Lower seating area, past the doorway
  { kind: "table", x: 190, y: 119, w: 66, h: 11, prompt: "WINDOW LEDGE" },
  { kind: "table", x: 100, y: 140, w: 13, h: 12, round: true, prompt: "A FREE TABLE" },
  { kind: "table", x: 148, y: 140, w: 13, h: 12, round: true, prompt: "A FREE TABLE" },
  { kind: "table", x: 232, y: 140, w: 13, h: 12, round: true, prompt: "A FREE TABLE" },
];

export const SOLIDS: Solid[] = [...WALLS, ...FURNITURE];

/**
 * Qral owns the cafe. He sits at the north side of the big table behind his
 * laptop, so the table hides him from the waist down. Anchor is the table's
 * north edge; he is drawn before the furniture so it overlaps him correctly.
 */
export const QRAL = { x: BIG_TABLE.x + 23, y: BIG_TABLE.y };

/** His laptop, sitting on the tabletop in front of him. */
export const LAPTOP = { x: BIG_TABLE.x + 16, y: BIG_TABLE.y + 2, w: 14, h: 6 };

/** Where the player starts the day — just inside the door. */
export const SPAWN = { x: 168, y: 104 };

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
