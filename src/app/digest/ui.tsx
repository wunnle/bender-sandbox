"use client";

/**
 * The pieces shared by the feed view and the by-author view: date formatting
 * for a payload whose timestamps are UTC instants (not calendar days), and the
 * card that renders one post.
 */

import { CATEGORY_META, type Category, type Item } from "./data";
import { CATEGORY_ICON } from "./icons";

/** "Wed, 23 Sep" — composed by hand because en-GB renders "Wed 23 Sept", no comma. */
export const longDay = (iso: string) => {
  const d = new Date(`${iso}T12:00:00Z`);
  const weekday = d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
  const month = d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  return `${weekday}, ${d.getUTCDate()} ${month}`;
};

/** "23 – 24 September 2026", collapsing the month when both ends share one. */
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

/** "04:57 UTC" — the payload derives these from status IDs, so keep them exact. */
export const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });

export function Icon({ cat, className = "h-4 w-4" }: { cat: Category; className?: string }) {
  const Glyph = CATEGORY_ICON[cat];
  return <Glyph className={`shrink-0 ${className}`} />;
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
 * One post. `summary` is what they said; `signal` is why it earned a place —
 * the two are visually separated because the second is the scraper's judgement,
 * not the author's words, and conflating them would misattribute opinion.
 */
export function Card({ group, showAuthor = true }: { group: Item; showAuthor?: boolean }) {
  const meta = CATEGORY_META[group.category];
  return (
    <a
      href={group.url}
      target="_blank"
      rel="noreferrer"
      className={`group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/25 hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 ${meta.ring}`}
    >
      <div className="flex items-center gap-2 text-xs">
        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium ring-1 ring-inset ${meta.chip}`}
        >
          <Icon cat={group.category} className="h-3.5 w-3.5" />
          {meta.label}
        </span>
        <span className="truncate text-neutral-500">{group.topic}</span>
      </div>

      {showAuthor && (
        <p className="mt-4 flex flex-wrap items-baseline gap-x-2 text-[15px]">
          <span className="font-semibold text-white">{group.name}</span>
          <span className="font-mono text-xs text-neutral-500">@{group.handle}</span>
        </p>
      )}

      <p
        className={`text-[17px] leading-relaxed text-neutral-100 ${showAuthor ? "mt-2" : "mt-4"}`}
      >
        {group.summary}
      </p>

      <p className="mt-3 border-l-2 border-white/10 pl-3 text-[15px] leading-relaxed text-neutral-400">
        {group.signal}
      </p>

      <p className="mt-4 flex items-center gap-1.5 pt-1 text-xs text-neutral-500 group-hover:text-neutral-300">
        <span className="font-mono">{timeLabel(group.publishedAt)} UTC</span>
        <span aria-hidden>·</span>
        <span className="underline-offset-4 group-hover:underline">Read on X</span>
        <ArrowIcon />
      </p>
    </a>
  );
}
