import { ok, safePublicState, serverError } from "@/lib/api";

export async function GET() {
  try {
    return Response.json(
      ok({
        status: "ok",
        ...safePublicState()
      })
    );
  } catch (error) {
    return serverError(error, "Unable to read backend health state.", "health_read_failed");
  }
}
