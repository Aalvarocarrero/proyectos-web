import {readCommunityListingShare} from "@/lib/community-listing-share";
import {parseObjectJson,parseStringListJson} from "@/lib/safe-json";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { farmRecords, farms, marketplaceListings, users, professionals, projectProposals, publicFarmProfiles, communityPosts, communityComments } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) {
    return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  }

  const db = await getDb();
  const now = new Date().toISOString();
  await db
    .insert(users)
    .values({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: { email: user.email, displayName: user.displayName, updatedAt: now },
    });

  const [farmRows, recordRows, listingRows] = await Promise.all([
    db.select().from(farms).where(and(eq(farms.ownerId, user.id))),
    db.select().from(farmRecords).where(and(eq(farmRecords.ownerId, user.id))),
    db.select().from(marketplaceListings).where(and(eq(marketplaceListings.ownerId, user.id))),
  ]);

  const [professionalRows,projectRows,publicFarmRows,postRows,commentRows]=await Promise.all([
    db.select().from(professionals).where(eq(professionals.ownerId,user.id)),db.select().from(projectProposals).where(eq(projectProposals.ownerId,user.id)),db.select().from(publicFarmProfiles).where(eq(publicFarmProfiles.ownerId,user.id)),db.select().from(communityPosts).where(eq(communityPosts.ownerId,user.id)),db.select().from(communityComments).where(eq(communityComments.ownerId,user.id)),
  ]);
  const hiddenFarmIds=new Set(farmRows.filter(row=>row.deleted).map(row=>row.id));
  return NextResponse.json({
    user: { id: user.id, email: user.email, displayName: user.displayName },
    farms: farmRows.map((farm) => {
      const boundary = parseFarmBoundary(farm.boundaryJson);
      return {
        ...farm,
        boundaryMeasurements: boundary.measurements,
        surveyPlan: boundary.surveyPlan,
        propertySketch: boundary.propertySketch,
        geographicReference: boundary.geographicReference,
        boundaryJson: undefined,
      };
    }),
    records: recordRows.map((record) => ({
      ...record,
      deleted:record.deleted||hiddenFarmIds.has(record.farmId),
      data: safeJson(record.dataJson),
      dataJson: undefined,
    })),
    listings: listingRows,
    entities:[
      ...professionalRows.map(row=>({entityType:"professional",id:row.id,revision:row.revision,deleted:row.status==="deleted",payload:{...row,credentialNote:typeof safeJson(row.credentialNote).credentialNote==="string"?safeJson(row.credentialNote).credentialNote:row.credentialNote.startsWith("{")?"":row.credentialNote,profileDetails:safeJson(row.credentialNote).details}})),
      ...projectRows.map(row=>({entityType:"project",id:row.id,revision:row.revision,deleted:row.status==="deleted",payload:{...row,has:parseStringListJson(row.hasJson),needs:parseStringListJson(row.needsJson)}})),
      ...publicFarmRows.map(row=>({entityType:"public-farm",id:row.id,revision:row.revision,deleted:row.status==="deleted",payload:{...safeJson(row.profileJson),actingUserId:user.id,status:row.status}})),
      ...postRows.map(row=>({entityType:"social-post",id:row.id,revision:row.revision,deleted:row.status==="deleted",payload:{farmId:row.farmId,...readCommunityListingShare(row.body),actingUserId:user.id,status:row.status}})),
      ...commentRows.map(row=>({entityType:"social-comment",id:row.id,revision:row.revision,deleted:row.status==="deleted",payload:{postId:row.postId,text:row.body,actingUserId:user.id,status:row.status}})),
    ],
    syncedAt: now,
  },{headers:{"cache-control":"private, no-store"}});
}

const safeJson=parseObjectJson;

function parseFarmBoundary(value: string): { measurements: Record<string, number>; surveyPlan?: Record<string, unknown>; propertySketch?: unknown; geographicReference?:unknown } {
  const parsed = safeJson(value);
  if (parsed.measurements && typeof parsed.measurements === "object" && !Array.isArray(parsed.measurements)) {
    const measurements = Object.fromEntries(
      Object.entries(parsed.measurements as Record<string, unknown>)
        .filter(([, measurement]) => typeof measurement === "number" && Number.isFinite(measurement)),
    ) as Record<string, number>;
    const surveyPlan = parsed.surveyPlan && typeof parsed.surveyPlan === "object" && !Array.isArray(parsed.surveyPlan)
      ? parsed.surveyPlan as Record<string, unknown>
      : undefined;
    return { measurements, surveyPlan, propertySketch: parsed.propertySketch,geographicReference:parsed.geographicReference };
  }

  // Compatibilidad con fincas creadas antes de incorporar la ficha poligonal.
  return {
    measurements: Object.fromEntries(
      Object.entries(parsed).filter(([, measurement]) => typeof measurement === "number" && Number.isFinite(measurement)),
    ) as Record<string, number>,
  };
}
