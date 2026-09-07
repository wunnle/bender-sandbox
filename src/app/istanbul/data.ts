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
  "2026-09-07",
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
    days: ["2026-09-07"],
    title: "Kaktüs Çiçeği",
    kind: "theatre",
    time: "21:00",
    venue: "Özgürlük Parkı Amfi Tiyatro",
    area: "Kadıköy",
    price: "from ₺528",
    note: "No direct event page found — search Biletix for this title.",
  },
  {
    days: ["2026-09-07"],
    title: "The Invite / Davet",
    kind: "film",
    time: "20:30",
    venue: "İstanbul Yelken Kulübü",
    area: "Fenerbahçe/Kadıköy",
    price: "₺514",
    url: "https://biletinial.com/tr-tr/etkinlik/the-invite-davet-acik-hava-gosterimi",
  },
  {
    days: ["2026-09-08"],
    title: "Hadi Öldürsene Canikom",
    kind: "theatre",
    time: "21:00",
    venue: "Özgürlük Parkı",
    area: "Kadıköy",
    price: "from ₺1,120",
    note: "No direct event page found — search Bubilet for this title.",
  },
  {
    days: ["2026-09-08", "2026-09-09"],
    title: "Kadıköy Açık Mikrofon Stand Up",
    kind: "stand-up",
    time: "20:15",
    venue: "Corner Kadıköy",
    area: "Kadıköy",
    url: "https://www.biletix.com/etkinlik/5ZENK/TURKIYE/tr/art-kadikoy-acik-mikrofon-stand-up-08-09-2026-istanbul",
    note: "Price unavailable.",
  },
  {
    days: ["2026-09-08"],
    title: "Sil Baştan",
    kind: "film",
    time: "20:30",
    venue: "İstanbul Yelken Kulübü",
    area: "Fenerbahçe/Kadıköy",
    price: "₺514",
    url: "https://biletinial.com/tr-tr/etkinlik/sil-bastan",
  },
  {
    days: ["2026-09-08"],
    title: "Zengin Mutfağı",
    kind: "theatre",
    venue: "DasDas",
    area: "Ataşehir",
    note: "Time, price and direct event page unavailable — search Bubilet for this title.",
  },
  {
    days: ["2026-09-09"],
    title: "Mutlu Aile Tablosu",
    kind: "theatre",
    time: "21:00",
    venue: "Özgürlük Parkı",
    area: "Kadıköy",
    note: "Price and direct event page unavailable — search Bubilet for this title.",
  },
  {
    days: ["2026-09-10"],
    title: "Şairler Mezarlığı",
    kind: "theatre",
    time: "21:00",
    venue: "Özgürlük Parkı",
    area: "Kadıköy",
    note: "Price and direct event page unavailable — search Bubilet for this title.",
  },
  {
    days: ["2026-09-10"],
    title: "Yürüyen Şato",
    kind: "film",
    time: "20:30",
    venue: "İstanbul Yelken Kulübü",
    area: "Fenerbahçe/Kadıköy",
    price: "₺514",
    url: "https://biletinial.com/tr-tr/etkinlik/yuruyen-sato",
  },
  {
    days: ["2026-09-10"],
    title: "Doğu Demirkol",
    kind: "stand-up",
    venue: "Sancaktepe Sahnesi",
    area: "Sancaktepe",
    note: "Time, price and direct event page unavailable — search Bubilet for this title.",
  },
  {
    days: ["2026-09-11"],
    title: "Kamufle",
    kind: "concert",
    venue: "Muaf Kadıköy",
    area: "Kadıköy",
    note: "Time, price and direct event page unavailable — search Bubilet for this title.",
  },
  {
    days: ["2026-09-11"],
    title: "The Bodyguard",
    kind: "musical",
    time: "20:30",
    venue: "Zorlu PSM",
    area: "Beşiktaş",
    price: "₺5,500–₺7,500",
    url: "https://www.passo.com.tr/tr/etkinlik/bodyguard-muzikali-zorlupsm-turkcell-sahnesi-biletleri/11485326",
  },
  {
    days: ["2026-09-12"],
    title: "Ayna",
    kind: "concert",
    time: "21:00",
    venue: "Özgürlük Parkı",
    area: "Kadıköy",
    price: "from ₺1,150",
    note: "No direct event page found — search Biletix for this title.",
  },
  {
    days: ["2026-09-12"],
    title: "Maher Zain",
    kind: "concert",
    time: "21:00",
    venue: "Harbiye Açıkhava",
    area: "Şişli",
    price: "approx ₺1,230–₺1,400",
    url: "https://biletinial.com/tr-tr/muzik/maher-zain-konseri",
  },
  {
    days: ["2026-09-12", "2026-09-13"],
    title: "Rock’n Park İstanbul",
    kind: "festival",
    venue: "Life Park",
    area: "Sarıyer",
    price: "from approx ₺2,690",
    note: "No direct event page found — search Biletix for this title.",
  },
  {
    days: ["2026-09-12"],
    title: "Ersay Üner",
    kind: "concert",
    venue: "Jolly Joker Vadistanbul",
    area: "Sarıyer",
    price: "from approx ₺3,940",
    note: "Time and direct event page unavailable — search Bubilet for this title.",
  },
  {
    days: ["2026-09-13"],
    title: "Zülfü Livaneli & Maria Farantouri",
    kind: "concert",
    time: "21:00",
    venue: "Harbiye Açıkhava",
    area: "Şişli",
    note: "Price and direct event page unavailable — search Biletix for this title.",
  },
  {
    days: ["2026-09-14"],
    title: "Aşk ve Gurur",
    kind: "film",
    time: "20:30",
    venue: "İstanbul Yelken Kulübü",
    area: "Fenerbahçe/Kadıköy",
    price: "₺514",
    url: "https://biletinial.com/tr-tr/etkinlik/ask-ve-gurur-film-gosterimi",
  },
];

export const CINEMAS = [
  {
    name: "Kadıköy Sineması",
    area: "Kadıköy",
    films: "Paris, Texas; En Sevdiğim Pastam; Birlikte; Dalga",
    url: "https://biletinial.com/tr-tr/mekan/kadikoy-sinemasi",
  },
  {
    name: "Paribu Cineverse Akasya",
    area: "Üsküdar",
    films: "Harry Potter ve Felsefe Taşı; Doraemon: Şeytanların Denizaltı Kalesi; Cebran; Sadece Bir Gece",
    url: "https://www.paribucineverse.com/filmler",
  },
];
