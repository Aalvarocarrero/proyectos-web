import { CURRENT_POLICY_VERSION } from "@/lib/policy-version";
import { and, eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import {accountContactSchema,confirmsAccountEmail,normalizeContactPhone} from "@/lib/account-contact";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { userConsents, users } from "@/db/schema";
import { rejectCrossSiteMutation } from "@/lib/security";

const schema = accountContactSchema;
const POLICY = CURRENT_POLICY_VERSION;

export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request); if (crossSite) return crossSite;
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_consent" }, { status: 400 });
  if(!confirmsAccountEmail(parsed.data.emailConfirmation,user.email))return NextResponse.json({error:"account_email_mismatch"},{status:400});
  const db = await getDb();
  const now = new Date().toISOString();
  await db.insert(users).values({ id: user.id, email: user.email, displayName: user.displayName, phoneE164:normalizeContactPhone(parsed.data.phone), createdAt: now, updatedAt: now }).onConflictDoUpdate({ target: users.id, set: { email: user.email, displayName: user.displayName, phoneE164:normalizeContactPhone(parsed.data.phone), updatedAt: now } });
  await db.insert(userConsents).values({ id: crypto.randomUUID(), userId: user.id, policyVersion: POLICY, essentialAccepted: true, publicContentAccepted: parsed.data.publicContentAccepted, securitySignalsAccepted: parsed.data.securitySignalsAccepted, acceptedAt: now }).onConflictDoUpdate({ target: [userConsents.userId, userConsents.policyVersion], set: { essentialAccepted: true, publicContentAccepted: parsed.data.publicContentAccepted, securitySignalsAccepted: parsed.data.securitySignalsAccepted, acceptedAt: now, revokedAt: null } });
  return NextResponse.json({ ok: true, policyVersion: POLICY });
}

export async function DELETE(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request); if (crossSite) return crossSite;
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  const db = await getDb();
  await db.update(userConsents).set({ revokedAt: new Date().toISOString() }).where(and(eq(userConsents.userId, user.id), isNull(userConsents.revokedAt)));
  return NextResponse.json({ ok: true });
}
