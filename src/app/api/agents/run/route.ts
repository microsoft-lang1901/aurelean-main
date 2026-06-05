import { fail, ok, readJson } from "@/lib/api";
import { runAureleanAgent } from "@/lib/aurelean-agent";
import type { AgentAction } from "@/types/aurelean";

type Payload = {
  prompt?: string;
  action?: AgentAction;
  supplierId?: string;
  rfqId?: string;
  material?: string;
  quantity?: string;
  targetDelivery?: string;
  specifications?: string;
};

export async function POST(request: Request) {
  try {
    const body = await readJson<Payload>(request);
    if (!body.prompt && !body.action) return fail("Prompt or action is required.");

    const response = await runAureleanAgent({
      prompt: body.prompt || body.action || "Run AURELEAN workflow.",
      action: body.action,
      supplierId: body.supplierId,
      rfqId: body.rfqId,
      material: body.material,
      quantity: body.quantity,
      targetDelivery: body.targetDelivery,
      specifications: body.specifications
    });

    return Response.json(ok(response));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Agent run failed.");
  }
}
