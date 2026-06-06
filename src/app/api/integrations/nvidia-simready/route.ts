import { fail, ok } from "@/lib/api";
import { simReadyPipelineSummary, simReadyReadiness } from "@/lib/nvidia-simready";

export async function GET() {
  try {
    return Response.json(
      ok({
        ...simReadyPipelineSummary,
        readiness: simReadyReadiness()
      })
    );
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Unable to read NVIDIA readiness data.",
      500,
      "nvidia_pipeline_read_failed"
    );
  }
}
