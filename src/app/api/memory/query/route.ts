import { answerMemoryQuestion } from "@/lib/assistant";
import { fail, ok, readJson } from "@/lib/api";
import { findMemoryMatches, listMemory, listRfqs, listSuppliers } from "@/lib/store";

type Payload = {
  question?: string;
};

export async function POST(request: Request) {
  try {
    const body = await readJson<Payload>(request);
    if (!body.question) return fail("Question is required.");

    const [memories, suppliers, rfqs] = await Promise.all([
      listMemory(),
      listSuppliers(),
      listRfqs()
    ]);
    const matches = findMemoryMatches(memories, body.question);
    const response = await answerMemoryQuestion({
      question: body.question,
      memories: matches.length ? matches : memories,
      suppliers,
      rfqs
    });

    return Response.json(ok({ ...response, matches }));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not query memory.");
  }
}
