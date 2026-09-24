import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { META, ITEMS } from "./data";

/**
 * Inter, not the display face this route started with. The page is now mostly
 * other people's prose at 15px — including code, URLs and prompt text — and a
 * geometric display face is tiring at that size and length.
 */
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-code" });

/**
 * Composed from payload values, so a refresh that changes the window updates
 * the tab and any shared link along with the page.
 */
export function generateMetadata(): Metadata {
  const title = `${META.window.start.slice(0, 10)} – ${META.window.end.slice(0, 10)}`;
  const description = `${ITEMS.length} posts from ${META.accountsWithPosts} of ${META.accountsScanned} accounts. ${META.filter}`;
  return { title, description, openGraph: { title, description } };
}

export default function DigestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${body.variable} ${mono.variable} font-sans`}
      /* Rebinding the globals the theme points at keeps the fonts scoped to this
         route — every other sandbox page keeps the default. */
      style={
        {
          "--font-geist-sans": "var(--font-body)",
          "--font-geist-mono": "var(--font-code)",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
