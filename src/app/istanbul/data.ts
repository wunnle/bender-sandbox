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

export const CINEMAS: {
  name: string;
  area: string;
  films: string;
  url: string;
}[] = [];
