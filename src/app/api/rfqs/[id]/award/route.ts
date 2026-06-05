import { fail, ok, readJson } from "@/lib/api";
import { awardBid } from "@/lib/store";

type Payload = {
  bidId?: string;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await readJson<Payload>(request);
    if (!body.bidId) return fail("Bid id is required.");
    const bid = await awardBid(id, body.bidId);
    if (!bid) return fail("Bid not found.", 404);
    return Response.json(ok(bid));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not award bid.");
  }
}
