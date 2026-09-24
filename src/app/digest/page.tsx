"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AUTHORS,
  CATEGORIES,
  CATEGORY_META,
  DAYS,
  ITEMS,
  META,
  type Category,
} from "./data";
import { Card, Icon, longDay, rangeLabel } from "./ui";

type View = "feed" | "authors";

const VIEWS: { id: View; label: string }[] = [
  { id: "feed", label: "Feed" },
  { id: "authors", label: "By author" },
];

export default function DigestPage() {
  const [view, setView] = useState<View>("feed");
  const [active, setActive] = useState<Category[]>([]);

  /**
   * The view lives in the hash so `/digest#authors` is a shareable link. Read
   * after mount rather than during render — the server has no hash, and seeding
   * state from it directly would mismatch hydration.
   */
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.slice(1);
      if (VIEWS.some((v) => v.id === h)) setView(h as View);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const pick = (v: View) => {
    setView(v);
    history.replaceState(null, "", v === "feed" ? " " : `#${v}`);
  };

  const matches = useMemo(
    () => (cat: Category) => active.length === 0 || active.includes(cat),
    [active],
  );

  const shown = useMemo(() => ITEMS.filter((i) => matches(i.category)), [matches]);

  const byDay = useMemo(() => {
    const m = new Map<string, typeof shown>();
    for (const d of DAYS) m.set(d, []);
    for (const i of shown) m.get(i.day)?.push(i);
    return m;
  }, [shown]);

  const counts = useMemo(() => {
    const c = {} as Record<Category, number>;
    for (const cat of CATEGORIES) c[cat] = 0;
    for (const i of ITEMS) c[i.category] += 1;
    return c;
  }, []);

  const toggle = (c: Category) =>
    setActive((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-950 px-4 py-10 text-neutral-200 sm:px-8 sm:py-14">
      {/* Cool ambient wash behind the top rows, so the page isn't flat black */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[80rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(56,130,246,0.16),transparent)] blur-2xl"
      />
      <div className="relative mx-auto max-w-[95rem]">
        <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-neutral-500">
              {rangeLabel(META.window.start, META.window.end)} · {META.window.duration_hours}h
            </p>
            <h1 className="mt-1 text-4xl font-light tracking-tight text-white sm:text-5xl">
              AI dev digest
            </h1>
          </div>

          {/* Counts live in the header's dead right-hand space instead of another paragraph */}
          <dl className="flex items-end gap-6 text-neutral-400">
            <div>
              <dt className="text-xs uppercase tracking-wider text-neutral-500">Posts</dt>
              <dd className="text-2xl font-semibold text-white">{ITEMS.length}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-neutral-500">Accounts</dt>
              <dd className="text-2xl font-semibold text-white">
                {META.accountsWithPosts}
                <span className="text-neutral-600">/{META.accountsScanned}</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-neutral-500">Days</dt>
              <dd className="text-2xl font-semibold text-white">{DAYS.length}</dd>
            </div>
          </dl>
        </header>

        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-neutral-500">
          {META.filter}.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2">
          {/* View switch first — it changes what the filters below apply to */}
          <div className="flex rounded-full p-0.5 ring-1 ring-inset ring-white/10">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                onClick={() => pick(v.id)}
                aria-pressed={view === v.id}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  view === v.id
                    ? "bg-white text-neutral-950"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          <span className="hidden h-5 w-px bg-white/10 sm:block" aria-hidden />

          {CATEGORIES.map((c) => {
            const on = active.includes(c);
            return (
              <button
                key={c}
                onClick={() => toggle(c)}
                title={CATEGORY_META[c].blurb}
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

        {view === "feed" ? (
          <div className="mt-8 space-y-10">
            {DAYS.map((d) => {
              const list = byDay.get(d) ?? [];
              return (
                <section key={d}>
                  <div className="sticky top-0 z-10 -mx-1 flex items-baseline gap-3 bg-neutral-950/85 px-1 py-2 backdrop-blur">
                    <h2 className="text-base font-semibold tracking-tight text-white sm:text-lg">
                      {longDay(d)}
                    </h2>
                    <span className="text-sm text-neutral-500">
                      {list.length} {list.length === 1 ? "post" : "posts"}
                    </span>
                  </div>
                  {list.length === 0 ? (
                    <p className="mt-3 text-[15px] text-neutral-600">
                      Nothing in the selected categories.
                    </p>
                  ) : (
                    <div className="mt-3 grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {list.map((i) => (
                        <Card key={i.url} group={i} />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            {AUTHORS.map((a) => {
              const list = a.items.filter((i) => matches(i.category));
              return (
                <section key={a.handle}>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                      {a.name}
                    </h2>
                    <a
                      href={`https://x.com/${a.handle}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-sm text-neutral-500 underline-offset-4 hover:text-neutral-300 hover:underline"
                    >
                      @{a.handle}
                    </a>
                    <span className="text-sm text-neutral-600">
                      {list.length} {list.length === 1 ? "post" : "posts"}
                    </span>
                  </div>

                  {/* An account that produced nothing is a result, not a gap —
                      the payload's note says why, so show it rather than hide the row. */}
                  {a.note && (
                    <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-neutral-500">
                      {a.note}
                    </p>
                  )}

                  {list.length > 0 && (
                    <div className="mt-3 grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {list.map((i) => (
                        <Card key={i.url} group={i} showAuthor={false} />
                      ))}
                    </div>
                  )}

                  {list.length === 0 && !a.note && (
                    <p className="mt-2 text-[15px] text-neutral-600">
                      Nothing in the selected categories.
                    </p>
                  )}
                </section>
              );
            })}
          </div>
        )}

        <footer className="mt-14 grid gap-4 border-t border-white/10 pt-6 text-sm leading-relaxed text-neutral-600 sm:grid-cols-2">
          <p>
            Each card is a summary of what was posted. Follow the link for what they actually
            wrote.
          </p>
          <p>
            The four categories are derived here from each post&rsquo;s topic, not supplied by the
            scrape. Times are UTC, derived from X status IDs.
          </p>
          {META.note && <p className="sm:col-span-2">{META.note}</p>}
          <p className="sm:col-span-2">
            {META.source} · generated{" "}
            {new Date(META.generatedAt).toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "UTC",
            })}{" "}
            UTC
          </p>
        </footer>
      </div>
    </main>
  );
}
