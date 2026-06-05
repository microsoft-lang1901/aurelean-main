import { fail, ok, readJson } from "@/lib/api";
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
    const { id } = await context.params;
    const supplier = await getSupplier(id);
    if (!supplier) return fail("Supplier not found.", 404);
    const body = await readJson<Payload>(request);
    const sample = await createSampleRequest({
      supplierId: supplier.id,
      material: body.material ?? supplier.material,
      quantity: body.quantity ?? "1 sample set",
      targetDelivery: body.targetDelivery ?? "",
      specifications: body.specifications ?? ""
    });
    return Response.json(ok(sample));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not request sample.");
  }
}
