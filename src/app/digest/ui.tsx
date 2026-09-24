"use client";

/**
 * Date formatting for a payload whose timestamps are UTC instants, and the card
 * that renders one post. The card shows payload fields and nothing else.
 */

import type { Item } from "./data";

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
 * One post: its topic, who posted it, the summary, when. Nothing is colour-coded,
 * because the payload carries no categorisation to code — `topic` is free text,
 * one per post, and is shown as the words it is.
 */
export function Card({ item, showAuthor = true }: { item: Item; showAuthor?: boolean }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/25 hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
    >
      <p className="text-xs uppercase tracking-wider text-neutral-500">{item.topic}</p>

      {showAuthor && (
        <p className="mt-3 flex flex-wrap items-baseline gap-x-2 text-[15px]">
          <span className="font-semibold text-white">{item.name}</span>
          <span className="font-mono text-xs text-neutral-500">@{item.handle}</span>
        </p>
      )}

      {/* The post itself carries the card — one step larger than the metadata
          around it, and the only thing competing for attention. */}
      <p className={`text-[19px] leading-relaxed text-neutral-50 ${showAuthor ? "mt-2" : "mt-3"}`}>
        {item.summary}
      </p>

      <p className="mt-auto flex items-center gap-1.5 pt-5 text-xs text-neutral-500 group-hover:text-neutral-300">
        <span className="font-mono">{timeLabel(item.publishedAt)}</span>
        <span aria-hidden>·</span>
        <span className="underline-offset-4 group-hover:underline">Read on X</span>
        <ArrowIcon />
      </p>
    </a>
  );
}
