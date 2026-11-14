"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SearchItem } from "./routes";

const OPEN_EVENT = "sandbox:open-palette";

/** Opens the palette from anywhere (e.g. a button on the homepage). */
export function openPalette() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

type Entry = {
  id: string;
  label: string;
  note?: string;
  date?: string;
  href: string;
  external?: boolean;
};

/** Substring/prefix matches score at least this; below it is a loose subsequence match. */
const SUBSTRING = 600;

/**
 * Fuzzy score: higher is better, -1 means no match. Rewards prefix and
 * contiguous matches so "pow" ranks powers-of-ten above "stopwatch".
 */
function score(query: string, text: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (!q) return 0;
  const idx = t.indexOf(q);
  if (idx === 0) return 1000 - t.length;
  if (idx > 0) {
    // Word-boundary substring beats mid-word substring.
    const boundary = /[\s/\-—]/.test(t[idx - 1]);
    return (boundary ? 800 : 600) - idx;
  }
  // Subsequence match, penalising gaps.
  let ti = 0;
  let gaps = 0;
  let last = -1;
  for (const ch of q) {
    const found = t.indexOf(ch, ti);
    if (found === -1) return -1;
    if (last !== -1) gaps += found - last - 1;
    last = found;
    ti = found + 1;
  }
  return Math.max(1, 300 - gaps * 5 - t.length);
}

const formatDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
}).format;

export default function CommandPalette({ items }: { items: SearchItem[] }) {
  const router = useRouter();
  const [open, setOpenState] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  // Reset on close so the next open starts clean (no setState-in-effect).
  const setOpen = (next: boolean) => {
    setOpenState(next);
    if (!next) {
      setQuery("");
      setActive(0);
    }
  };
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const entries = useMemo<Entry[]>(
    () => [
      { id: "home", label: "Home", note: "All experiments", href: "/" },
      ...items.map((i) => ({
        id: i.path,
        label: i.path.replace("/", " / "),
        note: i.note,
        date: i.date && formatDate(new Date(i.date)),
        href: `/${i.path}`,
      })),
      { id: "kafagoz", label: "kafagoz.com", note: "Other projects", href: "https://kafagoz.com", external: true },
    ],
    [items],
  );

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return entries;
    const scored = entries
      .map((e) => {
        const label = score(q, e.label);
        // Descriptions only count as substring hits, ranked below name hits.
        const note = score(q, e.note ?? "");
        return { e, s: Math.max(label, note >= SUBSTRING ? note - 200 : -1) };
      })
      .filter((r) => r.s >= 0);
    // Loose subsequence matches are only a fallback, so "ist" doesn't drag in "digest".
    const strict = scored.filter((r) => r.s >= SUBSTRING - 200);
    return (strict.length ? strict : scored).sort((a, b) => b.s - a.s).map((r) => r.e);
  }, [entries, query]);

  // Global shortcuts: Cmd/Ctrl+K toggles; "/" opens when not typing somewhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
        return;
      }
      if (e.key === "/" && !open) {
        const el = e.target;
        if (el instanceof Element && el.closest("input, textarea, select, [contenteditable='true']")) return;
        e.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (entry: Entry | undefined) => {
    if (!entry) return;
    setOpen(false);
    if (entry.external) window.location.href = entry.href;
    else router.push(entry.href);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search experiments"
        className="flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-black/10 bg-white/95 text-neutral-900 shadow-2xl dark:border-white/10 dark:bg-neutral-900/95 dark:text-neutral-100"
        style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
      >
        <div className="flex items-center gap-3 border-b border-black/10 px-4 dark:border-white/10">
          <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="9" cy="9" r="6" />
            <path d="m14 14 4 4" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              // Keep page-level shortcuts (arrow-key scrubbers etc.) from reacting.
              e.stopPropagation();
              if (e.key === "Escape") {
                e.preventDefault();
                setOpen(false);
              } else if (e.key === "ArrowDown" || (e.ctrlKey && e.key === "n")) {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, results.length - 1));
              } else if (e.key === "ArrowUp" || (e.ctrlKey && e.key === "p")) {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                go(results[active]);
              } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setOpen(false);
              }
            }}
            placeholder="Search experiments…"
            aria-label="Search experiments"
            aria-controls="palette-results"
            aria-activedescendant={results[active] ? `palette-${results[active].id}` : undefined}
            autoComplete="off"
            spellCheck={false}
            className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-neutral-400"
          />
          <kbd className="hidden rounded border border-black/10 px-1.5 py-0.5 text-[11px] text-neutral-400 sm:block dark:border-white/15">
            esc
          </kbd>
        </div>

        <ul ref={listRef} id="palette-results" role="listbox" className="overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="px-3 py-8 text-center text-sm text-neutral-500">No matches for “{query}”</li>
          )}
          {results.map((r, i) => (
            <li
              key={r.id}
              id={`palette-${r.id}`}
              data-index={i}
              role="option"
              aria-selected={i === active}
              onMouseMove={() => setActive(i)}
              onClick={() => go(r)}
              className={`flex cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2.5 ${
                i === active ? "bg-black/[0.06] dark:bg-white/[0.08]" : ""
              }`}
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{r.label}</span>
                {r.note && <span className="truncate text-sm text-neutral-500">{r.note}</span>}
              </span>
              <span className="flex shrink-0 items-center gap-3">
                {r.date && <span className="text-xs tabular-nums text-neutral-400">{r.date}</span>}
                <span className={`text-neutral-400 ${i === active ? "" : "opacity-0"}`}>
                  {r.external ? "↗" : "↵"}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-4 border-t border-black/10 px-4 py-2 text-[11px] text-neutral-400 sm:flex dark:border-white/10">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>⌘K toggle</span>
        </div>
      </div>
    </div>
  );
}
