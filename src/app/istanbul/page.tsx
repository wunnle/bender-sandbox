"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  ALL_DAYS as DAYS,
  CATEGORIES,
  CATEGORY_META,
  categoryOf,
  CINEMAS,
  EVENTS,
  META,
  SOURCES,
  type Category,
  type Ev,
} from "./data";
import { CATEGORY_ICON } from "./icons";

function fmt(iso: string, opts: Intl.DateTimeFormatOptions) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", opts);
}

/** "Wed, 9 Sep" — composed by hand because en-GB renders "Wed 9 Sept", no comma. */
const longDay = (iso: string) => {
  const d = new Date(`${iso}T12:00:00`);
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  const month = d.toLocaleDateString("en-US", { month: "short" });
  return `${weekday}, ${d.getDate()} ${month}`;
};


/** "8 – 14 September 2026", collapsing the month/year when both ends share one. */
const rangeLabel = (start: string, end: string) => {
  const sameMonth = start.slice(0, 7) === end.slice(0, 7);
  const left = sameMonth
    ? fmt(start, { day: "numeric" })
    : fmt(start, { day: "numeric", month: "long" });
  return `${left} – ${fmt(end, { day: "numeric", month: "long", year: "numeric" })}`;
};


function Icon({ cat, className = "h-4 w-4" }: { cat: Category; className?: string }) {
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

function ChevronIcon({ dir, className = "h-4 w-4" }: { dir: -1 | 1; className?: string }) {
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
const realPrice = (p?: string) =>
  p && !/unavailable|unknown|n\/a/i.test(p) ? p : undefined;

/** `times` supersedes `time`; `time` may itself be a comma-joined list. */
const sessionTimes = (e: Ev) =>
  e.times?.length ? e.times : e.time ? e.time.split(",").map((t) => t.trim()) : [];

/** Options for one title on one day — usually a single venue, sometimes several. */
type Group = Ev[];

/**
 * A 0–1 score for ranking. IMDb is out of 10 and the local rating out of 5, so
 * both are normalised before comparing. Unscored events sort last.
 */
function score(e: Ev): number {
  const imdb = e.imdbRating ? Number.parseFloat(e.imdbRating) : NaN;
  if (Number.isFinite(imdb)) return imdb / 10;
  const local = e.rating ? Number.parseFloat(e.rating) : NaN;
  if (Number.isFinite(local)) return local / 5;
  return -1;
}

/** "PT1H30M00S" → "1h 30m". Returns undefined for anything unparseable. */
function humanDuration(iso?: string) {
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

/** Detail view for one title on one day: metadata, then every venue showing it. */
/**
 * IMDb serves the full-resolution master by default — 3158x5000, 1.3MB. The
 * `UX300` segment asks their CDN for a 300px-wide copy instead, about 24KB.
 */
const imdbThumb = (url: string) => url.replace(/\._V1_.*?\.jpg$/, "._V1_QL75_UX300_.jpg");

function OptionsDialog({ group, onClose }: { group: Group; onClose: () => void }) {
  const e = group[0];
  const facts = [e.genre, humanDuration(e.duration), e.ageLimit].filter(Boolean) as string[];
  const poster = e.imdbImage ? imdbThumb(e.imdbImage) : e.image;

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => ev.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${group[0].title} — where to see it`}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
    >
      <div
        onClick={(ev) => ev.stopPropagation()}
        className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-neutral-900 p-5 shadow-2xl [scrollbar-width:thin]"
      >
        <div className="flex gap-4">
          {poster && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={poster}
              alt=""
              className="h-36 w-24 shrink-0 rounded-xl object-cover ring-1 ring-white/10"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold leading-tight text-white">{e.title}</h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="-mr-1 -mt-1 shrink-0 rounded-full px-2 py-1 text-neutral-400 transition hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>
            {/* Genre · duration · age limit — whichever exist */}
            {facts.length > 0 && (
              <p className="mt-1 text-sm text-neutral-400">{facts.join(" · ")}</p>
            )}
            <div className="mt-2">
              <ImdbBlock e={e} />
            </div>
          </div>
        </div>

        {e.description && <Synopsis text={e.description} />}

        {(e.director || e.cast?.length) && (
          <dl className="mt-4 space-y-1 text-sm">
            {e.director && (
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 text-neutral-500">Director</dt>
                <dd className="text-neutral-300">{e.director.replace(/\s+/g, " ")}</dd>
              </div>
            )}
            {e.cast?.length ? (
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 text-neutral-500">Cast</dt>
                <dd className="text-neutral-300">
                  {e.cast.slice(0, 4).map((c) => c.replace(/\s+/g, " ")).join(", ")}
                </dd>
              </div>
            ) : null}
          </dl>
        )}

        {/* Each venue is one clickable card — the whole thing is the ticket link */}
        <ul className="mt-5 space-y-2">
          {group.map((o, i) => {
            const times = sessionTimes(o);
            const price = realPrice(o.price);
            const cls = `block rounded-xl p-3 transition ${
              o.owned
                ? "bg-emerald-400/10 ring-1 ring-inset ring-emerald-400/40"
                : "bg-white/[0.04]"
            } ${o.url ? "cursor-pointer hover:bg-white/[0.1]" : ""}`;
            const body = (
              <>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-white">{o.venue}</span>
                  {price && <span className="shrink-0 text-xs text-neutral-400">{price}</span>}
                </div>
                {times.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {times.map((t) => (
                      <span
                        key={t}
                        className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-neutral-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                {/* Subtitled vs dubbed can differ by cinema, so it lives per venue */}
                {o.formats?.length ? (
                  <p className="mt-2 text-xs text-neutral-400">{o.formats.join(" · ")}</p>
                ) : null}
                {(o.owned || (o.availability && o.availability !== "available") || !o.url) && (
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 text-xs">
                    {o.owned && (
                      <span className="font-semibold uppercase tracking-wide text-emerald-400">
                        Booked
                      </span>
                    )}
                    {o.availability && o.availability !== "available" && (
                      <span className="text-rose-300/80">{o.availability.replace(/_/g, " ")}</span>
                    )}
                    {!o.url && <span className="text-neutral-600">no ticket link</span>}
                  </div>
                )}
              </>
            );
            return (
              <li key={`${o.venue}-${i}`}>
                {o.url ? (
                  <a href={o.url} target="_blank" rel="noreferrer" className={cls}>
                    {body}
                  </a>
                ) : (
                  <div className={cls}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>

        {e.trailer && (
          <a
            href={e.trailer}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block rounded-full px-3 py-1.5 text-sm text-neutral-300 ring-1 ring-white/15 transition hover:bg-white/5 hover:text-white"
          >
            Watch trailer ↗
          </a>
        )}
      </div>
    </div>
  );
}

/** The visual body of a tile: poster, then title, venue and times. */
function TileBody({ e, extra = 0 }: { e: Ev; extra?: number }) {
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
        {extra > 0 ? `${e.venue} and ${extra} more` : e.venue}
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
      {(e.availability && e.availability !== "available") || !e.url ? (
        <p className="mt-1 text-xs text-neutral-600">
          {e.availability && e.availability !== "available"
            ? e.availability.replace(/_/g, " ")
            : "no ticket link"}
        </p>
      ) : null}
    </>
  );
}

/** A poster-first tile sized for a horizontally scrolled row. */
function Tile({ group }: { group: Group }) {
  const [open, setOpen] = useState(false);
  const e = group[0];
  const extra = group.length - 1;

  const className =
    "group w-32 shrink-0 snap-start focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 sm:w-56 " +
    CATEGORY_META[categoryOf(e.kind)].ring;

  // Every tile opens the detail view; the ticket link lives inside it, per venue.
  return (
    <>
      <button onClick={() => setOpen(true)} className={`${className} text-left`}>
        <TileBody e={e} extra={extra} />
      </button>
      {open && <OptionsDialog group={group} onClose={() => setOpen(false)} />}
    </>
  );
}

/** One day: a heading, arrow controls, and a horizontally scrolled strip of tiles. */
function DayRow({ iso, list }: { iso: string; list: Group[] }) {
  const strip = useRef<HTMLDivElement>(null);

  // Scroll by most of a viewport so a nudge advances several tiles, not one.
  const scrollBy = (dir: -1 | 1) =>
    strip.current?.scrollBy({ left: dir * strip.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold tracking-tight text-white sm:text-lg">
          {longDay(iso)}
        </h2>
        {/* Pointer affordance only — the strip is scrollable and keyboard reachable without it */}
        <div className="hidden shrink-0 gap-2 sm:flex">
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              onClick={() => scrollBy(dir)}
              aria-label={dir === 1 ? `Later on ${longDay(iso)}` : `Earlier on ${longDay(iso)}`}
              className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-300 ring-1 ring-white/15 transition hover:bg-white/5 hover:text-white"
            >
              <ChevronIcon dir={dir} />
            </button>
          ))}
        </div>
      </div>

      <div
        ref={strip}
        className="mt-4 overflow-x-auto pb-3 [scrollbar-color:theme(colors.neutral.800)_transparent] [scrollbar-width:thin]"
      >
        <div className="flex snap-x snap-mandatory items-start gap-4">
          {list.map((g, i) => (
            <Tile key={`${iso}-${g[0].title}-${i}`} group={g} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** The date never changes mid-session in practice, so nothing to subscribe to. */
const subscribeNever = () => () => {};

/** Today in Istanbul, regardless of where the browser is. */
const todayInIstanbul = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: META.timezone ?? "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

export default function IstanbulPage() {
  const [active, setActive] = useState<Category[]>([]);
  // Client-only: the page is statically built, so the build date must never be
  // baked in. The server snapshot is null, so prerendered HTML shows every day
  // and hydration then drops the ones already gone.
  const today = useSyncExternalStore(subscribeNever, todayInIstanbul, () => null);

  /** Days still to come. Before hydration nothing is dropped, so SSR matches. */
  const days = useMemo(() => (today ? DAYS.filter((d) => d >= today) : DAYS), [today]);

  const shown = useMemo(
    () =>
      EVENTS.filter(
        (e) =>
          (active.length === 0 || active.includes(categoryOf(e.kind))) &&
          e.days.some((d) => !today || d >= today),
      ),
    [active, today],
  );

  const byDay = useMemo(() => {
    const raw = new Map<string, Ev[]>(days.map((d) => [d, []]));
    for (const e of shown) for (const d of e.days) raw.get(d)?.push(e);

    const first = (g: Group) => sessionTimes(g[0])[0] ?? "99:99";
    const booked = (g: Group) => g.some((o) => o.owned);

    const out = new Map<string, Group[]>();
    for (const [day, list] of raw) {
      // The same title can play several venues on one day — collapse into one tile.
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
      // Booked first, then best-reviewed, then earliest — time only breaks ties.
      groups.sort(
        (a, b) =>
          Number(booked(b)) - Number(booked(a)) ||
          score(b[0]) - score(a[0]) ||
          first(a).localeCompare(first(b)),
      );
      out.set(day, groups);
    }
    return out;
  }, [shown, days]);

  const toggle = (c: Category) =>
    setActive((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  /** Counts describe what's actually listed, so they shrink as days roll off. */
  const upcoming = useMemo(
    () => EVENTS.filter((e) => e.days.some((d) => !today || d >= today)),
    [today],
  );

  const counts = useMemo(() => {
    const c = {} as Record<Category, number>;
    for (const cat of CATEGORIES) c[cat] = 0;
    for (const e of upcoming) c[categoryOf(e.kind)] += 1;
    return c;
  }, [upcoming]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-950 px-4 py-10 text-neutral-200 sm:px-8 sm:py-14">
      {/* Warm ambient wash behind the top rows, so the page isn't flat black */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[80rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(180,83,9,0.18),transparent)] blur-2xl"
      />
      <div className="relative mx-auto max-w-[110rem]">
        <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-neutral-500">
              {days.length > 0 ? rangeLabel(days[0], days[days.length - 1]) : "Nothing upcoming"}
            </p>
            <h1 className="mt-1 text-4xl font-light tracking-tight text-white sm:text-5xl">
              {META.city} events
            </h1>
          </div>

          {/* Counts live in the header's dead right-hand space instead of another paragraph */}
          <dl className="flex items-end gap-6 text-neutral-400">
            <div>
              <dt className="text-xs uppercase tracking-wider text-neutral-500">Events</dt>
              <dd className="text-2xl font-semibold text-white">{upcoming.length}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-neutral-500">Days</dt>
              <dd className="text-2xl font-semibold text-white">{days.length}</dd>
            </div>
            {META.omitted > 0 && (
              <div>
                <dt className="text-xs uppercase tracking-wider text-neutral-500">Omitted</dt>
                <dd className="text-2xl font-semibold text-neutral-500">{META.omitted}</dd>
              </div>
            )}
            {META.lastUpdated && (
              <div>
                <dt className="text-xs uppercase tracking-wider text-neutral-500">Updated</dt>
                <dd className="text-2xl font-semibold text-neutral-400">
                  {fmt(META.lastUpdated, { day: "numeric", month: "short" })}
                </dd>
              </div>
            )}
          </dl>
        </header>

        {META.excluded.length > 0 && (
          <p className="mt-4 max-w-3xl text-sm text-neutral-500">
            Excludes {META.excluded.join(", ")}.
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-2">
          {CATEGORIES.map((c) => {
            const on = active.includes(c);
            return (
              <button
                key={c}
                onClick={() => toggle(c)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ring-1 ring-inset transition ${
                  on
                    ? CATEGORY_META[c].chip
                    : "bg-transparent text-neutral-400 ring-white/10 hover:text-white"
                }`}
              >
                <Icon cat={c} className={`h-4 w-4 ${on ? "" : CATEGORY_META[c].text}`} />
                {CATEGORY_META[c].label}
                <span className="text-neutral-500">{counts[c]}</span>
              </button>
            );
          })}

          {active.length > 0 && (
            <button
              onClick={() => setActive([])}
              className="text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-300"
            >
              clear
            </button>
          )}
        </div>

        <div className="mt-6 space-y-9">
          {days.map((d) => {
            const list = byDay.get(d) ?? [];
            if (list.length === 0) return null;
            return (
              <DayRow key={d} iso={d} list={list} />
            );
          })}
        </div>

        {CINEMAS.length > 0 && (
          <section className="mt-14">
            <h2 className="text-2xl font-semibold tracking-tight text-white">Cinema options</h2>
            <p className="mt-1 text-[15px] text-neutral-500">
              Exact sessions and prices must be selected live.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {CINEMAS.map((c) => (
                <a
                  key={c.name}
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/25 hover:bg-white/[0.06]"
                >
                  <h3 className="text-lg font-semibold text-white group-hover:underline group-hover:underline-offset-4">
                    {c.name}
                  </h3>
                  <p className="mt-2 text-[15px] text-neutral-400">{c.films}</p>
                </a>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-14 grid gap-4 border-t border-white/10 pt-6 text-sm leading-relaxed text-neutral-600 sm:grid-cols-2">
          <p>
            Only researched, event-specific, directly validated ticket links are listed. Generic
            marketplace search links are never substituted for a real listing.
          </p>
          {META.researchNote && <p>{META.researchNote}</p>}

          {SOURCES.length > 0 && (
            <div className="sm:col-span-2">
              <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-500">
                Sources
              </h2>
              <p className="mt-1">
                {[...new Set(SOURCES.map((s) => s.provider))].join(", ")} · {SOURCES.length}{" "}
                venue inventories
                {SOURCES[0]?.checkedAt && <> · checked {fmt(SOURCES[0].checkedAt, {
                  day: "numeric",
                  month: "short",
                })}</>}
              </p>
              <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                {SOURCES.map((s, i) => (
                  <li key={`${s.venue}-${i}`}>
                    {s.url ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline underline-offset-4 transition hover:text-neutral-300"
                      >
                        {s.venue ?? s.provider}
                      </a>
                    ) : (
                      (s.venue ?? s.provider)
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </footer>
      </div>
    </main>
  );
}
