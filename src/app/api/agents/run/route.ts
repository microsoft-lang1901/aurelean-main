import { cleanString, ensureMutationAllowed, fail, isRateLimited, ok, readJson } from "@/lib/api";
import { runAureleanAgent } from "@/lib/aurelean-agent";
import type { AgentAction } from "@/types/aurelean";

const actions: AgentAction[] = [
  "ask",
  "search_suppliers",
  "compare_bids",
  "create_rfq",
  "request_sample",
  "recommend_award",
  "query_memory",
  "risk_review"
];

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
    const authFailure = ensureMutationAllowed(request, "agent workflow");
    if (authFailure) return authFailure;

    if (isRateLimited(request, "agent-run", 20, 60_000)) {
      return fail("Too many agent requests. Please wait and try again.", 429, "rate_limited");
    }

    const body = await readJson<Payload>(request);
    const action = typeof body.action === "string" && actions.includes(body.action) ? body.action : undefined;
    if (body.action && !action) return fail("Unsupported agent action.", 422, "unsupported_agent_action");
    const prompt = cleanString(body.prompt, 1000);
    if (!prompt && !action) return fail("Prompt or action is required.", 422, "missing_prompt_or_action");

    const response = await runAureleanAgent({
      prompt: prompt || action || "Run AURELEAN workflow.",
      action,
      supplierId: cleanString(body.supplierId, 80),
      rfqId: cleanString(body.rfqId, 80),
      material: cleanString(body.material, 160),
      quantity: cleanString(body.quantity, 80),
      targetDelivery: cleanString(body.targetDelivery, 120),
      specifications: cleanString(body.specifications, 1000)
    });

    return Response.json(ok(response));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Agent run failed.");
  }
}
