"use client";

import { useMemo, useState } from "react";
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

const longDay = (iso: string) => fmt(iso, { weekday: "long", day: "numeric", month: "long" });


/** "8 – 14 September 2026", collapsing the month/year when both ends share one. */
const rangeLabel = (() => {
  const { start, end } = META.range;
  const sameMonth = start.slice(0, 7) === end.slice(0, 7);
  const left = sameMonth
    ? fmt(start, { day: "numeric" })
    : fmt(start, { day: "numeric", month: "long" });
  return `${left} – ${fmt(end, { day: "numeric", month: "long", year: "numeric" })}`;
})();


function Icon({ cat, className = "h-4 w-4" }: { cat: Category; className?: string }) {
  const Glyph = CATEGORY_ICON[cat];
  return <Glyph className={`shrink-0 ${className}`} />;
}

function KindChip({ e }: { e: Ev }) {
  const cat = categoryOf(e.kind);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${CATEGORY_META[cat].chip}`}
    >
      <Icon cat={cat} className="h-3.5 w-3.5" />
      {e.kind}
    </span>
  );
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

function Card({ e }: { e: Ev }) {
  const cat = categoryOf(e.kind);
  const details = (
    <>
      <div className="flex items-start justify-between gap-4">
        <h3
          className={`text-lg font-semibold text-white ${
            e.url ? "group-hover:underline group-hover:underline-offset-4" : ""
          }`}
        >
          {e.title}
        </h3>
        {/* Time and price stack as one right-hand column — the two numbers you scan for */}
        <div className="shrink-0 text-right">
          <div className="font-mono text-sm text-neutral-300">{e.time ?? "—"}</div>
          {e.price && (
            <div className="mt-0.5 text-sm font-medium text-neutral-400">{e.price}</div>
          )}
        </div>
      </div>
      <p className="mt-1.5 text-[15px] text-neutral-400">
        {e.venue} <span className="text-neutral-600">·</span> {e.area}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <KindChip e={e} />
        {!e.url && (
          <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-neutral-500 ring-1 ring-inset ring-white/10">
            no ticket link
          </span>
        )}
        {e.availability && e.availability !== "available" && (
          <span className="rounded-full bg-rose-400/10 px-2.5 py-1 text-xs font-medium text-rose-200 ring-1 ring-inset ring-rose-400/30">
            {e.availability.replace(/_/g, " ")}
          </span>
        )}
        {e.note && <span className="text-xs text-neutral-500">{e.note}</span>}
      </div>
    </>
  );

  // Roughly half the payload carries a poster; the rest must not leave a gap.
  const body = e.image ? (
    <div className="flex gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={e.image}
        alt=""
        loading="lazy"
        className="h-44 w-30 shrink-0 rounded-lg object-cover ring-1 ring-white/10 sm:h-52 sm:w-36"
      />
      <div className="min-w-0 flex-1">{details}</div>
    </div>
  ) : (
    details
  );

  const className =
    "group relative block rounded-xl border p-4 transition focus:outline-none focus-visible:ring-2 " +
    (e.owned
      ? "border-emerald-400/40 bg-emerald-400/10 hover:border-emerald-300/60 hover:bg-emerald-400/15 "
      : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06] ") +
    CATEGORY_META[cat].ring;

  const inner = (
    <>
      {e.owned && (
        <span
          title="You have tickets"
          className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 text-neutral-950 shadow-lg shadow-emerald-500/20"
        >
          <CheckIcon className="h-5 w-5" />
        </span>
      )}
      {body}
    </>
  );

  if (!e.url) {
    return <div className={className}>{inner}</div>;
  }

  return (
    <a href={e.url} target="_blank" rel="noreferrer" className={className}>
      {inner}
    </a>
  );
}

export default function IstanbulPage() {
  const [active, setActive] = useState<Category[]>([]);

  const shown = useMemo(
    () => EVENTS.filter((e) => active.length === 0 || active.includes(categoryOf(e.kind))),
    [active],
  );

  const byDay = useMemo(() => {
    const m = new Map<string, Ev[]>(DAYS.map((d) => [d, []]));
    for (const e of shown) for (const d of e.days) m.get(d)?.push(e);
    for (const list of m.values())
      list.sort((a, b) => (a.time ?? "99:99").localeCompare(b.time ?? "99:99"));
    return m;
  }, [shown]);

  const toggle = (c: Category) =>
    setActive((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const counts = useMemo(() => {
    const c = {} as Record<Category, number>;
    for (const cat of CATEGORIES) c[cat] = 0;
    for (const e of EVENTS) c[categoryOf(e.kind)] += 1;
    return c;
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-10 text-neutral-200 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-neutral-500">{rangeLabel}</p>
            <h1 className="mt-1 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {META.city} events
            </h1>
          </div>

          {/* Counts live in the header's dead right-hand space instead of another paragraph */}
          <dl className="flex items-end gap-6 text-neutral-400">
            <div>
              <dt className="text-xs uppercase tracking-wider text-neutral-500">Events</dt>
              <dd className="text-2xl font-semibold text-white">{EVENTS.length}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-neutral-500">Days</dt>
              <dd className="text-2xl font-semibold text-white">{DAYS.length}</dd>
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

        <div className="mt-7 flex flex-wrap items-center gap-2">
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

        <div className="mt-6 space-y-8">
          {DAYS.map((d) => {
            const list = byDay.get(d) ?? [];
            if (list.length === 0) return null;
            return (
              <section key={d}>
                <h2 className="sticky top-0 z-10 bg-neutral-950/90 py-2 text-lg font-semibold tracking-tight text-white backdrop-blur">
                  {longDay(d)}
                  <span className="ml-2 font-normal text-neutral-500">{list.length}</span>
                </h2>
                {/* items-start: a poster-less card shouldn't stretch to match a poster one */}
                <div className="mt-2 grid items-start gap-3 sm:grid-cols-2">
                  {list.map((e) => (
                    <Card key={e.title} e={e} />
                  ))}
                </div>
              </section>
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
                  <p className="mt-1 text-[15px] text-neutral-500">{c.area}</p>
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
