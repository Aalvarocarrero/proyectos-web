import { NextResponse } from "next/server";
import { chatGPTSignOutPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { isAdminIdentity } from "@/lib/admin-access";

export const dynamic = "force-dynamic";
export async function GET() {
  const user = await getChatGPTUser();
  return NextResponse.json(user ? {
    owner: user.id,
    canAdmin: isAdminIdentity(user),
    signOutPath: chatGPTSignOutPath("/"),
  } : null, { headers: { "cache-control": "private, no-store" } });
}
