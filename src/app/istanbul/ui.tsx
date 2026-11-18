"use client";

/**
 * The pieces shared by the day view and the per-venue view: date formatting,
 * the payload's small awkwardnesses (ISO durations, comma-joined times,
 * full-resolution posters) and the tile/dialog pair that renders one title.
 */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  CATEGORY_META,
  categoryOf,
  imdbThumb,
  META,
  showOf,
  venueSlug,
  type Category,
  type Ev,
  type Show,
} from "./data";
import { CATEGORY_ICON } from "./icons";

export function fmt(iso: string, opts: Intl.DateTimeFormatOptions) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", opts);
}

/** "Wed, 9 Sep" — composed by hand because en-GB renders "Wed 9 Sept", no comma. */
export const longDay = (iso: string) => {
  const d = new Date(`${iso}T12:00:00`);
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  const month = d.toLocaleDateString("en-US", { month: "short" });
  return `${weekday}, ${d.getDate()} ${month}`;
};


/** "8 – 14 September 2026", collapsing the month/year when both ends share one. */
export const rangeLabel = (start: string, end: string) => {
  const sameMonth = start.slice(0, 7) === end.slice(0, 7);
  const left = sameMonth
    ? fmt(start, { day: "numeric" })
    : fmt(start, { day: "numeric", month: "long" });
  return `${left} – ${fmt(end, { day: "numeric", month: "long", year: "numeric" })}`;
};


export function Icon({ cat, className = "h-4 w-4" }: { cat: Category; className?: string }) {
  const Glyph = CATEGORY_ICON[cat];
  return <Glyph className={`shrink-0 ${className}`} />;
}


function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ClockIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={className}
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="7.2" />
      <path d="M10 6v4.3l2.8 1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronIcon({ dir, className = "h-4 w-4" }: { dir: -1 | 1; className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path
        d={dir === 1 ? "m8 5 5 5-5 5" : "m12 5-5 5 5 5"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** "price unavailable" is the payload saying it doesn't know — not a price to print. */
export const realPrice = (p?: string) =>
  p && !/unavailable|unknown|n\/a/i.test(p) ? p : undefined;

/** `times` supersedes `time`; `time` may itself be a comma-joined list. */
export const sessionTimes = (e: Ev) =>
  e.times?.length ? e.times : e.time ? e.time.split(",").map((t) => t.trim()) : [];

/** The date never changes mid-session in practice, so nothing to subscribe to. */
const subscribeNever = () => () => {};

/** Today in Istanbul, regardless of where the browser is. */
const todayInPayloadZone = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: META.timezone ?? "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

/**
 * Client-only: these pages are statically built, so the build date must never be
 * baked in. The server snapshot is null, so prerendered HTML shows every day and
 * hydration then drops the ones already gone.
 */
export const useToday = () =>
  useSyncExternalStore(subscribeNever, todayInPayloadZone, () => null);

/** Options for one title on one day — usually a single venue, sometimes several. */
export type Group = Ev[];

/**
 * Bucket events by day and collapse each title into one tile, since the same
 * film plays several cinemas on the same evening. Booked first, then
 * best-reviewed, then earliest — time only breaks ties.
 */
export function groupByDay(events: Ev[], days: string[]): Map<string, Group[]> {
  const raw = new Map<string, Ev[]>(days.map((d) => [d, []]));
  for (const e of events) for (const d of e.days) raw.get(d)?.push(e);

  const first = (g: Group) => sessionTimes(g[0])[0] ?? "99:99";
  const booked = (g: Group) => g.some((o) => o.owned);

  const out = new Map<string, Group[]>();
  for (const [day, list] of raw) {
    const byTitle = new Map<string, Group>();
    for (const e of list) {
      const key = e.title.trim().toLowerCase();
      const group = byTitle.get(key);
      if (group) group.push(e);
      else byTitle.set(key, [e]);
    }

    const groups = [...byTitle.values()];
    // Within a group, a booked venue leads, then the earliest session.
    for (const g of groups)
      g.sort(
        (a, b) =>
          Number(!!b.owned) - Number(!!a.owned) ||
          (sessionTimes(a)[0] ?? "99:99").localeCompare(sessionTimes(b)[0] ?? "99:99"),
      );
    groups.sort(
      (a, b) =>
        Number(booked(b)) - Number(booked(a)) ||
        score(b[0]) - score(a[0]) ||
        first(a).localeCompare(first(b)),
    );
    out.set(day, groups);
  }
  return out;
}

/**
 * A 0–1 score for ranking. IMDb is out of 10 and the local rating out of 5, so
 * both are normalised before comparing. Unscored events sort last.
 */
export function score(e: Ev): number {
  const imdb = e.imdbRating ? Number.parseFloat(e.imdbRating) : NaN;
  if (Number.isFinite(imdb)) return imdb / 10;
  const local = e.rating ? Number.parseFloat(e.rating) : NaN;
  if (Number.isFinite(local)) return local / 5;
  return -1;
}

/** "PT1H30M00S" → "1h 30m". Returns undefined for anything unparseable. */
export function humanDuration(iso?: string) {
  if (!iso) return undefined;
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?/.exec(iso);
  if (!m || (!m[1] && !m[2])) return undefined;
  const h = Number(m[1] ?? 0);
  const min = Number(m[2] ?? 0);
  return [h ? `${h}h` : null, min ? `${min}m` : null].filter(Boolean).join(" ");
}

const nf = new Intl.NumberFormat("en-US");

function StarIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M10 1.8l2.5 5.1 5.6.8-4 3.9 1 5.6-5-2.6-5 2.6 1-5.6-4-3.9 5.6-.8L10 1.8Z" />
    </svg>
  );
}

/** The IMDb score, linking out to the title's page. */
function ImdbBlock({ e }: { e: Ev }) {
  if (!e.imdbRating) return null;
  const body = (
    <>
      <span className="rounded bg-[#f5c518] px-1.5 py-0.5 text-[11px] font-bold tracking-tight text-black">
        IMDb
      </span>
      <StarIcon className="h-4 w-4 text-[#f5c518]" />
      <span className="font-semibold text-white">{e.imdbRating}</span>
      <span className="text-neutral-500">/10</span>
      {e.imdbVotes ? (
        <span className="text-neutral-500">· {nf.format(e.imdbVotes)} votes</span>
      ) : null}
    </>
  );
  const cls = "inline-flex items-center gap-1.5 text-sm";
  return e.imdbUrl ? (
    <a
      href={e.imdbUrl}
      target="_blank"
      rel="noreferrer"
      className={`${cls} rounded transition hover:opacity-80`}
    >
      {body}
    </a>
  ) : (
    <span className={cls}>{body}</span>
  );
}

/** Synopsis clamped to three lines, expandable — some run to 1,300 characters. */
function Synopsis({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4">
      <p className={`text-sm leading-relaxed text-neutral-300 ${open ? "" : "line-clamp-3"}`}>
        {text}
      </p>
      {text.length > 180 && (
        <button
          onClick={() => setOpen((v) => !v)}
          className="mt-1 text-xs text-neutral-400 underline underline-offset-4 hover:text-white"
        >
          {open ? "less" : "more"}
        </button>
      )}
    </div>
  );
}

export const posterOf = (e: Ev) => (e.imdbImage ? imdbThumb(e.imdbImage) : e.image);

/** Listings for one day, booked first, then earliest session. */
export const listingsOn = (show: Show, day: string) =>
  show.listings
    .filter((e) => e.days.includes(day))
    .sort(
      (a, b) =>
        Number(!!b.owned) - Number(!!a.owned) ||
        (sessionTimes(a)[0] ?? "99:99").localeCompare(sessionTimes(b)[0] ?? "99:99"),
    );

/**
 * Native share sheet where there is one (phones, Safari), clipboard otherwise.
 * Returns the label to show on the button so the user sees it worked.
 */
export function useShare(path: string, title: string) {
  const [state, setState] = useState<"idle" | "copied">("idle");
  const share = async () => {
    const url = new URL(path, window.location.origin).toString();
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (err) {
        // The user dismissing the sheet is not a failure worth a fallback.
        if ((err as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
      setTimeout(() => setState("idle"), 1800);
    } catch {
      window.prompt("Copy this link", url);
    }
  };
  return { share, label: state === "copied" ? "Link copied" : "Share" };
}

function ShareIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
      <path d="M10 2.5v10M6.5 6 10 2.5 13.5 6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 9H5a1.5 1.5 0 0 0-1.5 1.5v5A1.5 1.5 0 0 0 5 17h10a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 15 9h-1" strokeLinecap="round" />
    </svg>
  );
}

function ExternalIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M8 4H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3M11 4h5v5M16 4l-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
      <path d="M10 17.5s5.5-5 5.5-9.5a5.5 5.5 0 1 0-11 0c0 4.5 5.5 9.5 5.5 9.5Z" strokeLinejoin="round" />
      <circle cx="10" cy="8" r="2" />
    </svg>
  );
}

const pill =
  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition";

/** Poster, title, facts and actions — the top of both the dialog and the page. */
function Hero({
  show,
  e,
  onClose,
  inDialog,
}: {
  show: Show;
  e: Ev;
  onClose?: () => void;
  inDialog: boolean;
}) {
  const cat = categoryOf(e.kind);
  const meta = CATEGORY_META[cat];
  const poster = posterOf(e);
  const href = `/istanbul/event/${show.slug}`;
  const { share, label } = useShare(href, `${show.title} — ${META.city}`);
  const ticket = show.listings.find((o) => o.owned && o.url) ?? show.listings.find((o) => o.url);
  const facts = [
    e.imdbYear ? String(e.imdbYear) : null,
    e.genre,
    humanDuration(e.duration),
    e.ageLimit,
  ].filter(Boolean) as string[];
  const original =
    e.sourceTitle && e.sourceTitle.trim().toLowerCase() !== show.title.toLowerCase()
      ? e.sourceTitle
      : undefined;

  return (
    <div
      className={`relative overflow-hidden ${
        inDialog ? "" : "rounded-3xl bg-neutral-900 ring-1 ring-inset ring-white/10"
      }`}
    >
      {/* The poster, blown up and blurred, tints the header to match the title */}
      {poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-125 object-cover opacity-35 blur-3xl"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/30 via-neutral-900/70 to-neutral-900" />

      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close"
          autoFocus
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-neutral-300 ring-1 ring-white/15 backdrop-blur transition hover:bg-black/60 hover:text-white"
        >
          ✕
        </button>
      )}

      <div className={`relative flex gap-5 ${inDialog ? "p-5 pt-6 sm:p-7" : "p-5 sm:p-8"}`}>
        <div
          className={`shrink-0 overflow-hidden rounded-2xl bg-white/5 shadow-2xl shadow-black/60 ring-1 ring-white/15 ${
            inDialog ? "w-28 sm:w-36" : "w-36 sm:w-56"
          } aspect-[2/3]`}
        >
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/[0.1] to-white/[0.02]">
              <Icon cat={cat} className={`h-12 w-12 opacity-50 ${meta.text}`} />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-end pr-8 sm:pr-0">
          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${meta.chip}`}
          >
            <Icon cat={cat} className="h-3.5 w-3.5" />
            {e.kind}
          </span>
          <h2
            className={`mt-2 font-semibold leading-[1.1] tracking-tight text-white ${
              inDialog ? "text-2xl sm:text-3xl" : "text-3xl sm:text-5xl"
            }`}
          >
            {show.title}
          </h2>
          {original && <p className="mt-1 text-sm italic text-neutral-400">{original}</p>}
          {facts.length > 0 && (
            <p className="mt-2 text-sm text-neutral-300">{facts.join("  ·  ")}</p>
          )}
          {e.imdbRating && (
            <div className="mt-2">
              <ImdbBlock e={e} />
            </div>
          )}
        </div>
      </div>

      {/* Actions: the one thing you came for first, then sharing */}
      <div className={`relative flex flex-wrap gap-2 ${inDialog ? "px-5 pb-5 sm:px-7" : "px-5 pb-5 sm:px-8 sm:pb-8"}`}>
        {ticket?.url && (
          <a
            href={ticket.url}
            target="_blank"
            rel="noreferrer"
            className={`${pill} bg-white text-neutral-950 hover:bg-neutral-200`}
          >
            {ticket.owned ? "Your tickets" : "Get tickets"}
            <ExternalIcon />
          </a>
        )}
        <button
          onClick={share}
          className={`${pill} bg-white/10 text-white ring-1 ring-inset ring-white/15 hover:bg-white/15`}
        >
          <ShareIcon />
          {label}
        </button>
        {e.trailer && (
          <a
            href={e.trailer}
            target="_blank"
            rel="noreferrer"
            className={`${pill} text-neutral-300 ring-1 ring-inset ring-white/15 hover:bg-white/5 hover:text-white`}
          >
            ▶ Trailer
          </a>
        )}
        {inDialog && (
          <Link
            href={href}
            // The URL already says this page; swap the dialog's entry for the real one.
            replace
            className={`${pill} text-neutral-400 hover:text-white`}
          >
            Open page →
          </Link>
        )}
      </div>
    </div>
  );
}

/** Synopsis and credits. */
function About({ e }: { e: Ev }) {
  const cast = (e.cast ?? []).map((c) => c.replace(/\s+/g, " ").trim()).filter(Boolean);
  if (!e.description && !e.director && cast.length === 0) return null;
  return (
    <section>
      {e.description && <Synopsis text={e.description} />}
      {(e.director || cast.length > 0) && (
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-5">
          {e.director && (
            <>
              <dt className="text-xs uppercase tracking-wider text-neutral-500 sm:pt-0.5">
                Director
              </dt>
              <dd className="-mt-2 text-neutral-200 sm:mt-0">{e.director.replace(/\s+/g, " ")}</dd>
            </>
          )}
          {cast.length > 0 && (
            <>
              <dt className="text-xs uppercase tracking-wider text-neutral-500 sm:pt-1.5">Cast</dt>
              <dd className="-mt-2 flex flex-wrap gap-1.5 sm:mt-0">
                {cast.slice(0, 8).map((c) => (
                  <span key={c} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-neutral-300">
                    {c}
                  </span>
                ))}
              </dd>
            </>
          )}
        </dl>
      )}
    </section>
  );
}

/** One venue on one day: where, when, how, and the ticket link. */
function VenueCard({ o, atVenue, replace }: { o: Ev; atVenue?: string; replace?: boolean }) {
  const times = sessionTimes(o);
  const price = realPrice(o.price);
  const slug = venueSlug(o.venue ?? "");
  const unavailable = o.availability && !/^(available|listed)$/.test(o.availability);
  return (
    <li
      className={`rounded-2xl p-4 ${
        o.owned ? "bg-emerald-400/10 ring-1 ring-inset ring-emerald-400/40" : "bg-white/[0.04] ring-1 ring-inset ring-white/[0.06]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-white">{o.venue}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
            {o.area && (
              <>
                <PinIcon />
                {o.area}
              </>
            )}
            {slug && slug !== atVenue && (
              <Link
                href={`/istanbul/venue/${slug}`}
                replace={replace}
                className="ml-1 underline-offset-4 transition hover:text-neutral-300 hover:underline"
              >
                {o.area ? "· " : ""}venue programme
              </Link>
            )}
          </p>
        </div>
        {o.owned ? (
          <span className="shrink-0 rounded-full bg-emerald-400 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-950">
            Booked
          </span>
        ) : price ? (
          <span className="shrink-0 text-sm font-medium text-neutral-300">{price}</span>
        ) : null}
      </div>

      {times.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {times.map((t) => (
            <span
              key={t}
              className="rounded-lg bg-white/10 px-2.5 py-1 font-mono text-sm text-white"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-neutral-400">
          {[...(o.formats ?? []), unavailable ? o.availability!.replace(/_/g, " ") : null]
            .filter(Boolean)
            .join(" · ")}
        </span>
        {o.url ? (
          <a
            href={o.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 font-medium text-white transition hover:bg-white/20"
          >
            Tickets <ExternalIcon className="h-3 w-3" />
          </a>
        ) : (
          <span className="text-neutral-600">no ticket link</span>
        )}
      </div>
    </li>
  );
}

function DayTabs({
  days,
  day,
  onPick,
}: {
  days: string[];
  day: string;
  onPick: (d: string) => void;
}) {
  if (days.length < 2) return null;
  return (
    <div role="tablist" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
      {days.map((d) => {
        const on = d === day;
        return (
          <button
            key={d}
            role="tab"
            aria-selected={on}
            onClick={() => onPick(d)}
            className={`shrink-0 rounded-xl px-3 py-1.5 text-sm transition ${
              on
                ? "bg-white text-neutral-950"
                : "text-neutral-400 ring-1 ring-inset ring-white/10 hover:text-white"
            }`}
          >
            {longDay(d)}
          </button>
        );
      })}
    </div>
  );
}

/** Where and when: every venue for the chosen day(s). */
function Schedule({
  show,
  days,
  atVenue,
  wide,
  replace,
}: {
  show: Show;
  days: string[];
  atVenue?: string;
  /** Lay venue cards out in columns — the page with no side column. */
  wide?: boolean;
  /** Links replace the dialog's history entry instead of stacking on it. */
  replace?: boolean;
}) {
  return (
    <div className="space-y-6">
      {days.map((d) => (
        <div key={d}>
          {days.length > 1 && (
            <h4 className="mb-2 text-sm font-semibold text-neutral-300">{longDay(d)}</h4>
          )}
          <ul className={`grid gap-2 ${wide ? "md:grid-cols-2 xl:grid-cols-3" : ""}`}>
            {listingsOn(show, d).map((o, i) => (
              <VenueCard key={`${o.venue}-${i}`} o={o} atVenue={atVenue} replace={replace} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

const sectionLabel = "text-xs font-medium uppercase tracking-widest text-neutral-500";

/** Days a show still has to come; before hydration, all of them. */
function useUpcoming(show: Show) {
  const today = useToday();
  return useMemo(() => {
    const left = show.days.filter((d) => !today || d >= today);
    return left.length ? left : show.days;
  }, [show, today]);
}

/** Modal detail for one show, opened on a particular day. */
export function EventDialog({
  show,
  day: initialDay,
  onClose,
  atVenue,
}: {
  show: Show;
  day?: string;
  onClose: () => void;
  /** Slug of the venue being browsed — it gets no link back to itself. */
  atVenue?: string;
}) {
  const days = useUpcoming(show);
  const [day, setDay] = useState(
    initialDay && show.days.includes(initialDay) ? initialDay : days[0],
  );
  const listings = listingsOn(show, day);
  const e = listings[0] ?? show.listings[0];

  /**
   * The address bar follows the dialog: opening it pushes the event's own URL,
   * so copying the URL, refreshing or sharing lands on that event's page. Back
   * closes the dialog rather than leaving the list, and closing it any other
   * way steps history back so no stale event entry is left behind.
   */
  const href = `/istanbul/event/${show.slug}`;
  const pushed = useRef(false);

  useEffect(() => {
    // Guarded so a double-run effect (dev StrictMode) doesn't push twice.
    if (window.location.pathname !== href) {
      window.history.pushState(null, "", href);
      pushed.current = true;
    }
    const onPop = () => {
      if (window.location.pathname !== href) onClose();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [href, onClose]);

  const close = useCallback(() => {
    // popstate then fires and calls onClose.
    if (pushed.current && window.location.pathname === href) window.history.back();
    else onClose();
  }, [href, onClose]);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => ev.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    // Stop the page scrolling underneath the sheet.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [close]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={show.title}
      onClick={close}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm ist-fade sm:items-center sm:p-6"
    >
      <div
        onClick={(ev) => ev.stopPropagation()}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-white/15 bg-neutral-900 shadow-2xl shadow-black/80 [scrollbar-width:thin] ist-up sm:rounded-3xl"
      >
        <Hero show={show} e={e} onClose={close} inDialog />

        <div className="space-y-7 px-5 pb-7 pt-2 sm:px-7">
          <section>
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h3 className={sectionLabel}>Where &amp; when</h3>
              <span className="text-xs text-neutral-500">
                {days.length > 1 ? `${days.length} days` : longDay(day)}
              </span>
            </div>
            <DayTabs days={days} day={day} onPick={setDay} />
            <div className="mt-3">
              <Schedule show={show} days={[day]} atVenue={atVenue} replace />
            </div>
          </section>

          {(e.description || e.director || e.cast?.length) && (
            <section>
              <h3 className={`${sectionLabel} mb-1`}>About</h3>
              <About e={e} />
            </section>
          )}

          {e.note && <p className="text-xs leading-relaxed text-neutral-600">{e.note}</p>}
        </div>
      </div>
    </div>
  );
}

/** The same detail, as a standalone page — what a shared link opens. */
export function EventPage({ show }: { show: Show }) {
  const days = useUpcoming(show);
  const e = listingsOn(show, days[0])[0] ?? show.listings[0];
  const hasAbout = !!(e.description || e.director || e.cast?.length);
  return (
    <div className="space-y-10">
      <Hero show={show} e={e} inDialog={false} />
      {/* Without a synopsis there's nothing for a side column, so the schedule spreads out */}
      <div className={`grid gap-10 ${hasAbout ? "lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]" : ""}`}>
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className={sectionLabel}>Where &amp; when</h3>
            <span className="text-xs text-neutral-500">
              {days.length > 1 ? rangeLabel(days[0], days[days.length - 1]) : longDay(days[0])}
            </span>
          </div>
          <Schedule show={show} days={days} wide={!hasAbout} />
          {!hasAbout && e.note && (
            <p className="mt-6 text-xs leading-relaxed text-neutral-600">{e.note}</p>
          )}
        </section>
        {hasAbout && (
          <section>
            <h3 className={`${sectionLabel} mb-1`}>About</h3>
            <About e={e} />
            {e.note && <p className="mt-6 text-xs leading-relaxed text-neutral-600">{e.note}</p>}
          </section>
        )}
      </div>
    </div>
  );
}


/** The visual body of a tile: poster, then title, venue and times. */
function TileBody({
  e,
  extra = 0,
  subtitle,
}: {
  e: Ev;
  extra?: number;
  /** Replaces the venue line where the venue is already obvious from context. */
  subtitle?: string;
}) {
  const cat = categoryOf(e.kind);
  const times = sessionTimes(e);
  const price = realPrice(e.price);
  const meta = CATEGORY_META[cat];
  // No score here — it has its own chip on the times row, above.
  const details = [e.genre, humanDuration(e.duration)].filter(Boolean);

  const art = e.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={e.image}
      alt=""
      loading="lazy"
      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
    />
  ) : (
    <div
      aria-hidden="true"
      className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/[0.08] to-white/[0.02] transition duration-300 group-hover:scale-105"
    >
      <Icon cat={cat} className={`h-12 w-12 opacity-40 ${meta.text}`} />
    </div>
  );

  return (
    <>
      {/* 3:4 matches the source posters (600x800), so nothing gets cropped. */}
      <div
        className={`relative aspect-[3/4] w-full overflow-hidden rounded-3xl transition ${
          e.owned
            ? "shadow-lg shadow-emerald-500/25"
            : "ring-1 ring-white/10 group-hover:ring-white/30"
        }`}
      >
        {art}
        {e.owned && (
          <>
            <span
              title="You have tickets"
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-emerald-950/70 backdrop-blur-[1px]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400 text-neutral-950 shadow-lg shadow-emerald-900/40">
                <CheckIcon className="h-7 w-7" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-100">
                Booked
              </span>
            </span>
            {/* Drawn above the overlay so the border reads as inset, not outlined */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-3xl ring-4 ring-inset ring-emerald-400"
            />
          </>
        )}
        {extra > 0 && (
          <span className="absolute right-2 top-2 rounded-full bg-black/75 px-2 py-1 text-xs font-semibold text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm">
            +{extra}
          </span>
        )}
      </div>

      {/* Title, then where, then when. */}
      <h3
        className="mt-2.5 line-clamp-2 min-h-[1.6em] text-sm font-semibold leading-tight text-white"
        title={e.description}
      >
        {e.title}
      </h3>
      <p className="line-clamp-1 text-xs text-neutral-500">
        {subtitle ?? (extra > 0 ? `${e.venue} and ${extra} more` : e.venue)}
      </p>
      <div className="mt-0.5 flex h-4 items-center gap-2 overflow-hidden text-[11px] text-neutral-400">
        {times.length > 0 && (
          <span className="flex min-w-0 items-center gap-1">
            <ClockIcon className={`h-3 w-3 shrink-0 ${meta.text}`} />
            <span className="truncate font-mono tracking-tight" title={times.join(", ")}>
              {times.join(" ")}
            </span>
          </span>
        )}
        {/* Grayscale here: the row is poster-led, so the score shouldn't shout */}
        {e.imdbRating && (
          <span
            className="flex shrink-0 items-center gap-1 text-neutral-400"
            title={`IMDb ${e.imdbRating}/10`}
          >
            <span className="rounded bg-neutral-700 px-1 text-[9px] font-bold leading-4 tracking-tight text-neutral-200">
              IMDb
            </span>
            <span className="font-medium">{e.imdbRating}</span>
          </span>
        )}
        {price && <span className="shrink-0 font-medium text-neutral-300">{price}</span>}
      </div>
      {details.length > 0 && (
        <p className="mt-1 truncate text-[11px] text-neutral-500" title={e.description}>
          {details.join(" · ")}
        </p>
      )}
      {(e.availability && !/^(available|listed)$/.test(e.availability)) || !e.url ? (
        <p className="mt-1 text-xs text-neutral-600">
          {e.availability && !/^(available|listed)$/.test(e.availability)
            ? e.availability.replace(/_/g, " ")
            : "no ticket link"}
        </p>
      ) : null}
    </>
  );
}

/** A poster-first tile sized for a horizontally scrolled row. */
export function Tile({
  group,
  day,
  atVenue,
  subtitle,
}: {
  group: Group;
  /** The day row this tile sits in; the dialog opens on it. */
  day?: string;
  atVenue?: string;
  subtitle?: string;
}) {
  const [open, setOpen] = useState(false);
  const e = group[0];
  const extra = group.length - 1;
  const show = showOf(e);
  const close = useCallback(() => setOpen(false), []);

  const className =
    "group w-32 shrink-0 snap-start focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 sm:w-56 " +
    CATEGORY_META[categoryOf(e.kind)].ring;

  // Every tile opens the detail view; the ticket link lives inside it, per venue.
  return (
    <>
      <button onClick={() => setOpen(true)} className={`${className} text-left`}>
        <TileBody e={e} extra={extra} subtitle={subtitle} />
      </button>
      {open && show && (
        <EventDialog show={show} day={day ?? e.days[0]} atVenue={atVenue} onClose={close} />
      )}
    </>
  );
}
