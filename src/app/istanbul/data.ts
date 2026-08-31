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
    when: "Wed 2 Sept · 19:30  ·  Fri 4 Sept · 18:15  ·  Sun 6 Sept · 16:00",
    title: "Anna Karenina",
    blurb:
      "Tolstoy as a single interior monologue — Anna in her own voice rather than seen through everyone else's, from the glittering salons inward. Ali Aktı performs it solo.",
    venue: "Bakırköy Butik Sahne",
    address: "Cevizlik, İzzet Molla Sk. No:12, Bakırköy",
    price: "from 300₺ · unnumbered seating",
    url: "https://www.bubilet.com.tr/istanbul/etkinlik/anna-karenina-",
    urlLabel: "Bubilet — dated listing",
    note: "Pray Tiyatro, dir. Muhammet Emre Aydın. 50 minutes, ages 10+. No late entry once it starts.",
    warn:
      "Bubilet has two near-identical pages for this and the other one lists no sessions at all. The link above is the one with live dates.",
  },
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
    url: "https://www.bubilet.com.tr/istanbul/etkinlik/-fareler-ve-insanlar--",
    urlLabel: "Bubilet — dated listing",
    note: "Adapted by Sude Naz Demirci. Unnumbered seating. The 7 Sept show is a 16:00 matinee, not an evening one.",
    warn:
      "Bubilet hosts three pages under this title and two of them are the wrong production — the Ankara Yeni Sahne touring version, which plays Ankara and Antalya, not Istanbul. The link above is the Butik Sahne one.",
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
];
