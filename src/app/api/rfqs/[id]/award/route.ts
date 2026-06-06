import { cleanString, fail, ok, readJson } from "@/lib/api";
import { awardBid } from "@/lib/store";

type Payload = {
  bidId?: string;
  approvalIntent?: string;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await readJson<Payload>(request);
    const bidId = cleanString(body.bidId, 80);
    if (!bidId) return fail("Bid id is required.", 422, "missing_bid_id");
    if (body.approvalIntent !== "human-approved") {
      return fail("Award actions require explicit human approval.", 403, "human_approval_required");
    }
    const bid = await awardBid(id, bidId);
    if (!bid) return fail("Bid not found.", 404, "bid_not_found");
    return Response.json(ok(bid));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not award bid.");
  }
}
