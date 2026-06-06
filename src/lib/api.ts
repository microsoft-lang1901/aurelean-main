import type { ApiResult } from "@/types/aurelean";

const defaultMaxJsonBytes = 32_000;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function ok<T>(data: T): ApiResult<T> {
  return { ok: true, data };
}

export function fail(error: string, status = 400, code?: string) {
  return Response.json({ ok: false, error, code }, { status });
}

export async function readJson<T>(request: Request, maxBytes = defaultMaxJsonBytes): Promise<T> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) {
    throw new Error("Request body is too large.");
  }

  try {
    return (await request.json()) as T;
  } catch {
    throw new Error("Invalid JSON payload.");
  }
}

export function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export function cleanStringArray(value: unknown, maxItems = 8, maxLength = 80) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => cleanString(item, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
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

export function safePublicState() {
  return {
    mode: process.env.VERCEL && !process.env.SUPABASE_SERVICE_ROLE_KEY ? "ephemeral-demo" : "persistent",
    supabaseConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    openAIConfigured: Boolean(process.env.OPENAI_API_KEY),
    nvidiaNimConfigured: Boolean(process.env.NVIDIA_NIM_BASE_URL && process.env.NVIDIA_NIM_API_KEY),
    renderConfigured: Boolean(process.env.RENDER_ENDPOINT),
    contentAgentsConfigured: Boolean(process.env.CONTENT_AGENTS_ENDPOINT && process.env.CONTENT_AGENTS_API_KEY)
  };
}
