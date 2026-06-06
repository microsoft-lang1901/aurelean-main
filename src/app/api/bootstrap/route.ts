import { ok } from "@/lib/api";
import { getPublicState } from "@/lib/store";

export async function GET() {
  return Response.json(ok(await getPublicState()));
}
