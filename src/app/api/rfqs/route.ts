import { cleanString, ensureMutationAllowed, fail, ok, readJson } from "@/lib/api";
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
    const authFailure = ensureMutationAllowed(request, "RFQ creation");
    if (authFailure) return authFailure;

    const body = await readJson<Payload>(request);
    const supplierId = cleanString(body.supplierId, 80);
    const material = cleanString(body.material, 160);
    const quantity = cleanString(body.quantity, 80);
    const targetDelivery = cleanString(body.targetDelivery, 120);

    if (!supplierId || !material || !quantity || !targetDelivery) {
      return fail("Supplier, material, quantity, and target delivery are required.", 422, "missing_required_fields");
    }
    const supplier = (await listSuppliers()).find((item) => item.id === supplierId);
    if (!supplier) return fail("Supplier not found.", 404, "supplier_not_found");
    if (!supplier.verified) return fail("RFQs can only be created for verified suppliers.", 403, "supplier_not_verified");

    const rfq = await createRfq({
      supplierId: supplier.id,
      supplierName: supplier.name,
      material,
      quantity,
      targetDelivery,
      specifications: cleanString(body.specifications, 1000)
    });

    return Response.json(ok(rfq));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not create RFQ.");
  }
}
