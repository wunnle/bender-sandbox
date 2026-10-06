import type { Metadata, Viewport } from "next";
import SafeAreaProbe from "./probe";

export const metadata: Metadata = {
  title: "Safe area",
  description: "Live readout of Safari safe-area insets and viewport sizes",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Safe area" },
};

// viewport-fit=cover is what makes env(safe-area-inset-*) non-zero.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b0d12",
};

export default function Page() {
  return <SafeAreaProbe />;
}
