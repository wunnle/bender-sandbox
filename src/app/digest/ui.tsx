"use client";

/**
 * Date formatting for a payload whose timestamps are UTC instants, and the card
 * that renders one post. The card shows payload fields and nothing else.
 */

import type { Item, Media } from "./data";

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

/**
 * One post: its topic, who posted it, the post itself, its media, when. Nothing
 * is colour-coded, because the payload carries no categorisation to code —
 * `topic` is free text, one per post, and is shown as the words it is.
 */
export function Card({ item, showAuthor = true }: { item: Item; showAuthor?: boolean }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="group mb-4 flex break-inside-avoid flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/25 hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
    >
      <p className="text-xs uppercase tracking-wider text-neutral-500">{item.topic}</p>

      {showAuthor && (
        <p className="mt-3 flex flex-wrap items-baseline gap-x-2 text-[15px]">
          <span className="font-semibold text-white">{item.name}</span>
          <span className="font-mono text-xs text-neutral-500">@{item.handle}</span>
        </p>
      )}

      {/* The post as written. `whitespace-pre-line` because twelve of these
          carry their own line breaks — lists and prompts that collapse into
          mush without them. */}
      <p
        className={`whitespace-pre-line break-words text-[17px] leading-relaxed text-neutral-50 ${
          showAuthor ? "mt-2" : "mt-3"
        }`}
      >
        {item.text}
      </p>

      <MediaBlock media={item.media} />

      <p className="mt-auto flex items-center gap-1.5 pt-5 text-xs text-neutral-500 group-hover:text-neutral-300">
        <span className="font-mono">{timeLabel(item.publishedAt)}</span>
        <span aria-hidden>·</span>
        <span className="underline-offset-4 group-hover:underline">Read on X</span>
        <ArrowIcon />
      </p>
    </a>
  );
}
