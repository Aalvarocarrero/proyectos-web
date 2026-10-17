export function parseObjectJson(value:string):Record<string,unknown>{try{const parsed:unknown=JSON.parse(value);return parsed!==null&&typeof parsed==="object"&&!Array.isArray(parsed)?parsed as Record<string,unknown>:{};}catch{return {};}}
/** Damaged legacy lists must not make an otherwise valid account snapshot fail. */
export function parseStringListJson(value: string): string[] {
  try { const parsed: unknown = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []; }
  catch { return []; }
}
