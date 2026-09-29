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
  },
  {
    title: "Kingdom Come: Deliverance – The Board Game",
    publisher: "Czech Games Edition",
    designers: "Tomáš Holek (co-designer)",
    kind: "New",
    buzz: true,
    blurb: "Board game adaptation of the Czech medieval RPG.",
  },
  {
    title: "Carpet Racers",
    designers: "Tomáš Holek",
    kind: "New",
    buzz: true,
    blurb: "Chaotic racing game where players steer cards without knowing which one is theirs.",
  },
  {
    title: "Greenwood",
    publisher: "Feuerland",
    designers: "Christos Giannakoulas, Manolis Zachariadis",
    kind: "New",
    tags: ["Strategy"],
    buzz: true,
    blurb: "Fantasy euro: primal spirits rescue creatures from a corrupted druid grove.",
  },
  {
    title: "Stonesaga",
    designers: "Max Brooke, Luke Eddy",
    kind: "New",
    tags: ["Co-op", "Narrative"],
    buzz: true,
    blurb: "Co-op exploration with survival crafting, played across several generations of characters.",
  },
  {
    title: "Gaudí",
    designers: "Dani Garcia",
    kind: "New",
    buzz: true,
    blurb: "Tile placement about the architect, scoring across Nature, Catalonia and Religion.",
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
  },
  {
    title: "Blood Hunt",
    kind: "New",
    buzz: true,
    blurb: "Four-player vampire game: secretly draft cards to claim citizens across the city's districts.",
  },
  {
    title: "Aridnyk",
    publisher: "Boardova",
    kind: "New",
    buzz: true,
    blurb: "Tile game from Hutsul mythology: shepherd your flocks and deal with mythic creatures.",
  },
  {
    title: "Harmonies: Crescendo",
    publisher: "Libellud",
    kind: "Expansion",
    buzz: true,
    blurb: "New board layouts, scoring and animal cards, plus “Whisper Creatures”.",
  },

  { title: "Entropy", publisher: "Board & Dice (DE: Frosted Games)", kind: "New", tags: ["Strategy"] },
  { title: "Thessaloniki", publisher: "Board & Dice", kind: "New" },
  { title: "Maestro", publisher: "Board & Dice", kind: "New" },
  { title: "Windmill Valley Duel", publisher: "Board & Dice", kind: "Spin-off", tags: ["Two-player"] },

  { title: "Flügelschlag: Mittel- und Südamerika", en: "Wingspan: Central & South America", publisher: "Feuerland", kind: "Expansion" },
  { title: "Flügelschlag: Regionen Fan-Set 1", en: "Wingspan: Regions fan pack 1", publisher: "Feuerland", kind: "Expansion" },
  { title: "Flossenschlag: Haie und Riffe", en: "Finspan: Sharks & Reefs", publisher: "Feuerland", kind: "Expansion" },
  { title: "Age of Innovation: Zukunft und Vergangenheit", publisher: "Feuerland", kind: "Expansion", tags: ["Strategy"] },
  { title: "Viticulture: Bordeaux", publisher: "Feuerland", kind: "Expansion" },
  { title: "Melochs Duell", publisher: "Feuerland", kind: "New", tags: ["Two-player"] },

  { title: "Mischwald – Smokey Mountains", en: "Forest Shuffle: Smokey Mountains", publisher: "Lookout Spiele", kind: "Expansion" },
  { title: "Duell der Drachen", publisher: "Lookout Spiele", kind: "New", tags: ["Two-player"] },

  { title: "Carcassonne 25 Jahre", en: "Carcassonne 25th anniversary", publisher: "Hans im Glück", kind: "Spin-off" },

  { title: "CATAN – Japan", publisher: "Kosmos", kind: "Expansion" },
  { title: "Andor – Ewige Kälte: Das Licht der Dunkelklinge", publisher: "Kosmos", kind: "Spin-off", tags: ["Co-op", "Narrative"] },
  { title: "Fourth Wing – Das Spiel", en: "Fourth Wing: The Game", publisher: "Kosmos", kind: "New" },
  { title: "EXIT – Der perfekte Einbruch", publisher: "Kosmos", kind: "New", tags: ["Co-op"] },

  { title: "Horrified: Dungeons & Dragons – Ravenloft", publisher: "Ravensburger", kind: "Spin-off", tags: ["Co-op"] },
  { title: "Scotland Yard – Duel", publisher: "Ravensburger", kind: "Spin-off", tags: ["Two-player"] },
  { title: "echoes – Das grüne Grab", publisher: "Ravensburger", kind: "New", tags: ["Co-op"] },

  { title: "Dorfromantik Südsee", en: "Dorfromantik: South Seas", publisher: "Pegasus Spiele", kind: "Spin-off", tags: ["Co-op"] },

  { title: "Minikin City", publisher: "Cranio Creations", kind: "New" },
  { title: "Crossing Heroes", publisher: "Cranio Creations", kind: "New" },

  { title: "La Cosecha", publisher: "Spielworxx", kind: "New", tags: ["Strategy"] },
  { title: "Québec", publisher: "Spielworxx", kind: "New", tags: ["Strategy"] },
  { title: "Molly House", publisher: "Spielworxx", kind: "New", tags: ["Strategy"] },

  { title: "Spell", publisher: "Skellig Games", kind: "New" },
  { title: "Tinctura", publisher: "Skellig Games", kind: "New" },
  { title: "Riffwelten", publisher: "Strohmann Games", kind: "New" },
  { title: "Nacht im Zoo", publisher: "Albi", kind: "New" },
  { title: "Yubibo", publisher: "Edition Spielwiese", kind: "New" },
  { title: "Wuselige Wiesen", publisher: "Frosted Games", kind: "New" },
];

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
