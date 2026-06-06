import { answerMemoryQuestion } from "@/lib/assistant";
import { cleanString, fail, isRateLimited, ok, readJson } from "@/lib/api";
import { findMemoryMatches, listMemory, listRfqs, listSuppliers } from "@/lib/store";

type Payload = {
  question?: string;
};

export async function POST(request: Request) {
  try {
    if (isRateLimited(request, "memory-query", 30, 60_000)) {
      return fail("Too many memory queries. Please wait and try again.", 429, "rate_limited");
    }

    const body = await readJson<Payload>(request);
    const question = cleanString(body.question, 600);
    if (!question) return fail("Question is required.", 422, "missing_question");

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
