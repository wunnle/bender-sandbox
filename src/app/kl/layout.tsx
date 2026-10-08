import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KL day trip",
  description: "A Friday in Kuala Lumpur: iPhone repair, electronics, coffee, board games.",
};

export default function KlLayout({ children }: { children: React.ReactNode }) {
  return children;
}
