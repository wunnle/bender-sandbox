export type Kind =
  | "theatre"
  | "stand-up"
  | "musical"
  | "concert"
  | "festival"
  | "open-air cinema"
  | "sailing";

export type Category = "stage" | "music" | "screen" | "outdoors";

export type Ev = {
  /** ISO days the event runs on */
  days: string[];
  title: string;
  kind: Kind;
  time?: string;
  venue: string;
  area: string;
  price?: string;
  url: string;
  note?: string;
};

export const CATEGORY_OF: Record<Kind, Category> = {
  theatre: "stage",
  "stand-up": "stage",
  musical: "stage",
  concert: "music",
  festival: "music",
  "open-air cinema": "screen",
  sailing: "outdoors",
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
  outdoors: {
    label: "Outdoors",
    dot: "bg-emerald-400",
    text: "text-emerald-400",
    chip: "bg-emerald-400/10 text-emerald-200 ring-emerald-400/30",
    ring: "ring-emerald-400/40",
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
    url: "https://www.biletix.com/search/TURKIYE/tr?searchText=Kakt%C3%BCs%20%C3%87i%C3%A7e%C4%9Fi",
  },
  {
    days: ["2026-09-07"],
    title: "The Invite / Davet",
    kind: "open-air cinema",
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
    url: "https://www.bubilet.com.tr/arama?q=Hadi%20%C3%96ld%C3%BCrsene%20Canikom",
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
    kind: "open-air cinema",
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
    url: "https://www.bubilet.com.tr/arama?q=Zengin%20Mutfa%C4%9F%C4%B1",
    note: "Time and price unavailable.",
  },
  {
    days: ["2026-09-09"],
    title: "Mutlu Aile Tablosu",
    kind: "theatre",
    time: "21:00",
    venue: "Özgürlük Parkı",
    area: "Kadıköy",
    url: "https://www.bubilet.com.tr/arama?q=Mutlu%20Aile%20Tablosu",
    note: "Price unavailable.",
  },
  {
    days: ["2026-09-10"],
    title: "Şairler Mezarlığı",
    kind: "theatre",
    time: "21:00",
    venue: "Özgürlük Parkı",
    area: "Kadıköy",
    url: "https://www.bubilet.com.tr/arama?q=%C5%9Eairler%20Mezarl%C4%B1%C4%9F%C4%B1",
    note: "Price unavailable.",
  },
  {
    days: ["2026-09-10"],
    title: "Yürüyen Şato",
    kind: "open-air cinema",
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
    url: "https://www.bubilet.com.tr/arama?q=Do%C4%9Fu%20Demirkol",
    note: "Time and price unavailable.",
  },
  {
    days: ["2026-09-11"],
    title: "Kamufle",
    kind: "concert",
    venue: "Muaf Kadıköy",
    area: "Kadıköy",
    url: "https://www.bubilet.com.tr/arama?q=Kamufle",
    note: "Time and price unavailable.",
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
    url: "https://www.biletix.com/search/TURKIYE/tr?searchText=Ayna",
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
    url: "https://www.biletix.com/search/TURKIYE/tr?searchText=Rock%27n%20Park%20%C4%B0stanbul",
  },
  {
    days: ["2026-09-12"],
    title: "Ersay Üner",
    kind: "concert",
    venue: "Jolly Joker Vadistanbul",
    area: "Sarıyer",
    price: "from approx ₺3,940",
    url: "https://www.bubilet.com.tr/arama?q=Ersay%20%C3%9Cner",
    note: "Time unavailable.",
  },
  {
    days: ["2026-09-13"],
    title: "Zülfü Livaneli & Maria Farantouri",
    kind: "concert",
    time: "21:00",
    venue: "Harbiye Açıkhava",
    area: "Şişli",
    url: "https://www.biletix.com/search/TURKIYE/tr?searchText=Z%C3%BClf%C3%BC%20Livaneli",
    note: "Price unavailable.",
  },
  {
    days: ["2026-09-12", "2026-09-13"],
    title: "İYK Sportsboat Türkiye Trophy",
    kind: "sailing",
    venue: "İstanbul Yelken Kulübü",
    area: "Fenerbahçe/Kadıköy",
    url: "https://www.iyk.org.tr/",
    note: "No spectator ticket.",
  },
  {
    days: ["2026-09-14"],
    title: "Aşk ve Gurur",
    kind: "open-air cinema",
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
