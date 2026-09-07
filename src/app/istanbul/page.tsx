"use client";

import { useMemo, useState } from "react";
import {
  CATEGORY_META,
  CATEGORY_OF,
  CINEMAS,
  DAYS,
  EVENTS,
  type Category,
  type Ev,
} from "./data";
import { CATEGORY_ICON } from "./icons";

const CATEGORIES = Object.keys(CATEGORY_META) as Category[];

function fmt(iso: string, opts: Intl.DateTimeFormatOptions) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", opts);
}

const longDay = (iso: string) => fmt(iso, { weekday: "long", day: "numeric", month: "long" });

function Icon({ cat, className = "h-4 w-4" }: { cat: Category; className?: string }) {
  const Glyph = CATEGORY_ICON[cat];
  return <Glyph className={`shrink-0 ${className}`} />;
}

function KindChip({ e }: { e: Ev }) {
  const cat = CATEGORY_OF[e.kind];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${CATEGORY_META[cat].chip}`}
    >
      <Icon cat={cat} className="h-3.5 w-3.5" />
      {e.kind}
    </span>
  );
}

function Card({ e }: { e: Ev }) {
  const cat = CATEGORY_OF[e.kind];
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3
          className={`text-lg font-semibold text-white ${
            e.url ? "group-hover:underline group-hover:underline-offset-4" : ""
          }`}
        >
          {e.title}
        </h3>
        <span className="shrink-0 font-mono text-sm text-neutral-400">{e.time ?? "—"}</span>
      </div>
      <p className="mt-1.5 text-[15px] text-neutral-400">
        {e.venue} <span className="text-neutral-600">·</span> {e.area}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <KindChip e={e} />
        {e.price && (
          <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-neutral-300 ring-1 ring-inset ring-white/10">
            {e.price}
          </span>
        )}
        {!e.url && (
          <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-neutral-500 ring-1 ring-inset ring-white/10">
            no ticket link
          </span>
        )}
        {e.note && <span className="text-xs text-neutral-500">{e.note}</span>}
      </div>
    </>
  );

  const className =
    "group block rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/25 hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 " +
    CATEGORY_META[cat].ring;

  if (!e.url) {
    return <div className={className}>{body}</div>;
  }

  return (
    <a href={e.url} target="_blank" rel="noreferrer" className={className}>
      {body}
    </a>
  );
}

export default function IstanbulPage() {
  const [active, setActive] = useState<Category[]>([]);

  const shown = useMemo(
    () => EVENTS.filter((e) => active.length === 0 || active.includes(CATEGORY_OF[e.kind])),
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
    for (const e of EVENTS) c[CATEGORY_OF[e.kind]] += 1;
    return c;
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-10 text-neutral-200 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <header>
          <p className="text-sm uppercase tracking-widest text-neutral-500">
            7 – 14 September 2026
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Istanbul events
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-neutral-400">
            {EVENTS.length} picks across eight days — concerts, theatre, stand-up and film
            screenings. Excludes Erol Evgin, Karanlıkta Diyalog, Candan Erçetin, Ajda Pekkan,
            Leman Sam, Bengü and Serdar Ortaç, and all sailing/sports-boat events (İstanbul
            Yelken Kulübü appears here only for its open-air film screenings).
          </p>
        </header>

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
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {list.map((e) => (
                    <Card key={e.title} e={e} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

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

        <footer className="mt-14 border-t border-white/10 pt-6 text-sm leading-relaxed text-neutral-600">
          Biletix and Bubilet block automated lookups of individual listings, so events without a
          confirmed direct event page are marked "no ticket link" rather than linked to a generic
          search — search the venue or listing site by title before you travel.
        </footer>
      </div>
    </main>
  );
}
