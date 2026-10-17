import {publicProfessionalRow,publicProjectRow} from "@/lib/public-records";
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
    professionals: professionalRows.map(publicProfessionalRow),
    projects: projectRows.map(publicProjectRow),
  });
}
