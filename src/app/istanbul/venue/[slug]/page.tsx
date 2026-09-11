import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { META, VENUES, venueBySlug } from "../../data";
import VenueView from "./venue-view";

type Params = { params: Promise<{ slug: string }> };

/** The payload is the whole universe of venues, so anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return VENUES.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const venue = venueBySlug(slug);
  if (!venue) return {};
  return {
    title: `${venue.name} — ${META.city} events`,
    description: `Everything on at ${venue.name}${
      venue.areas[0] ? `, ${venue.areas[0]}` : ""
    }: ${venue.events.length} listings.`,
  };
}

export default async function VenuePage({ params }: Params) {
  const { slug } = await params;
  const venue = venueBySlug(slug);
  if (!venue) notFound();
  // Only the slug crosses the boundary; the client reads the same bundled payload.
  return <VenueView slug={venue.slug} />;
}
