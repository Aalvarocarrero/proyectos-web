import { NextResponse } from "next/server";
import { getChatGPTUser } from "@/app/chatgpt-auth";
export const dynamic = "force-dynamic";
export async function GET() {
  const user = await getChatGPTUser();
  return NextResponse.json({ owner: user?.id ?? "device-local" }, { headers: { "cache-control": "no-store" } });
}
