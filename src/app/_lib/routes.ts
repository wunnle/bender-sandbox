import fs from "node:fs";
import path from "node:path";
// Generated from git history by scripts/route-dates.mjs, committed by the
// route-dates workflow. See that script for why it isn't read from git here.
import routeDates from "../route-dates.json";

export const dates: Record<string, string> = routeDates;

// Optional blurbs. Anything not listed still shows up, just without a description.
export const NOTES: Record<string, string> = {
  dice: "Roll d4 through d100, up to six at a time",
  qr: "Turn any text or URL into a QR code",
  stopwatch: "Stopwatch with laps",
  urban: "Pixel-art cafe life-sim — engine shell",
  istanbul: "What's on in Istanbul — events calendar",
  kl: "KL day trip",
  "spiel-essen": "SPIEL Essen 2026 — where to stay",
  "safe-area": "Safe-area insets probe",
  "powers-of-ten": "Zoom through powers of ten",
  bender: "Bender — personal assistant",
  "bender/privacy": "Bender privacy policy",
  "bender/terms": "Bender terms of service",
};

const appDir = path.join(process.cwd(), "src/app");

const isRoute = (dir: string, name: string) =>
  !name.startsWith("_") &&
  !name.startsWith("(") &&
  !name.startsWith("[") &&
  fs.existsSync(path.join(dir, name, "page.tsx"));

const subdirs = (dir: string) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && isRoute(dir, e.name))
    .map((e) => e.name);

/** Top-level experiments, most recently changed first. */
export function experiments() {
  return subdirs(appDir).sort((a, b) => {
    // Anything without a date sinks to the bottom.
    const da = dates[a] ?? "";
    const db = dates[b] ?? "";
    return db.localeCompare(da) || a.localeCompare(b);
  });
}

export type SearchItem = {
  /** Path without leading slash, e.g. "bender/privacy". */
  path: string;
  note?: string;
  date?: string;
};

/** Every static page (experiments plus their static sub-pages) for the Cmd-K palette. */
export function searchIndex(): SearchItem[] {
  const items: SearchItem[] = [];
  for (const top of experiments()) {
    items.push({ path: top, note: NOTES[top], date: dates[top] });
    for (const sub of subdirs(path.join(appDir, top)).sort()) {
      const p = `${top}/${sub}`;
      items.push({ path: p, note: NOTES[p], date: dates[top] });
    }
  }
  return items;
}
