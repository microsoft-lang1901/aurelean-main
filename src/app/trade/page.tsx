import type { Metadata } from "next";
import { PublicShell } from "@/components/SiteChrome";
import { TradeClient } from "@/components/TradeClient";
import { listSuppliers } from "@/lib/store";

export const metadata: Metadata = {
  title: "Trade Marketplace",
  description:
    "Search verified textile suppliers, compare material data, save suppliers, request samples, and create RFQs."
};

export default async function TradePage() {
  const suppliers = await listSuppliers();
  return (
    <PublicShell>
      <TradeClient initialSuppliers={suppliers} />
    </PublicShell>
  );
}
