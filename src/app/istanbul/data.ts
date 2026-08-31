export type Ev = {
  when: string;
  title: string;
  blurb: string;
  venue: string;
  address?: string;
  price?: string;
  url: string;
  urlLabel: string;
  alt?: { url: string; label: string };
  note?: string;
  warn?: string;
};

export const EVENTS: Ev[] = [
  {
    when: "Fri 4 Sept · 20:30  ·  Sun 6 Sept · 18:15",
    title: "Çalıkuşu",
    blurb:
      "Eyfel Sema Çoruh alone on stage as Feride, from Reşat Nuri Güntekin's 1922 novel. Short — audience reports put it at 35–40 minutes.",
    venue: "Bakırköy Butik Sahne",
    address: "Cevizlik, İzzet Molla Sk. No:12, Bakırköy",
    price: "from 550₺ · unnumbered seating",
    url: "https://www.bubilet.com.tr/istanbul/etkinlik/calikusu",
    urlLabel: "Bubilet — dated listing",
    note: "Pray Tiyatro, dir. Muhammet Emre Aydın. Later run at Taksim İstiklal Sahne: 18 Sept and 4 Oct, 20:30, from 800₺.",
    warn:
      "A Cumhuriyet listing put this at Taksim İstiklal Sahne on 2 Sept. Bubilet's own dated calendar says Bakırköy on the 4th and 6th — I'd trust the seller.",
  },
  {
    when: "Sat 5 Sept · 20:30  ·  Mon 7 Sept · 16:00",
    title: "Fareler ve İnsanlar",
    blurb:
      "Steinbeck's Of Mice and Men carried by two actors — Furkan Karayama and Müslüm Çelik. Same company and director as Çalıkuşu.",
    venue: "Bakırköy Butik Sahne",
    address: "Cevizlik, İzzet Molla Sk. No:12, Bakırköy",
    price: "from 240₺",
    url: "https://www.bubilet.com.tr/mekan/bakirkoy-butik-sahne",
    urlLabel: "Bubilet — venue calendar",
    note: "The 7 Sept show is a 16:00 matinee, not an evening one.",
    warn:
      "Don't confuse it with the 672–728₺ touring production of the same name — that one plays Ankara, Antalya and Muğla this month, not Istanbul.",
  },
  {
    when: "Sat 5 Sept · 18:00  ·  Sun 6 Sept · 20:30",
    title: "Ağzı Çiçekli Adam",
    blurb:
      "Pirandello, staged and performed by Metin Zakoğlu — a man facing death rediscovering his life. The café runs as a cabaret from 20:30.",
    venue: "Cafe Theatre Koşuyolu",
    address: "Bekir Sıtkı Sezgin Sk. No:168, Koşuyolu",
    price: "5 Sept from 600₺ (unnumbered) · 6 Sept from 1000₺ (assigned seats)",
    url: "https://www.bubilet.com.tr/istanbul/etkinlik/agzi-cicekli-adam",
    urlLabel: "Bubilet — dated listing",
    note: "Also played 1 Sept; runs every Tue and Sat through 29 Sept if these dates don't work.",
  },
  {
    when: "Fri 11 Sept · 21:30",
    title: "Jojo Mayer — ME/MACHINE",
    blurb:
      "Solo improvised duet against a custom music engine that reinterprets his drumming live. Grew out of an experimental session with Brian Eno.",
    venue: "Komünite, Terminal Istanbul, Kadıköy",
    address: "Kurbağalıdere Cd. No:2/2 — 3 min walk from Söğütlüçeşme",
    price: "1.400₺ (1.386₺ in the app)",
    url: "https://pass.paribu.com/muzik/jojo-mayer",
    urlLabel: "Paribu Pass — buy",
    alt: { url: "https://komunite.social/event/jojo-mayer-konser", label: "venue page" },
    note: "Open-air, 18+, unreserved seating so arrive early. No outside food or drink.",
  },
  {
    when: "Sun 8 Nov · 15:00 and 20:30  ·  Mon 9 Nov · 15:00",
    title: "Bovary",
    blurb:
      "Flaubert reworked as contemporary feminist theatre — Emma as a 21st-century voice rather than a naive dreamer. Flemish Royal Theatre production.",
    venue: "Zorlu PSM",
    price: "2.000–3.000₺",
    url: "https://www.timeout.com/istanbul/tr/tiyatro/bovary",
    urlLabel: "Time Out — details",
    alt: { url: "https://www.iksv.org/en/events/current-events", label: "İKSV festival" },
    note:
      "Dir. Carme Portaceli and Michael De Cock, with Maaike Neuville, Koen De Sutter and Ana Naqe. Part of the Istanbul Theatre Festival's 'A Woman in This' strand — well outside this week, but it's the only Istanbul staging.",
  },
];

export const DEAD = {
  title: "LEGOLAND Yetişkin Gecesi",
  body:
    "There is nothing to book. LEGOLAND Discovery Centre Istanbul, at Forum Istanbul in Bayrampaşa, operated from 2015 and closed in 2025. The 18+ adult nights — 20:00 start, free build competitions, 4D film, pizza and beer — went with it. Every page still describing them is stale.",
};
