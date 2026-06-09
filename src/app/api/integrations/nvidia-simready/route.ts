import { ok, serverError } from "@/lib/api";
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
    return serverError(error, "Unable to read NVIDIA readiness data.", "nvidia_pipeline_read_failed");
  }
}
