"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  ALL_DAYS as DAYS,
  CATEGORIES,
  CATEGORY_META,
  categoryOf,
  CINEMAS,
  EVENTS,
  META,
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

/** A poster-first tile sized for a horizontally scrolled row. */
function Tile({ e }: { e: Ev }) {
  const cat = categoryOf(e.kind);
  const times = sessionTimes(e);
  const price = realPrice(e.price);
  const meta = CATEGORY_META[cat];

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

  const inner = (
    <>
      {/* 3:4 matches the source posters (600x800), so nothing gets cropped. */}
      <div
        className={`relative aspect-[3/4] w-full overflow-hidden rounded-3xl transition ${
          e.owned
            ? "ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/25"
            : "ring-1 ring-white/10 group-hover:ring-white/30"
        }`}
      >
        {art}
        {e.owned && (
          <span
            title="You have tickets"
            className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-emerald-400 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-950"
          >
            <CheckIcon className="h-3.5 w-3.5 shrink-0" />
            Booked
          </span>
        )}
      </div>

      {/* Title, then where, then when. Reserved heights keep a row's tiles aligned
          however long a name runs or how many sessions a film has. */}
      <h3 className="mt-2.5 line-clamp-2 min-h-9 text-sm font-semibold leading-tight text-white">
        {e.title}
      </h3>
      <p className="line-clamp-1 text-xs text-neutral-500">{e.venue}</p>
      <div className="mt-0.5 flex h-4 items-center gap-2 overflow-hidden text-[11px] text-neutral-400">
        {times.length > 0 && (
          <span className="flex min-w-0 items-center gap-1">
            <ClockIcon className={`h-3 w-3 shrink-0 ${meta.text}`} />
            <span className="truncate font-mono tracking-tight" title={times.join(", ")}>
              {times.join(" ")}
            </span>
          </span>
        )}
        {price && <span className="shrink-0 font-medium text-neutral-300">{price}</span>}
      </div>
      {(e.availability && e.availability !== "available") || !e.url ? (
        <p className="mt-1 text-xs text-neutral-600">
          {e.availability && e.availability !== "available"
            ? e.availability.replace(/_/g, " ")
            : "no ticket link"}
        </p>
      ) : null}
    </>
  );

  const className =
    "group w-32 shrink-0 snap-start focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 sm:w-56 " +
    meta.ring;

  return e.url ? (
    <a href={e.url} target="_blank" rel="noreferrer" className={className}>
      {inner}
    </a>
  ) : (
    <div className={className}>{inner}</div>
  );
}

/** One day: a heading, arrow controls, and a horizontally scrolled strip of tiles. */
function DayRow({ iso, list }: { iso: string; list: Ev[] }) {
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

      {/* Negative margins let tiles bleed to the screen edge so the row reads as continuing */}
      <div
        ref={strip}
        className="-mx-4 mt-4 overflow-x-auto px-4 pb-3 [scrollbar-color:theme(colors.neutral.800)_transparent] [scrollbar-width:thin] sm:-mx-8 sm:px-8"
      >
        <div className="flex snap-x snap-mandatory gap-4">
          {list.map((e, i) => (
            <Tile key={`${iso}-${e.title}-${e.venue}-${i}`} e={e} />
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
    const m = new Map<string, Ev[]>(days.map((d) => [d, []]));
    for (const e of shown) for (const d of e.days) m.get(d)?.push(e);
    // Anything already booked leads its day; the rest stay in start-time order.
    for (const list of m.values())
      list.sort(
        (a, b) =>
          Number(!!b.owned) - Number(!!a.owned) ||
          (sessionTimes(a)[0] ?? "99:99").localeCompare(sessionTimes(b)[0] ?? "99:99"),
      );
    return m;
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
            <h1 className="mt-1 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
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
          <span className="mr-2 max-w-16 text-sm leading-tight text-neutral-500">Find by type</span>
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
        </footer>
      </div>
    </main>
  );
}
