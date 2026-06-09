import { ok, serverError } from "@/lib/api";
import { getPublicState } from "@/lib/store";

export async function GET() {
  try {
    return Response.json(ok(await getPublicState()));
  } catch (error) {
    return serverError(error, "Could not load bootstrap data.", "bootstrap_read_failed");
  }
}
