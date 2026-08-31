import type { Metadata } from "next";
import { CopyAddress } from "./copy-address";
import ADDRESSES from "./addresses.json";

export const metadata: Metadata = {
  title: "SPIEL Essen 2026 — where to stay",
  description: "Live availability for 21–26 Oct 2026, checked 31 Aug 2026.",
};

const DATE_QS =
  "?checkin=2026-10-21&checkout=2026-10-26&group_adults=1&no_rooms=1&group_children=0&selected_currency=EUR";

type Stay = {
  name: string;
  where: string;
  score: number;
  price: number;
  slug: string;
  station?: string;
  note?: string;
  address?: string;
};

type Base = {
  city: string;
  commute: string;
  legs: { from: string; time: string; via: string }[];
  detail: string;
  stays: Stay[];
};

const BASES: Base[] = [
  {
    city: "Essen",
    commute: "10–20 min",
    legs: [
      { from: "Essen Hbf", time: "5 min", via: "U11 direct, no change" },
      { from: "Essen Bismarckplatz", time: "11–14 min", via: "U18 or U17, change to U11" },
    ],
    detail:
      "Nothing at all is available inside 1 km of the fairground. Mintrops, Atlantic Congress, Hotel An der Gruga, DORMERO and Garner Essen-Messe all return zero rooms for these dates — the walking ring is sold out. What's left is 1–3 km out at fair-week prices.",
    stays: [
      { name: "H-Aparts Essen", where: "1.0 km from Fair Essen", score: 8.9, price: 1823, slug: "h-aparts-essen-heinrich-apartments", note: "Apartment. Closest available thing to the halls." },
      { name: "Im Stadtzentrum / Küche / Für 5", where: "1.3 km", score: 8.8, price: 2973, slug: "im-stadtzentrum-kuche-fur-5" },
      { name: "Trip Inn Hotel & Suites Essen", where: "2.1 km", station: "Bismarckplatz (Stadtbahn) 150 m", score: 8.1, price: 1310, slug: "trip-inn-living-amp-suites", note: "Cheapest decent actual hotel left in Essen, and a 150 m walk to the tram." },
      { name: "Ruhig & Zentral — 2 Kingsize Betten", where: "2.2 km", score: 9.5, price: 2258, slug: "ruhig-amp-zentral-2-kingsize-betten-wi-fi-essen" },
      { name: "art Hotel Körschen", where: "2.7 km", score: 8.1, price: 2100, slug: "art-korschen" },
      { name: "New Work Hotel Essen", where: "2.7 km", score: 8.0, price: 1820, slug: "kempe-new-work-essen" },
      { name: "Gockel Homes — Zentral mit Balkon", where: "3.1 km", score: 9.2, price: 1955, slug: "zentral-mit-balkon-amp-netflix" },
      { name: "Exquisite Superior Suite 80 m²", where: "1.9 km", score: 9.0, price: 3158, slug: "exclusive-modern-city-center-view-suite" },
      { name: "Deluxe! 15 min Messe & Uniklinik", where: "1.7 km", score: 9.5, price: 3365, slug: "deluxe-15min-zu-messe-und-uniklinik-arbeitsplatz-boxspring" },
    ],
  },
  {
    city: "Duisburg",
    commute: "35–40 min",
    legs: [{ from: "Duisburg Hbf", time: "19–24 min", via: "RE, change to U11 at Essen Hbf" }],
    detail:
      "The train leg is genuinely quick — 19–24 minutes from Duisburg Hbf to the halls. The catch is that every affordable Duisburg room sits in Dellviertel, 1–1.5 km south of the Hbf, and the stops on their doorsteps are U79 Stadtbahn stations, not S-Bahn or regional rail. Add ~15 minutes at the front of every morning to reach the station your train actually leaves from.",
    stays: [
      { name: "Hotel Plaza", where: "Dellviertel", station: "König-Heinrich-Platz (U79) 500 m", score: 8.6, price: 542, slug: "plaza" },
      { name: "Twins Hotel", where: "Dellviertel", station: "Steinsche Gasse (U79) 250 m", score: 9.0, price: 603, slug: "twins", note: "Best-rated in Duisburg, but not the Hbf." },
      { name: "Hotel Conti Duisburg — SORAT", where: "Dellviertel", station: "Kremerstraße (U79) 100 m", score: 8.5, price: 590, slug: "contisorat" },
      { name: "Niteroom Boutiquehotel", where: "Duisburg centre", score: 8.1, price: 531, slug: "niteroom-boutiquehotel-amp-apartements" },
      { name: "SECRET HIDEAWAYS boho ARTstudio", where: "near Hbf", score: 8.6, price: 540, slug: "boho-loft-secret-hideaway-for-work-amp-travel-duisburg" },
      { name: "ELENA flat Lavendel", where: "Duisburg centre", score: 8.6, price: 638, slug: "center-5min-vom-hbf-dusseldorf-messe-nahe-2-og-l-lavendel" },
      { name: "Blumenhof Duisburg HBF", where: "near Hbf", score: 8.7, price: 743, slug: "elena-flat-mandarin-duisburg-hbf" },
      { name: "Hotel Carlton", where: "Dellplatz", station: "Steinsche Gasse (U79) 400 m · Hbf 15 min walk", score: 8.0, price: 402, slug: "regent-duisburg", note: "Cheapest hotel that clears 8.0." },
      { name: "Monteurswohnung Duisburg", where: "Duisburg", score: 8.0, price: 200, slug: "monteurswohnung-duisburg", note: "Workers' flat, only 2 reviews. Cheap for a reason — check it." },
    ],
  },
  {
    city: "Bochum",
    commute: "25–30 min",
    legs: [
      { from: "Bochum-Ehrenfeld", time: "24–29 min", via: "S1, change to U11 at Essen Hbf" },
      { from: "Bochum Hbf", time: "18–22 min", via: "RE1 / RE11, change to U11" },
    ],
    detail:
      "The S1 runs direct from Bochum into Essen Hbf, where you pick up the U11. This is the only base where a good, cheap room sits on top of an actual S-Bahn platform rather than a tram stop. Watch the distances — several of the bargains are 4–5 km out.",
    stays: [
      { name: "STAYERY Bochum Ehrenfeld", where: "1.3 km from Bochum Hbf", station: "Bochum-Ehrenfeld (S-Bahn) 200 m", score: 9.2, price: 476, slug: "stayery-bochum-ehrenfeld", note: "The pick. 200 m from an S-Bahn platform with a direct run into Essen Hbf." },
      { name: "Garner Hotel Bochum by IHG", where: "350 m from centre", station: "Deutsches Bergbau-Museum (U35) 350 m", score: 8.0, price: 477, slug: "garner-hotel-bochum", note: "Stadtbahn, not S-Bahn — change at Bochum Hbf." },
      { name: "Tippelsberg", where: "3.2 km", score: 10, price: 468, slug: "tippelsberg" },
      { name: "Limehome Bochum Kortumstr", where: "500 m", score: 8.7, price: 685, slug: "limehome-bochum-kortumstr" },
      { name: "Holiday Inn Express Bochum", where: "350 m", score: 8.6, price: 703, slug: "holiday-inn-express-bochum-an-ihg" },
      { name: "J&J BermudaStay", where: "0.6 km", score: 8.5, price: 365, slug: "j-amp-jbermudastay", note: "Private room, shared kitchen." },
      { name: "Laerholz 84", where: "4.4 km", score: 8.3, price: 431, slug: "laerholz-84" },
      { name: "Uni nähe Unterkunft mit Garten", where: "4.9 km", score: 9.0, price: 225, slug: "unterkunft-uni-nahe", note: "Cheapest found anywhere. Far out." },
    ],
  },
  {
    city: "Düsseldorf",
    commute: "40–45 min",
    legs: [{ from: "Düsseldorf Hbf", time: "36–39 min", via: "RE / ICE, change to U11 at Essen Hbf" }],
    detail:
      "25–30 min to Essen Hbf, trains every few minutes until late. Longest commute of the four, but a real city for the evenings and a direct airport rail link — worth weighing since the return flight isn't booked.",
    stays: [
      { name: "Boutique Hotel Sir & Lady Astor", where: "Stadtmitte", station: "Düsseldorf Hbf 350 m", score: 8.6, price: 533, slug: "hotelsirandladyastor", note: "Best of Düsseldorf — 1,929 reviews at 8.6, and genuinely at the Hbf." },
      { name: "Gästehaus Grupello", where: "0.5 km", score: 8.5, price: 397, slug: "ga-stehaus-grupello", note: "Guesthouse, not a hotel." },
      { name: "Perfect apartment for business trip", where: "250 m", score: 9.7, price: 516, slug: "perfect-apartment-for-business-trip", note: "Only 3 reviews." },
      { name: "Hotel Paris", where: "400 m", score: 8.0, price: 620, slug: "nizza" },
      { name: "Premier Inn City Friedrichstadt", where: "350 m", score: 8.2, price: 711, slug: "premier-inn-dusseldorf-city-friedrichstadt" },
      { name: "TRIBE Düsseldorf", where: "400 m", score: 8.5, price: 741, slug: "duesseldorf_intercity" },
      { name: "Me and All Hotel, by Hyatt", where: "0.5 km", score: 8.2, price: 741, slug: "me-and-all-dusseldorf" },
      { name: "Motel One Hauptbahnhof", where: "200 m", score: 8.3, price: 802, slug: "motel-one-da1-4sseldorf-hauptbahnhof" },
      { name: "Adina Apartment Hotel", where: "350 m", score: 8.5, price: 818, slug: "adina-apartment-dusseldorf" },
      { name: "Moxy Düsseldorf City", where: "500 m", score: 8.5, price: 916, slug: "moxy-duesseldorf-city" },
    ],
  },
];

function scoreTone(score: number) {
  if (score >= 9) return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  if (score >= 8.5) return "bg-sky-500/15 text-sky-700 dark:text-sky-300";
  return "bg-neutral-500/15 text-neutral-700 dark:text-neutral-300";
}

function StayRow({ stay }: { stay: Stay }) {
  const address = stay.address ?? (ADDRESSES as Record<string, string>)[stay.slug];
  return (
    <div className="flex flex-col gap-1 border-b border-black/5 py-3 sm:flex-row sm:items-baseline sm:gap-4 dark:border-white/10">
      <div className="flex flex-1 flex-wrap items-baseline gap-x-2 gap-y-1">
        <a
          href={`https://www.booking.com/hotel/de/${stay.slug}.en-gb.html${DATE_QS}`}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-100"
        >
          {stay.name}
        </a>
        {address ? <CopyAddress address={address} /> : null}
      </div>
      <span className="text-sm text-neutral-500 sm:w-56 dark:text-neutral-400">
        {stay.where}
        {stay.station ? (
          <span className="block text-neutral-400 dark:text-neutral-500">{stay.station}</span>
        ) : null}
      </span>
      <span className={`w-fit rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums ${scoreTone(stay.score)}`}>
        {stay.score.toFixed(1)}
      </span>
      <span className="font-semibold tabular-nums text-neutral-900 sm:w-24 sm:text-right dark:text-neutral-100">
        €{stay.price.toLocaleString("en-GB")}
      </span>
      {stay.note ? (
        <span className="basis-full text-sm text-neutral-500 sm:hidden dark:text-neutral-400">{stay.note}</span>
      ) : null}
    </div>
  );
}

export default function SpielEssenPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-14 font-sans text-neutral-800 dark:text-neutral-200">
      <header className="mb-10">
        <p className="text-sm font-medium uppercase tracking-widest text-neutral-400">
          SPIEL Essen · 22–25 Oct 2026
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Where to stay
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">
          Prices are the <strong>total for five nights</strong>, 21–26 Oct 2026, one adult, cheapest
          available room, taxes usually extra. Pulled live from Booking.com on 31 Aug 2026 — inventory
          at this event moves fast, so treat these as a snapshot, not a quote.
        </p>
      </header>

      <section className="mb-10 rounded-xl border border-amber-500/30 bg-amber-500/[0.07] p-5">
        <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">The recommendation</h2>
        <p className="mt-2 leading-relaxed">
          <strong>STAYERY Bochum Ehrenfeld — €476.</strong> Scores 9.2, and it sits{" "}
          <strong>200 m from Bochum-Ehrenfeld S-Bahn station</strong>, which runs direct into Essen Hbf where
          you pick up the U11 — a routing check puts it at <strong>24–29 minutes station-to-halls</strong>, so
          call it half an hour door-to-door. It is the cheapest good room on this page and the only one where the
          every-morning trip is a two-minute walk followed by one train.
          <br />
          <span className="mt-2 inline-block">
            If you want a bigger city for the evenings, <strong>Sir &amp; Lady Astor, Düsseldorf — €533</strong>,
            350 m from Düsseldorf Hbf and direct trains to Essen. Costs about 10 extra minutes each way
            (36–39 min station-to-halls) for a much bigger city at night.
          </span>
        </p>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          Not Duisburg, despite the low prices. The train itself is the quickest of the three at 19–24 min, but
          every cheap Duisburg room is in Dellviertel, 1–1.5 km from the Hbf and served by U79 Stadtbahn stops
          rather than the S-Bahn — so the morning gains a leg before it starts.
        </p>
      </section>

      {BASES.map((base) => (
        <section key={base.city} className="mb-12">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              {base.city}
            </h2>
            <span className="whitespace-nowrap text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {base.commute} to the halls
            </span>
          </div>
          <p className="mt-2 leading-relaxed text-neutral-600 dark:text-neutral-300">{base.detail}</p>
          <dl className="mt-4 space-y-1.5 rounded-lg bg-black/[0.03] p-4 text-sm dark:bg-white/[0.05]">
            {base.legs.map((leg) => (
              <div key={leg.from} className="flex flex-wrap items-baseline gap-x-2">
                <dt className="font-medium text-neutral-700 dark:text-neutral-200">{leg.from}</dt>
                <dd className="font-semibold tabular-nums text-neutral-900 dark:text-neutral-50">{leg.time}</dd>
                <dd className="text-neutral-500 dark:text-neutral-400">· {leg.via}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5">
            {base.stays.map((stay) => (
              <StayRow key={stay.slug} stay={stay} />
            ))}
          </div>
          <ul className="mt-3 space-y-1 text-sm text-neutral-500 max-sm:hidden dark:text-neutral-400">
            {base.stays
              .filter((s) => s.note)
              .map((s) => (
                <li key={s.slug}>
                  <span className="font-medium text-neutral-600 dark:text-neutral-300">{s.name}</span> — {s.note}
                </li>
              ))}
          </ul>
        </section>
      ))}

      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Getting there
        </h2>
        <ul className="mt-4 space-y-3 leading-relaxed text-neutral-600 dark:text-neutral-300">
          <li>
            <strong>Arrival, Wed 21 Oct.</strong> TK1671 lands Köln/Bonn 09:25. Airport to the fairground
            measures <strong>~1h40 to 1h55</strong> all-in via the RE6 corridor. The RE6 calls at Düsseldorf,
            Duisburg and Essen on the way, so every base on this page is one train from the airport — you just
            get off earlier.
          </li>
          <li>
            <strong>Every morning.</strong> Essen Hbf → <strong>U11</strong> to Messe Essen / Gruga, ~8 min.
            The U11 is the line to optimise for; the underground gets very busy at opening. Avoid the
            overground line toward Gelsenkirchen, which attendees report as unreliable.
          </li>
          <li>
            <strong>Deutschlandticket, €58 for October.</strong> Covers every regional train, S-Bahn and tram
            in Germany including the U11. Cheaper than four days of point-to-point fares plus the airport leg.
            Monthly subscription — cancel before the deadline for November.
          </li>
          <li>
            <strong>Check.</strong> SPIEL entry tickets have historically included VRR-area transport on fair
            days, which would cover the Essen commute for free. Confirm on the ticket.
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Avoid
        </h2>
        <p className="mt-3 leading-relaxed text-neutral-600 dark:text-neutral-300">
          Two Essen hotels look like bargains at <strong>€904 for the five nights</strong> —{" "}
          <strong>Brunnen Hotel</strong> (1.7 km) and <strong>Luise City</strong> (2.1 km). Both score{" "}
          <strong>5.0</strong> across more than a thousand reviews each. That isn&apos;t a deal.{" "}
          <strong>Hotel Rüttenscheider Stern</strong> (7.3, €1,401) and <strong>Center Hotel Essen</strong>{" "}
          (7.5, €1,403) are the mid-tier Essen options if proximity really is worth the premium.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Still open
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-neutral-600 dark:text-neutral-300">
          <li>
            <strong>No return flight booked.</strong> SPIEL closes ~17:00 Sunday 25th, so these prices assume
            checkout Monday 26th. Düsseldorf gains an edge if you fly out of DUS rather than CGN.
          </li>
          <li>
            <strong>Fair housing partners hold blocks that never appear on Booking</strong> —{" "}
            <a className="underline underline-offset-4" href="https://www.fair-point.com/en/events/spiel-essen?id=5360" target="_blank" rel="noreferrer">Fair Point</a>,{" "}
            <a className="underline underline-offset-4" href="https://www.expobeds.com/event/spiel" target="_blank" rel="noreferrer">ExpoBeds</a>,{" "}
            <a className="underline underline-offset-4" href="https://trade-fair-trips.com/exhibitions/spiel/hotels" target="_blank" rel="noreferrer">TradeFairTrips</a>.
            Worth one enquiry if you want to be inside the walking ring after all.
          </li>
          <li>
            <strong>Book something refundable now.</strong> The Essen result above is what Duisburg and
            Düsseldorf will look like in a few weeks.
          </li>
        </ul>
      </section>

      <footer className="border-t border-black/10 pt-6 text-sm text-neutral-400 dark:border-white/10">
        All links open the property on Booking.com with 21–26 Oct 2026 pre-filled. Availability and prices
        checked 31 Aug 2026. Station distances are Booking&apos;s own figures, verified per property for the
        shortlisted options only — properties without a station line underneath weren&apos;t individually checked.
        <br />
        Journey times are real routings to <em>Essen Messe Ost/Gruga</em> for an 08:30 weekday departure, from
        the Transitous/MOTIS planner over German open transit data — fastest and typical of six itineraries.
        They were measured on a date whose timetable is fully published; October 2026 schedules aren&apos;t out
        yet, so treat them as the service pattern rather than a booked connection. Add walking time from the
        door to the station on top.
      </footer>
    </main>
  );
}
