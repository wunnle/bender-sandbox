import type { Metadata } from "next";
import { GameList } from "./game-list";
import { TRACKERS } from "./games";

export const metadata: Metadata = {
  title: "SPIEL Essen 2026 — what's new",
  description: "New releases and expansions coming to SPIEL Essen, 22–25 Oct 2026.",
};

export default function SpielGamesPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-14 font-sans text-neutral-800 dark:text-neutral-200">
      <header className="mb-10">
        <p className="text-sm font-medium uppercase tracking-widest text-neutral-400">
          SPIEL Essen · 22–25 Oct 2026
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          What&apos;s new
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">
          A shortlist of the releases worth knowing about, out of the 550-odd games heading to Essen. The ones
          tagged <strong>Buzz</strong> are the games press and community &ldquo;most anticipated&rdquo; lists keep
          naming. Star the ones you want to find on the floor. Your stars are saved on this device.
        </p>
        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
          Also: <a className="underline underline-offset-4" href="/spiel-essen">where to stay</a>.
        </p>
      </header>

      <GameList />

      <section className="mt-14 mb-12">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Full lists
        </h2>
        <p className="mt-2 leading-relaxed text-neutral-600 dark:text-neutral-300">
          For everything else, plus booth numbers, which this page doesn&apos;t have yet:
        </p>
        <ul className="mt-4 space-y-3">
          {TRACKERS.map((t) => (
            <li key={t.href} className="rounded-lg bg-black/[0.03] p-4 dark:bg-white/[0.05]">
              <a
                href={t.href}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-100"
              >
                {t.name}
              </a>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{t.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-t border-black/10 pt-6 text-sm text-neutral-400 dark:border-white/10">
        Compiled 29 Sep 2026 from the{" "}
        <a className="underline underline-offset-4" href="https://www.wargamer.com/board-games/essen-spiel-wishlist" target="_blank" rel="noreferrer">Wargamer wishlist</a>,{" "}
        <a className="underline underline-offset-4" href="https://brettspielbox.de/brettspiel-neuheiten-spiel-2026-herbst-2026-a-z/" target="_blank" rel="noreferrer">brettspielbox</a>{" "}
        and publisher announcements. German titles are as listed for the German market, with the English name
        alongside where it&apos;s known. Game names link to a BoardGameGeek search. Publisher line-ups change
        right up to the fair, so check the BGG preview before you go.
      </footer>
    </main>
  );
}
