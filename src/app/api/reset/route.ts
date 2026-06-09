import { ensureResetAllowed, fail, isRateLimited, ok, safePublicState, serverError } from "@/lib/api";
import { resetState } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const authFailure = ensureResetAllowed(request);
    if (authFailure) return authFailure;

    if (isRateLimited(request, "state-reset", 3, 60_000)) {
      return fail("Too many reset requests. Please wait and try again.", 429, "rate_limited");
    }

    const state = await resetState();
    return Response.json(
      ok({
        status: "reset",
        state,
        runtime: safePublicState()
      })
    );
  } catch (error) {
    return serverError(error, "Could not reset demo state.", "state_reset_failed");
  }
}
