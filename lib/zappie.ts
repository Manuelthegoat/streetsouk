const BASE = "https://api.zappie.ai/storefront/v1";
const KEY = process.env.EXPO_PUBLIC_ZAPPIE_KEY;

export class ZappieError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

type ErrorBody = { error?: { code?: string; message?: string } };

type Options = {
  method?: "GET" | "POST" | "DELETE";
  body?: unknown;
  idempotencyKey?: string;
  customerToken?: string;
};

export async function zappie<T>(path: string, options: Options = {}): Promise<T> {
  if (!KEY) {
    throw new ZappieError(
      "missing_key",
      "EXPO_PUBLIC_ZAPPIE_KEY is not set in .env (restart with: npx expo start -c)",
    );
  }
  const headers: Record<string, string> = { "Zappie-Key": KEY };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.idempotencyKey) headers["Idempotency-Key"] = options.idempotencyKey;
  if (options.customerToken) {
    headers.Authorization = `Bearer ${options.customerToken}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  if (res.status === 204) return undefined as T;

  const json = (await res.json().catch(() => null)) as ErrorBody | T | null;
  if (!res.ok) {
    const err = (json as ErrorBody | null)?.error;
    throw new ZappieError(
      err?.code ?? `http_${res.status}`,
      err?.message ?? "Zappie request failed",
    );
  }
  return json as T;
}