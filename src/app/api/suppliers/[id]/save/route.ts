import { ensureMutationAllowed, fail, isRateLimited, ok } from "@/lib/api";
import { idSchema } from "@/lib/validation";
import { toggleSupplierSaved } from "@/lib/store";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authFailure = ensureMutationAllowed(_request, "supplier save");
    if (authFailure) return authFailure;

    if (isRateLimited(_request, "supplier-save", 40, 60_000)) {
      return fail("Too many supplier save requests. Please wait and try again.", 429, "rate_limited");
    }

    const { id } = await context.params;
    const supplierIdResult = idSchema.safeParse(id);
    if (!supplierIdResult.success) {
      return fail("Supplier id is invalid.", 422, "invalid_supplier_id");
    }

    const supplier = await toggleSupplierSaved(supplierIdResult.data);
    if (!supplier) return fail("Supplier not found.", 404, "supplier_not_found");
    return Response.json(ok(supplier));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not save supplier.");
  }
}
