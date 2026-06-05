import { notFound } from "next/navigation";
import { PublicShell } from "@/components/SiteChrome";
import { SupplierClient } from "@/components/SupplierClient";
import { getSupplier, listSuppliers } from "@/lib/store";

export async function generateStaticParams() {
  const suppliers = await listSuppliers();
  return suppliers.map((supplier) => ({ id: supplier.id }));
}

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
