export type Category = "music" | "theatre" | "cinema" | "art" | "other";

export type Ev = {
  date: string; // ISO
  time?: string;
  title: string;
  venue: string;
  price?: string;
  cat: Category;
  url?: string;
  note?: string;
  unconfirmed?: boolean;
  pick?: boolean;
};

// Week of Tue 1 – Mon 7 Sept 2026, plus a few worth planning ahead for.
export const EVENTS: Ev[] = [
  {
    date: "2026-09-01",
    title: "Gaye Su Akyol, Kalben, Ceylan Ertem, Nilipek, Nova Norda, Yasemin Mori, Eda Baba",
    venue: "Harbiye Cemil Topuzlu Açıkhava",
    cat: "music",
    url: "https://www.songkick.com/metro-areas/32463-turkey-istanbul/september-2026",
    note: "All-women lineup — the single best night of the week if you only pick one",
    pick: true,
  },
  {
    date: "2026-09-02",
    title: "Yıldız Tilbe",
    venue: "Ataköy Marina Açık Hava",
    cat: "music",
    url: "https://www.songkick.com/metro-areas/32463-turkey-istanbul/september-2026",
  },
  {
    date: "2026-09-02",
    title: "Çalıkuşu — Eyfel Sema Çoruh",
    venue: "Taksim İstiklal Sahne",
    price: "from 300₺",
    cat: "theatre",
    url: "https://www.bubilet.com.tr/mekan/taksim-istiklal-sahne",
    note: "One-woman show. Start time not published; İstiklal Sahne weeknights are usually 20:30",
    unconfirmed: true,
    pick: true,
  },
  {
    date: "2026-09-02",
    time: "20:00–22:00",
    title: "LEGOLAND Yetişkin Gecesi (18+)",
    venue: "LEGOLAND Discovery Centre, Forum Istanbul, Bayrampaşa",
    cat: "other",
    url: "https://www.biletix.com/etkinlik-grup/140566923/TURKIYE/tr/legoland-discovery-centre",
    note: "Billed as first Wednesday monthly — free build competitions, 4D film, pizza and beer. No live 2026 listing found; call before planning around it",
    unconfirmed: true,
  },
  {
    date: "2026-09-02",
    title: "KAOS (instrumental jazz)",
    venue: "AKM Çok Amaçlı Salon",
    cat: "music",
    url: "https://akmistanbul.gov.tr",
    note: "Türk Telekom Prime AKM summer series",
  },
  { date: "2026-09-02", title: "yung ouzo", venue: "Dorock XL", cat: "music" },
  { date: "2026-09-03", title: "Ufuk Beydemir", venue: "Blind, Kadıköy", cat: "music" },
  {
    date: "2026-09-04",
    title: "Sertab Erener",
    venue: "Harbiye Cemil Topuzlu Açıkhava",
    cat: "music",
  },
  {
    date: "2026-09-04",
    title: "The Great Gatsby — open-air screening",
    venue: "AKM Açık Hava Sineması",
    cat: "cinema",
  },
  {
    date: "2026-09-04",
    title: "Ağzı Çiçekli Adam",
    venue: "Cafe Theatre Koşuyolu",
    cat: "theatre",
    note: "Also 5 and 6 Sept",
  },
  {
    date: "2026-09-04",
    title: "Flashback 90'lar Türkçe Pop Gecesi",
    venue: "Jolly Joker Vadistanbul",
    cat: "music",
  },
  { date: "2026-09-04", title: "Su Soley", venue: "Swissôtel The Bosphorus", cat: "music" },
  {
    date: "2026-09-05",
    title: "Gogol Bordello",
    venue: "JJ Arena Ataşehir",
    cat: "music",
    url: "https://www.songkick.com/metro-areas/32463-turkey-istanbul/september-2026",
    pick: true,
  },
  { date: "2026-09-05", title: "Can Bonomo", venue: "Paribu Vadi Açıkhava", cat: "music" },
  { date: "2026-09-05", title: "Kenan Doğulu", venue: "Maximum Uniq Açıkhava", cat: "music" },
  { date: "2026-09-05", title: "Gökhan Türkmen", venue: "Jolly Joker Vadistanbul", cat: "music" },
  {
    date: "2026-09-05",
    title: "Emre Aydın",
    venue: "Selamiçeşme Özgürlük Parkı Amfi, Kadıköy",
    cat: "music",
  },
  {
    date: "2026-09-05",
    title: "Sertab Erener (2nd night)",
    venue: "Harbiye Cemil Topuzlu Açıkhava",
    cat: "music",
  },
  {
    date: "2026-09-05",
    time: "20:30",
    title: "Fareler ve İnsanlar",
    venue: "Bakırköy Butik Sahne — İzzet Molla Sk. No:12",
    price: "from 240₺",
    cat: "theatre",
    url: "https://www.bubilet.com.tr/mekan/bakirkoy-butik-sahne",
    note: "Steinbeck two-hander: Furkan Karayama and Müslüm Çelik, dir. Muhammet Emre Aydın. Not the 672–728₺ touring production — that one plays Ankara and Antalya",
    pick: true,
  },
  {
    date: "2026-09-05",
    title: "Inception — open-air screening",
    venue: "AKM Açık Hava Sineması",
    cat: "cinema",
  },
  {
    date: "2026-09-05",
    title: "Lifepark K-Pop Festival — P1Harmony, AleXa",
    venue: "Lifepark",
    cat: "music",
  },
  {
    date: "2026-09-05",
    title: "Ayna / Ayta Sözeri / Fatih Erkoç / Cihan Mürtezaoğlu",
    venue: "JJ Atakent · JJ Kartal · Swissôtel · Burgazada",
    cat: "music",
  },
  { date: "2026-09-06", title: "Simge", venue: "Paribu Vadi Açıkhava", cat: "music" },
  {
    date: "2026-09-06",
    title: "Sibel Can",
    venue: "Harbiye Cemil Topuzlu Açıkhava",
    cat: "music",
  },
  { date: "2026-09-06", title: "Ferit Odman (jazz)", venue: "Swissôtel The Bosphorus", cat: "music" },
  {
    date: "2026-09-06",
    title: "Aşk ve Yaşam — open-air screening",
    venue: "Zorlu PSM Vestel Amfi",
    cat: "cinema",
  },
  {
    date: "2026-09-07",
    time: "16:00",
    title: "Fareler ve İnsanlar (matinee)",
    venue: "Bakırköy Butik Sahne",
    price: "from 240₺",
    cat: "theatre",
    url: "https://www.bubilet.com.tr/mekan/bakirkoy-butik-sahne",
    note: "Afternoon show, not an evening one",
  },
  {
    date: "2026-09-07",
    title: "Hayko Cepkin",
    venue: "Harbiye Cemil Topuzlu Açıkhava",
    cat: "music",
  },
  { date: "2026-09-07", title: "Erol Evgin", venue: "Harbiye Açıkhava", cat: "music" },
  { date: "2026-09-07", title: "Yaşar", venue: "Swissôtel The Bosphorus", cat: "music" },
];

export const LATER: Ev[] = [
  {
    date: "2026-09-11",
    time: "21:30",
    title: "Jojo Mayer — ME/MACHINE",
    venue: "Komünite, Kadıköy — Kurbağalıdere Cd. No:2/2",
    cat: "music",
    url: "https://komunite.social/event/jojo-mayer-konser",
    note: "Solo improvised duet with a machine that mutates his drum patterns. Tickets via Paribu Pass; price not published",
    pick: true,
  },
  {
    date: "2026-09-12",
    title: "Festibağ — music, art, gastronomy (2 days)",
    venue: "Swissôtel The Bosphorus & Chalet Garden",
    cat: "other",
  },
  {
    date: "2026-09-19",
    title: "Istanbul Fringe Festival, 8th edition (to 26 Sept)",
    venue: "Various",
    cat: "theatre",
  },
  {
    date: "2026-09-23",
    title: "Contemporary Istanbul Edition21 (to 27 Sept)",
    venue: "Tersane",
    cat: "art",
  },
  {
    date: "2026-11-05",
    title: "Jojo Mayer & Nerve — Garanti Caz Yeşili",
    venue: "Babylon Bomonti",
    cat: "music",
    url: "https://www.songkick.com/artists/3009231-jojo-mayer",
    note: "The full-band show, if you'd rather have Nerve than the solo set",
  },
];

export const ONGOING: Ev[] = [
  {
    date: "2026-09-01",
    title: "Türk Resmini İzlemek",
    venue: "İş Bankası Resim Heykel Müzesi",
    price: "free",
    cat: "art",
    note: "Runs all month",
  },
];
