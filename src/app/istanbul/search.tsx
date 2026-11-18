"use client";

/**
 * ⌘K / Ctrl+K palette over every show and venue in the payload. Mounted once in
 * the layout so it works on every Istanbul route; header buttons open it via a
 * window event rather than shared state.
 */

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { categoryOf, CATEGORY_META, SHOWS, VENUES, type Show, type Venue } from "./data";
import { Icon, longDay, posterOf, score, useToday } from "./ui";

const OPEN_EVENT = "istanbul:search";

/** Turkish-aware fold so "kadikoy" finds "Kadıköy" and "sis" finds "Şiş". */
const fold = (s: string) =>
  s
    .replace(/İ/g, "i")
    .toLowerCase()
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

type Hit =
  | { type: "show"; show: Show; next?: string; rank: number }
  | { type: "venue"; venue: Venue; count: number; rank: number };

const SHOW_INDEX = SHOWS.map((show) => {
  const e = show.listings[0];
  const venues = [...new Set(show.listings.map((l) => l.venue?.trim()).filter(Boolean))];
  return {
    show,
    title: fold(`${show.title} ${e.sourceTitle ?? ""}`),
    hay: fold(
      [
        show.title,
        e.sourceTitle,
        e.kind,
        e.genre,
        e.director,
        ...(e.cast ?? []),
        ...venues,
        ...show.listings.map((l) => l.area),
      ]
        .filter(Boolean)
        .join(" "),
    ),
    venues,
  };
});

const VENUE_INDEX = VENUES.map((venue) => ({
  venue,
  title: fold(venue.name),
  hay: fold([venue.name, ...venue.areas].join(" ")),
}));

function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <circle cx="9" cy="9" r="5.5" />
      <path d="m13.2 13.2 3.8 3.8" strokeLinecap="round" />
    </svg>
  );
}

/** Platform-correct shortcut label, settled after hydration. */
const noSubscribe = () => () => {};
const useModKey = () =>
  useSyncExternalStore(
    noSubscribe,
    () => (/Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl "),
    () => "⌘",
  );

export function SearchButton({ className = "" }: { className?: string }) {
  const mod = useModKey();
  return (
    <button
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      className={`flex items-center gap-2 rounded-full bg-white/[0.04] px-3.5 py-2 text-sm text-neutral-400 ring-1 ring-inset ring-white/10 transition hover:bg-white/[0.08] hover:text-white ${className}`}
    >
      <SearchIcon />
      <span>Search</span>
      <kbd className="hidden rounded bg-white/10 px-1.5 py-0.5 font-sans text-[11px] text-neutral-400 sm:inline">
        {mod}K
      </kbd>
    </button>
  );
}

export function SearchPalette() {
  const router = useRouter();
  const today = useToday();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "k") {
        ev.preventDefault();
        setOpen((v) => !v);
        return;
      }
      // "/" also opens it, unless someone is typing somewhere.
      const t = ev.target as HTMLElement | null;
      const typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if (ev.key === "/" && !typing) {
        ev.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    // Capture phase, so this runs before the sandbox-wide palette and can claim
    // the shortcut (it skips events that are already defaultPrevented).
    window.addEventListener("keydown", onKey, true);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const hits = useMemo<Hit[]>(() => {
    const upcoming = (days: string[]) => days.find((d) => !today || d >= today);
    const terms = fold(q).split(/\s+/).filter(Boolean);
    const query = terms.join(" ");

    const shows: Hit[] = [];
    for (const s of SHOW_INDEX) {
      const next = upcoming(s.show.days);
      if (!next) continue;
      if (!terms.every((t) => s.hay.includes(t))) continue;
      const booked = s.show.listings.some((l) => l.owned);
      // Title matches beat cast/venue matches; booked things float up when idle.
      const rank = !query
        ? (booked ? 10 : 0) + Math.max(0, score(s.show.listings[0]))
        : s.title.startsWith(query)
          ? 3
          : s.title.includes(query)
            ? 2
            : terms.every((t) => s.title.includes(t))
              ? 1.5
              : 1;
      shows.push({ type: "show", show: s.show, next, rank });
    }
    shows.sort((a, b) =>
      b.rank - a.rank ||
      (a.type === "show" && b.type === "show" ? (a.next ?? "").localeCompare(b.next ?? "") : 0),
    );

    const venues: Hit[] = [];
    if (query) {
      for (const v of VENUE_INDEX) {
        if (!terms.every((t) => v.hay.includes(t))) continue;
        const count = v.venue.events.filter((e) => upcoming(e.days)).length;
        if (!count) continue;
        venues.push({ type: "venue", venue: v.venue, count, rank: v.title.startsWith(query) ? 2 : 1 });
      }
      venues.sort((a, b) => b.rank - a.rank);
    }

    // A venue name typed exactly should come before its films.
    const topVenue = venues[0] && venues[0].rank === 2 && !shows.some((s) => s.rank >= 2);
    return topVenue
      ? [...venues.slice(0, 4), ...shows.slice(0, 12)]
      : [...shows.slice(0, query ? 12 : 8), ...venues.slice(0, 4)];
  }, [q, today]);

  useEffect(() => {
    list.current
      ?.querySelector<HTMLElement>(`[data-i="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  const close = () => {
    setOpen(false);
    setQ("");
  };

  const go = (h: Hit | undefined) => {
    if (!h) return;
    close();
    router.push(
      h.type === "show" ? `/istanbul/event/${h.show.slug}` : `/istanbul/venue/${h.venue.slug}`,
    );
  };

  const onKeyDown = (ev: React.KeyboardEvent) => {
    if (ev.key === "ArrowDown") {
      ev.preventDefault();
      setActive((i) => Math.min(i + 1, hits.length - 1));
    } else if (ev.key === "ArrowUp") {
      ev.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (ev.key === "Enter") {
      ev.preventDefault();
      go(hits[active]);
    } else if (ev.key === "Escape") {
      ev.preventDefault();
      close();
    }
  };

  const firstVenue = hits.findIndex((h) => h.type === "venue");
  const firstShow = hits.findIndex((h) => h.type === "show");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search events"
      onClick={close}
      className="ist-fade fixed inset-0 z-[60] flex items-start justify-center bg-black/70 px-3 pt-[10vh] backdrop-blur-sm sm:pt-[14vh]"
    >
      <div
        onClick={(ev) => ev.stopPropagation()}
        className="ist-up flex max-h-[72vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-neutral-900 text-neutral-200 shadow-2xl shadow-black/80"
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-4">
          <SearchIcon className="h-5 w-5 shrink-0 text-neutral-500" />
          <input
            autoFocus
            value={q}
            onChange={(ev) => {
              setQ(ev.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Films, plays, people, venues…"
            role="combobox"
            aria-expanded="true"
            aria-controls="ist-search-results"
            aria-activedescendant={hits[active] ? `ist-hit-${active}` : undefined}
            className="h-14 min-w-0 flex-1 bg-transparent text-base text-white placeholder:text-neutral-500 focus:outline-none"
          />
          <kbd
            onClick={close}
            className="cursor-pointer rounded bg-white/10 px-1.5 py-0.5 text-[11px] text-neutral-400"
          >
            esc
          </kbd>
        </div>

        <ul
          ref={list}
          id="ist-search-results"
          role="listbox"
          className="flex-1 overflow-y-auto p-2 [scrollbar-width:thin]"
        >
          {hits.length === 0 && (
            <li className="px-3 py-10 text-center text-sm text-neutral-500">
              Nothing upcoming matches “{q}”.
            </li>
          )}
          {hits.map((h, i) => {
            const on = i === active;
            const heading =
              i === firstShow ? (q ? "Events" : "Coming up") : i === firstVenue ? "Venues" : null;
            return (
              <li key={h.type === "show" ? `s-${h.show.slug}` : `v-${h.venue.slug}`} role="none">
                {heading && (
                  <p className="px-3 pb-1.5 pt-3 text-[11px] font-medium uppercase tracking-widest text-neutral-500">
                    {heading}
                  </p>
                )}
                <button
                  id={`ist-hit-${i}`}
                  data-i={i}
                  role="option"
                  aria-selected={on}
                  onMouseMove={() => setActive(i)}
                  onClick={() => go(h)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
                    on ? "bg-white/10" : ""
                  }`}
                >
                  {h.type === "show" ? <ShowRow h={h} /> : <VenueRow h={h} />}
                  <span className={`shrink-0 text-neutral-500 ${on ? "opacity-100" : "opacity-0"}`}>
                    ↵
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-4 border-t border-white/10 px-4 py-2 text-[11px] text-neutral-500 sm:flex">
          <span>↑↓ to move</span>
          <span>↵ to open</span>
          <span>esc to close</span>
        </div>
      </div>
    </div>
  );
}

function ShowRow({ h }: { h: Extract<Hit, { type: "show" }> }) {
  const e = h.show.listings[0];
  const cat = categoryOf(e.kind);
  const poster = posterOf(e);
  const venues = new Set(h.show.listings.map((l) => l.venue?.trim()));
  const booked = h.show.listings.some((l) => l.owned);
  return (
    <>
      <span className="h-12 w-9 shrink-0 overflow-hidden rounded-md bg-white/5 ring-1 ring-white/10">
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center">
            <Icon cat={cat} className={`h-4 w-4 ${CATEGORY_META[cat].text}`} />
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-white">{h.show.title}</span>
          {booked && (
            <span className="shrink-0 rounded bg-emerald-400/15 px-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
              Booked
            </span>
          )}
        </span>
        <span className="block truncate text-xs text-neutral-500">
          <span className={`capitalize ${CATEGORY_META[cat].text}`}>{e.kind}</span>
          {h.next && <> · {longDay(h.next)}</>}
          {" · "}
          {venues.size > 1 ? `${venues.size} venues` : e.venue}
        </span>
      </span>
    </>
  );
}

function VenueRow({ h }: { h: Extract<Hit, { type: "venue" }> }) {
  return (
    <>
      <span className="flex h-12 w-9 shrink-0 items-center justify-center rounded-md bg-white/5 text-neutral-400 ring-1 ring-white/10">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4" aria-hidden="true">
          <path d="M10 17.5s5.5-5 5.5-9.5a5.5 5.5 0 1 0-11 0c0 4.5 5.5 9.5 5.5 9.5Z" strokeLinejoin="round" />
          <circle cx="10" cy="8" r="2" />
        </svg>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-white">{h.venue.name}</span>
        <span className="block truncate text-xs text-neutral-500">
          {[h.venue.areas[0], `${h.count} upcoming`].filter(Boolean).join(" · ")}
        </span>
      </span>
    </>
  );
}
