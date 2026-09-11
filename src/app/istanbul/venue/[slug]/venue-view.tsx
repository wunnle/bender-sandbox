"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CATEGORY_META,
  categoryOf,
  META,
  venueBySlug,
  type Category,
} from "../../data";
import { fmt, groupByDay, Icon, longDay, rangeLabel, Tile, useToday } from "../../ui";

/**
 * One venue's whole programme. Same tiles and dialog as the day view, but laid
 * out as a wrapping grid per day rather than a scrolled strip — a venue rarely
 * has more than a handful of things on in an evening.
 */
export default function VenueView({ slug }: { slug: string }) {
  const venue = venueBySlug(slug);
  const [active, setActive] = useState<Category[]>([]);
  const today = useToday();

  const events = useMemo(() => venue?.events ?? [], [venue]);

  /** Days this venue actually uses, past ones dropped after hydration. */
  const days = useMemo(
    () => (venue?.days ?? []).filter((d) => !today || d >= today),
    [venue, today],
  );

  const upcoming = useMemo(
    () => events.filter((e) => e.days.some((d) => !today || d >= today)),
    [events, today],
  );

  const shown = useMemo(
    () =>
      upcoming.filter((e) => active.length === 0 || active.includes(categoryOf(e.kind))),
    [upcoming, active],
  );

  const byDay = useMemo(() => groupByDay(shown, days), [shown, days]);

  /** Only the categories this venue programmes get a filter chip. */
  const cats = useMemo(() => {
    const c = new Map<Category, number>();
    for (const e of upcoming) {
      const cat = categoryOf(e.kind);
      c.set(cat, (c.get(cat) ?? 0) + 1);
    }
    return [...c].sort((a, b) => b[1] - a[1]);
  }, [upcoming]);

  if (!venue) return null;

  const toggle = (c: Category) =>
    setActive((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-950 px-4 py-10 text-neutral-200 sm:px-8 sm:py-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[80rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(180,83,9,0.18),transparent)] blur-2xl"
      />
      <div className="relative mx-auto max-w-[110rem]">
        <Link
          href="/istanbul"
          className="text-sm text-neutral-500 transition hover:text-neutral-300"
        >
          ← All {META.city} events
        </Link>

        <header className="mt-4 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-neutral-500">
              {venue.areas.length > 0 ? venue.areas.join(" · ") : META.city}
            </p>
            <h1 className="mt-1 text-4xl font-light tracking-tight text-white sm:text-5xl">
              {venue.name}
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              {days.length > 0
                ? rangeLabel(days[0], days[days.length - 1])
                : "Nothing upcoming here"}
            </p>
          </div>

          <dl className="flex items-end gap-6 text-neutral-400">
            <div>
              <dt className="text-xs uppercase tracking-wider text-neutral-500">Listings</dt>
              <dd className="text-2xl font-semibold text-white">{upcoming.length}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-neutral-500">Days</dt>
              <dd className="text-2xl font-semibold text-white">{days.length}</dd>
            </div>
            {venue.source?.checkedAt && (
              <div>
                <dt className="text-xs uppercase tracking-wider text-neutral-500">Checked</dt>
                <dd className="text-2xl font-semibold text-neutral-400">
                  {fmt(venue.source.checkedAt, { day: "numeric", month: "short" })}
                </dd>
              </div>
            )}
          </dl>
        </header>

        {/* Provenance for this venue specifically — where its inventory was read */}
        {venue.source?.url && (
          <p className="mt-4 text-sm text-neutral-500">
            Inventory from{" "}
            <a
              href={venue.source.url}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 transition hover:text-neutral-300"
            >
              {venue.source.provider}
              {venue.source.venue && venue.source.venue !== venue.name
                ? ` · ${venue.source.venue}`
                : ""}
            </a>
            .
          </p>
        )}

        {cats.length > 1 && (
          <div className="mt-8 flex flex-wrap items-center gap-2">
            {cats.map(([c, n]) => {
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
                  <span className="text-neutral-500">{n}</span>
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
        )}

        <div className="mt-8 space-y-9">
          {days.map((d) => {
            const list = byDay.get(d) ?? [];
            if (list.length === 0) return null;
            return (
              <section key={d}>
                <h2 className="text-base font-semibold tracking-tight text-white sm:text-lg">
                  {longDay(d)}
                </h2>
                <div className="mt-4 flex flex-wrap items-start gap-4">
                  {list.map((g, i) => (
                    <Tile
                      key={`${d}-${g[0].title}-${i}`}
                      group={g}
                      atVenue={venue.slug}
                      // The venue is the page; the kind is the useful second line.
                      subtitle={g[0].kind}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {upcoming.length === 0 && (
          <p className="mt-10 text-neutral-500">
            Everything listed here has already happened. The payload still holds{" "}
            {events.length} past {events.length === 1 ? "listing" : "listings"}.
          </p>
        )}

        <footer className="mt-14 border-t border-white/10 pt-6 text-sm leading-relaxed text-neutral-600">
          <p>
            Listings follow the shared {META.city} payload, so this page changes whenever
            that does.
          </p>
        </footer>
      </div>
    </main>
  );
}
