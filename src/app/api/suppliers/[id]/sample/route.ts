import { cleanString, ensureMutationAllowed, fail, ok, readJson } from "@/lib/api";
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

    const { id } = await context.params;
    const supplier = await getSupplier(id);
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
