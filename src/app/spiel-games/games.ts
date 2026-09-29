export type Kind = "New" | "Expansion" | "Spin-off";
export type Tag = "Strategy" | "Co-op" | "Two-player" | "Narrative";

export type Game = {
  title: string;
  /** English name when the source listing is German. */
  en?: string;
  publisher?: string;
  designers?: string;
  kind: Kind;
  tags?: Tag[];
  /** Picked out by press / community "most anticipated" lists. */
  buzz?: boolean;
  blurb?: string;
  /** Booth ids as the official hall plan knows them, "<hall>.<stand>", e.g. "3.3U210". */
  booths?: string[];
  /** "publisher" when the game isn't in the official novelties list, so this is its publisher's booth. */
  boothFrom?: "listing" | "publisher";
  /** Exhibitor showing the game, when that isn't the publisher. */
  at?: string;
};

export const GAMES: Game[] = [
  {
    title: "Queen Alice",
    publisher: "Combo Games",
    kind: "New",
    tags: ["Strategy"],
    buzz: true,
    blurb:
      "Mid-heavy euro. You're advisors at the court beyond the Looking Glass, building an engine from chess pieces and cards. Early online plays marked it as the one for heavy-strategy fans.",
    booths: ["3.3U210"],
  },
  {
    title: "Kingdom Come: Deliverance – The Board Game",
    publisher: "Czech Games Edition",
    designers: "Tomáš Holek (co-designer)",
    kind: "New",
    buzz: true,
    blurb: "Board game adaptation of the Czech medieval RPG.",
    booths: ["3.3V400", "7.7E100"],
  },
  {
    title: "Carpet Racers",
    designers: "Tomáš Holek",
    kind: "New",
    buzz: true,
    blurb: "Chaotic racing game where players steer cards without knowing which one is theirs.",
    booths: ["4.4G515"],
    at: "Pink Troubadour",
  },
  {
    title: "Greenwood",
    publisher: "Feuerland",
    designers: "Christos Giannakoulas, Manolis Zachariadis",
    kind: "New",
    tags: ["Strategy"],
    buzz: true,
    blurb: "Fantasy euro: primal spirits rescue creatures from a corrupted druid grove.",
    booths: ["3.3Q300"],
  },
  {
    title: "Stonesaga",
    designers: "Max Brooke, Luke Eddy",
    kind: "New",
    tags: ["Co-op", "Narrative"],
    buzz: true,
    blurb: "Co-op exploration with survival crafting, played across several generations of characters.",
    booths: ["2.2C130"],
    at: "Board Game Circus",
  },
  {
    title: "Gaudí",
    designers: "Dani Garcia",
    kind: "New",
    buzz: true,
    blurb: "Tile placement about the architect, scoring across Nature, Catalonia and Religion.",
    booths: ["3.3D600", "6.6B300"],
    at: "DEVIR and HUCH!",
  },
  {
    title: "Personal Demons",
    designers: "Judson Cowan",
    kind: "New",
    buzz: true,
    blurb: "Group drafting: build demon summoning circles for points. Already on Kickstarter.",
  },
  {
    title: "Dust in the Wind",
    publisher: "PHALANX",
    designers: "Srdjan Jovanovski",
    kind: "New",
    tags: ["Co-op", "Narrative"],
    buzz: true,
    blurb: "Story-driven co-op on the American frontier, with resource management and branching choices.",
    booths: ["3.3L500"],
    boothFrom: "publisher",
  },
  {
    title: "Blood Hunt",
    kind: "New",
    buzz: true,
    blurb: "Four-player vampire game: secretly draft cards to claim citizens across the city's districts.",
    booths: ["6.6B201"],
    at: "Mandoo Games",
  },
  {
    title: "Aridnyk",
    publisher: "Boardova",
    kind: "New",
    buzz: true,
    blurb: "Tile game from Hutsul mythology: shepherd your flocks and deal with mythic creatures.",
    booths: ["4.4A425"],
    at: "Koalla",
  },
  {
    title: "Harmonies: Crescendo",
    publisher: "Libellud",
    kind: "Expansion",
    buzz: true,
    blurb: "New board layouts, scoring and animal cards, plus “Whisper Creatures”.",
  },

  { title: "Entropy", publisher: "Board & Dice (DE: Frosted Games)", kind: "New", tags: ["Strategy"], booths: ["3.3G300"], at: "Frosted Games" },
  { title: "Thessaloniki", publisher: "Board & Dice", kind: "New", booths: ["2.2E430", "2.2E440"], at: "B-Rex Entertainment" },
  { title: "Maestro", publisher: "Board & Dice", kind: "New", booths: ["2.2E430", "2.2E440"], at: "B-Rex Entertainment" },
  { title: "Windmill Valley Duel", publisher: "Board & Dice", kind: "Spin-off", tags: ["Two-player"], booths: ["3.3G200"], boothFrom: "publisher" },

  { title: "Flügelschlag: Mittel- und Südamerika", en: "Wingspan: Central & South America", publisher: "Feuerland", kind: "Expansion", booths: ["3.3Q300"] },
  { title: "Flügelschlag: Regionen Fan-Set 1", en: "Wingspan: Regions fan pack 1", publisher: "Feuerland", kind: "Expansion", booths: ["3.3Q300"] },
  { title: "Flossenschlag: Haie & Riffe", publisher: "Feuerland", kind: "Expansion", booths: ["3.3Q300"] },
  { title: "Age of Innovation: Zukunft und Vergangenheit", en: "Age of Innovation: Future & Past", publisher: "Feuerland", kind: "Expansion", tags: ["Strategy"], booths: ["3.3Q300"] },
  { title: "Viticulture: Bordeaux", publisher: "Feuerland", kind: "Expansion", booths: ["3.3Q300"] },
  { title: "Melochs Duell", publisher: "Feuerland", kind: "New", tags: ["Two-player"], booths: ["3.3Q300"] },

  { title: "Mischwald – Smoky Mountains", en: "Forest Shuffle: Smoky Mountains", publisher: "Lookout Spiele", kind: "Expansion", booths: ["3.3V300"] },
  { title: "Duell der Drachen", publisher: "Lookout Spiele", kind: "New", tags: ["Two-player"], booths: ["3.3V300"], boothFrom: "publisher" },

  { title: "Carcassonne 25 Jahre", en: "Carcassonne: 25-year anniversary edition", publisher: "Hans im Glück", kind: "Spin-off", booths: ["2.2B210"] },

  { title: "CATAN – Japan", publisher: "Kosmos", kind: "Expansion", booths: ["7.7E311"], boothFrom: "publisher" },
  { title: "Andor – Ewige Kälte: Das Licht der Dunkelklinge", publisher: "Kosmos", kind: "Spin-off", tags: ["Co-op", "Narrative"], booths: ["7.7E311"], boothFrom: "publisher" },
  { title: "Fourth Wing – Das Spiel", en: "Fourth Wing – The Game: Choosing the Dragons", publisher: "Kosmos", kind: "New", booths: ["7.7E311"] },
  { title: "EXIT – Der perfekte Einbruch", en: "EXIT: The Perfect Heist", publisher: "Kosmos", kind: "New", tags: ["Co-op"], booths: ["7.7E311"] },

  { title: "Horrified: Dungeons & Dragons – Ravenloft", publisher: "Ravensburger", kind: "Spin-off", tags: ["Co-op"], booths: ["7.7D311"] },
  { title: "Scotland Yard – Duel", publisher: "Ravensburger", kind: "Spin-off", tags: ["Two-player"], booths: ["7.7D311"], boothFrom: "publisher" },
  { title: "echoes – Das grüne Grab", publisher: "Ravensburger", kind: "New", tags: ["Co-op"], booths: ["7.7D311"], boothFrom: "publisher" },

  { title: "Dorfromantik Südsee", en: "Dorfromantik – South Seas", publisher: "Pegasus Spiele", kind: "Spin-off", tags: ["Co-op"], booths: ["3.3K120", "3.3L110", "3.3M120"] },

  { title: "Minikin City", publisher: "Cranio Creations", kind: "New", booths: ["3.3T400"] },
  { title: "Crossing Heroes", publisher: "Cranio Creations", kind: "New", booths: ["3.3T400"] },

  { title: "La Cosecha", publisher: "Spielworxx", kind: "New", tags: ["Strategy"], booths: ["3.3B300"] },
  { title: "Québec", publisher: "Spielworxx", kind: "New", tags: ["Strategy"], booths: ["3.3B300"] },
  { title: "Molly House", publisher: "Spielworxx", kind: "New", tags: ["Strategy"], booths: ["3.3B300"] },

  { title: "Spell", publisher: "Skellig Games", kind: "New", booths: ["3.3C300"] },
  { title: "Tinctura", publisher: "Skellig Games", kind: "New", booths: ["3.3C300"] },
  { title: "Riffwelten", publisher: "Strohmann Games", kind: "New", booths: ["3.3T600"], boothFrom: "publisher" },
  { title: "Nacht im Zoo", en: "Night at the ZOO", publisher: "Albi", kind: "New", booths: ["4.4D400", "6.6E110"] },
  { title: "Yubibo", publisher: "Edition Spielwiese", kind: "New", booths: ["6.6A300"] },
  { title: "Wuselige Wiesen", publisher: "Frosted Games", kind: "New", booths: ["3.3G300"] },
];

/** Deep link into the official hall plan with the booth circled. */
export function boothMap(id: string) {
  return `https://maps.eyeled-services.de/maps/en/spiel26/stand/${id}`;
}

/** "3.3U210" → { hall: "3", stand: "3U210" } */
export function splitBooth(id: string) {
  const [hall, stand] = id.split(".");
  return { hall, stand };
}

export const TRACKERS = [
  {
    name: "BGG SPIEL '26 Preview",
    href: "https://boardgamegeek.com/geekpreview/93/spiel-essen-2026",
    note: "The main one. Filter, sort, save — and booth numbers for planning a route.",
  },
  {
    name: "Official novelties list",
    href: "https://www.spiel-essen.de/en/the-spiel/novelties",
    note: "Filled in by exhibitors themselves, with prices and player counts.",
  },
  {
    name: "SPIEL Essen app",
    href: "https://play.google.com/store/apps/details?id=com.eyeled.spiel&hl=en",
    note: "Same novelties data, updated for 2026, usable on the floor.",
  },
  {
    name: "brettspielbox A–Z",
    href: "https://brettspielbox.de/brettspiel-neuheiten-spiel-2026-herbst-2026-a-z/",
    note: "552 games with short previews. German.",
  },
  {
    name: "BGG: collection of lists",
    href: "https://boardgamegeek.com/geeklist/379404/essen-spiel-2026-collection-of-lists",
    note: "Community geeklists — most anticipated, preorder pickups, niche picks.",
  },
];
