type Stop = {
  time: string;
  name: string;
  kind: string;
  walk?: string;
  notes: string[];
  /** Coordinates when we have them, otherwise a search query for Google Maps. */
  where: { lat: number; lon: number } | { q: string };
};

const maps = (w: Stop["where"]) =>
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("q" in w ? w.q : `${w.lat},${w.lon}`);

const BEFORE = [
  "Book a Genius Bar slot for 10:00 at Apple The Exchange TRX (open 10:00–22:00 daily). Same-day screen swap if the part is in stock — not guaranteed.",
  "Back up the iPhone and screenshot this page. Once it's handed in you have no maps and no Grab.",
];

const LOOP: Stop[] = [
  {
    time: "10:00",
    name: "Apple The Exchange TRX",
    kind: "iPhone repair",
    notes: ["Drop off the phone for the screen replacement.", "L1.40, The Exchange TRX."],
    where: { lat: 3.14254, lon: 101.71808 },
  },
  {
    time: "10:45",
    name: "Jalan Pasar, Pudu",
    kind: "Electronics parts",
    walk: "~20 min walk",
    notes: [
      "KL's electronics-parts street. Lian Hup Electronics at No. 78 (Arduino, MCUs, sensors), I.C. Electronics at No. 82.",
      "More shops on Jalan Landak and Lorong Yap Hin next door.",
      "Go in the morning — small shops close by early evening.",
    ],
    where: { lat: 3.13436, lon: 101.71323 },
  },
  {
    time: "12:30",
    name: "VCR, Jalan Galloway",
    kind: "Coffee + lunch",
    walk: "~15 min walk",
    notes: [
      "One of KL's best-known specialty coffee shops; does lunch too.",
      "Ask about AeroPress filters — no shop confirmed stocking them. Fallback: Bean Brothers sells AeroPress gear at its KL and PJ cafés.",
    ],
    where: { lat: 3.14325, lon: 101.70545 },
  },
  {
    time: "14:00",
    name: "Plaza Low Yat",
    kind: "Gadgets / smart home",
    walk: "~10 min walk",
    notes: [
      "Huge IT mall — ready-made smart-home devices: smart plugs, sensors, Xiaomi gear.",
      "Jalan Pasar is for loose parts; this is for finished devices.",
    ],
    where: { lat: 3.14403, lon: 101.71 },
  },
  {
    time: "15:30",
    name: "Apple The Exchange TRX",
    kind: "Pick up",
    walk: "~15 min walk",
    notes: ["Collect the phone."],
    where: { lat: 3.14254, lon: 101.71808 },
  },
];

const AFTERNOON: Stop[] = [
  {
    time: "16:30",
    name: "Meeples, Taman Connaught",
    kind: "Board games",
    walk: "MRT Kajang line, TRX → Taman Connaught",
    notes: [
      "Calls itself Malaysia's biggest board game supplier — 2,000+ titles from 100+ publishers. A real shop, not just a café.",
      "18-1 Jalan Menara Gading 1. Address from a 2026 source; check hours before going.",
    ],
    where: { q: "Meeples, 18-1 Jalan Menara Gading 1, Taman Connaught, Kuala Lumpur" },
  },
  {
    time: "alt",
    name: "Boardgame Depot, Bangsar",
    kind: "Board game café",
    notes: ["300+ games to play. More for sitting down with a game than for shopping."],
    where: { lat: 3.12794, lon: 101.66889 },
  },
];

const EVENING: Stop[] = [
  {
    time: "evening",
    name: "KLCC Park",
    kind: "Sights",
    notes: ["Fountain show under the Petronas Towers."],
    where: { q: "KLCC Park, Kuala Lumpur" },
  },
  {
    time: "dinner",
    name: "Jalan Alor",
    kind: "Street food",
    notes: ["Bukit Bintang's food street, right by Low Yat."],
    where: { q: "Jalan Alor, Kuala Lumpur" },
  },
];

const SOURCES: [string, string][] = [
  ["Apple The Exchange TRX", "https://www.apple.com/my/retail/exchangetrx/"],
  ["Jalan Pasar electronics (The Edge)", "https://theedgemalaysia.com/article/jalan-pasar-area-shopping-hub-electrical-goods"],
  ["Lian Hup Electronics", "https://www.lianhup-electronics.com.my/index.php?ws=ourproducts&cid=351463&cat=Arduino-MCU-Sensors&lang=en"],
  ["I.C. Electronics (Yelp)", "https://www.yelp.com/biz/i-c-electronics-kuala-lumpur"],
  ["Meeples (Globetrove)", "https://www.globetrove.com/finding-board-games-in-kuala-lumpur/"],
  ["Time Out: board game cafés", "https://www.timeout.com/kuala-lumpur/kids/the-best-board-game-cafes-in-kl"],
  ["Bean Brothers AeroPress", "https://beanbrothers.my/products/aeropress"],
  ["Time Out: best coffee in KL", "https://www.timeout.com/kuala-lumpur/food-and-drink/best-coffee-in-kl"],
];

function StopCard({ s }: { s: Stop }) {
  return (
    <li>
      {s.walk && <p className="mb-2 pl-[4.5rem] text-xs text-neutral-500">↓ {s.walk}</p>}
      <div className="flex gap-4">
        <div className="w-14 shrink-0 pt-4 text-right font-mono text-sm tabular-nums text-neutral-400">
          {s.time}
        </div>
        <div className="flex-1 rounded-xl bg-neutral-900 p-4 ring-1 ring-white/10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">{s.kind}</p>
              <h3 className="mt-1 font-semibold text-white">{s.name}</h3>
            </div>
            <a
              href={maps(s.where)}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-200 ring-1 ring-white/15 hover:bg-white/5"
            >
              Map
            </a>
          </div>
          <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-neutral-300">
            {s.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}

function Section({ title, sub, stops }: { title: string; sub?: string; stops: Stop[] }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
      {sub && <p className="mt-1 text-sm text-neutral-400">{sub}</p>}
      <ol className="mt-4 space-y-3">
        {stops.map((s, i) => (
          <StopCard key={`${s.name}-${i}`} s={s} />
        ))}
      </ol>
    </section>
  );
}

export default function KlPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 px-4 pb-16 pt-10 text-neutral-200 sm:px-6">
      <div className="mx-auto max-w-xl">
        <p className="text-sm text-neutral-400">Friday, 9 October 2026</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Kuala Lumpur day trip</h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-400">
          iPhone repair, electronics, coffee, board games. The morning is one walkable ~4 km loop —
          handy, since the phone will be in the shop.
        </p>

        <section className="mt-8 rounded-xl bg-amber-500/10 p-4 ring-1 ring-amber-500/30">
          <h2 className="text-sm font-semibold text-amber-300">Before Friday</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-neutral-200">
            {BEFORE.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>

        <Section title="Morning loop" sub="On foot, while the phone is in repair." stops={LOOP} />
        <Section title="Board games" stops={AFTERNOON} />
        <Section title="If there's energy left" stops={EVENING} />

        <footer className="mt-12 border-t border-white/10 pt-6">
          <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500">Sources</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {SOURCES.map(([label, href]) => (
              <li key={href}>
                <a href={href} target="_blank" rel="noreferrer" className="text-neutral-400 underline-offset-2 hover:text-white hover:underline">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </footer>
      </div>
    </main>
  );
}
