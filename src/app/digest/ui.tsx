"use client";

/**
 * Date formatting for a payload whose timestamps are UTC instants, and the card
 * that renders one post. The card shows payload fields and nothing else.
 */

import { useCallback, useEffect, useState } from "react";
import type { Item, Media, Quote } from "./data";

const READ_KEY = "digest:read";

/**
 * Which posts have been marked read, persisted across visits. Keyed by post URL
 * rather than by index, so a refreshed payload keeps the marks on the posts that
 * survive it and doesn't transfer them to unrelated new ones.
 *
 * Starts empty and fills after mount: the server has no localStorage, and
 * seeding from it during render would mismatch hydration.
 */
export function useRead() {
  const [read, setRead] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(READ_KEY);
      if (raw) setRead(new Set(JSON.parse(raw) as string[]));
    } catch {
      // A corrupt or blocked store just means nothing is marked read.
    }
  }, []);

  const persist = (next: Set<string>) => {
    try {
      localStorage.setItem(READ_KEY, JSON.stringify([...next]));
    } catch {
      // Private mode and full quotas shouldn't break the toggle.
    }
    return next;
  };

  const toggle = useCallback((url: string) => {
    setRead((prev) => {
      const next = new Set(prev);
      if (!next.delete(url)) next.add(url);
      return persist(next);
    });
  }, []);

  const clear = useCallback(() => setRead(persist(new Set())), []);

  return { read, toggle, clear };
}

/** "Wed, 23 Sep" — composed by hand because en-GB renders "Wed 23 Sept", no comma. */
export const longDay = (iso: string) => {
  const d = new Date(`${iso}T12:00:00Z`);
  const weekday = d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
  const month = d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  return `${weekday}, ${d.getUTCDate()} ${month}`;
};

/** "22 – 24 September 2026", collapsing the month when both ends share one. */
export const rangeLabel = (startIso: string, endIso: string) => {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", timeZone: "UTC" };
  const left =
    s.getUTCMonth() === e.getUTCMonth()
      ? s.toLocaleDateString("en-GB", { day: "numeric", timeZone: "UTC" })
      : s.toLocaleDateString("en-GB", opts);
  return `${left} – ${e.toLocaleDateString("en-GB", { ...opts, year: "numeric" })}`;
};

/**
 * "23 Sep" from a full instant — the per-card date, now that headings are gone.
 * en-US for the month: en-GB renders September as "Sept", which reads as a typo
 * next to every other three-letter month.
 */
export const shortDay = (iso: string) => {
  const d = new Date(iso);
  const month = d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  return `${d.getUTCDate()} ${month}`;
};

/** "04:57" — the payload derives these from status IDs, so keep them exact. */
export const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });

export const stamp = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });

/** 200.133 → "3:20". Videos carry a float duration in seconds. */
const clock = (s: number) => {
  const total = Math.round(s);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

function PlayIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </svg>
  );
}

/**
 * Photos hotlink `pbs.twimg.com` and videos show their poster frame rather than
 * an embedded player — the card already links to the post, which is where a
 * video can actually be played. Plain `img`: the payload's hosts aren't in
 * next.config's remote patterns, and every URL arrives pre-sized anyway.
 */
function Shot({
  m,
  className = "",
  style,
}: {
  m: Media;
  className?: string;
  style?: React.CSSProperties;
}) {
  const src = m.type === "video" ? m.thumbnail_url : m.url;
  if (!src) return null;
  return (
    <span
      className={`relative block overflow-hidden rounded-xl bg-white/5 ${className}`}
      style={style}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        loading="lazy"
        width={m.width}
        height={m.height}
        className="h-full w-full object-cover"
      />
      {m.type === "video" && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/25">
          <span className="flex items-center gap-1.5 rounded-full bg-black/70 py-1.5 pl-2.5 pr-3 text-xs font-medium text-white">
            <PlayIcon className="h-3.5 w-3.5" />
            {m.duration ? clock(m.duration) : "Video"}
          </span>
        </span>
      )}
    </span>
  );
}

/** One photo runs full width at its own ratio; several tile two-up. */
function MediaBlock({ media }: { media: Media[] }) {
  if (media.length === 0) return null;
  if (media.length === 1) {
    const m = media[0];
    // Reserving the ratio up front stops the column reflowing as photos load.
    // Tall portraits are capped so one screenshot can't own the whole column.
    return (
      <Shot
        m={m}
        className="mt-3 max-h-[30rem] w-full"
        style={{ aspectRatio: `${m.width} / ${m.height}` }}
      />
    );
  }
  return (
    <span className="mt-3 grid grid-cols-2 gap-2">
      {media.map((m) => (
        <Shot key={m.url} m={m} className="aspect-[4/3]" />
      ))}
    </span>
  );
}

/**
 * The post this one quotes. Inset rather than linked: the card is already an
 * `<a>` to the parent post, and an anchor can't contain another. Six of the
 * twenty-two are quote tweets, and in several the quoted post is the substance
 * — "my kind of slop" means nothing without the thing being called slop.
 */
function QuoteBlock({ quote }: { quote: Quote }) {
  return (
    <span className="mt-3 block rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <span className="flex flex-wrap items-baseline gap-x-2 text-sm">
        <span className="font-semibold text-neutral-200">{quote.author.name}</span>
        <span className="font-mono text-xs text-neutral-500">@{quote.author.handle}</span>
      </span>
      <span className="mt-1.5 block whitespace-pre-line break-words text-[15px] leading-relaxed text-neutral-300">
        {quote.text}
      </span>
      <MediaBlock media={quote.media} />
    </span>
  );
}

function ArrowIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M6 14 14 6M7.5 6H14v6.5" />
    </svg>
  );
}

function CheckIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="m4 10.5 4 4 8-9" />
    </svg>
  );
}

/**
 * One post: its topic, who posted it, the post itself, its media, when. Nothing
 * is colour-coded, because the payload carries no categorisation to code —
 * `topic` is free text, one per post, and is shown as the words it is.
 *
 * A `div`, not an `<a>`: the read toggle is a button, and an anchor can't
 * contain one. "Read on X" is an explicit link in the footer instead.
 */
export function Card({
  item,
  showAuthor = true,
  read = false,
  onToggleRead,
}: {
  item: Item;
  showAuthor?: boolean;
  read?: boolean;
  onToggleRead?: (url: string) => void;
}) {
  return (
    <div
      className={`mb-4 flex break-inside-avoid flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition duration-300 hover:border-white/25 ${
        // Read posts recede but stay legible, and come back on hover so a
        // mis-click isn't a dead end.
        read ? "opacity-35 hover:opacity-100" : ""
      }`}
    >
      <p className="text-xs uppercase tracking-wider text-neutral-500">{item.topic}</p>

      {showAuthor && (
        <p className="mt-3 flex flex-wrap items-baseline gap-x-2 text-sm">
          <span className="font-semibold text-white">{item.name}</span>
          <span className="font-mono text-xs text-neutral-500">@{item.handle}</span>
        </p>
      )}

      {/* The post as written. `whitespace-pre-line` because twelve of these
          carry their own line breaks — lists and prompts that collapse into
          mush without them. */}
      <p
        className={`whitespace-pre-line break-words text-[15px] leading-relaxed text-neutral-100 ${
          showAuthor ? "mt-2" : "mt-3"
        }`}
      >
        {item.text}
      </p>

      <MediaBlock media={item.media} />

      {item.quote && <QuoteBlock quote={item.quote} />}

      {/* Day and time both live here now that the day headings are gone. */}
      <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs text-neutral-500">
        <span className="font-mono">
          {shortDay(item.publishedAt)} {timeLabel(item.publishedAt)}
        </span>

        <span className="flex items-center gap-3">
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 underline-offset-4 transition hover:text-neutral-200 hover:underline"
          >
            Read on X
            <ArrowIcon />
          </a>
          {onToggleRead && (
            <button
              onClick={() => onToggleRead(item.url)}
              aria-pressed={read}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 ring-1 ring-inset transition ${
                read
                  ? "bg-white/10 text-neutral-300 ring-white/20"
                  : "text-neutral-400 ring-white/10 hover:text-white hover:ring-white/30"
              }`}
            >
              <CheckIcon />
              {read ? "Read" : "Mark read"}
            </button>
          )}
        </span>
      </div>
    </div>
  );
}
