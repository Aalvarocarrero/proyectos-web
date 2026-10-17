import type { GoogleAuthConfig } from "./config";

// Only fixed categories cross the auth boundary. Never return tokens, secrets,
// provider response bodies, hostnames, cdata or exception messages.
export const TURNSTILE_FAILURE_REASONS = [
  "token_missing", "token_oversized", "secret_rejected", "token_expired_or_used",
  "token_rejected", "request_rejected", "provider_unavailable", "provider_rejected",
  "verification_unavailable", "verification_response_invalid", "hostname_mismatch", "action_mismatch",
  "provider_http_400", "provider_http_401", "provider_http_403", "provider_http_429", "provider_http_5xx", "provider_http_other", "provider_internal_error",
] as const;
export type TurnstileFailureReason = typeof TURNSTILE_FAILURE_REASONS[number];
export type TurnstileVerification = { ok: true } | { ok: false; reason: TurnstileFailureReason };

export function isTurnstileFailureReason(value: unknown): value is TurnstileFailureReason {
  return typeof value === "string" && (TURNSTILE_FAILURE_REASONS as readonly string[]).includes(value);
}

export async function verifyTurnstileDetailed(token: string, config: GoogleAuthConfig, transport: typeof fetch = fetch): Promise<TurnstileVerification> {
  if (!token) return { ok: false, reason: "token_missing" };
  if (token.length > 2048) return { ok: false, reason: "token_oversized" };
  const signal = AbortSignal.timeout(8000);
  let response: Response;
  try {
    response = await transport("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: config.turnstileSecret, response: token }),
      signal,
    });
  } catch { return { ok: false, reason: "verification_unavailable" }; }
  const httpFailure: TurnstileFailureReason = response.status === 400 ? "provider_http_400"
    : response.status === 401 ? "provider_http_401" : response.status === 403 ? "provider_http_403"
    : response.status === 429 ? "provider_http_429" : response.status >= 500 && response.status <= 599 ? "provider_http_5xx" : "provider_http_other";
  const fallback = response.ok ? "verification_response_invalid" : httpFailure;
  let result: Record<string, unknown>;
  try {
    // Siteverify may return its documented error envelope with HTTP 400.
    // Bound the input before parsing; no raw provider data leaves this function.
    const reader = response.body?.getReader();
    if (!reader) return { ok: false, reason: fallback };
    const cancel = () => { void reader.cancel().catch(() => undefined); };
    signal.addEventListener("abort", cancel, { once: true });
    let body = "", bytes = 0;
    const decoder = new TextDecoder();
    try {
      signal.throwIfAborted();
      while (true) {
        const chunk = await reader.read();
        signal.throwIfAborted();
        if (chunk.done) break;
        bytes += chunk.value.byteLength;
        if (bytes > 16 * 1024) { cancel(); return { ok: false, reason: fallback }; }
        body += decoder.decode(chunk.value, { stream: true });
      }
      body += decoder.decode();
    } finally { signal.removeEventListener("abort", cancel); reader.releaseLock(); }
    const value: unknown = JSON.parse(body);
    if (!value || typeof value !== "object" || Array.isArray(value)) return { ok: false, reason: fallback };
    result = value as Record<string, unknown>;
  } catch { return { ok: false, reason: fallback }; }
  if (typeof result.success !== "boolean") return { ok: false, reason: fallback };
  if (!result.success) {
    const codes = Array.isArray(result["error-codes"]) ? result["error-codes"] : [];
    if (codes.includes("missing-input-secret") || codes.includes("invalid-input-secret")) return { ok: false, reason: "secret_rejected" };
    if (codes.includes("timeout-or-duplicate")) return { ok: false, reason: "token_expired_or_used" };
    if (codes.includes("missing-input-response") || codes.includes("invalid-input-response")) return { ok: false, reason: "token_rejected" };
    if (codes.includes("bad-request")) return { ok: false, reason: "request_rejected" };
    if (codes.includes("internal-error")) return { ok: false, reason: "provider_internal_error" };
    return { ok: false, reason: response.ok ? "provider_rejected" : httpFailure };
  }
  // A success-shaped error response can NEVER authorize a login.
  if (!response.ok) return { ok: false, reason: httpFailure };
  if (result.hostname !== new URL(config.origin).hostname) return { ok: false, reason: "hostname_mismatch" };
  if (result.action !== "login") return { ok: false, reason: "action_mismatch" };
  return { ok: true };
}

export async function verifyTurnstile(token: string, config: GoogleAuthConfig, transport: typeof fetch = fetch): Promise<boolean> {
  return (await verifyTurnstileDetailed(token, config, transport)).ok;
}
