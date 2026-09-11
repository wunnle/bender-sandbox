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
  description?: string;
  duration?: string;
  genre?: string;
  director?: string;
  cast?: string[];
  rating?: string;
  reviewCount?: number;
  trailer?: string;
  imdbId?: string;
  imdbUrl?: string;
  imdbRating?: string;
  imdbVotes?: number;
  availability?: string;
  owned?: boolean;
  /** Poster from the source listing. Present on roughly half the payload. */
  image?: string;
  /** IMDb's own poster — much higher resolution than the seller's. */
  imdbImage?: string;
  imdbTitle?: string;
  imdbYear?: number;
  imdbType?: string;
  /** The original local-language title, once `title` holds the IMDb one. */
  sourceTitle?: string;
  ageLimit?: string;
  /** Per-venue, e.g. "Türkçe Altyazılı", "3D / Türkçe Dublaj". */
  formats?: string[];
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
  /** Per-venue provenance: where each inventory was read from, and when. */
  sources?: {
    provider: string;
    kind: string;
    venue?: string;
    url?: string;
    checkedAt?: string;
  }[];
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

/**
 * `card` tints the card body by category. The hover state drops the tint rather
 * than raising it — against a near-black page, less light tint reads as darker.
 */
export const CATEGORY_META: Record<
  Category,
  { label: string; dot: string; text: string; chip: string; ring: string; card: string }
> = {
  stage: {
    label: "Stage",
    dot: "bg-amber-400",
    text: "text-amber-400",
    chip: "bg-amber-400/10 text-amber-200 ring-amber-400/30",
    ring: "ring-amber-400/40",
    card: "border-amber-400/15 bg-amber-400/[0.06] hover:border-amber-400/25 hover:bg-amber-400/[0.02]",
  },
  music: {
    label: "Music & festivals",
    dot: "bg-violet-400",
    text: "text-violet-400",
    chip: "bg-violet-400/10 text-violet-200 ring-violet-400/30",
    ring: "ring-violet-400/40",
    card: "border-violet-400/15 bg-violet-400/[0.06] hover:border-violet-400/25 hover:bg-violet-400/[0.02]",
  },
  screen: {
    label: "Screen",
    dot: "bg-sky-400",
    text: "text-sky-400",
    chip: "bg-sky-400/10 text-sky-200 ring-sky-400/30",
    ring: "ring-sky-400/40",
    card: "border-sky-400/15 bg-sky-400/[0.06] hover:border-sky-400/25 hover:bg-sky-400/[0.02]",
  },
  other: {
    label: "Other",
    dot: "bg-emerald-400",
    text: "text-emerald-400",
    chip: "bg-emerald-400/10 text-emerald-200 ring-emerald-400/30",
    ring: "ring-emerald-400/40",
    card: "border-emerald-400/15 bg-emerald-400/[0.06] hover:border-emerald-400/25 hover:bg-emerald-400/[0.02]",
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

export const SOURCES = data.sources ?? [];

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

/**
 * Venue names are the only key we have — there are no ids, and they arrive with
 * stray whitespace and Turkish casing. Lowercase the two dotted/dotless i pairs
 * by hand (`toLowerCase` leaves `ı` alone and turns `İ` into i + combining dot),
 * then strip the remaining diacritics through NFD.
 */
export const venueSlug = (name: string) =>
  name
    .trim()
    .replace(/İ/g, "i")
    .toLowerCase()
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export type Venue = {
  slug: string;
  name: string;
  /** Areas seen for this venue; usually one, occasionally a vaguer duplicate. */
  areas: string[];
  events: Ev[];
  days: string[];
  source?: (typeof SOURCES)[number];
};

/**
 * Source rows are named independently of the listings ("Caddebostan Kültür
 * Merkezi" vs "Caddebostan CKM Sineması"), so an exact slug match is tried
 * first and a prefix match only as a fallback.
 */
function sourceFor(slug: string) {
  const named = SOURCES.filter((s) => s.venue);
  return (
    named.find((s) => venueSlug(s.venue!) === slug) ??
    named.find((s) => {
      const ss = venueSlug(s.venue!);
      return slug.startsWith(`${ss}-`) || ss.startsWith(`${slug}-`);
    })
  );
}

/** One entry per distinct venue, biggest first. Slug collisions get a suffix. */
export const VENUES: Venue[] = (() => {
  const byName = new Map<string, Ev[]>();
  for (const e of EVENTS) {
    const name = e.venue?.trim();
    if (!name) continue;
    const list = byName.get(name);
    if (list) list.push(e);
    else byName.set(name, [e]);
  }

  const taken = new Set<string>();
  const out: Venue[] = [];
  for (const [name, events] of [...byName].sort((a, b) => b[1].length - a[1].length)) {
    let slug = venueSlug(name) || "venue";
    for (let n = 2; taken.has(slug); n += 1) slug = `${venueSlug(name)}-${n}`;
    taken.add(slug);
    out.push({
      slug,
      name,
      areas: [...new Set(events.map((e) => e.area?.trim()).filter(Boolean) as string[])],
      events,
      days: [...new Set(events.flatMap((e) => e.days))].sort(),
      source: sourceFor(slug),
    });
  }
  return out;
})();

export const venueBySlug = (slug: string) => VENUES.find((v) => v.slug === slug);

/** Categories present in this payload, in a stable order. */
export const CATEGORIES = (Object.keys(CATEGORY_META) as Category[]).filter((c) =>
  EVENTS.some((e) => categoryOf(e.kind) === c),
);
