import { fail, ok } from "@/lib/api";
import { toggleSupplierSaved } from "@/lib/store";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supplier = await toggleSupplierSaved(id);
  if (!supplier) return fail("Supplier not found.", 404, "supplier_not_found");
  return Response.json(ok(supplier));
}
