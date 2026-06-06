import { ok } from "@/lib/api";
import { simReadyPipelineSummary, simReadyReadiness } from "@/lib/nvidia-simready";

export async function GET() {
  return Response.json(
    ok({
      ...simReadyPipelineSummary,
      readiness: simReadyReadiness()
    })
  );
}
