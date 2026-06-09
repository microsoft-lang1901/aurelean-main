import type { ApiResult } from "@/types/aurelean";
import { z } from "zod";

const defaultMaxJsonBytes = 32_000;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const requireAuthForMutations = process.env.AURELEAN_REQUIRE_AUTH === "true";
const apiMutationToken = process.env.AURELEAN_API_TOKEN;
const resetEnabled = process.env.AURELEAN_ENABLE_RESET === "true";

function codeForStatus(status: number) {
  if (status === 400) return "bad_request";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 413) return "payload_too_large";
  if (status === 422) return "invalid_payload";
  if (status === 429) return "rate_limited";
  if (status >= 500) return "server_error";
  return "request_failed";
}

export function ok<T>(data: T): ApiResult<T> {
  return { ok: true, data };
}

export function fail(error: string, status = 400, code = codeForStatus(status)) {
  return Response.json({ ok: false, error, code, status }, { status });
}

export function serverError(error: unknown, fallback: string, code = "server_error") {
  const detail = error instanceof Error ? error.message : String(error ?? "Unknown error");
  console.error(`[api:${code}] ${detail}`);
  return fail(fallback, 500, code);
}

export async function readJson<T>(request: Request, maxBytes = defaultMaxJsonBytes): Promise<T> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) {
    throw new Error("Request body is too large.");
  }

  const body = await request.text();
  if (Buffer.byteLength(body, "utf8") > maxBytes) {
    throw new Error("Request body is too large.");
  }

  try {
    return JSON.parse(body) as T;
  } catch {
    throw new Error("Invalid JSON payload.");
  }
}

export function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export function isSafeResourceId(value: string, maxLength = 80) {
  const normalized = cleanString(value, maxLength);
  if (!normalized) return "";
  return /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(normalized) ? normalized : "";
}

export function cleanStringArray(value: unknown, maxItems = 8, maxLength = 80) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => cleanString(item, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

function normalizePayloadIssues(issues: Array<z.ZodIssue>) {
  return issues
    .map((item) => `${item.path.map(String).join(".")} ${item.message}` || "Invalid value.")
    .join("; ");
}

export async function parseValidatedJson<T extends z.ZodTypeAny>(
  request: Request,
  schema: T,
  maxBytes = defaultMaxJsonBytes
) {
  try {
    const body = await readJson<unknown>(request, maxBytes);
    const result = schema.safeParse(body);
    if (!result.success) {
      return {
        ok: false as const,
        response: fail(
          `Invalid request payload. ${normalizePayloadIssues(result.error.issues)}`,
          422,
          "invalid_payload"
        )
      };
    }

    return { ok: true as const, data: result.data as z.output<T> };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request payload.";
    if (message === "Request body is too large.") return { ok: false as const, response: fail(message, 413, "payload_too_large") };
    return { ok: false as const, response: fail(message, 400, "invalid_json") };
  }
}

export function isWorkEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !/(gmail|yahoo|hotmail|outlook)\./i.test(value);
}

export function isRateLimited(request: Request, bucket: string, limit = 20, windowMs = 60_000) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  current.count += 1;
  return current.count > limit;
}

export function ensureMutationAllowed(request: Request, operation = "mutation") {
  if (!requireAuthForMutations) return null;
  if (!apiMutationToken) {
    return fail("Mutation guard is enabled but AURELEAN_API_TOKEN is not configured.", 500, "auth_token_missing");
  }

  const headerToken = request.headers.get("x-aurelean-api-token");
  const authorization = request.headers.get("authorization") || "";
  const bearerToken = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  const token = headerToken || bearerToken;

  if (!token) {
    return fail(`Missing API token for ${operation}.`, 401, "missing_api_token");
  }
  if (token !== apiMutationToken) {
    return fail("Invalid API token.", 403, "invalid_api_token");
  }
  return null;
}

export function ensureResetAllowed(request: Request) {
  if (!resetEnabled) {
    return fail("Reset endpoint is disabled.", 403, "reset_disabled");
  }

  if (!apiMutationToken) {
    return fail("Reset endpoint requires AURELEAN_API_TOKEN.", 500, "auth_token_missing");
  }

  const headerToken = request.headers.get("x-aurelean-api-token");
  const authorization = request.headers.get("authorization") || "";
  const bearerToken = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  const token = headerToken || bearerToken;

  if (!token) {
    return fail("Missing API token for reset.", 401, "missing_api_token");
  }
  if (token !== apiMutationToken) {
    return fail("Invalid API token.", 403, "invalid_api_token");
  }
  return null;
}

export function safePublicState() {
  return {
    mode: process.env.VERCEL && !process.env.SUPABASE_SERVICE_ROLE_KEY ? "ephemeral-demo" : "persistent",
    supabaseConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    openAIConfigured: Boolean(process.env.OPENAI_API_KEY),
    nvidiaNimConfigured: Boolean(process.env.NVIDIA_NIM_BASE_URL && process.env.NVIDIA_NIM_API_KEY),
    renderConfigured: Boolean(process.env.RENDER_ENDPOINT),
    contentAgentsConfigured: Boolean(process.env.CONTENT_AGENTS_ENDPOINT && process.env.CONTENT_AGENTS_API_KEY),
    mutationAuthRequired: requireAuthForMutations,
    resetEnabled
  };
}
