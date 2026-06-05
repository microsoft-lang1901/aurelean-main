import { ok } from "@/lib/api";
import { getState } from "@/lib/store";

export async function GET() {
  return Response.json(ok(await getState()));
}
