import "server-only";

import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import { answerMemoryQuestion } from "@/lib/assistant";
import {
  createRfq,
  createSampleRequest,
  findMemoryMatches,
  getState,
  getSupplier,
  recordMemory
} from "@/lib/store";
import type {
  AgentAction,
  AgentRunData,
  AgentToolEvent,
  AureleanState,
  Bid,
  MemoryEntry,
  Rfq,
  Supplier
} from "@/types/aurelean";

type AgentRunInput = {
  prompt: string;
  action?: AgentAction;
  supplierId?: string;
  rfqId?: string;
  material?: string;
  quantity?: string;
  targetDelivery?: string;
  specifications?: string;
};

const model =
  process.env.OPENAI_MODEL || process.env.NVIDIA_NIM_MODEL || "gpt-5.4-mini";
const hasLLMProvider = Boolean(process.env.OPENAI_API_KEY || process.env.NVIDIA_NIM_API_KEY);

const procurementInputGuardrail = {
  name: "procurement_human_approval_boundary",
  execute: async ({ input }: { input: string | unknown[] }) => {
    const text = typeof input === "string" ? input : JSON.stringify(input);
    const lowered = text.toLowerCase();
    const unsafe =
      lowered.includes("award without approval") ||
      lowered.includes("bypass approval") ||
      lowered.includes("ignore guardrails") ||
      lowered.includes("send payment") ||
      lowered.includes("wire transfer");

    return {
      tripwireTriggered: unsafe,
      outputInfo: {
        reason: unsafe
          ? "The request attempts to bypass procurement approval or payment controls."
          : "Input stayed inside the procurement advisory boundary."
      }
    };
  },
  runInParallel: false
};

function textMatches(text: string, query: string) {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .some((word) => text.toLowerCase().includes(word));
}

function serializeLeanState(state: AureleanState, query = "") {
  const suppliers = query
    ? state.suppliers.filter((supplier) =>
        textMatches(`${supplier.name} ${supplier.country} ${supplier.category} ${supplier.material}`, query)
      )
    : state.suppliers;
  const rfqs = query
    ? state.rfqs.filter((rfq) =>
        textMatches(`${rfq.id} ${rfq.supplierName} ${rfq.material} ${rfq.project}`, query)
      )
    : state.rfqs;
  const rfqIds = new Set(rfqs.map((rfq) => rfq.id));
  const memories = query
    ? state.memories.filter((memory) =>
        textMatches(`${memory.title} ${memory.body} ${memory.entities.join(" ")}`, query)
      )
    : state.memories;

  return {
    suppliers: (suppliers.length ? suppliers : state.suppliers).slice(0, 8).map((supplier) => ({
      id: supplier.id,
      name: supplier.name,
      country: supplier.country,
      countryCode: supplier.countryCode,
      city: supplier.city,
      category: supplier.category,
      material: supplier.material,
      moq: supplier.moq,
      leadTimeWeeks: supplier.leadTimeWeeks,
      verified: supplier.verified,
      reliability: supplier.reliability,
      capabilityTier: supplier.capabilityTier,
      stage: supplier.stage,
      certifications: supplier.certifications
    })),
    rfqs: (rfqs.length ? rfqs : state.rfqs).slice(0, 6).map((rfq) => ({
      id: rfq.id,
      supplierId: rfq.supplierId,
      supplierName: rfq.supplierName,
      material: rfq.material,
      quantity: rfq.quantity,
      status: rfq.status,
      bidsReceived: rfq.bidsReceived,
      project: rfq.project,
      targetDelivery: rfq.targetDelivery
    })),
    bids: state.bids.filter((bid) => !rfqIds.size || rfqIds.has(bid.rfqId)).slice(0, 8),
    memories: (memories.length ? memories : state.memories).slice(0, 8)
  };
}

function supplierMatches(supplier: Supplier, query: string) {
  const q = query.toLowerCase();
  return [
    supplier.name,
    supplier.country,
    supplier.city,
    supplier.category,
    supplier.material,
    supplier.capabilityTier,
    ...supplier.certifications
  ]
    .join(" ")
    .toLowerCase()
    .includes(q);
}

async function searchSuppliers(input: { query?: string; category?: string }) {
  const state = await getState();
  const query = input.query?.trim() || "";
  const category = input.category?.trim().toLowerCase() || "";
  const suppliers = state.suppliers
    .filter((supplier) => !query || supplierMatches(supplier, query))
    .filter((supplier) => !category || supplier.category === category)
    .sort((a, b) => b.featuredScore - a.featuredScore)
    .slice(0, 6);

  return {
    suppliers,
    summary: suppliers.length
      ? suppliers
          .map(
            (supplier) =>
              `${supplier.name}: ${supplier.material}, ${supplier.countryCode}, reliability ${supplier.reliability}`
          )
          .join("\n")
      : "No verified suppliers matched that search."
  };
}

async function supplierProfile(input: { supplierId: string }) {
  const supplier = await getSupplier(input.supplierId);
  if (!supplier) {
    return {
      supplier: null,
      summary: `No supplier exists with id ${input.supplierId}.`
    };
  }

  return {
    supplier,
    summary: `${supplier.name} is a ${supplier.city}, ${supplier.country} supplier for ${supplier.material}. Reliability ${supplier.reliability}, tier ${supplier.capabilityTier}. Certifications: ${supplier.certifications.join(", ")}.`
  };
}

function rankBid(bid: Bid) {
  return bid.reliability * 2 - bid.pricePerUnit - bid.leadTimeWeeks * 1.5;
}

async function compareRfqBids(input: { rfqId: string }) {
  const state = await getState();
  const rfq = state.rfqs.find((item) => item.id === input.rfqId);
  const bids = state.bids
    .filter((bid) => bid.rfqId === input.rfqId)
    .sort((a, b) => rankBid(b) - rankBid(a));

  if (!rfq || bids.length === 0) {
    return {
      rfq,
      bids,
      recommendation: null,
      summary: "No comparable bids are available for that RFQ yet."
    };
  }

  const best = bids[0];
  return {
    rfq,
    bids,
    recommendation: best,
    summary: `${best.supplierName} is the recommended bid for ${rfq.id}: ${best.currency} ${best.pricePerUnit}/m, ${best.leadTimeWeeks} weeks, reliability ${best.reliability}. This is a recommendation only; awarding still requires human approval.`
  };
}

async function guardedCreateRfq(input: {
  supplierId: string;
  material?: string;
  quantity?: string;
  targetDelivery?: string;
  specifications?: string;
}) {
  const supplier = await getSupplier(input.supplierId);
  if (!supplier) {
    return {
      created: false,
      rfq: null,
      summary: `Cannot create RFQ: supplier ${input.supplierId} was not found.`
    };
  }

  if (!supplier.verified) {
    return {
      created: false,
      rfq: null,
      summary: `Cannot create RFQ: ${supplier.name} is not verified.`
    };
  }

  const rfq = await createRfq({
    supplierId: supplier.id,
    supplierName: supplier.name,
    material: input.material || supplier.material,
    quantity: input.quantity || supplier.moq,
    targetDelivery: input.targetDelivery || "TBD",
    specifications: input.specifications || "Agent-drafted sourcing request."
  });

  return {
    created: true,
    rfq,
    summary: `${rfq.id} was created for ${supplier.name}: ${rfq.quantity} of ${rfq.material}, target ${rfq.targetDelivery}.`
  };
}

async function guardedSampleRequest(input: {
  supplierId: string;
  material?: string;
  quantity?: string;
  targetDelivery?: string;
  specifications?: string;
}) {
  const supplier = await getSupplier(input.supplierId);
  if (!supplier) {
    return {
      created: false,
      request: null,
      summary: `Cannot request sample: supplier ${input.supplierId} was not found.`
    };
  }

  if (!supplier.verified) {
    return {
      created: false,
      request: null,
      summary: `Cannot request sample: ${supplier.name} is not verified.`
    };
  }

  const request = await createSampleRequest({
    supplierId: supplier.id,
    material: input.material || supplier.material,
    quantity: input.quantity || "1 sample set",
    targetDelivery: input.targetDelivery || "TBD",
    specifications: input.specifications || "Agent-assisted sample request."
  });

  return {
    created: true,
    request,
    summary: `${request.id} sample request was created for ${supplier.name}: ${request.quantity} of ${request.material}.`
  };
}

async function queryMemory(input: { question: string }) {
  const state = await getState();
  const matches = findMemoryMatches(state.memories, input.question);
  const response = await answerMemoryQuestion({
    question: input.question,
    memories: matches.length ? matches : state.memories,
    suppliers: state.suppliers,
    rfqs: state.rfqs
  });

  return {
    ...response,
    matches,
    summary: response.answer
  };
}

async function riskReview(input: { supplierId?: string; rfqId?: string }) {
  const state = await getState();
  const supplier =
    input.supplierId
      ? state.suppliers.find((item) => item.id === input.supplierId)
      : input.rfqId
        ? state.suppliers.find(
            (item) =>
              item.id === state.rfqs.find((rfq) => rfq.id === input.rfqId)?.supplierId
          )
        : null;

  if (!supplier) {
    return {
      supplier: null,
      risk: "unknown",
      summary: "No supplier context was found for this risk review."
    };
  }

  const issues = [
    supplier.reliability < 85 ? "Reliability below preferred threshold." : "",
    supplier.certifications.length < 2 ? "Certification evidence is light." : "",
    supplier.stage === "dialogue" ? "Relationship is still in dialogue stage." : ""
  ].filter(Boolean);

  return {
    supplier,
    risk: issues.length > 1 ? "medium" : issues.length === 1 ? "watch" : "low",
    issues,
    summary: issues.length
      ? `${supplier.name} needs review: ${issues.join(" ")}`
      : `${supplier.name} is low risk for the current workflow.`
  };
}

async function recommendAward(input: { rfqId: string }) {
  const comparison = await compareRfqBids({ rfqId: input.rfqId });
  if (!comparison.recommendation) return comparison;

  await recordMemory({
    kind: "Decision",
    title: `Approval prepared for ${input.rfqId}`,
    body: `AURELEAN prepared an award recommendation for ${comparison.recommendation.supplierName}. Human approval is required before awarding.`,
    entities: [
      input.rfqId,
      comparison.recommendation.supplierName,
      comparison.rfq?.material || "RFQ"
    ]
  });

  return {
    ...comparison,
    approvalRequired: true,
    summary: `${comparison.summary} Approval is required before the award can be executed.`
  };
}

const searchSuppliersTool = tool({
  name: "search_suppliers",
  description:
    "Search verified suppliers by supplier name, material, country, certification, or category.",
  parameters: z.object({
    query: z.string().optional(),
    category: z.string().optional()
  }),
  execute: searchSuppliers
});

const supplierProfileTool = tool({
  name: "get_supplier_profile",
  description:
    "Return an evidence-based supplier profile from AURELEAN's supplier record.",
  parameters: z.object({
    supplierId: z.string()
  }),
  execute: supplierProfile
});

const compareBidsTool = tool({
  name: "compare_bids",
  description:
    "Compare bids for an RFQ and recommend the best value without awarding it.",
  parameters: z.object({
    rfqId: z.string()
  }),
  execute: compareRfqBids
});

const createRfqTool = tool({
  name: "create_rfq",
  description:
    "Create a structured RFQ only for a verified supplier. This is a safe workflow action.",
  parameters: z.object({
    supplierId: z.string(),
    material: z.string().optional(),
    quantity: z.string().optional(),
    targetDelivery: z.string().optional(),
    specifications: z.string().optional()
  }),
  execute: guardedCreateRfq,
  inputGuardrails: [
    {
      name: "verified_supplier_only",
      run: async ({ toolCall }) => {
        const args = JSON.parse(toolCall.arguments || "{}") as { supplierId?: string };
        const supplier = args.supplierId ? await getSupplier(args.supplierId) : null;
        if (!supplier || !supplier.verified) {
          return {
            behavior: {
              type: "rejectContent",
              message: "RFQs can only be created for verified suppliers."
            },
            outputInfo: { supplierId: args.supplierId || null }
          };
        }
        return { behavior: { type: "allow" }, outputInfo: { supplierId: supplier.id } };
      }
    }
  ]
});

const requestSampleTool = tool({
  name: "request_sample",
  description:
    "Create a sample request only for a verified supplier. This is a safe workflow action.",
  parameters: z.object({
    supplierId: z.string(),
    material: z.string().optional(),
    quantity: z.string().optional(),
    targetDelivery: z.string().optional(),
    specifications: z.string().optional()
  }),
  execute: guardedSampleRequest
});

const queryMemoryTool = tool({
  name: "query_operational_memory",
  description:
    "Answer questions from AURELEAN operational memory and current procurement state.",
  parameters: z.object({
    question: z.string()
  }),
  execute: queryMemory
});

const riskReviewTool = tool({
  name: "supplier_risk_review",
  description:
    "Review supplier or RFQ risk using reliability, certification evidence, and relationship stage.",
  parameters: z.object({
    supplierId: z.string().optional(),
    rfqId: z.string().optional()
  }),
  execute: riskReview
});

const awardRequiresApprovalTool = tool({
  name: "award_bid_requires_approval",
  description:
    "Prepare an award recommendation. This must never execute the award; it always requires human approval.",
  parameters: z.object({
    rfqId: z.string()
  }),
  needsApproval: true,
  execute: recommendAward
});

const supplierIntelligenceAgent = new Agent({
  name: "Supplier Intelligence Agent",
  model,
  instructions:
    "Analyze supplier evidence. Use only provided AURELEAN context. Do not invent certifications, countries, capacity, or compliance facts.",
  tools: [searchSuppliersTool, supplierProfileTool, riskReviewTool]
});

const rfqAgent = new Agent({
  name: "RFQ Orchestration Agent",
  model,
  instructions:
    "Draft and create RFQs only when supplier, material, quantity, and delivery target are clear enough. Ask for missing fields instead of guessing.",
  tools: [supplierProfileTool, createRfqTool, requestSampleTool]
});

const bidComparisonAgent = new Agent({
  name: "Bid Comparison Agent",
  model,
  instructions:
    "Compare bids by price, lead time, MOQ, and reliability. Recommend only. Never award without a separate human approval.",
  tools: [compareBidsTool, awardRequiresApprovalTool]
});

const operationalMemoryAgent = new Agent({
  name: "Operational Memory Agent",
  model,
  instructions:
    "Answer from operational memory and current sourcing state. Mention uncertainty and missing evidence clearly.",
  tools: [queryMemoryTool]
});

function orchestratorAgent() {
  return new Agent({
    name: "AURELEAN Orchestrator",
    model,
    instructions:
      "You are AURELEAN, an AI-native procurement operating layer. Coordinate sourcing, RFQs, bid comparison, supplier intelligence, risk review, and operational memory. Use tools for factual data. Keep responses concise and executive. Never claim an award has been executed unless a human has clicked the separate award action in the UI. Never invent supplier credentials or market facts.",
    inputGuardrails: [procurementInputGuardrail],
    tools: [
      supplierIntelligenceAgent.asTool({
        toolName: "supplier_intelligence_agent",
        toolDescription:
          "Use for supplier discovery, profile checks, and supplier risk reviews."
      }),
      rfqAgent.asTool({
        toolName: "rfq_orchestration_agent",
        toolDescription:
          "Use for drafting or creating RFQs and sample requests for verified suppliers."
      }),
      bidComparisonAgent.asTool({
        toolName: "bid_comparison_agent",
        toolDescription:
          "Use for comparing bids and preparing award recommendations that require approval."
      }),
      operationalMemoryAgent.asTool({
        toolName: "operational_memory_agent",
        toolDescription:
          "Use for questions about past decisions, samples, signals, specs, and sourcing memory."
      }),
      searchSuppliersTool,
      supplierProfileTool,
      compareBidsTool,
      createRfqTool,
      requestSampleTool,
      queryMemoryTool,
      riskReviewTool,
      awardRequiresApprovalTool
    ]
  });
}

function event(toolName: string, summary: string, status: AgentToolEvent["status"] = "completed") {
  return { tool: toolName, status, summary };
}

function inferAction(input: AgentRunInput): AgentAction {
  if (input.action) return input.action;
  const prompt = input.prompt.toLowerCase();
  if (prompt.includes("sample")) return "request_sample";
  if (prompt.includes("create") && prompt.includes("rfq")) return "create_rfq";
  if (prompt.includes("compare") || prompt.includes("bid")) return "compare_bids";
  if (prompt.includes("award")) return "recommend_award";
  if (prompt.includes("risk")) return "risk_review";
  if (prompt.includes("supplier") || prompt.includes("find") || prompt.includes("search")) {
    return "search_suppliers";
  }
  if (prompt.includes("why") || prompt.includes("memory")) return "query_memory";
  return "ask";
}

function inferSupplierId(input: AgentRunInput, state: AureleanState) {
  if (input.supplierId) return input.supplierId;
  const prompt = input.prompt.toLowerCase();
  return state.suppliers.find((supplier) =>
    supplier.name.toLowerCase().split(/\s+/).some((part) => part.length > 3 && prompt.includes(part))
  )?.id;
}

function inferRfqId(input: AgentRunInput, state: AureleanState) {
  if (input.rfqId) return input.rfqId;
  const match = input.prompt.match(/rfq-\d+/i);
  if (match) return match[0].toUpperCase();
  return state.rfqs[0]?.id;
}

async function deterministicAction(input: AgentRunInput): Promise<AgentRunData> {
  const state = await getState();
  const action = inferAction(input);
  const supplierId = inferSupplierId(input, state);
  const rfqId = inferRfqId(input, state);

  if (action === "search_suppliers") {
    const result = await searchSuppliers({
      query: input.material || input.prompt
    });
    return {
      answer: result.summary,
      source: "deterministic-action",
      action,
      approvalRequired: false,
      toolEvents: [event("search_suppliers", `${result.suppliers.length} suppliers returned`)],
      data: result
    };
  }

  if (action === "compare_bids") {
    const result = await compareRfqBids({ rfqId });
    return {
      answer: result.summary,
      source: "deterministic-action",
      action,
      approvalRequired: false,
      toolEvents: [event("compare_bids", `Compared bids for ${rfqId}`)],
      data: result
    };
  }

  if (action === "recommend_award") {
    const result = await recommendAward({ rfqId });
    return {
      answer: result.summary,
      source: "deterministic-action",
      action,
      approvalRequired: Boolean("approvalRequired" in result),
      toolEvents: [
        event("award_bid_requires_approval", `Prepared approval boundary for ${rfqId}`, "approval_required")
      ],
      data: result
    };
  }

  if (action === "create_rfq") {
    if (!supplierId) {
      return {
        answer: "I need a verified supplier before I can create an RFQ.",
        source: "deterministic-action",
        action,
        approvalRequired: false,
        toolEvents: [event("create_rfq", "Missing supplier", "blocked")]
      };
    }
    const result = await guardedCreateRfq({
      supplierId,
      material: input.material,
      quantity: input.quantity,
      targetDelivery: input.targetDelivery,
      specifications: input.specifications || input.prompt
    });
    return {
      answer: result.summary,
      source: "deterministic-action",
      action,
      approvalRequired: false,
      toolEvents: [event("create_rfq", result.created ? "RFQ created" : "RFQ blocked")],
      data: result
    };
  }

  if (action === "request_sample") {
    if (!supplierId) {
      return {
        answer: "I need a verified supplier before I can request a sample.",
        source: "deterministic-action",
        action,
        approvalRequired: false,
        toolEvents: [event("request_sample", "Missing supplier", "blocked")]
      };
    }
    const result = await guardedSampleRequest({
      supplierId,
      material: input.material,
      quantity: input.quantity,
      targetDelivery: input.targetDelivery,
      specifications: input.specifications || input.prompt
    });
    return {
      answer: result.summary,
      source: "deterministic-action",
      action,
      approvalRequired: false,
      toolEvents: [event("request_sample", result.created ? "Sample requested" : "Sample blocked")],
      data: result
    };
  }

  if (action === "risk_review") {
    const result = await riskReview({ supplierId, rfqId });
    return {
      answer: result.summary,
      source: "deterministic-action",
      action,
      approvalRequired: false,
      toolEvents: [event("supplier_risk_review", "Risk review completed")],
      data: result
    };
  }

  const result = await queryMemory({ question: input.prompt });
  return {
    answer: result.summary,
    source: "deterministic-action",
    action: action === "ask" ? "query_memory" : action,
    approvalRequired: false,
    toolEvents: [event("query_operational_memory", `${result.matches.length} direct matches`)],
    data: result
  };
}

function fallbackMemoryAnswer(prompt: string, memories: MemoryEntry[]) {
  const firstWord = prompt.toLowerCase().split(/\s+/).find((word) => word.length > 3);
  const memory =
    memories.find((entry) =>
      firstWord
        ? `${entry.title} ${entry.body} ${entry.entities.join(" ")}`
            .toLowerCase()
            .includes(firstWord)
        : false
    ) ?? memories[0];
  return memory
    ? `${memory.title}: ${memory.body}`
    : "I do not have enough operational memory yet to answer that.";
}

export async function runAureleanAgent(input: AgentRunInput): Promise<AgentRunData> {
  const action = inferAction(input);

  if (input.action && input.action !== "ask") {
    return deterministicAction(input);
  }

  const state = await getState();
  const context = JSON.stringify(serializeLeanState(state, input.prompt), null, 2);
  const prompt = `${input.prompt}\n\nAURELEAN current operating context:\n${context}`;

  if (!hasLLMProvider) {
    const fallback = await deterministicAction(input);
    return {
      ...fallback,
      source: "deterministic-fallback",
      toolEvents: [
        ...fallback.toolEvents,
        event("agents_sdk", "OPENAI_API_KEY is not configured", "fallback")
      ]
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const result = await run(orchestratorAgent(), prompt, {
      maxTurns: 6,
      signal: controller.signal,
      toolExecution: { maxFunctionToolConcurrency: 2 }
    });
    clearTimeout(timeout);

    const approvalRequired = result.interruptions.length > 0;
    const answer =
      typeof result.finalOutput === "string"
        ? result.finalOutput
        : result.finalOutput
          ? JSON.stringify(result.finalOutput)
          : fallbackMemoryAnswer(input.prompt, state.memories);

    return {
      answer,
      source: "agents-sdk",
      action,
      approvalRequired,
      toolEvents: [
        event(
          "agents_sdk",
          approvalRequired
            ? "The agent reached an approval-required procurement action."
            : "The orchestrator completed the run."
        )
      ],
      data: {
        lastResponseId: result.lastResponseId,
        interruptions: result.interruptions.map((item) => item.rawItem)
      }
    };
  } catch (error) {
    const fallback = await deterministicAction(input);
    return {
      ...fallback,
      source: "deterministic-fallback",
      toolEvents: [
        ...fallback.toolEvents,
        event(
          "agents_sdk",
          error instanceof Error ? error.message : "Agent run fell back safely",
          "fallback"
        )
      ]
    };
  }
}
