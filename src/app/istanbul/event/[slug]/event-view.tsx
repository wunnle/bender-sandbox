"use client";

import Link from "next/link";
import { META, showBySlug } from "../../data";
import { SearchButton } from "../../search";
import { EventPage } from "../../ui";

/** A shared link lands here: the full detail for one title, every upcoming day. */
export default function EventView({ slug }: { slug: string }) {
  const show = showBySlug(slug);
  if (!show) return null;
  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-950 px-4 py-10 text-neutral-200 sm:px-8 sm:py-14">
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link href="/istanbul" className="text-sm text-neutral-500 transition hover:text-neutral-300">
            ← All {META.city} events
          </Link>
          <SearchButton />
        </div>
        <EventPage show={show} />
      </div>
    </main>
  );
}
