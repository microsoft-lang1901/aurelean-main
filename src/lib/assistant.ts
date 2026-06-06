import "server-only";

import OpenAI from "openai";
import type { MemoryEntry, Rfq, Supplier } from "@/types/aurelean";

let openai: OpenAI | null = null;

function getOpenAI() {
  const apiKey = process.env.NVIDIA_NIM_API_KEY || process.env.OPENAI_API_KEY;
  const baseURL = process.env.NVIDIA_NIM_BASE_URL || process.env.OPENAI_BASE_URL;
  if (!apiKey) return null;
  openai ??= new OpenAI({ apiKey, baseURL });
  return openai;
}

function configuredModel() {
  return process.env.NVIDIA_NIM_MODEL || process.env.OPENAI_MODEL || "gpt-5.4-mini";
}

function configuredSource() {
  return process.env.NVIDIA_NIM_BASE_URL ? "nvidia-nim" : "openai";
}

function matchesText(text: string, query: string) {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .some((word) => text.toLowerCase().includes(word));
}

export async function answerMemoryQuestion(args: {
  question: string;
  memories: MemoryEntry[];
  suppliers: Supplier[];
  rfqs: Rfq[];
}) {
  const client = getOpenAI();
  const relevantMemories = args.memories.slice(0, 8);
  const entityText = relevantMemories.flatMap((memory) => memory.entities).join(" ");
  const relevantSuppliers = args.suppliers
    .filter((supplier) =>
      matchesText(`${supplier.name} ${supplier.material} ${supplier.country} ${entityText}`, args.question)
    )
    .slice(0, 6);
  const relevantRfqs = args.rfqs
    .filter((rfq) =>
      matchesText(`${rfq.id} ${rfq.supplierName} ${rfq.material} ${rfq.project} ${entityText}`, args.question)
    )
    .slice(0, 6);
  const context = JSON.stringify(
    {
      memories: relevantMemories,
      suppliers: relevantSuppliers.length ? relevantSuppliers : args.suppliers.slice(0, 4),
      rfqs: relevantRfqs.length ? relevantRfqs : args.rfqs.slice(0, 4)
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
        model: configuredModel(),
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
      source: configuredSource()
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
