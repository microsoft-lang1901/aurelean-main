import { ok, safePublicState } from "@/lib/api";

export async function GET() {
  return Response.json(
    ok({
      status: "ok",
      ...safePublicState()
    })
  );
}
