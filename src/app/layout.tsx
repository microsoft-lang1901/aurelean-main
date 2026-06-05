import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AURELEAN - Operational intelligence for global sourcing",
  description:
    "AI-native sourcing infrastructure, supplier intelligence, RFQ orchestration, and operational memory."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
