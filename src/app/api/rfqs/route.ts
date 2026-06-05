import { fail, ok, readJson } from "@/lib/api";
import { createRfq, listBids, listRfqs, listSuppliers } from "@/lib/store";

type Payload = {
  supplierId?: string;
  material?: string;
  quantity?: string;
  targetDelivery?: string;
  specifications?: string;
};

export async function GET() {
  const [rfqs, bids] = await Promise.all([listRfqs(), listBids()]);
  return Response.json(ok({ rfqs, bids }));
}

export async function POST(request: Request) {
  try {
    const body = await readJson<Payload>(request);
    if (!body.supplierId || !body.material || !body.quantity) {
      return fail("Supplier, material, and quantity are required.");
    }
    const supplier = (await listSuppliers()).find((item) => item.id === body.supplierId);
    if (!supplier) return fail("Supplier not found.", 404);

    const rfq = await createRfq({
      supplierId: supplier.id,
      supplierName: supplier.name,
      material: body.material,
      quantity: body.quantity,
      targetDelivery: body.targetDelivery ?? "",
      specifications: body.specifications
    });

    return Response.json(ok(rfq));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not create RFQ.");
  }
}
