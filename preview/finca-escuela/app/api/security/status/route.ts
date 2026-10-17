import { CURRENT_POLICY_VERSION } from "@/lib/policy-version";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { trustedDevices, userConsents, users } from "@/db/schema";
import { sha256 } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  const db = await getDb();
  const now = new Date().toISOString();
  await db.insert(users).values({ id: user.id, email: user.email, displayName: user.displayName, createdAt: now, updatedAt: now, lastSeenAt: now }).onConflictDoUpdate({ target: users.id, set: { email: user.email, displayName: user.displayName, updatedAt: now, lastSeenAt: now } });
  const deviceToken = request.cookies.get("morochos_device")?.value;
  const tokenHash = deviceToken ? await sha256(`${user.id}:${deviceToken}`) : "";
  const [consentRows, deviceRows] = await Promise.all([
    db.select().from(userConsents).where(and(eq(userConsents.userId, user.id), eq(userConsents.policyVersion,CURRENT_POLICY_VERSION), isNull(userConsents.revokedAt))).orderBy(desc(userConsents.acceptedAt)).limit(1),
    tokenHash ? db.select().from(trustedDevices).where(and(eq(trustedDevices.userId, user.id), eq(trustedDevices.tokenHash, tokenHash), isNull(trustedDevices.revokedAt), gt(trustedDevices.expiresAt, now))).limit(1) : Promise.resolve([]),
  ]);
  return NextResponse.json({
    email: user.email,
    phone: (await db.select({phone:users.phoneE164}).from(users).where(eq(users.id,user.id)).limit(1))[0]?.phone ?? null,
    policyVersion: CURRENT_POLICY_VERSION,
    consent: consentRows[0] ?? null,
    trustedDevice: deviceRows[0] ? { id: deviceRows[0].id, label: deviceRows[0].label, expiresAt: deviceRows[0].expiresAt, lastVerifiedAt: deviceRows[0].lastVerifiedAt } : null,
  });
}
