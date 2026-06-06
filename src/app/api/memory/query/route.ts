import { fail, isRateLimited, ok, parseValidatedJson } from "@/lib/api";
import { memoryQuerySchema } from "@/lib/validation";
import { answerMemoryQuestion } from "@/lib/assistant";
import { findMemoryMatches, listMemory, listRfqs, listSuppliers } from "@/lib/store";

export async function POST(request: Request) {
  try {
    if (isRateLimited(request, "memory-query", 30, 60_000)) {
      return fail("Too many memory queries. Please wait and try again.", 429, "rate_limited");
    }

    const bodyResult = await parseValidatedJson(request, memoryQuerySchema);
    if (!bodyResult.ok) return bodyResult.response;

    const question = bodyResult.data.question;
    const [memories, suppliers, rfqs] = await Promise.all([
      listMemory(),
      listSuppliers(),
      listRfqs()
    ]);

    const matches = findMemoryMatches(memories, question);
    const response = await answerMemoryQuestion({
      question,
      memories: matches.length ? matches : memories,
      suppliers,
      rfqs
    });

    return Response.json(ok({ ...response, matches }));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not query memory.");
  }
}
