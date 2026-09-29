"use client";

import Image from "next/image";
import { useMemo, useState, useSyncExternalStore } from "react";
import { COVERS } from "./covers";
import { GAMES, boothMap, splitBooth, type Game, type Kind, type Tag } from "./games";

const STORAGE_KEY = "spiel-games:starred";

// Starred titles live in localStorage; this store keeps every tab in sync.
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}
function readStarred() {
  return localStorage.getItem(STORAGE_KEY) ?? "[]";
}
function parseStarred(raw: string): string[] {
  try {
    const saved = JSON.parse(raw);
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}
const KINDS: ("All" | Kind)[] = ["All", "New", "Expansion", "Spin-off"];
const TAGS: Tag[] = ["Strategy", "Co-op", "Two-player", "Narrative"];
const HALLS = [...new Set(GAMES.flatMap((g) => g.booths?.map((b) => splitBooth(b).hall) ?? []))].sort(
  (a, b) => Number(a) - Number(b),
);

/** Games with no booth sort last; otherwise by their first booth, which reads as a walking order. */
function boothOrder(a: Game, b: Game) {
  const ka = a.booths?.[0] ?? "~";
  const kb = b.booths?.[0] ?? "~";
  return ka.localeCompare(kb, "en", { numeric: true });
}

function BoothLine({ game }: { game: Game }) {
  if (!game.booths?.length) {
    return <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">Booth not announced yet</p>;
  }
  return (
    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
      {game.booths.map((id, i) => {
        const { hall, stand } = splitBooth(id);
        return (
          <span key={id}>
            {i > 0 ? ", " : null}
            <a
              href={boothMap(id)}
              target="_blank"
              rel="noreferrer"
              className="font-semibold tabular-nums text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900 dark:text-neutral-100 dark:decoration-neutral-600 dark:hover:decoration-neutral-100"
            >
              {i === 0 || splitBooth(game.booths![i - 1]).hall !== hall ? `Hall ${hall} · ` : ""}
              {stand}
            </a>
          </span>
        );
      })}
      {game.at ? <span className="text-neutral-500 dark:text-neutral-400"> · at {game.at}</span> : null}
      {game.boothFrom === "publisher" ? (
        <span className="block text-neutral-400 dark:text-neutral-500">
          Publisher&apos;s booth — this game isn&apos;t in the official novelties list yet
        </span>
      ) : null}
    </p>
  );
}

function bggSearch(game: Game) {
  const q = encodeURIComponent(game.en ?? game.title);
  return `https://boardgamegeek.com/geeksearch.php?action=search&objecttype=boardgame&q=${q}`;
}

function chip(active: boolean) {
  return `rounded-md border px-2.5 py-1 text-sm font-medium transition-colors ${
    active
      ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
      : "border-black/10 text-neutral-600 hover:border-black/25 dark:border-white/15 dark:text-neutral-300 dark:hover:border-white/30"
  }`;
}

function GameRow({ game, starred, onStar }: { game: Game; starred: boolean; onStar: () => void }) {
  const meta = [game.publisher, game.designers].filter(Boolean).join(" · ");
  return (
    <li className="flex gap-4 border-b border-black/5 py-4 dark:border-white/10">
      <Cover game={game} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <a
            href={bggSearch(game)}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-100"
          >
            {game.title}
          </a>
          {game.en ? <span className="text-sm text-neutral-500 dark:text-neutral-400">{game.en}</span> : null}
        </div>
        {meta ? <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{meta}</p> : null}
        <BoothLine game={game} />
        {game.blurb ? (
          <p className="mt-1.5 leading-relaxed text-neutral-600 dark:text-neutral-300">{game.blurb}</p>
        ) : null}
        <div className="mt-2 flex flex-wrap gap-1.5 text-xs font-semibold">
          {game.buzz ? (
            <span className="rounded bg-rose-500/15 px-1.5 py-0.5 text-rose-700 dark:text-rose-300">Buzz</span>
          ) : null}
          <span
            className={`rounded px-1.5 py-0.5 ${
              game.kind === "New"
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : "bg-sky-500/15 text-sky-700 dark:text-sky-300"
            }`}
          >
            {game.kind}
          </span>
          {game.tags?.map((t) => (
            <span key={t} className="rounded bg-neutral-500/15 px-1.5 py-0.5 text-neutral-700 dark:text-neutral-300">
              {t}
            </span>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={onStar}
        aria-label={starred ? `Unstar ${game.title}` : `Star ${game.title}`}
        aria-pressed={starred}
        className={`-mr-1 h-8 w-8 shrink-0 rounded-md text-xl leading-none transition-colors ${
          starred
            ? "bg-amber-500/15 text-amber-500"
            : "text-neutral-300 hover:text-neutral-500 dark:text-neutral-600 dark:hover:text-neutral-400"
        }`}
      >
        {starred ? "★" : "☆"}
      </button>
    </li>
  );
}

function Cover({ game }: { game: Game }) {
  const src = COVERS[game.title];
  const box = "h-24 w-[4.5rem] shrink-0 rounded-md bg-black/[0.04] dark:bg-white/[0.06]";
  if (!src) {
    return (
      <div aria-hidden className={`${box} flex items-center justify-center text-2xl font-semibold text-neutral-300 dark:text-neutral-600`}>
        {game.title[0]}
      </div>
    );
  }
  return (
    <a href={bggSearch(game)} target="_blank" rel="noreferrer" className={`${box} overflow-hidden`}>
      <Image src={src} alt={`${game.title} box`} width={72} height={96} className="h-full w-full object-contain" />
    </a>
  );
}

export function GameList() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"All" | Kind>("All");
  const [tags, setTags] = useState<Tag[]>([]);
  const [buzzOnly, setBuzzOnly] = useState(false);
  const [starredOnly, setStarredOnly] = useState(false);
  const [hall, setHall] = useState<string | null>(null);
  const [byBooth, setByBooth] = useState(false);
  const starredRaw = useSyncExternalStore(subscribe, readStarred, () => "[]");
  const starred = useMemo(() => parseStarred(starredRaw), [starredRaw]);

  function toggleStar(title: string) {
    const next = starred.includes(title) ? starred.filter((t) => t !== title) : [...starred, title];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    listeners.forEach((l) => l());
  }

  function toggleTag(tag: Tag) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = GAMES.filter((g) => {
      if (kind !== "All" && g.kind !== kind) return false;
      if (buzzOnly && !g.buzz) return false;
      if (starredOnly && !starred.includes(g.title)) return false;
      if (tags.some((t) => !g.tags?.includes(t))) return false;
      if (hall && !g.booths?.some((b) => splitBooth(b).hall === hall)) return false;
      if (!q) return true;
      const booths = g.booths?.map((b) => splitBooth(b).stand).join(" ");
      return [g.title, g.en, g.publisher, g.designers, g.blurb, g.at, booths].some((f) =>
        f?.toLowerCase().includes(q),
      );
    });
    return byBooth ? matches.sort(boothOrder) : matches;
  }, [query, kind, tags, buzzOnly, starredOnly, starred, hall, byBooth]);

  return (
    <section>
      <div className="space-y-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, publisher, booth…"
          className="w-full rounded-lg border border-black/10 bg-transparent px-3.5 py-2.5 text-base outline-none placeholder:text-neutral-400 focus:border-black/30 dark:border-white/15 dark:focus:border-white/35"
        />
        <div className="flex flex-wrap gap-1.5">
          {KINDS.map((k) => (
            <button key={k} type="button" onClick={() => setKind(k)} className={chip(kind === k)}>
              {k}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => setBuzzOnly((v) => !v)} className={chip(buzzOnly)}>
            Buzz
          </button>
          <button type="button" onClick={() => setStarredOnly((v) => !v)} className={chip(starredOnly)}>
            ★ Starred{starred.length ? ` (${starred.length})` : ""}
          </button>
          {TAGS.map((t) => (
            <button key={t} type="button" onClick={() => toggleTag(t)} className={chip(tags.includes(t))}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => setHall(null)} className={chip(hall === null)}>
            All halls
          </button>
          {HALLS.map((h) => (
            <button key={h} type="button" onClick={() => setHall(h)} className={chip(hall === h)}>
              Hall {h}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-baseline justify-between gap-4 text-sm text-neutral-500 dark:text-neutral-400">
        <p>
          {shown.length} of {GAMES.length} games
        </p>
        <button
          type="button"
          onClick={() => setByBooth((v) => !v)}
          className="font-medium text-neutral-700 underline-offset-4 hover:underline dark:text-neutral-300"
        >
          {byBooth ? "Sorted by booth" : "Sort by booth"}
        </button>
      </div>

      {shown.length ? (
        <ul className="mt-1">
          {shown.map((g) => (
            <GameRow key={g.title} game={g} starred={starred.includes(g.title)} onStar={() => toggleStar(g.title)} />
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-lg bg-black/[0.03] p-4 text-neutral-500 dark:bg-white/[0.05] dark:text-neutral-400">
          {starredOnly && !starred.length ? "Nothing starred yet — tap ☆ on a game to add it." : "No games match those filters."}
        </p>
      )}
    </section>
  );
}
