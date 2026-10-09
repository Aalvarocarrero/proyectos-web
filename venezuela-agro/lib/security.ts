import { NextRequest, NextResponse } from "next/server";

export function rejectCrossSiteMutation(request: NextRequest) {
  const fetchSite = request.headers.get("sec-fetch-site");
  const origin = request.headers.get("origin");
  const expected = request.nextUrl.origin;
  if (fetchSite === "cross-site" || (origin && origin !== expected)) {
    return NextResponse.json({ error: "cross_site_request_rejected" }, { status: 403 });
  }
  return null;
}

export async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64UrlDecode(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}

export function randomToken(bytes = 32) {
  const value = new Uint8Array(bytes);
  crypto.getRandomValues(value);
  return base64UrlEncode(value);
}

export function coarseNetworkHint(request: NextRequest) {
  const raw = request.headers.get("cf-connecting-ip") ?? "unknown";
  if (raw.includes(".")) return raw.split(".").slice(0, 3).join(".");
  if (raw.includes(":")) return raw.split(":").slice(0, 4).join(":");
  return "unknown";
}
