import { ensureMutationAllowed, fail, ok } from "@/lib/api";
import { toggleSupplierSaved } from "@/lib/store";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const authFailure = ensureMutationAllowed(_request, "supplier save");
  if (authFailure) return authFailure;

  const { id } = await context.params;
  const supplier = await toggleSupplierSaved(id);
  if (!supplier) return fail("Supplier not found.", 404, "supplier_not_found");
  return Response.json(ok(supplier));
}
