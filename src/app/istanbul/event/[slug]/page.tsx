import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { imdbThumb, META, SHOWS, showBySlug } from "../../data";
import EventView from "./event-view";

type Params = { params: Promise<{ slug: string }> };

/** Every show in the payload gets a page at build time; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return SHOWS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const show = showBySlug(slug);
  if (!show) return {};
  const e = show.listings[0];
  const venues = [...new Set(show.listings.map((l) => l.venue?.trim()).filter(Boolean))];
  const where = venues.length > 1 ? `${venues.length} venues` : (venues[0] ?? META.city);
  const first = show.days[0];
  const last = show.days[show.days.length - 1];
  const when = first === last ? first : `${first} to ${last}`;
  const summary = `${e.kind[0].toUpperCase()}${e.kind.slice(1)} at ${where}, ${META.city} · ${when}`;
  const description = e.description ? `${summary}. ${e.description.slice(0, 160)}` : summary;
  const poster = e.imdbImage ? imdbThumb(e.imdbImage) : e.image;
  const title = `${show.title} — ${META.city} events`;
  return {
    title,
    description,
    // A shared link unfurls with the poster, title, where and when.
    openGraph: {
      title: show.title,
      description,
      images: poster ? [{ url: poster }] : undefined,
    },
    twitter: { card: poster ? "summary_large_image" : "summary" },
  };
}

export default async function EventRoute({ params }: Params) {
  const { slug } = await params;
  if (!showBySlug(slug)) notFound();
  return <EventView slug={slug} />;
}
