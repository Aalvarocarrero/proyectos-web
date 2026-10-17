import {publicProfessionalRow} from "./public-records";
import { and,eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { professionals } from '@/db/schema';
import type { ProfessionalRecord } from '@/lib/professional-profile';
import { professionalExamples } from '@/lib/professional-examples';
export async function findProfessional(id:string):Promise<ProfessionalRecord|null> {
 const example=professionalExamples.find(p=>p.id===id);if(example)return example;
 if(!/^[a-zA-Z0-9_-]{3,160}$/.test(id))return null;
 const db=await getDb();const rows=await db.select().from(professionals).where(and(eq(professionals.id,id),eq(professionals.status,'active'))).limit(1);return rows[0]?publicProfessionalRow(rows[0]):null;
}
