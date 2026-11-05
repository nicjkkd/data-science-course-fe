import type { z } from "zod";
import { mockRequest } from "./mock";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const MOCK = process.env.NEXT_PUBLIC_API_MOCK === "1";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public issues?: unknown,
  ) {
    super(message);
  }
}

type Options = { method?: "GET" | "POST"; body?: unknown; signal?: AbortSignal };

export async function api<T>(path: string, schema: z.ZodType<T>, opts: Options = {}): Promise<T> {
  const raw = MOCK ? await mockRequest(path, opts.signal) : await realRequest(path, opts);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(500, `Невідповідь контракту для ${path}`, parsed.error.issues);
  }
  return parsed.data;
}

async function realRequest(path: string, { method = "GET", body, signal }: Options) {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    throw new ApiError(0, "Сервер недоступний — перевірте з'єднання або спробуйте пізніше");
  }
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const detail = typeof data?.detail === "string" ? data.detail : undefined;
    throw new ApiError(res.status, detail ?? data?.error ?? res.statusText, data?.issues);
  }
  return res.json();
}
