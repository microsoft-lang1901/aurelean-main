import "server-only";

import OpenAI from "openai";
import type { MemoryEntry, Rfq, Supplier } from "@/types/aurelean";

let openai: OpenAI | null = null;

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) return null;
  openai ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai;
}

export async function answerMemoryQuestion(args: {
  question: string;
  memories: MemoryEntry[];
  suppliers: Supplier[];
  rfqs: Rfq[];
}) {
  const client = getOpenAI();
  const context = JSON.stringify(
    {
      memories: args.memories.slice(0, 12),
      suppliers: args.suppliers.slice(0, 12),
      rfqs: args.rfqs.slice(0, 8)
    },
    null,
    2
  );

  if (!client) {
    const fallback =
      args.memories.find((memory) =>
        `${memory.title} ${memory.body} ${memory.entities.join(" ")}`
          .toLowerCase()
          .includes(args.question.toLowerCase().split(" ")[0] ?? "")
      ) ?? args.memories[0];
    return {
      answer: fallback
        ? `${fallback.title}: ${fallback.body}`
        : "I do not have enough operational memory yet to answer that.",
      source: "deterministic-fallback" as const
    };
  }

  try {
    const response = await client.responses.create(
      {
        model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
        input: [
          {
            role: "system",
            content:
              "You are AURELEAN, an operational sourcing copilot. Answer concisely from the provided data only. Mention uncertainty when the data is insufficient."
          },
          {
            role: "user",
            content: `Question: ${args.question}\n\nOperational data:\n${context}`
          }
        ]
      },
      { timeout: 8000 }
    );

    return {
      answer: response.output_text || "No answer generated.",
      source: "openai" as const
    };
  } catch {
    const fallback = args.memories[0];
    return {
      answer: fallback
        ? `${fallback.title}: ${fallback.body}`
        : "The OpenAI assistant is configured, but no matching operational memory was available.",
      source: "deterministic-fallback" as const
    };
  }
}
