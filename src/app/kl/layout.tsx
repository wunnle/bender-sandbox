import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "KL day trip",
  description: "A Friday in Kuala Lumpur: iPhone repair, electronics, coffee, board games.",
};

// Full-bleed map: draw under the notch and home bar, and let the overlays pad for them.
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

export default function KlLayout({ children }: { children: React.ReactNode }) {
  return children;
}
