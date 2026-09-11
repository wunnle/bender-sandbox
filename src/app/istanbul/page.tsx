"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  ALL_DAYS as DAYS,
  CATEGORIES,
  CATEGORY_META,
  categoryOf,
  CINEMAS,
  EVENTS,
  META,
  SOURCES,
  VENUES,
  type Category,
} from "./data";
import {
  ChevronIcon,
  fmt,
  groupByDay,
  Icon,
  longDay,
  rangeLabel,
  useToday,
  Tile,
  type Group,
} from "./ui";

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

export default function IstanbulPage() {
  const [active, setActive] = useState<Category[]>([]);
  const today = useToday();

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

  const byDay = useMemo(() => groupByDay(shown, days), [shown, days]);

  const toggle = (c: Category) =>
    setActive((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  /** Counts describe what's actually listed, so they shrink as days roll off. */
  const upcoming = useMemo(
    () => EVENTS.filter((e) => e.days.some((d) => !today || d >= today)),
    [today],
  );

  /** Venues with something still to come, busiest first. */
  const venues = useMemo(
    () =>
      VENUES.map((venue) => ({
        venue,
        count: venue.events.filter((e) => e.days.some((d) => !today || d >= today)).length,
      }))
        .filter((v) => v.count > 0)
        .sort((a, b) => b.count - a.count || a.venue.name.localeCompare(b.venue.name)),
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

        {venues.length > 0 && (
          <section className="mt-14">
            <h2 className="text-2xl font-semibold tracking-tight text-white">Venues</h2>
            <p className="mt-1 text-[15px] text-neutral-500">
              The whole programme for one place, in date order.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {venues.map(({ venue, count }) => (
                <Link
                  key={venue.slug}
                  href={`/istanbul/venue/${venue.slug}`}
                  className="flex items-baseline gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-neutral-300 transition hover:border-white/25 hover:bg-white/[0.07] hover:text-white"
                >
                  {venue.name}
                  <span className="text-xs text-neutral-500">{count}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

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
