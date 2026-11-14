"use client";

import { openPalette } from "./CommandPalette";

export default function SearchButton() {
  return (
    <button
      type="button"
      onClick={openPalette}
      className="flex w-full items-center gap-3 rounded-xl border border-black/10 px-4 py-3 text-left text-neutral-400 transition hover:border-black/30 dark:border-white/10 dark:hover:border-white/30"
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="9" cy="9" r="6" />
        <path d="m14 14 4 4" strokeLinecap="round" />
      </svg>
      <span className="flex-1 text-sm">Search experiments…</span>
      <kbd className="hidden rounded border border-black/10 px-1.5 py-0.5 text-[11px] sm:block dark:border-white/15">
        ⌘K
      </kbd>
    </button>
  );
}
