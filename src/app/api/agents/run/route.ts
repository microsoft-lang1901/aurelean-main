import { ensureMutationAllowed, fail, isRateLimited, ok, parseValidatedJson } from "@/lib/api";
import { runAureleanAgent } from "@/lib/aurelean-agent";
import { agentRunSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const authFailure = ensureMutationAllowed(request, "agent workflow");
    if (authFailure) return authFailure;

    if (isRateLimited(request, "agent-run", 20, 60_000)) {
      return fail("Too many agent requests. Please wait and try again.", 429, "rate_limited");
    }

    const bodyResult = await parseValidatedJson(request, agentRunSchema);
    if (!bodyResult.ok) return bodyResult.response;

    const body = bodyResult.data;
    const action = body.action;
    if (!action && !body.prompt) {
      return fail("Prompt or action is required.", 422, "missing_prompt_or_action");
    }

    const response = await runAureleanAgent({
      prompt: body.prompt || "Run AURELEAN workflow.",
      action,
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
