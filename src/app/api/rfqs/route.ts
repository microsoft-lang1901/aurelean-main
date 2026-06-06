import { ensureMutationAllowed, fail, isRateLimited, ok, parseValidatedJson } from "@/lib/api";
import { rfqCreateSchema } from "@/lib/validation";
import { createRfq, listBids, listRfqs, listSuppliers } from "@/lib/store";

export async function GET() {
  const [rfqs, bids] = await Promise.all([listRfqs(), listBids()]);
  return Response.json(ok({ rfqs, bids }));
}

export async function POST(request: Request) {
  try {
    const authFailure = ensureMutationAllowed(request, "RFQ creation");
    if (authFailure) return authFailure;

    if (isRateLimited(request, "rfq-create", 25, 60_000)) {
      return fail("Too many RFQ requests. Please wait and try again.", 429, "rate_limited");
    }

    const bodyResult = await parseValidatedJson(request, rfqCreateSchema);
    if (!bodyResult.ok) return bodyResult.response;

    const body = bodyResult.data;
    const supplierId = body.supplierId;

    const supplier = (await listSuppliers()).find((item) => item.id === supplierId);
    if (!supplier) return fail("Supplier not found.", 404, "supplier_not_found");
    if (!supplier.verified) return fail("RFQs can only be created for verified suppliers.", 403, "supplier_not_verified");

    const rfq = await createRfq({
      supplierId: supplier.id,
      supplierName: supplier.name,
      material: body.material,
      quantity: body.quantity,
      targetDelivery: body.targetDelivery,
      specifications: body.specifications
    });

    return Response.json(ok(rfq));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not create RFQ.");
  }
}
