import type { professionals, projectProposals } from "@/db/schema";
import {parseStringListJson} from "./safe-json";

/** Explicit public projections also protect server-to-client component serialization. */
export function publicProfessionalRow(row: typeof professionals.$inferSelect) {
  return {
    id: row.id, name: row.name, profession: row.profession, specialties: row.specialties,
    state: row.state, municipality: row.municipality, serviceMode: row.serviceMode,
    introduction: row.introduction, contact: row.contact, credentialNote: row.credentialNote,
    status: row.status, createdAt: row.createdAt, updatedAt: row.updatedAt,
  };
}
export function publicProjectRow(row: typeof projectProposals.$inferSelect) {
  return {
    id: row.id, title: row.title, sector: row.sector, state: row.state, summary: row.summary,
    has: parseStringListJson(row.hasJson), needs: parseStringListJson(row.needsJson),
    impact: row.impact, requestedSupport: row.requestedSupport, contact: row.contact,
    status: row.status, createdAt: row.createdAt, updatedAt: row.updatedAt,
  };
}
