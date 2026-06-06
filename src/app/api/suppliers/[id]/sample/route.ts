import { cleanString, ensureMutationAllowed, fail, isRateLimited, isSafeResourceId, ok, readJson } from "@/lib/api";
import { createSampleRequest, getSupplier } from "@/lib/store";

type Payload = {
  material?: string;
  quantity?: string;
  targetDelivery?: string;
  specifications?: string;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authFailure = ensureMutationAllowed(request, "sample request");
    if (authFailure) return authFailure;

    if (isRateLimited(request, "sample-request", 30, 60_000)) {
      return fail("Too many sample requests. Please wait and try again.", 429, "rate_limited");
    }

    const { id } = await context.params;
    const supplierId = isSafeResourceId(id);
    if (!supplierId) {
      return fail("Supplier id is invalid.", 422, "invalid_supplier_id");
    }

    const supplier = await getSupplier(supplierId);
    if (!supplier) return fail("Supplier not found.", 404, "supplier_not_found");
    if (!supplier.verified) return fail("Samples can only be requested from verified suppliers.", 403, "supplier_not_verified");
    const body = await readJson<Payload>(request);
    const material = cleanString(body.material, 160) || supplier.material;
    const quantity = cleanString(body.quantity, 80);
    if (!quantity) return fail("Sample quantity is required.", 422, "missing_quantity");
    const sample = await createSampleRequest({
      supplierId: supplier.id,
      material,
      quantity,
      targetDelivery: cleanString(body.targetDelivery, 120),
      specifications: cleanString(body.specifications, 1000)
    });
    return Response.json(ok(sample));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not request sample.");
  }
}
