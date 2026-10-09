import {hasStoredListingPhoto} from "@/lib/listing-photo";
import {isAdminIdentity} from "@/lib/admin-access";
import { readOrderDetails } from "@/lib/order-details";
import { and, desc, eq, ne, sql, type SQLWrapper } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { publicFarmProfiles, communityPosts, communityComments, feedbackSubmissions, knowledgeArticles, marketplaceListings, orderRequests, professionals, projectProposals, users } from "@/db/schema";
import { rejectCrossSiteMutation } from "@/lib/security";

export const dynamic = "force-dynamic";

async function isAdmin() {
  const user = await getChatGPTUser();
  return isAdminIdentity(user);
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const db = await getDb();
  const [listings, orders, professionalRows, projects, feedback, userRows, articleRows, publicFarms, socialPosts, socialComments] = await Promise.all([
    db.select().from(marketplaceListings).where(eq(marketplaceListings.deleted, false)).orderBy(desc(marketplaceListings.serverUpdatedAt)).limit(200),
    db.select().from(orderRequests).orderBy(desc(orderRequests.serverUpdatedAt)).limit(200),
    db.select().from(professionals).orderBy(desc(professionals.updatedAt)).limit(200),
    db.select().from(projectProposals).orderBy(desc(projectProposals.updatedAt)).limit(200),
    db.select().from(feedbackSubmissions).orderBy(desc(feedbackSubmissions.updatedAt)).limit(200),
    db.select({ id: users.id, email: users.email, displayName: users.displayName, createdAt: users.createdAt, lastSeenAt: users.lastSeenAt }).from(users).orderBy(desc(users.updatedAt)).limit(500),
    db.select().from(knowledgeArticles).orderBy(desc(knowledgeArticles.updatedAt)).limit(200),
    db.select().from(publicFarmProfiles).where(sqlNotDeleted(publicFarmProfiles.status)).orderBy(desc(publicFarmProfiles.updatedAt)).limit(200),
    db.select().from(communityPosts).where(sqlNotDeleted(communityPosts.status)).orderBy(desc(communityPosts.updatedAt)).limit(200),
    db.select().from(communityComments).where(sqlNotDeleted(communityComments.status)).orderBy(desc(communityComments.updatedAt)).limit(200),
  ]);
  return NextResponse.json({ listings, professionals: professionalRows, projects, feedback, users: userRows, articles: articleRows, publicFarms, socialPosts, socialComments, orders: orders.map((order) => ({ ...order, ...readOrderDetails(order.itemsJson), itemsJson: undefined })) });
}

function sqlNotDeleted(column:SQLWrapper){return sql`${column} != 'deleted'`;}

const actionSchema = z.discriminatedUnion("entityType", [
  z.object({ entityType: z.literal("listing"), id: z.string().min(3).max(160), status: z.enum(["pending", "active", "rejected"]) }),
  z.object({ entityType: z.literal("order"), id: z.string().min(3).max(160), status: z.enum(["new", "contacted", "closed", "cancelled"]) }),
  z.object({ entityType: z.literal("professional"), id: z.string().min(3).max(160), status: z.enum(["pending", "active", "rejected"]) }),
  z.object({ entityType: z.literal("project"), id: z.string().min(3).max(160), status: z.enum(["pending", "active", "rejected"]) }),
  z.object({ entityType: z.literal("feedback"), id: z.string().min(3).max(160), status: z.enum(["new", "reviewed", "planned", "closed"]) }),
  ...["public-farm","social-post","social-comment"].map(type=>z.object({entityType:z.literal(type),id:z.string().min(3).max(160),status:z.enum(["pending","active","rejected"])})),
  z.object({ entityType: z.literal("article"), id: z.string().min(3).max(160), status: z.enum(["draft", "published", "archived"]) }),
]);

const versionedActionSchema=actionSchema.and(z.object({expectedVersion:z.string().max(200)}));

const articleSchema = z.object({
  slug: z.string().trim().min(3).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.string().trim().min(2).max(80),
  emoji: z.string().trim().min(1).max(12).default("🌿"),
  title: z.string().trim().min(5).max(180),
  description: z.string().trim().min(20).max(320),
  sectionHeading: z.string().trim().min(3).max(160),
  body: z.string().trim().min(80).max(12000),
  keywords: z.string().trim().max(800).default(""),
  readMinutes: z.coerce.number().int().min(1).max(60).default(5),
  status: z.enum(["draft", "published"]).default("draft"),
});

export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request); if (crossSite) return crossSite;
  if (!(await isAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const parsed = articleSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_article", details: parsed.error.flatten() }, { status: 400 });
  const db = await getDb();
  const now = new Date().toISOString();
  const bodyJson = JSON.stringify([{ heading: parsed.data.sectionHeading, paragraphs: parsed.data.body.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean) }]);
  await db.insert(knowledgeArticles).values({ slug: parsed.data.slug, category: parsed.data.category, emoji: parsed.data.emoji, title: parsed.data.title, description: parsed.data.description, bodyJson, keywords: parsed.data.keywords, readMinutes: parsed.data.readMinutes, status: parsed.data.status, createdAt: now, updatedAt: now }).onConflictDoUpdate({ target: knowledgeArticles.slug, set: { category: parsed.data.category, emoji: parsed.data.emoji, title: parsed.data.title, description: parsed.data.description, bodyJson, keywords: parsed.data.keywords, readMinutes: parsed.data.readMinutes, status: parsed.data.status, updatedAt: now } });
  return NextResponse.json({ ok: true, slug: parsed.data.slug });
}

export async function PATCH(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request); if (crossSite) return crossSite;
  if (!(await isAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const parsed = versionedActionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  const db = await getDb();
  const now = new Date().toISOString();
  const {entityType,id,status,expectedVersion}=parsed.data;let changed:Array<unknown>=[];
  if(entityType==="listing"&&status==="active"){
    const [candidate]=await db.select().from(marketplaceListings).where(and(eq(marketplaceListings.id,id),eq(marketplaceListings.deleted,false),eq(marketplaceListings.revision,expectedVersion))).limit(1);
    if(!candidate)return NextResponse.json({error:"review_changed_refresh_required"},{status:409});
    if(!hasStoredListingPhoto(candidate.imageKey))return NextResponse.json({error:"listing_photo_required"},{status:422});
    const {env}=await import("cloudflare:workers");const bucket=(env as unknown as {BUCKET?:R2Bucket}).BUCKET;
    if(!bucket)return NextResponse.json({error:"photo_storage_unavailable"},{status:503});
    let photo:R2Object|null;try{photo=await bucket.head(candidate.imageKey);}catch{return NextResponse.json({error:"photo_storage_unavailable"},{status:503});}
    if(!photo||photo.size<=0)return NextResponse.json({error:"listing_photo_unavailable"},{status:422});
  }
  if(entityType==="listing")changed=await db.update(marketplaceListings).set({status,serverUpdatedAt:now,revision:crypto.randomUUID(),lastOperationId:null,lastOperationHash:null}).where(and(eq(marketplaceListings.id,id),eq(marketplaceListings.deleted,false),eq(marketplaceListings.revision,expectedVersion))).returning({id:marketplaceListings.id});
  else if(entityType==="order")changed=await db.update(orderRequests).set({status,serverUpdatedAt:now}).where(and(eq(orderRequests.id,id),eq(orderRequests.serverUpdatedAt,expectedVersion))).returning({id:orderRequests.id});
  else if(entityType==="feedback")changed=await db.update(feedbackSubmissions).set({status,updatedAt:now}).where(and(eq(feedbackSubmissions.id,id),eq(feedbackSubmissions.updatedAt,expectedVersion))).returning({id:feedbackSubmissions.id});
  else if(entityType==="article")changed=await db.update(knowledgeArticles).set({status,updatedAt:now}).where(and(eq(knowledgeArticles.slug,id),eq(knowledgeArticles.updatedAt,expectedVersion))).returning({id:knowledgeArticles.slug});
  else {const table=entityType==="professional"?professionals:entityType==="project"?projectProposals:entityType==="public-farm"?publicFarmProfiles:entityType==="social-post"?communityPosts:communityComments;
   changed=await db.update(table).set({status,updatedAt:now,revision:crypto.randomUUID(),lastOperationId:null,lastOperationHash:null}).where(and(eq(table.id,id),ne(table.status,"deleted"),eq(table.revision,expectedVersion))).returning({id:table.id});}
  if(!changed.length)return NextResponse.json({error:"review_changed_refresh_required"},{status:409});
  return NextResponse.json({ ok: true });
}
