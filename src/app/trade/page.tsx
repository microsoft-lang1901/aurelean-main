import { PublicShell } from "@/components/SiteChrome";
import { TradeClient } from "@/components/TradeClient";
import { listSuppliers } from "@/lib/store";

export default async function TradePage() {
  const suppliers = await listSuppliers();
  return (
    <PublicShell>
      <TradeClient initialSuppliers={suppliers} />
    </PublicShell>
  );
}
