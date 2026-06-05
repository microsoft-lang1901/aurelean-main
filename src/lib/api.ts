import type { ApiResult } from "@/types/aurelean";

export function ok<T>(data: T): ApiResult<T> {
  return { ok: true, data };
}

export function fail(error: string, status = 400) {
  return Response.json({ ok: false, error }, { status });
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new Error("Invalid JSON payload.");
  }
}
