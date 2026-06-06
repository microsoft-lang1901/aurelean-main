import { fail, ok, safePublicState } from "@/lib/api";

export async function GET() {
  try {
    return Response.json(
      ok({
        status: "ok",
        ...safePublicState()
      })
    );
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Unable to read backend health state.",
      500,
      "health_read_failed"
    );
  }
}
