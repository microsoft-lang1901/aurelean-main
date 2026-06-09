import { ensureMutationAllowed, fail, isRateLimited, isSafeResourceId, ok, parseValidatedJson, serverError } from "@/lib/api";
import { awardSchema } from "@/lib/validation";
import { awardBid, listBids, listRfqs } from "@/lib/store";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authFailure = ensureMutationAllowed(request, "bid award");
    if (authFailure) return authFailure;

    if (isRateLimited(request, "rfq-award", 20, 60_000)) {
      return fail("Too many award actions. Please wait and try again.", 429, "rate_limited");
    }

    const { id } = await context.params;
    const rfqId = isSafeResourceId(id);
    if (!rfqId) {
      return fail("RFQ id is invalid.", 422, "invalid_rfq_id");
    }

    const bodyResult = await parseValidatedJson(request, awardSchema);
    if (!bodyResult.ok) return bodyResult.response;

    const { bidId, approvalIntent } = bodyResult.data;

    const rfq = (await listRfqs()).find((item) => item.id === rfqId);
    if (!rfq) return fail("RFQ not found.", 404, "rfq_not_found");
    if (rfq.status === "closed") return fail("This RFQ has already been closed.", 409, "rfq_closed");

    const targetBid = (await listBids()).find((bid) => bid.id === bidId);
    if (!targetBid) return fail("Bid not found.", 404, "bid_not_found");
    if (targetBid.rfqId !== rfqId) return fail("Bid does not belong to this RFQ.", 409, "bid_rfq_mismatch");

    if (approvalIntent !== "human-approved") {
      return fail("Award actions require explicit human approval.", 403, "human_approval_required");
    }

    const bid = await awardBid(rfqId, bidId);
    if (!bid) return fail("Bid not found.", 404, "bid_not_found");
    return Response.json(ok(bid));
  } catch (error) {
    return serverError(error, "Could not award bid.", "bid_award_failed");
  }
}
