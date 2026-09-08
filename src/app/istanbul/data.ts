import payload from "../../../event-data.json";

/**
 * Everything on this page is derived from event-data.json at the repo root —
 * the single file Hermes overwrites. Nothing about Istanbul, September, or any
 * particular event is hardcoded below; drop in a payload for another city and
 * the page follows.
 */

export type Category = "stage" | "music" | "screen" | "other";

export type Ev = {
  days: string[];
  title: string;
  kind: string;
  time?: string;
  /** Multiple sessions on the same day. Supersedes `time` when present. */
  times?: string[];
  venue: string;
  area: string;
  price?: string;
  url?: string;
  note?: string;
  availability?: string;
  owned?: boolean;
  /** Poster from the source listing. Present on roughly half the payload. */
  image?: string;
};

type Payload = {
  city: string;
  timezone?: string;
  lastUpdated?: string;
  range: { start: string; end: string };
  preferences?: {
    excluded_titles?: string[];
    excluded_artists?: string[];
  };
  events: Ev[];
  cinemas: { name: string; area: string; films: string; url?: string }[];
  omitted_records?: number;
  research_note?: string;
};

const data = payload as Payload;

/** Kinds the payload is known to emit, mapped onto the four filter buckets. */
const KIND_CATEGORY: Record<string, Category> = {
  theatre: "stage",
  "stand-up": "stage",
  standup: "stage",
  musical: "stage",
  opera: "stage",
  dance: "stage",
  concert: "music",
  music: "music",
  festival: "music",
  film: "screen",
  cinema: "screen",
  "open-air cinema": "screen",
  screening: "screen",
};

/** Unknown kinds land in "other" rather than crashing or being silently dropped. */
export const categoryOf = (kind: string): Category =>
  KIND_CATEGORY[kind.toLowerCase()] ?? "other";

export const CATEGORY_META: Record<
  Category,
  { label: string; dot: string; text: string; chip: string; ring: string }
> = {
  stage: {
    label: "Stage",
    dot: "bg-amber-400",
    text: "text-amber-400",
    chip: "bg-amber-400/10 text-amber-200 ring-amber-400/30",
    ring: "ring-amber-400/40",
  },
  music: {
    label: "Music & festivals",
    dot: "bg-violet-400",
    text: "text-violet-400",
    chip: "bg-violet-400/10 text-violet-200 ring-violet-400/30",
    ring: "ring-violet-400/40",
  },
  screen: {
    label: "Screen",
    dot: "bg-sky-400",
    text: "text-sky-400",
    chip: "bg-sky-400/10 text-sky-200 ring-sky-400/30",
    ring: "ring-sky-400/40",
  },
  other: {
    label: "Other",
    dot: "bg-emerald-400",
    text: "text-emerald-400",
    chip: "bg-emerald-400/10 text-emerald-200 ring-emerald-400/30",
    ring: "ring-emerald-400/40",
  },
};

const shift = (iso: string, days: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

/** Every day in range.start–range.end inclusive, so empty days still render. */
export const DAYS: string[] = (() => {
  const out: string[] = [];
  for (let d = data.range.start; d <= data.range.end; d = shift(d, 1)) out.push(d);
  return out;
})();

/** Days named by an event but outside the stated range would otherwise vanish. */
const EXTRA_DAYS = [...new Set(data.events.flatMap((e) => e.days))]
  .filter((d) => !DAYS.includes(d))
  .sort();

export const ALL_DAYS = [...DAYS, ...EXTRA_DAYS].sort();

export const EVENTS: Ev[] = data.events;
export const CINEMAS = data.cinemas ?? [];

export const META = {
  city: data.city,
  timezone: data.timezone,
  lastUpdated: data.lastUpdated,
  range: data.range,
  researchNote: data.research_note,
  omitted: data.omitted_records ?? 0,
  excluded: [
    ...(data.preferences?.excluded_artists ?? []),
    ...(data.preferences?.excluded_titles ?? []),
  ],
};

/** Categories present in this payload, in a stable order. */
export const CATEGORIES = (Object.keys(CATEGORY_META) as Category[]).filter((c) =>
  EVENTS.some((e) => categoryOf(e.kind) === c),
);
