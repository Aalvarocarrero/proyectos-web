import { isNotNull, ne, and, desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { communityPosts, marketplaceListings, professionals, projectProposals, publicFarmProfiles } from "@/db/schema";
import {
  OFFLINE_PUBLIC_KINDS, OFFLINE_PUBLIC_LIMIT_PER_KIND, offlinePublicHref, parseOfflinePublicSnapshot,
  type OfflinePublicItem, type OfflinePublicKind,
} from "@/lib/offline-public-types";

export const dynamic = "force-dynamic";
const headers = { "cache-control": "no-store", "x-content-type-options": "nosniff" };
const fetchLimit = OFFLINE_PUBLIC_LIMIT_PER_KIND + 1;
type PublicRow = { id: string; title: string; summary: string | null; location: string | null; category: string | null; updatedAt: string };
const text = (value: unknown, length: number) => typeof value === "string" ? value.trim().slice(0, length) : "";

function project(kind: OfflinePublicKind, row: PublicRow): OfflinePublicItem {
  return {
    kind, id: row.id, title: text(row.title, 180), summary: text(row.summary, 2000),
    location: text(row.location, 180), category: text(row.category, 500),
    href: offlinePublicHref(kind, row.id), updatedAt: text(row.updatedAt, 40),
  };
}

/** Explicit public allowlist. Never load authentication, ownership, contact, or full JSON payloads. */
export async function GET() {
  try {
    const db = await getDb();
    const [market, professional, projects, farms, posts] = await Promise.all([
      db.select({
        id: marketplaceListings.id, title: marketplaceListings.title, summary: marketplaceListings.description,
        location: marketplaceListings.location, category: marketplaceListings.category, updatedAt: marketplaceListings.serverUpdatedAt,
      }).from(marketplaceListings)
        .where(and(eq(marketplaceListings.status, "active"), eq(marketplaceListings.deleted, false), isNotNull(marketplaceListings.imageKey), ne(marketplaceListings.imageKey, "")))
        .orderBy(desc(marketplaceListings.serverUpdatedAt), marketplaceListings.id).limit(fetchLimit),
      db.select({
        id: professionals.id, title: professionals.name, summary: professionals.introduction,
        location: professionals.state, category: professionals.profession, updatedAt: professionals.updatedAt,
      }).from(professionals).where(eq(professionals.status, "active"))
        .orderBy(desc(professionals.updatedAt), professionals.id).limit(fetchLimit),
      db.select({
        id: projectProposals.id, title: projectProposals.title, summary: projectProposals.summary,
        location: projectProposals.state, category: projectProposals.sector, updatedAt: projectProposals.updatedAt,
      }).from(projectProposals).where(eq(projectProposals.status, "active"))
        .orderBy(desc(projectProposals.updatedAt), projectProposals.id).limit(fetchLimit),
      db.select({
        id: publicFarmProfiles.id, title: publicFarmProfiles.name,
        summary: sql<string>`CASE WHEN json_valid(${publicFarmProfiles.profileJson}) THEN
          CASE WHEN json_type(${publicFarmProfiles.profileJson}, '$.description') = 'text'
            THEN json_extract(${publicFarmProfiles.profileJson}, '$.description') ELSE '' END ELSE '' END`,
        location: publicFarmProfiles.state,
        category: sql<string>`CASE WHEN json_valid(${publicFarmProfiles.profileJson}) THEN
          CASE WHEN json_type(${publicFarmProfiles.profileJson}, '$.rubrics') = 'text'
            THEN json_extract(${publicFarmProfiles.profileJson}, '$.rubrics') ELSE '' END ELSE '' END`,
        updatedAt: publicFarmProfiles.updatedAt,
      }).from(publicFarmProfiles).where(eq(publicFarmProfiles.status, "active"))
        .orderBy(desc(publicFarmProfiles.updatedAt), publicFarmProfiles.id).limit(fetchLimit),
      db.select({
        id: communityPosts.id, title: publicFarmProfiles.name, summary: communityPosts.body,
        location: publicFarmProfiles.state, category: sql<string>`'Comunidad'`, updatedAt: communityPosts.updatedAt,
      }).from(communityPosts).innerJoin(publicFarmProfiles, eq(communityPosts.farmId, publicFarmProfiles.id))
        .where(and(eq(communityPosts.status, "active"), eq(publicFarmProfiles.status, "active")))
        .orderBy(desc(communityPosts.updatedAt), communityPosts.id).limit(fetchLimit),
    ]);
    const groups: Record<OfflinePublicKind, PublicRow[]> = {
      marketplace: market, professional, project: projects, farm: farms, post: posts,
    };
    const snapshot = parseOfflinePublicSnapshot({
      schemaVersion: 1, generatedAt: new Date().toISOString(),
      items: OFFLINE_PUBLIC_KINDS.flatMap((kind) => groups[kind].slice(0, OFFLINE_PUBLIC_LIMIT_PER_KIND).map((row) => project(kind, row))),
      truncatedKinds: OFFLINE_PUBLIC_KINDS.filter((kind) => groups[kind].length > OFFLINE_PUBLIC_LIMIT_PER_KIND),
    });
    return NextResponse.json(snapshot, { headers });
  } catch {
    // A failed download must never replace an existing snapshot with fake empty success.
    return NextResponse.json({ error: "offline_public_unavailable" }, { status: 503, headers });
  }
}
