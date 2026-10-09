import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { professionals, projectProposals } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await getDb();
  const [professionalRows, projectRows] = await Promise.all([
    db.select().from(professionals).where(eq(professionals.status, "active")).orderBy(desc(professionals.updatedAt)).limit(100),
    db.select().from(projectProposals).where(eq(projectProposals.status, "active")).orderBy(desc(projectProposals.updatedAt)).limit(100),
  ]);
  return NextResponse.json({
    professionals: professionalRows.map(row=>({...row,ownerId:undefined,lastOperationId:undefined,lastOperationHash:undefined,revision:undefined})),
    projects: projectRows.map((project) => ({ ...project,ownerId:undefined,lastOperationId:undefined,lastOperationHash:undefined,revision:undefined, has: safeList(project.hasJson), needs: safeList(project.needsJson), hasJson: undefined, needsJson: undefined })),
  });
}

function safeList(value: string) { try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch { return []; } }
