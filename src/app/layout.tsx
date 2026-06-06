import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://aurelean-main.vercel.app"),
  title: {
    default: "AURELEAN - Operational intelligence for global sourcing",
    template: "%s | AURELEAN"
  },
  description:
    "AI-native sourcing infrastructure, supplier intelligence, RFQ orchestration, and operational memory.",
  openGraph: {
    title: "AURELEAN",
    description:
      "AI-native sourcing infrastructure, supplier intelligence, RFQ orchestration, and operational memory.",
    url: "https://aurelean-main.vercel.app",
    siteName: "AURELEAN",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
