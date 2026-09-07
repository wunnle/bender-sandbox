import { EVENTS, CINEMAS, Ev } from "./data";

function Row({ e }: { e: Ev }) {
  return (
    <li className="border-b border-white/10 py-4 text-sm leading-relaxed">
      <span className="font-medium text-white">{e.date}:</span>{" "}
      <a
        href={e.url}
        target="_blank"
        rel="noreferrer"
        className="text-neutral-200 underline underline-offset-4 hover:text-white"
      >
        {e.title}
      </a>
      , {e.kind}
      {e.time && <>, {e.time}</>}, {e.venue}, {e.area}
      {e.price && <>, {e.price}</>}
      {e.note && <span className="text-neutral-500"> — {e.note}</span>}
    </li>
  );
}

export default function IstanbulPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-5 py-14 text-neutral-200 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <header>
          <p className="text-xs uppercase tracking-widest text-neutral-500">7 – 14 September 2026</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Istanbul events
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-400">
            Filtered list, excluding Erol Evgin, Karanlıkta Diyalog, Candan Erçetin, Ajda Pekkan,
            Leman Sam, Bengü and Serdar Ortaç.
          </p>
        </header>

        <ul className="mt-8">
          {EVENTS.map((e) => (
            <Row key={`${e.date}-${e.title}`} e={e} />
          ))}
        </ul>

        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight text-white">Cinema options</h2>
          <p className="mt-2 text-sm text-neutral-500">Exact sessions and prices must be selected live.</p>
          <ul className="mt-4 space-y-3 text-sm">
            {CINEMAS.map((c) => (
              <li key={c.name}>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-neutral-200 underline underline-offset-4 hover:text-white"
                >
                  {c.name}
                </a>{" "}
                ({c.area}): {c.films}
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-14 border-t border-white/10 pt-6 text-xs leading-relaxed text-neutral-600">
          Biletix blocks automated lookups, so Biletix links above are search results rather than
          direct listings — check live availability before you travel.
        </footer>
      </div>
    </main>
  );
}
