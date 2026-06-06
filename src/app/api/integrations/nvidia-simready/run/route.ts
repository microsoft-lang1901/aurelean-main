import { ensureMutationAllowed, fail, isRateLimited, ok } from "@/lib/api";
import { simReadyReadiness } from "@/lib/nvidia-simready";

function hasRenderInputs() {
  return Boolean(process.env.RENDER_ENDPOINT && process.env.CONTENT_AGENTS_ENDPOINT && process.env.CONTENT_AGENTS_API_KEY);
}

export async function POST(request: Request) {
  try {
    const authFailure = ensureMutationAllowed(request, "NVIDIA SimReady rerun");
    if (authFailure) return authFailure;

    if (isRateLimited(request, "nvidia-simready-rerun", 10, 60_000)) {
      return fail(
        "Too many SimReady rerun requests. Please wait and try again.",
        429,
        "rate_limited"
      );
    }

    if (!hasRenderInputs()) {
      const readiness = simReadyReadiness();
      return fail(
        "Cannot run SimReady rerun: missing RENDER_ENDPOINT and/or CONTENT_AGENTS credentials.",
        422,
        "simready_prerequisites_missing"
      );
    }

    const requestId = `NVIDIA-SR-${Date.now()}`;
    return Response.json(
      ok({
        requestId,
        status: "accepted",
        message: "SimReady rerun requested. A run artifact refresh workflow should be executed by the configured pipeline service."
      })
    );
  } catch {
    return fail("Failed to request SimReady rerun.");
  }
}
