import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { META, ITEMS } from "./data";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-code" });

/**
 * Derived from the payload rather than hardcoded, so a refresh that changes the
 * window updates the tab and any shared link along with the page.
 */
export function generateMetadata(): Metadata {
  const title = "AI dev digest";
  const description = `${ITEMS.length} worthwhile posts from ${META.accountsWithPosts} developers, ${META.window.duration_hours}h to ${META.window.end.slice(0, 10)}.`;
  return { title, description, openGraph: { title, description } };
}

export default function DigestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${display.variable} ${mono.variable} font-sans`}
      /* Rebinding the globals the theme points at keeps the fonts scoped to this
         route — every other sandbox page keeps the default. */
      style={
        {
          "--font-geist-sans": "var(--font-display)",
          "--font-geist-mono": "var(--font-code)",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
