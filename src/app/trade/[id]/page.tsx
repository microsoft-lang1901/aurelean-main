import { notFound } from "next/navigation";
import { PublicShell } from "@/components/SiteChrome";
import { SupplierClient } from "@/components/SupplierClient";
import { getSupplier } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function SupplierPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplier = await getSupplier(id);
  if (!supplier) notFound();
  return (
    <PublicShell>
      <SupplierClient supplier={supplier} />
    </PublicShell>
  );
}
