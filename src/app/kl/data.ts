export type Where = { lat: number; lon: number } | { q: string };

export type Stop = {
  time: string;
  name: string;
  kind: string;
  walk?: string;
  notes: string[];
  /** Coordinates when we have them, otherwise a search query for Google Maps. */
  where: Where;
};

export type Section = {
  key: string;
  label: string;
  color: string;
  sub?: string;
  /** Draw the stops in order as a line — only meaningful for the walking loop. */
  path?: boolean;
  stops: Stop[];
};

export const mapsHref = (w: Where) =>
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("q" in w ? w.q : `${w.lat},${w.lon}`);

export const BEFORE = [
  "Book a Genius Bar slot for 10:00 at Apple The Exchange TRX (open 10:00–22:00 daily). Same-day screen swap if the part is in stock — not guaranteed.",
  "Back up the iPhone and screenshot this page. Once it's handed in you have no maps and no Grab.",
];

export const SECTIONS: Section[] = [
  {
    key: "morning",
    label: "Morning",
    color: "#34d399",
    sub: "Walking loop while the phone is in repair",
    path: true,
    stops: [
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
        time: "11:45",
        name: "Play Play Asia, GMBB",
        kind: "Board games",
        walk: "~20 min walk",
        notes: [
          "Shop and community space for games by Asian designers — buy them, learn to play them. Opened 15 August 2026.",
          "Level 1 of GMBB, Jalan Robertson. Open 11:00–20:00 daily.",
        ],
        where: { lat: 3.14475, lon: 101.70453 },
      },
      {
        time: "12:30",
        name: "VCR, Jalan Galloway",
        kind: "Coffee + lunch",
        walk: "~3 min walk",
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
    ],
  },
  {
    key: "games",
    label: "Games",
    color: "#fbbf24",
    sub: "Optional afternoon trip — Play Play Asia is already in the morning",
    stops: [
      {
        time: "½ day",
        name: "Meeples, Subang Jaya",
        kind: "Board games",
        walk: "LRT Kelana Jaya line to SS15 — ~45–60 min from the centre",
        notes: [
          "Malaysia's biggest board game supplier — 2,000+ titles from 100+ publishers. A real shop and a café.",
          "64-1 Jalan SS15/4D. Closed Mondays; confirm Friday hours (+603 5633 8033).",
          "Worth it for a big haul of Western titles. Otherwise spend the afternoon on the Islamic Arts Museum.",
        ],
        where: { lat: 3.07372, lon: 101.59002 },
      },
      {
        time: "alt",
        name: "Boardgame Depot, Bangsar",
        kind: "Board game café",
        notes: ["300+ games to play. More for sitting down with a game than for shopping."],
        where: { lat: 3.12794, lon: 101.66889 },
      },
    ],
  },
  {
    key: "sights",
    label: "Sights",
    color: "#38bdf8",
    sub: "Skipping street food, KLCC Park and Chinatown",
    stops: [
      {
        time: "any",
        name: "TRX City Park",
        kind: "Rooftop park",
        notes: [
          "10-acre public park on the roof of the Apple Store's mall, open from 07:00. Good for the repair wait.",
        ],
        where: { lat: 3.14254, lon: 101.71808 },
      },
      {
        time: "check",
        name: "Merdeka 118 — The View at 118",
        kind: "Viewing deck",
        notes: [
          "World's second-tallest building, a few minutes from Jalan Pasar.",
          "Deck was expected in 2026, but most of the tower was still closed as of July. Confirm it's open first.",
        ],
        where: { q: "Merdeka 118, Kuala Lumpur" },
      },
      {
        time: "1.5–2h",
        name: "Islamic Arts Museum",
        kind: "Museum",
        notes: [
          "KL's best museum: domed ceilings, manuscripts, architecture models.",
          "Sits in the Perdana Botanical Gardens — walk them too. Either this or Meeples in the afternoon, probably not both.",
        ],
        where: { lat: 3.14145, lon: 101.68987 },
      },
      {
        time: "1h",
        name: "Thean Hou Temple",
        kind: "Temple",
        notes: ["Six-tier Chinese temple on a hill with city views. Close to Bangsar — pairs with Boardgame Depot."],
        where: { lat: 3.12184, lon: 101.68764 },
      },
      {
        time: "1h",
        name: "KL Forest Eco Park",
        kind: "Canopy walk",
        notes: ["Rainforest walkways in the middle of the city, at the foot of KL Tower."],
        where: { lat: 3.15293, lon: 101.70269 },
      },
    ],
  },
  {
    key: "evening",
    label: "Evening",
    color: "#c084fc",
    sub: "If there's energy left",
    stops: [
      {
        time: "evening",
        name: "REXKL",
        kind: "Bookshop / creative space",
        notes: ["An old cinema turned bookshop and creative space, on the edge of Chinatown."],
        where: { lat: 3.14485, lon: 101.69825 },
      },
      {
        time: "night",
        name: "Saloma Bridge → Kampung Baru",
        kind: "Views + Malay food",
        notes: [
          "LED-lit pedestrian bridge with a good Petronas Towers view.",
          "Leads into Kampung Baru, an old Malay village ringed by skyscrapers — go for dinner.",
        ],
        where: { lat: 3.16138, lon: 101.7078 },
      },
    ],
  },
];

export const SOURCES: [string, string][] = [
  ["Apple The Exchange TRX", "https://www.apple.com/my/retail/exchangetrx/"],
  ["Jalan Pasar electronics (The Edge)", "https://theedgemalaysia.com/article/jalan-pasar-area-shopping-hub-electrical-goods"],
  ["Lian Hup Electronics", "https://www.lianhup-electronics.com.my/index.php?ws=ourproducts&cid=351463&cat=Arduino-MCU-Sensors&lang=en"],
  ["I.C. Electronics (Yelp)", "https://www.yelp.com/biz/i-c-electronics-kuala-lumpur"],
  ["Play Play Asia opening (Malay Mail)", "https://www.malaymail.com/news/life/2026/08/16/a-place-for-games-and-connection-play-play-asia-opens-kl-hub-dedicated-to-showcasing-asian-tabletop-games/231546"],
  ["Play Play Asia (Hiew's Boardgame Blog)", "http://hiewandboardgames.blogspot.com/2026/08/play-play-asia-opens-for-business.html"],
  ["Meeples store page", "https://meeples.com.my/store/"],
  ["Meeples (Yelp)", "https://www.yelp.com/biz/meeples-european-boardgame-cafe-subang-jaya"],
  ["Time Out: board game cafés", "https://www.timeout.com/kuala-lumpur/kids/the-best-board-game-cafes-in-kl"],
  ["Bean Brothers AeroPress", "https://beanbrothers.my/products/aeropress"],
  ["Time Out: best coffee in KL", "https://www.timeout.com/kuala-lumpur/food-and-drink/best-coffee-in-kl"],
  ["TRX City Park (Wonderful Malaysia)", "https://www.wonderfulmalaysia.com/shopping/?p=42"],
  ["Merdeka 118 (Wikipedia)", "https://en.wikipedia.org/wiki/Merdeka_118"],
];

/** Every stop numbered once across the whole day, so pins never repeat a number. */
export const NUMBERED = SECTIONS.flatMap((sec, s) => sec.stops.map((stop) => ({ ...stop, s })))
  .map((stop, i) => ({ ...stop, n: i + 1 }));
export type NumberedStop = (typeof NUMBERED)[number];
