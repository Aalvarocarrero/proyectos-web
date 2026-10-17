/** Web Crypto only: compatible with Workers and modern Node, no runtime secrets in source. */
export function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function isOpaqueToken(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{43}$/.test(value);
}
/** Domain-separated keyed hashes keep database contents useless as bearer credentials. */
export async function tokenHash(secret: string, purpose: string, token: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${purpose}\0${token}`)));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function encode(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function decode(value: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4)), byte => byte.charCodeAt(0));
}
async function transactionKey(secret: string) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), "HKDF", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "HKDF", hash: "SHA-256", salt: new TextEncoder().encode("va-auth-v1"), info: new TextEncoder().encode("oauth-transaction-verifier") }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
/** AAD binds the encrypted verifier to its transaction, preventing row substitution. */
export async function encryptVerifier(secret: string, stateHash: string, verifier: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: new TextEncoder().encode(stateHash) }, await transactionKey(secret), new TextEncoder().encode(verifier));
  return `v1.${encode(iv)}.${encode(new Uint8Array(ciphertext))}`;
}
export async function decryptVerifier(secret: string, stateHash: string, sealed: string): Promise<string> {
  const parts = sealed.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") throw new Error("invalid_encrypted_verifier");
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: decode(parts[1]), additionalData: new TextEncoder().encode(stateHash) }, await transactionKey(secret), decode(parts[2]));
  return new TextDecoder().decode(plaintext);
}
