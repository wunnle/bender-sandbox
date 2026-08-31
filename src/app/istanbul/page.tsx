"use client";

import { useMemo, useState } from "react";
import { Category, EVENTS, Ev, LATER, ONGOING } from "./data";

const CATS: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "music", label: "Music" },
  { id: "theatre", label: "Theatre" },
  { id: "cinema", label: "Cinema" },
  { id: "art", label: "Art" },
  { id: "other", label: "Other" },
];

const DOT: Record<Category, string> = {
  music: "bg-violet-400",
  theatre: "bg-amber-400",
  cinema: "bg-sky-400",
  art: "bg-emerald-400",
  other: "bg-rose-400",
};

function dayLabel(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
}

function Card({ e }: { e: Ev }) {
  const body = (
    <>
      <div className="flex items-start gap-3">
        <span className={`mt-2 size-2 shrink-0 rounded-full ${DOT[e.cat]}`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h3 className="font-medium text-neutral-100">{e.title}</h3>
            {e.pick && (
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-neutral-300">
                pick
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-neutral-400">{e.venue}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
            {e.time && <span className="text-neutral-300">{e.time}</span>}
            {e.price && <span>{e.price}</span>}
            {e.unconfirmed && <span className="text-amber-400/80">unconfirmed</span>}
            {e.url && <span className="text-neutral-400 group-hover:text-white">tickets →</span>}
          </div>
          {e.note && <p className="mt-2 text-xs leading-relaxed text-neutral-500">{e.note}</p>}
        </div>
      </div>
    </>
  );

  const cls =
    "group block rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/25 hover:bg-white/[0.06]";

  return e.url ? (
    <a href={e.url} target="_blank" rel="noreferrer" className={cls}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function Section({ title, events }: { title: string; events: Ev[] }) {
  if (!events.length) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {events.map((e, i) => (
          <Card key={title + i} e={e} />
        ))}
      </div>
    </section>
  );
}

export default function IstanbulPage() {
  const [cat, setCat] = useState<Category | "all">("all");

  const match = (e: Ev) => cat === "all" || e.cat === cat;

  const byDay = useMemo(() => {
    const days = new Map<string, Ev[]>();
    for (const e of EVENTS.filter(match)) {
      if (!days.has(e.date)) days.set(e.date, []);
      days.get(e.date)!.push(e);
    }
    return [...days.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [cat]);

  const count = EVENTS.filter(match).length;

  return (
    <main className="min-h-screen bg-neutral-950 px-5 py-12 text-neutral-200 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <header>
          <p className="text-xs uppercase tracking-widest text-neutral-500">1 – 7 September 2026</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Istanbul this week
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-400">
            End of the open-air season, so most of it is outdoors and most of it is on Saturday.
            Anything marked <span className="text-amber-400/80">unconfirmed</span> is worth a phone
            call before you build an evening around it.
          </p>
        </header>

        <div className="mt-8 flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                cat === c.id
                  ? "border-white/80 bg-white text-neutral-900"
                  : "border-white/15 text-neutral-300 hover:border-white/40"
              }`}
            >
              {c.label}
            </button>
          ))}
          <span className="self-center pl-1 text-xs text-neutral-600">{count} this week</span>
        </div>

        {byDay.map(([date, evs]) => (
          <section key={date} className="mt-10">
            <h2 className="mb-3 flex items-baseline gap-3 text-lg font-medium text-white">
              {dayLabel(date)}
              <span className="text-xs font-normal text-neutral-600">{evs.length}</span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {evs.map((e, i) => (
                <Card key={date + i} e={e} />
              ))}
            </div>
          </section>
        ))}

        {!byDay.length && (
          <p className="mt-10 text-sm text-neutral-500">Nothing in that category this week.</p>
        )}

        <Section title="Running all month" events={ONGOING.filter(match)} />
        <Section title="Worth planning ahead for" events={LATER.filter(match)} />

        <footer className="mt-16 border-t border-white/10 pt-6 text-xs leading-relaxed text-neutral-600">
          Compiled from Songkick, Bubilet, Biletix, Komünite, İKSV and Cumhuriyet listings.
          Biletix blocks automated lookups, so seat availability was never checked — confirm before
          you travel.
        </footer>
      </div>
    </main>
  );
}
