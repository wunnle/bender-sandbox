import type { Metadata } from "next";
import { META } from "./data";

/**
 * Derived from the payload rather than hardcoded, so a refresh that changes the
 * city or the window updates the tab and any shared link along with the page.
 */
export function generateMetadata(): Metadata {
  const title = `${META.city} events`;
  const window = `${META.range.start} to ${META.range.end}`;
  return {
    title,
    description: `What's on in ${META.city}: theatre, music, festivals and cinema, ${window}.`,
    openGraph: { title, description: `What's on in ${META.city}, ${window}.` },
  };
}

export default function IstanbulLayout({ children }: { children: React.ReactNode }) {
  return children;
}
