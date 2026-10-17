/** Bounded JSON input. Limits apply while reading, including chunked requests. */
export class RequestBodyError extends Error {
  constructor(public code: "json_required" | "request_too_large" | "invalid_json", public status: number) { super(code); }
}

export async function readBoundedJson(request: Request, maxBytes: number): Promise<unknown> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new RequestBodyError("json_required", 415);
  }
  const statedLength = request.headers.get("content-length");
  if (statedLength && Number(statedLength) > maxBytes) throw new RequestBodyError("request_too_large", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new RequestBodyError("invalid_json", 400);
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let bytes = 0;
  let text = "";
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > maxBytes) {
        // Cancellation failure must not turn a known oversize input into success.
        await reader.cancel().catch(() => undefined);
        throw new RequestBodyError("request_too_large", 413);
      }
      text += decoder.decode(chunk.value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } catch (error) {
    if (error instanceof RequestBodyError) throw error;
    throw new RequestBodyError("invalid_json", 400);
  } finally { reader.releaseLock(); }
}
