import { cleanString, ensureMutationAllowed, fail, isSafeResourceId, ok, readJson } from "@/lib/api";
import { awardBid, listRfqs, listBids } from "@/lib/store";

type Payload = {
  bidId?: string;
  approvalIntent?: string;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authFailure = ensureMutationAllowed(request, "bid award");
    if (authFailure) return authFailure;

    const { id } = await context.params;
    const rfqId = isSafeResourceId(id);
    if (!rfqId) {
      return fail("RFQ id is invalid.", 422, "invalid_rfq_id");
    }

    const body = await readJson<Payload>(request);
    const rawBidId = cleanString(body.bidId, 80);
    if (!rawBidId) {
      return fail("Bid id is required.", 422, "missing_bid_id");
    }
    const bidId = isSafeResourceId(rawBidId);
    if (!bidId) {
      return fail("Bid id is invalid.", 422, "invalid_bid_id");
    }
    const rfqs = await listRfqs();
    const rfq = rfqs.find((item) => item.id === rfqId);
    if (!rfq) return fail("RFQ not found.", 404, "rfq_not_found");
    if (rfq.status === "closed") return fail("This RFQ has already been closed.", 409, "rfq_closed");
    const bids = await listBids();
    const targetBid = bids.find((bid) => bid.id === bidId);
    if (!targetBid) return fail("Bid not found.", 404, "bid_not_found");
    if (targetBid.rfqId !== rfqId) return fail("Bid does not belong to this RFQ.", 409, "bid_rfq_mismatch");

    if (body.approvalIntent !== "human-approved") {
      return fail("Award actions require explicit human approval.", 403, "human_approval_required");
    }
    const bid = await awardBid(rfqId, bidId);
    if (!bid) return fail("Bid not found.", 404, "bid_not_found");
    return Response.json(ok(bid));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not award bid.");
  }
}
