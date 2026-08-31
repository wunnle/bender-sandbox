"use client";

import { useState } from "react";

export function CopyAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(address).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        });
      }}
      title={address}
      aria-label={`Copy address: ${address}`}
      className="inline-flex shrink-0 items-center gap-1 rounded border border-black/10 px-1.5 py-0.5 text-xs font-medium text-neutral-500 transition-colors hover:border-black/25 hover:text-neutral-800 dark:border-white/15 dark:text-neutral-400 dark:hover:border-white/35 dark:hover:text-neutral-100"
    >
      {copied ? (
        <>
          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 8.5 6.5 12 13 4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="5.25" y="5.25" width="8" height="8" rx="1.5" />
            <path d="M10.75 2.75H3.75a1 1 0 0 0-1 1v7" strokeLinecap="round" />
          </svg>
          Address
        </>
      )}
    </button>
  );
}
