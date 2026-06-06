import { ensureMutationAllowed, fail, isRateLimited, ok, parseValidatedJson } from "@/lib/api";
import { idSchema, supplierSampleSchema } from "@/lib/validation";
import { createSampleRequest, getSupplier } from "@/lib/store";

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
    const supplierIdResult = idSchema.safeParse(id);
    if (!supplierIdResult.success) {
      return fail("Supplier id is invalid.", 422, "invalid_supplier_id");
    }

    const supplier = await getSupplier(supplierIdResult.data);
    if (!supplier) return fail("Supplier not found.", 404, "supplier_not_found");
    if (!supplier.verified) return fail("Samples can only be requested from verified suppliers.", 403, "supplier_not_verified");

    const bodyResult = await parseValidatedJson(request, supplierSampleSchema);
    if (!bodyResult.ok) return bodyResult.response;

    const material = bodyResult.data.material || supplier.material;
    const sample = await createSampleRequest({
      supplierId: supplier.id,
      material,
      quantity: bodyResult.data.quantity,
      targetDelivery: bodyResult.data.targetDelivery || "",
      specifications: bodyResult.data.specifications || ""
    });

    return Response.json(ok(sample));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not request sample.");
  }
}
