import { CURRENT_POLICY_VERSION } from "@/lib/policy-version";
import { and, eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { trustedDevices, userConsents } from "@/db/schema";
import { coarseNetworkHint, randomToken, rejectCrossSiteMutation, sha256 } from "@/lib/security";

const schema = z.object({ label: z.string().trim().min(2).max(80), platform: z.string().trim().max(120), timezone: z.string().trim().max(100), connectionClass: z.string().trim().max(40) });

export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request); if (crossSite) return crossSite;
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_device" }, { status: 400 });
  const db = await getDb();
  const consents = await db.select().from(userConsents).where(and(eq(userConsents.userId, user.id), eq(userConsents.securitySignalsAccepted, true), eq(userConsents.policyVersion,CURRENT_POLICY_VERSION), isNull(userConsents.revokedAt))).limit(1);
  if (!consents.length) return NextResponse.json({ error: "security_signal_consent_required" }, { status: 409 });
  const token = randomToken();
  const tokenHash = await sha256(`${user.id}:${token}`);
  const networkHintHash = await sha256(`${user.id}:${coarseNetworkHint(request)}`);
  const now = new Date();
  const expires = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const id = crypto.randomUUID();
  await db.insert(trustedDevices).values({ id, userId: user.id, tokenHash, label: parsed.data.label, platform: parsed.data.platform, timezone: parsed.data.timezone, connectionClass: parsed.data.connectionClass, networkHintHash, countryCode: request.headers.get("cf-ipcountry"), createdAt: now.toISOString(), expiresAt: expires.toISOString(), lastVerifiedAt: now.toISOString() });
  const response = NextResponse.json({ ok: true, id, expiresAt: expires.toISOString() });
  response.cookies.set("morochos_device", token, { httpOnly: true, secure: true, sameSite: "strict", path: "/", expires });
  return response;
}

export async function DELETE(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request); if (crossSite) return crossSite;
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  const token = request.cookies.get("morochos_device")?.value;
  if (token) {
    const hash = await sha256(`${user.id}:${token}`);
    const db = await getDb();
    await db.update(trustedDevices).set({ revokedAt: new Date().toISOString() }).where(and(eq(trustedDevices.userId, user.id), eq(trustedDevices.tokenHash, hash)));
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set("morochos_device", "", { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}
