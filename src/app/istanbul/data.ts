export type Kind =
  | "theatre"
  | "stand-up"
  | "musical"
  | "concert"
  | "festival"
  | "film";

export type Category = "stage" | "music" | "screen";

export type Ev = {
  /** ISO days the event runs on */
  days: string[];
  title: string;
  kind: Kind;
  time?: string;
  venue: string;
  area: string;
  price?: string;
  /** omitted when no reliable direct event page exists — see `note` */
  url?: string;
  note?: string;
};

export const CATEGORY_OF: Record<Kind, Category> = {
  theatre: "stage",
  "stand-up": "stage",
  musical: "stage",
  concert: "music",
  festival: "music",
  film: "screen",
};

export const CATEGORY_META: Record<
  Category,
  { label: string; dot: string; text: string; chip: string; ring: string }
> = {
  stage: {
    label: "Stage",
    dot: "bg-amber-400",
    text: "text-amber-400",
    chip: "bg-amber-400/10 text-amber-200 ring-amber-400/30",
    ring: "ring-amber-400/40",
  },
  music: {
    label: "Music",
    dot: "bg-violet-400",
    text: "text-violet-400",
    chip: "bg-violet-400/10 text-violet-200 ring-violet-400/30",
    ring: "ring-violet-400/40",
  },
  screen: {
    label: "Screen",
    dot: "bg-sky-400",
    text: "text-sky-400",
    chip: "bg-sky-400/10 text-sky-200 ring-sky-400/30",
    ring: "ring-sky-400/40",
  },
};

export const DAYS = [
  "2026-09-08",
  "2026-09-09",
  "2026-09-10",
  "2026-09-11",
  "2026-09-12",
  "2026-09-13",
  "2026-09-14",
];

export const EVENTS: Ev[] = [
  {
    days: ["2026-09-08"],
    title: "Hadi Öldürsene Canikom",
    kind: "theatre",
    time: "21:00",
    venue: "Özgürlük Parkı Amfi Tiyatro",
    area: "Kadıköy",
    price: "from ₺1,118",
    url: "https://biletinial.com/tr-tr/tiyatro/hadi-oldursene-canikom-tiyatro-etkinligi",
  },
  {
    days: ["2026-09-09"],
    title: "Mutlu Aile Tablosu",
    kind: "theatre",
    time: "21:00",
    venue: "Özgürlük Parkı Amfi Tiyatro",
    area: "Kadıköy",
    price: "from ₺1,370",
    url: "https://www.bubilet.com.tr/istanbul/etkinlik/mutlu-aile-tablosu-oyunu",
  },
  {
    days: ["2026-09-10"],
    title: "Şairler Mezarlığı",
    kind: "theatre",
    time: "21:00",
    venue: "Özgürlük Parkı Amfi Tiyatro",
    area: "Kadıköy",
    price: "from ₺700",
    url: "https://biletinial.com/tr-tr/tiyatro/sairler-mezarligi",
  },
  {
    days: ["2026-09-11", "2026-09-12", "2026-09-13"],
    title: "The Bodyguard",
    kind: "musical",
    venue: "Zorlu PSM Turkcell Sahnesi",
    area: "Beşiktaş",
    price: "from ₺3,300",
    url: "https://biletinial.com/tr-tr/muzik/the-bodyguard",
    note: "Evenings around 20:30; Sep 13 matinee 15:30.",
  },
  {
    days: ["2026-09-12"],
    title: "Ayna",
    kind: "concert",
    time: "21:00",
    venue: "Özgürlük Parkı Amfi Tiyatro",
    area: "Kadıköy",
    price: "from ₺1,150",
    url: "https://biletinial.com/tr-tr/muzik/ayna-konserii",
  },
  {
    days: ["2026-09-12", "2026-09-13"],
    title: "Rock’n Park İstanbul",
    kind: "festival",
    time: "16:00",
    venue: "Life Park",
    area: "Sarıyer",
    price: "from ₺2,100",
    url: "https://www.bubilet.com.tr/istanbul/etkinlik/rockn-park-istanbul/seans/267610",
    note: "Festival lineup varies by day.",
  },
  {
    days: ["2026-09-13"],
    title: "İstanbul Coffee Festival 2026",
    kind: "festival",
    time: "1. Seans",
    venue: "Tepe Nautilus",
    area: "Kadıköy",
    price: "₺410",
    url: "https://dsmbilet.com/etkinlikler/istanbul-coffee-festival-2026/13-eylul-pazar-1-seans",
    note: "Login required to purchase.",
  },
];

export const CINEMAS = [
  {
    name: "Kadıköy Sineması",
    area: "Kadıköy",
    films: "Harry Potter ve Felsefe Taşı; Aşıklar Şehri; Komşum Totoro; Prenses Mononoke; Bir Zamanlar Anadolu'da",
    url: "https://biletinial.com/tr-tr/mekan/kadikoy-sinemasi",
  },
];
