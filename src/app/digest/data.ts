import payload from "../../../digest-data.json";

/**
 * Everything on this page is derived from digest-data.json at the repo root —
 * the single file the scraper overwrites. Nothing about these ten accounts or
 * this particular 48-hour window is hardcoded below; drop in a fresh payload
 * and the page follows.
 *
 * The payload is the source of truth for *what was said*. The only thing this
 * module invents is `Category` — the payload's `topic` strings are free text,
 * one per item, which is too many to filter on, so they are folded into four
 * buckets here. The page says so in its footer rather than passing the
 * grouping off as the scraper's.
 */

export type Category = "tooling" | "evals" | "models" | "practice";

export type Item = {
  handle: string;
  name: string;
  publishedAt: string;
  /** UTC calendar day, `YYYY-MM-DD`. The window is stated in UTC. */
  day: string;
  url: string;
  topic: string;
  summary: string;
  signal: string;
  category: Category;
};

export type Author = {
  handle: string;
  name: string;
  items: Item[];
  /** Why an account contributed nothing — an empty account is information. */
  note?: string;
};

type RawItem = {
  published_at: string;
  url: string;
  topic: string;
  summary: string;
  signal: string;
};

type Payload = {
  generated_at: string;
  window: { start: string; end: string; timezone: string; duration_hours: number };
  scope: { accounts: string[]; filter: string; source: string; note?: string };
  digest: { handle: string; name: string; items: RawItem[]; note?: string }[];
  highlights: { title: string; url: string; reason: string }[];
};

const raw = payload as Payload;

export const CATEGORIES: Category[] = ["tooling", "evals", "models", "practice"];

export const CATEGORY_META: Record<
  Category,
  { label: string; blurb: string; dot: string; text: string; chip: string; ring: string }
> = {
  tooling: {
    label: "Tooling",
    blurb: "Harnesses, agent config, MCP, observability — the machinery around the model.",
    dot: "bg-sky-400",
    text: "text-sky-300",
    chip: "bg-sky-400/15 text-sky-200 ring-sky-400/30",
    ring: "ring-sky-400/30",
  },
  evals: {
    label: "Evals",
    blurb: "Does the thing actually work, and how would you know.",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    chip: "bg-emerald-400/15 text-emerald-200 ring-emerald-400/30",
    ring: "ring-emerald-400/30",
  },
  models: {
    label: "Models",
    blurb: "Picking between them, migrating, comparing on the same prompt.",
    dot: "bg-violet-400",
    text: "text-violet-300",
    chip: "bg-violet-400/15 text-violet-200 ring-violet-400/30",
    ring: "ring-violet-400/30",
  },
  practice: {
    label: "Practice",
    blurb: "How the work changes — craft, criticism, what to keep doing yourself.",
    dot: "bg-amber-400",
    text: "text-amber-300",
    chip: "bg-amber-400/15 text-amber-200 ring-amber-400/30",
    ring: "ring-amber-400/30",
  },
};

/**
 * Keyword rules, most specific first, so a payload full of topics nobody has
 * seen yet still sorts itself. `practice` is the fallback: an item that doesn't
 * name a tool, a model or a test is somebody talking about the work.
 */
const RULES: [RegExp, Category][] = [
  [/eval|test|verif|proof|benchmark/i, "evals"],
  // Bare model names (opus, gpt-, gemini) are deliberately absent: they appear
  // in tooling topics too, and would drag "Gemini TTS playground" in here.
  [/model (comparison|selection)|frontier|migrat|same-prompt/i, "models"],
  [/agent|harness|mcp|context|tooling|observab|cache|prompt|claude code|agents\.md|playground|interface/i, "tooling"],
  [/wisdom|understanding|adoption|prototyp|pollution|slop/i, "practice"],
];

export function categoryOf(topic: string): Category {
  for (const [re, cat] of RULES) if (re.test(topic)) return cat;
  return "practice";
}

export const AUTHORS: Author[] = raw.digest.map((a) => ({
  handle: a.handle,
  name: a.name,
  note: a.note,
  items: a.items.map((i) => ({
    handle: a.handle,
    name: a.name,
    publishedAt: i.published_at,
    day: i.published_at.slice(0, 10),
    url: i.url,
    topic: i.topic,
    summary: i.summary,
    signal: i.signal,
    category: categoryOf(i.topic),
  })),
}));

/** Newest first — a digest is read from the top. */
export const ITEMS: Item[] = AUTHORS.flatMap((a) => a.items).sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt),
);

/** Every UTC day the window actually produced something on, newest first. */
export const DAYS: string[] = [...new Set(ITEMS.map((i) => i.day))].sort((a, b) =>
  b.localeCompare(a),
);

export const META = {
  generatedAt: raw.generated_at,
  window: raw.window,
  filter: raw.scope.filter,
  source: raw.scope.source,
  note: raw.scope.note,
  accountsScanned: raw.scope.accounts.length,
  accountsWithPosts: AUTHORS.filter((a) => a.items.length > 0).length,
};
