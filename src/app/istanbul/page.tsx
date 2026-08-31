import { EVENTS, Ev } from "./data";

function Card({ e }: { e: Ev }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <p className="text-xs font-medium uppercase tracking-widest text-neutral-400">{e.when}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">{e.title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-300">{e.blurb}</p>

      <dl className="mt-4 space-y-1 text-sm">
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 text-neutral-600">Where</dt>
          <dd className="text-neutral-300">
            {e.venue}
            {e.address && <span className="block text-neutral-500">{e.address}</span>}
          </dd>
        </div>
        {e.price && (
          <div className="flex gap-2">
            <dt className="w-16 shrink-0 text-neutral-600">Price</dt>
            <dd className="text-neutral-300">{e.price}</dd>
          </div>
        )}
      </dl>

      {e.note && <p className="mt-4 text-xs leading-relaxed text-neutral-500">{e.note}</p>}
      {e.warn && (
        <p className="mt-3 border-l-2 border-amber-500/50 pl-3 text-xs leading-relaxed text-amber-200/70">
          {e.warn}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <a
          href={e.url}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200"
        >
          {e.urlLabel} →
        </a>
        {e.alt && (
          <a
            href={e.alt.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-neutral-400 underline underline-offset-4 transition hover:text-white"
          >
            {e.alt.label}
          </a>
        )}
      </div>
    </article>
  );
}

export default function IstanbulPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-5 py-14 text-neutral-200 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <header>
          <p className="text-xs uppercase tracking-widest text-neutral-500">September 2026</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            The shortlist
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-400">
            Four things worth booking, each linked to the seller with the actual dated calendar
            rather than a search page. Where a listing contradicted another, the conflict is spelled
            out instead of averaged away. Three of the four are the same company at the same
            Bakırköy stage, so they double up cleanly in one evening.
          </p>
        </header>

        <div className="mt-10 space-y-5">
          {EVENTS.map((e) => (
            <Card key={e.title} e={e} />
          ))}
        </div>

        <footer className="mt-14 border-t border-white/10 pt-6 text-xs leading-relaxed text-neutral-600">
          Prices and times from Bubilet, Paribu Pass, Time Out and İKSV. Biletix blocks automated
          lookups, so nothing here reflects live seat availability — check before you travel.
        </footer>
      </div>
    </main>
  );
}
