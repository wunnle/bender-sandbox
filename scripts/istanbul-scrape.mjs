// Refreshes event-data.json from Biletinial for the rolling 20-day Istanbul
// window: the preferred theatre venue tabs and the independent cinemas.
//
// The daily Hermes job used to do this sweep by hand, page by page, and gave
// up before finishing; this does the same sweep the same way every run.
// Calendar ownership, Biletix-only events and IMDb enrichment stay with the
// agent: records the scraper does not cover are carried over from the previous
// payload, and enrichment fields are copied onto matching new records.
//
//   node scripts/istanbul-scrape.mjs            dry run, prints the summary
//   node scripts/istanbul-scrape.mjs --write    also writes event-data.json
//   --start YYYY-MM-DD                          override the window start
import fs from "node:fs";
import path from "node:path";

const BASE = "https://biletinial.com";
const UA =
  "Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140 Safari/537.36";
const DATA_FILE = path.join(process.cwd(), "event-data.json");
const WINDOW_DAYS = 20;

// `match` is the venue-name prefix a session row must carry; a production
// page lists its whole tour, and only the preferred venue's stops belong here.
const THEATRE_VENUES = [
  { name: "Moda Sahnesi", loc: 15880, match: "moda sahnesi" },
  { name: "Bostancı Gösteri Merkezi", loc: 17011, match: "bostancı gösteri merkezi" },
  { name: "Tiyatro Akla Kara", loc: 15863, match: "tiyatro akla kara" },
  { name: "Caddebostan Kültür Merkezi", loc: 15738, match: "caddebostan kültür merkezi" },
  { name: "Özgürlük Parkı", loc: 15866, match: "özgürlük parkı" },
  { name: "Kadıköy Eğitim Sahnesi", loc: 18051, match: "kadıköy eğitim sahnesi" },
];

const CINEMAS = [
  { name: "Kadıköy Sineması", path: "/tr-tr/mekan/kadikoy-sinemasi", area: "Kadıköy" },
  { name: "Caddebostan CKM Sineması", path: "/tr-tr/mekan/caddebostan-ckm-sinemasi", area: "Kadıköy" },
  {
    name: "İstanbul Yelken Kulübü Açık Hava Sineması",
    path: "/tr-tr/mekan/istanbul-yelken-kulubu-acik-hava-sinemasi",
    area: "Fenerbahçe/Kadıköy",
  },
];

const AREAS = { "bostancı gösteri merkezi": "Bostancı/Kadıköy" };

// Sinan has turned these down; payload preferences can add more.
const REJECTED = [
  "erol evgin", "karanlıkta diyalog", "candan erçetin", "ajda pekkan", "leman sam", "bengü", "serdar ortaç",
];

// Fields the agent adds after the sweep (IMDb, descriptions, credits). They
// are copied onto the new record for the same production or film.
const ENRICHMENT = [
  "sourceTitle", "description", "duration", "genre", "director", "cast", "rating",
  "reviewCount", "trailer", "imdbId", "imdbUrl", "imdbRating", "imdbVotes", "imdbImage",
  "imdbTitle", "imdbYear", "imdbType", "ageLimit",
];

const MONTHS = ["ocak", "şubat", "mart", "nisan", "mayıs", "haziran", "temmuz", "ağustos", "eylül", "ekim", "kasım", "aralık"];

const args = process.argv.slice(2);
const write = args.includes("--write");
const startArg = args.includes("--start") ? args[args.indexOf("--start") + 1] : null;

const today = startArg || new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(new Date());
const addDays = (iso, n) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const start = today;
const end = addDays(today, WINDOW_DAYS - 1);
const inWindow = (day) => day >= start && day <= end;

const errors = [];
const sources = [];
const venueReports = [];

const clean = (s) =>
  (s || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
const lower = (s) => clean(s).toLocaleLowerCase("tr-TR");

async function get(url, { ajax = false, json = false } = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url.startsWith("http") ? url : BASE + url, {
        headers: { "User-Agent": UA, ...(ajax ? { "X-Requested-With": "XMLHttpRequest" } : {}) },
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return json ? await res.json() : await res.text();
    } catch (e) {
      if (attempt >= 3) throw new Error(`${e.message}: ${url}`);
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
}

// "10 Kasım Salı" carries no year: take the one that lands nearest the window.
function turkishDay(text) {
  const m = lower(text).match(/^(\d{1,2})\s+(\S+)/);
  if (!m) return null;
  const month = MONTHS.indexOf(m[2]);
  if (month < 0) return null;
  const year = Number(start.slice(0, 4));
  const candidates = [year - 1, year, year + 1].map(
    (y) => `${y}-${String(month + 1).padStart(2, "0")}-${m[1].padStart(2, "0")}`,
  );
  return candidates.reduce((best, c) =>
    Math.abs(Date.parse(c) - Date.parse(start)) < Math.abs(Date.parse(best) - Date.parse(start)) ? c : best,
  );
}

function jsonLd(html) {
  const out = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const v = JSON.parse(m[1]);
      out.push(...(Array.isArray(v) ? v : [v]));
    } catch {
      // Malformed blocks only cost metadata, never sessions.
    }
  }
  return out;
}

function pageImage(html) {
  for (const o of jsonLd(html)) {
    const img = Array.isArray(o.image) ? o.image[0] : o.image;
    if (typeof img === "string" && img.startsWith("http")) return img;
  }
  const og = html.match(/<meta property="og:image" content="([^"]+)"/);
  return og ? og[1] : undefined;
}

// Production and event pages list every session as <div class="row" id="seans-N">.
function sessionRows(html) {
  const starts = [...html.matchAll(/<div class="row" id="seans-(\d+)">/g)];
  return starts.map((m, i) => {
    const block = html.slice(m.index, starts[i + 1]?.index ?? m.index + 20000);
    const venueLink = block.match(/<div class="vl">[\s\S]*?<a href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/);
    const price = block.match(/<div class="price">[\s\S]*?<b>([\s\S]*?)<\/b>/);
    const button = block.match(/<button[^>]*class="cta[^"]*"[^>]*>([\s\S]*?)<\/button>/);
    const buttonTag = block.match(/<button[^>]*class="(cta[^"]*)"[^>]*>/);
    const buyable =
      !!buttonTag && /seanceSelect/.test(buttonTag[1]) && !/disabled/.test(buttonTag[0]) && lower(button?.[1]).includes("bilet");
    return {
      id: m[1],
      day: turkishDay(clean(block.match(/<span class="d">([\s\S]*?)<\/span>/)?.[1])),
      time: clean(block.match(/<span class="tm">([\s\S]*?)<\/span>/)?.[1]),
      venueHref: venueLink?.[1] || "",
      venue: clean(venueLink?.[2]),
      price: price ? clean(price[1]).replace(/\s*₺$/, " ₺") : undefined,
      buyable,
      label: clean(button?.[1]),
    };
  });
}

async function theatreVenue(v) {
  const report = { venue: v.name, productions: 0, sessions: 0, soldOut: 0 };
  let rowsParsed = 0;
  venueReports.push(report);
  const tab = `${BASE}/tr-tr/tiyatro/istanbul-anadolu?loc=${v.loc}`;
  sources.push({ provider: "Biletinial", kind: "venue", venue: v.name, url: tab, checkedAt: today });
  const items = [];
  for (let page = 0; page < 10; page++) {
    const q = new URLSearchParams({
      region: "tr-tr", cityId: "77", cityUrl: "istanbul-anadolu", order: "0", isKids: "false",
      isCampaign: "false", isForeign: "false", organizerUrl: "tiyatro", page: String(page), loc: String(v.loc),
    });
    const res = await get(`/List/GetMoreItems?${q}`, { ajax: true, json: true });
    items.push(...(res.items || []));
    if (!res.items?.length || !res.hasMore) break;
  }
  report.productions = items.length;
  const events = [];
  for (const item of items) {
    const url = `${BASE}/tr-tr/tiyatro/${item.seoUrl}`;
    try {
      const html = await get(url);
      const image = item.imageUrl ? `https://b6s54eznn8xq.merlincdn.net${item.imageUrl}` : pageImage(html);
      for (const row of sessionRows(html)) {
        if (row.day && row.time) rowsParsed++;
        if (!row.day || !inWindow(row.day) || !lower(row.venue).startsWith(v.match)) continue;
        if (!row.buyable) {
          report.soldOut++;
          continue;
        }
        report.sessions++;
        events.push({
          title: clean(item.name),
          days: [row.day],
          kind: /stand ?up/i.test(item.name + " " + item.seoUrl) ? "stand-up" : "theatre",
          time: row.time,
          venue: row.venue,
          area: AREAS[v.match] || "Kadıköy",
          price: row.price || "price unavailable",
          url: `${url}/${row.id}`,
          availability: "available",
          source: url,
          owned: false,
          ...(image ? { image } : {}),
        });
      }
    } catch (e) {
      errors.push(`${v.name} · ${item.name}: ${e.message}`);
    }
  }
  // Productions listed but not one session row parsed, in or out of the
  // window, reads as a markup change rather than a quiet month.
  if (items.length && !rowsParsed) {
    errors.push(`${v.name}: ${items.length} productions listed but no sessions parsed; the page format may have changed`);
    report.broken = true;
  }
  return events;
}

async function cinemaVenue(c) {
  const report = { venue: c.name, productions: 0, sessions: 0, soldOut: 0 };
  venueReports.push(report);
  sources.push({ provider: "Biletinial", kind: "venue", venue: c.name, url: BASE + c.path, checkedAt: today });
  const html = await get(c.path);
  const links = new Map();
  for (const m of html.matchAll(/<a[^>]*href="(\/tr-tr\/(sinema|etkinlik)\/[^"?]+\?cinemaBranchId=\d+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const title = clean(m[3]);
    if (!links.has(m[1]) || (title && !links.get(m[1]).title)) links.set(m[1], { kind: m[2], title });
  }
  report.productions = links.size;
  if (!links.size && !html.includes("Seçilen kriterlere uygun etkinlik bulunamadı")) {
    errors.push(`${c.name}: no film links and no empty-programme message; the page format may have changed`);
    report.broken = true;
  }
  const sessions = [];
  for (const [href, { kind, title: linkTitle }] of links) {
    const url = BASE + href;
    try {
      const page = await get(href);
      const title = linkTitle || clean(page.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]);
      const image = pageImage(page);
      if (kind === "etkinlik") {
        // Event-style screenings carry their sessions inline, like theatre.
        for (const row of sessionRows(page)) {
          if (!row.day || !inWindow(row.day) || !row.venueHref.startsWith(c.path)) continue;
          if (!row.buyable) {
            report.soldOut++;
            continue;
          }
          sessions.push({ title, day: row.day, time: row.time, url, image, price: row.price, format: undefined, verified: true });
        }
        continue;
      }
      const find = (key) => page.match(new RegExp(`(?:var|let|const)\\s+${key}\\s*=\\s*["']?([\\w-]+)`))?.[1];
      const [id, lang, country] = [find("eventId"), find("langId"), find("countryCode")];
      if (!id || !lang || !country) throw new Error("missing eventId/langId/countryCode");
      const branch = new URL(url).searchParams.get("cinemaBranchId");
      const dates = await get(`/details/GetDateListForCity?eventId=${id}&langId=${lang}&cityId=77&cinemaBranchId=${branch}`);
      const days = [...new Set([...dates.matchAll(/data-date="(\d{4}-\d{2}-\d{2})"/g)].map((m) => m[1]))].filter(inWindow);
      for (const day of days) {
        const res = await get(`/dynamic/get_seances/${id}/77/${day}/${lang}/${country}?cinemaBranchId=${branch}`, { ajax: true });
        for (const cinema of res.split('class="yn_cinema"').slice(1)) {
          const venueHref = cinema.match(/class="yn_cinema_info_title"[\s\S]*?<a href="([^"]+)"/)?.[1] || "";
          if (!venueHref.replace(BASE, "").startsWith(c.path)) continue;
          for (const hall of cinema.split('class="yn_cinema_salon_info"').slice(1)) {
            const format = clean(hall.match(/<span[^>]*>([\s\S]*?)<\/span>/)?.[1]);
            for (const b of hall.matchAll(/<button([^>]*)data-title="(\d+)"([^>]*)>([\s\S]*?)<\/button>/g)) {
              const time = clean(b[4]);
              if (!/^\d{1,2}:\d{2}$/.test(time)) continue;
              if (/disabled|sold|passive|tukendi/i.test(b[1] + b[3])) {
                report.soldOut++;
                continue;
              }
              sessions.push({ title, day, time, url, image, format, verified: false });
            }
          }
        }
      }
    } catch (e) {
      errors.push(`${c.name} · ${linkTitle || href}: ${e.message}`);
    }
  }
  report.sessions = sessions.length;

  // One card per (day, title): times[] holds every session.
  const groups = new Map();
  for (const s of sessions) {
    const key = `${s.day}|${s.title}`;
    const g = groups.get(key) || { ...s, times: new Set(), formats: new Set() };
    g.times.add(s.time.padStart(5, "0"));
    if (s.format) g.formats.add(s.format);
    groups.set(key, g);
  }
  return [...groups.values()].map((g) => {
    const times = [...g.times].sort();
    return {
      days: [g.day],
      title: g.title,
      kind: "film",
      time: times.join(", "),
      ...(times.length > 1 ? { times } : {}),
      venue: c.name,
      area: c.area,
      price: g.verified && g.price ? g.price : "price unavailable",
      url: g.url,
      availability: g.verified ? "available" : "listed",
      owned: false,
      ...(g.formats.size ? { formats: [...g.formats] } : {}),
      ...(g.verified ? {} : { note: "Session times listed; ticket price and seat availability not verified." }),
      ...(g.image ? { image: g.image } : {}),
    };
  });
}

// Records keyed by production/film, so a session's enrichment survives a new
// session id. IMDb renames swap `title`, so the original lives in sourceTitle.
const baseKey = (url) => (url || "").replace(/\/\d+(\?|$)/, "$1");
const sessionKey = (e) => `${e.days.join(",")}|${lower(e.sourceTitle || e.title)}|${lower(e.venue)}|${e.time || ""}`;

const previous = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
const scraped = [];
for (const v of THEATRE_VENUES) {
  try {
    scraped.push(...(await theatreVenue(v)));
  } catch (e) {
    errors.push(`${v.name}: ${e.message}`);
    venueReports.find((r) => r.venue === v.name).broken = true;
  }
}
for (const c of CINEMAS) {
  try {
    scraped.push(...(await cinemaVenue(c)));
  } catch (e) {
    errors.push(`${c.name}: ${e.message}`);
    (venueReports.find((r) => r.venue === c.name) || {}).broken = true;
  }
}

const rejected = [
  ...REJECTED,
  ...(previous.preferences?.excluded_titles || []),
  ...(previous.preferences?.excluded_artists || []),
].map(lower);
for (let i = scraped.length - 1; i >= 0; i--)
  if (rejected.some((r) => lower(scraped[i].title).includes(r))) scraped.splice(i, 1);

const enrichment = new Map();
for (const e of previous.events) {
  const extra = Object.fromEntries(ENRICHMENT.filter((k) => e[k] !== undefined).map((k) => [k, e[k]]));
  if (Object.keys(extra).length) enrichment.set(baseKey(e.url), { ...extra, ...(e.sourceTitle ? { title: e.title } : {}) });
}
for (const e of scraped) {
  const extra = enrichment.get(baseKey(e.url));
  if (!extra) continue;
  if (extra.title) e.sourceTitle = e.title;
  Object.assign(e, extra);
}

// A venue whose sweep broke keeps its previous records rather than vanishing.
const brokenVenues = venueReports.filter((r) => r.broken).map((r) => lower(r.venue));
const scrapedVenue = (venue) => {
  const v = lower(venue);
  return [...THEATRE_VENUES.map((t) => t.match), ...CINEMAS.map((c) => lower(c.name))].find((m) => v.startsWith(m));
};
const keys = new Set(scraped.map(sessionKey));
const carried = [];
for (const e of previous.events) {
  const days = e.days.filter(inWindow);
  if (!days.length) continue;
  const covered = scrapedVenue(e.venue) && !brokenVenues.includes(scrapedVenue(e.venue)) && /biletinial\.com/.test(e.url || "");
  if (covered && !e.owned) continue;
  const rec = { ...e, days };
  if (keys.has(sessionKey(rec))) {
    // Owned and re-scraped: keep the fresh record, carry the ownership flag.
    for (const s of scraped) if (sessionKey(s) === sessionKey(rec)) Object.assign(s, { owned: true, ...(e.note ? { note: e.note } : {}) });
    continue;
  }
  carried.push(rec);
}

const events = [...scraped, ...carried].sort(
  (a, b) => a.days[0].localeCompare(b.days[0]) || (a.time || "").localeCompare(b.time || "") || a.title.localeCompare(b.title, "tr"),
);

const prevKeys = new Set(previous.events.filter((e) => e.days.some(inWindow)).map(sessionKey));
const nextKeys = new Set(events.map(sessionKey));
const added = events.filter((e) => !prevKeys.has(sessionKey(e)));
const removed = previous.events.filter((e) => e.days.some(inWindow) && !nextKeys.has(sessionKey(e)));

const payload = {
  ...previous,
  lastUpdated: today,
  range: { start, end },
  sources: [
    ...sources,
    ...(previous.sources || []).filter((s) => !/biletinial\.com/.test(s.url || "")),
  ],
  events,
  cinemas: [],
  omitted_records: venueReports.reduce((n, r) => n + r.soldOut, 0),
  research_note:
    `Biletinial preferred venues swept by scripts/istanbul-scrape.mjs on ${today}. ` +
    `Regular cinema sessions are listed times; their price and seat availability are not verified. ` +
    (carried.length ? `${carried.length} records from other sources were carried over from the previous payload without re-checking. ` : "") +
    (errors.length ? `${errors.length} source errors; affected records may be missing.` : ""),
};

if (write) fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2) + "\n");

const line = (e) => `  ${e.days[0]} ${e.time || ""} · ${e.sourceTitle || e.title} · ${e.venue}`;
console.log(`Window ${start} → ${end} · ${events.length} events (${scraped.length} scraped, ${carried.length} carried over)`);
for (const r of venueReports)
  console.log(`  ${r.broken ? "BROKEN " : ""}${r.venue}: ${r.productions} listed, ${r.sessions} sessions, ${r.soldOut} sold out/unavailable`);
console.log(`Added ${added.length} · Removed ${removed.length} · Owned ${events.filter((e) => e.owned).length}`);
if (added.length) console.log(`New:\n${added.slice(0, 40).map(line).join("\n")}${added.length > 40 ? `\n  …and ${added.length - 40} more` : ""}`);
if (carried.length) console.log(`Carried over (not re-checked):\n${carried.map(line).join("\n")}`);
if (errors.length) console.log(`Errors (${errors.length}):\n${errors.slice(0, 20).map((e) => `  ${e}`).join("\n")}`);
console.log(write ? `Wrote ${DATA_FILE}` : "Dry run; pass --write to update event-data.json");
process.exit(brokenVenues.length ? 2 : 0);
