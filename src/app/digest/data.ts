import payload from "../../../digest-data.json";

/**
 * Everything on this page comes out of digest-data.json at the repo root — the
 * single file the scraper overwrites. This module reshapes that payload and
 * adds nothing to it: no categories, no labels, no editorial. Every string the
 * page renders is either a payload value or structural chrome (a column
 * heading, a link). Drop in a fresh payload and the page follows.
 */

export type Item = {
  handle: string;
  name: string;
  publishedAt: string;
  /** UTC calendar day, `YYYY-MM-DD`. The payload states its window in UTC. */
  day: string;
  url: string;
  topic: string;
  summary: string;
};

export type Author = {
  handle: string;
  name: string;
  items: Item[];
  /** Why an account contributed nothing. An empty account is a result. */
  note?: string;
};

type RawItem = {
  published_at: string;
  url: string;
  topic: string;
  summary: string;
};

type Payload = {
  generated_at: string;
  window: { start: string; end: string; timezone: string; duration_hours: number };
  scope: { accounts: string[]; filter: string; source: string; note?: string };
  digest: { handle: string; name: string; items: RawItem[]; note?: string }[];
};

const raw = payload as Payload;

const entries = new Map(raw.digest.map((a) => [a.handle, a]));

/**
 * Ordered by `scope.accounts` — the list the scraper was asked to check — so an
 * account it was given but returned no entry for is still a visible row rather
 * than a silent omission. Any entry not in that list is appended.
 */
const handles = [
  ...raw.scope.accounts.filter((h) => entries.has(h)),
  ...raw.digest.map((a) => a.handle).filter((h) => !raw.scope.accounts.includes(h)),
];

export const AUTHORS: Author[] = handles.map((h) => {
  const a = entries.get(h)!;
  return {
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
    })),
  };
});

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
