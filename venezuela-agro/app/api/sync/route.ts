import {parseObjectJson} from "@/lib/safe-json";
import { ZodError } from "zod";
import { revisionWrite, RevisionConflict, operationHash } from "@/lib/revision-write";
import { CURRENT_POLICY_VERSION } from "@/lib/policy-version";
import {syncNetworkOperation} from "@/lib/community-network-db";
import { encodeListingContact } from "@/lib/listing-contact";
import { and, eq, isNull, sql, type SQL } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import {
  farmRecords,
  farms,
  marketplaceListings,
  orderRequests,
  professionals,
  projectProposals,
  feedbackSubmissions,
  syncReceipts,
  users,
  userConsents,
} from "@/db/schema";
import {
  farmPayloadSchema,
  farmRecordPayloadSchema,
  listingPayloadSchema,
  orderPayloadSchema,
  professionalPayloadSchema,
  projectPayloadSchema,
  feedbackPayloadSchema,
  syncBatchSchema,
} from "@/lib/sync-validation";
import { buildListingSeo } from "@/lib/seo-listing";
import { rejectCrossSiteMutation } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const raw = await request.text();
  if(new TextEncoder().encode(raw).byteLength > 8 * 1024 * 1024)return NextResponse.json({error:"sync_batch_too_large"},{status:413});
  let body:unknown;try{body=JSON.parse(raw);}catch{body=null;}
  const parsed = syncBatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_sync_batch", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const user = await getChatGPTUser();
  const expectedOwner = request.headers.get("x-local-owner");
  if (expectedOwner !== (user?.id ?? "device-local")) {
    return NextResponse.json({ error: "local_owner_mismatch" }, { status: 409 });
  }
  const containsPrivateWrite = parsed.data.operations.some(
    (operation) => operation.entityType !== "order" && operation.entityType !== "feedback",
  );
  if (containsPrivateWrite && !user) {
    return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  }

  const db = await getDb();
  const syncedAt = new Date().toISOString();
  let publicConsentGranted = false;
  let contactComplete=false;
  if (user) {
    await db
      .insert(users)
      .values({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        createdAt: syncedAt,
        updatedAt: syncedAt,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: { email: user.email, displayName: user.displayName, updatedAt: syncedAt },
      });
    const consentRows = await db.select({ id: userConsents.id }).from(userConsents).where(and(eq(userConsents.userId, user.id), eq(userConsents.publicContentAccepted, true), eq(userConsents.policyVersion,CURRENT_POLICY_VERSION), isNull(userConsents.revokedAt))).limit(1);
    publicConsentGranted = Boolean(consentRows.length);
    const [contactRow]=await db.select({phone:users.phoneE164}).from(users).where(eq(users.id,user.id)).limit(1);
    const confirmedContact=await db.select({id:userConsents.id}).from(userConsents).where(and(eq(userConsents.userId,user.id),eq(userConsents.policyVersion,CURRENT_POLICY_VERSION),isNull(userConsents.revokedAt))).limit(1);
    contactComplete=Boolean(user.email && contactRow?.phone && confirmedContact.length);
  }

  const accepted: string[] = [];
  const rejected: Array<{ id: string; reason: string; serverRevision?:string|null }> = [];
  const revisions:Record<string,string|null>={};

  for (const operation of parsed.data.operations) {
    const ownerKey = user?.id ?? "anonymous-order";
    const hash=await operationHash(operation);
    await db.insert(syncReceipts).values({id:operation.id,ownerKey,entityType:operation.entityType,entityId:operation.entityId,operationHash:hash,receiptStatus:"pending",createdAt:syncedAt}).onConflictDoNothing();
    const [receipt]=await db.select().from(syncReceipts).where(eq(syncReceipts.id,operation.id)).limit(1);
    if(!receipt || receipt.ownerKey!==ownerKey || receipt.entityType!==operation.entityType || receipt.entityId!==operation.entityId || (receipt.operationHash && receipt.operationHash!==hash)) {
      rejected.push({id:operation.id,reason:"operation_id_reused"});continue;
    }
    if(receipt.receiptStatus==="accepted"){accepted.push(operation.id);revisions[operation.id]=receipt.serverRevision;continue;}
    let revision:string|void;
    try {
      if(operation.action!=="delete" && ["farm","professional","public-farm"].includes(operation.entityType) && !contactComplete)throw new Error("account_contact_required");
      if (["public-farm","social-post","social-comment","social-reaction"].includes(operation.entityType)) {
        if(!user)throw new Error("authentication_required");
        if(operation.action!=="delete"&&!publicConsentGranted)throw new Error("public_content_consent_required");
        revision=await syncNetworkOperation(operation,user.id,user.fullName||"Miembro de la comunidad",syncedAt);
      } else if (operation.entityType === "farm") {
        if (!user) throw new Error("authentication_required");
        revision=await syncFarm(operation, user.id, syncedAt);
      } else if (operation.entityType === "farm-record") {
        if (!user) throw new Error("authentication_required");
        revision=await syncFarmRecord(operation, user.id, syncedAt);
      } else if (operation.entityType === "listing") {
        if (!user) throw new Error("authentication_required");
        if (operation.action!=="delete"&&!publicConsentGranted) throw new Error("public_content_consent_required");
        revision=await syncListing(operation, user.id, syncedAt);
      } else if (operation.entityType === "professional") {
        if (!user) throw new Error("authentication_required");
        if (operation.action!=="delete"&&!publicConsentGranted) throw new Error("public_content_consent_required");
        revision=await syncProfessional(operation, user.id, syncedAt);
      } else if (operation.entityType === "project") {
        if (!user) throw new Error("authentication_required");
        if (operation.action!=="delete"&&!publicConsentGranted) throw new Error("public_content_consent_required");
        revision=await syncProject(operation, user.id, syncedAt);
      } else if (operation.entityType === "feedback") {
        revision=await syncFeedback(operation, user?.id ?? null, syncedAt);
      } else {
        revision=await syncOrder(operation, user?.id ?? null, syncedAt);
      }

      await db.update(syncReceipts).set({receiptStatus:"accepted",serverRevision:revision||null}).where(and(eq(syncReceipts.id,operation.id),eq(syncReceipts.ownerKey,ownerKey),eq(syncReceipts.operationHash,hash)));
      revisions[operation.id]=revision||null;
      accepted.push(operation.id);
    } catch (error) {
      rejected.push({
        id: operation.id,
        reason: error instanceof ZodError ? "invalid_payload" : error instanceof Error ? error.message : "sync_failed",
        ...(error instanceof RevisionConflict ? {serverRevision:error.serverRevision} : {}),
      });
    }
  }

  return NextResponse.json({ accepted, rejected, syncedAt, revisions });
}

type Operation = ReturnType<typeof syncBatchSchema.parse>["operations"][number];

async function syncFarm(operation: Operation, ownerId:string, syncedAt:string) {
 if(operation.action==="delete")return revisionWrite(farms,operation,ownerId,{}, {deleted:true,serverUpdatedAt:syncedAt,clientUpdatedAt:operation.clientUpdatedAt});
 const p=farmPayloadSchema.parse(operation.payload);
 const boundary=JSON.stringify({measurements:p.boundaryMeasurements,surveyPlan:p.surveyPlan,propertySketch:p.propertySketch,geographicReference:p.geographicReference});
 let updateBoundary:string|SQL=boundary;
 // Older prepared clients do not know these fields. Preserve them atomically in
 // the same revision-checked UPDATE; a new client sends explicit null to clear.
 if(!Object.prototype.hasOwnProperty.call(operation.payload,"propertySketch"))updateBoundary=sql`json_set(${updateBoundary}, '$.propertySketch', json_extract(${farms.boundaryJson}, '$.propertySketch'))`;
 if(!Object.prototype.hasOwnProperty.call(operation.payload,"geographicReference"))updateBoundary=sql`json_set(${updateBoundary}, '$.geographicReference', json_extract(${farms.boundaryJson}, '$.geographicReference'))`;
 const values={name:p.name,location:p.location,areaSqM:p.areaSqM??null,boundaryShape:p.boundaryShape,boundaryJson:boundary,objective:p.objective,clientUpdatedAt:operation.clientUpdatedAt,serverUpdatedAt:syncedAt,deleted:false};
 return revisionWrite(farms,operation,ownerId,values,{...values,boundaryJson:updateBoundary});
}
async function syncFarmRecord(operation:Operation,ownerId:string,syncedAt:string){
 if(operation.action==="delete")return revisionWrite(farmRecords,operation,ownerId,{}, {deleted:true,serverUpdatedAt:syncedAt,clientUpdatedAt:operation.clientUpdatedAt});
 const payload=farmRecordPayloadSchema.parse(operation.payload);const db=await getDb();
 const [farm]=await db.select().from(farms).where(and(eq(farms.id,payload.farmId),eq(farms.ownerId,ownerId),eq(farms.deleted,false))).limit(1);
 if(!farm)throw new Error("farm_not_found");
 const areaId=payload.data.areaId;
 if(payload.recordType==="area"&&!Object.prototype.hasOwnProperty.call(payload.data,"areaId")){const [old]=await db.select().from(farmRecords).where(and(eq(farmRecords.id,operation.entityId),eq(farmRecords.ownerId,ownerId),eq(farmRecords.farmId,payload.farmId))).limit(1);if(old&&parseObjectJson(old.dataJson).areaId)throw new Error("area_cannot_reference_area");}
 if(areaId){
  if(payload.recordType==="area")throw new Error("area_cannot_reference_area");
  const [area]=await db.select({id:farmRecords.id}).from(farmRecords).where(and(eq(farmRecords.id,areaId),eq(farmRecords.ownerId,ownerId),eq(farmRecords.farmId,payload.farmId),eq(farmRecords.recordType,"area"),eq(farmRecords.deleted,false))).limit(1);
  if(!area){const [old]=await db.select().from(farmRecords).where(and(eq(farmRecords.id,operation.entityId),eq(farmRecords.ownerId,ownerId),eq(farmRecords.farmId,payload.farmId))).limit(1);if(!old||parseObjectJson(old.dataJson).areaId!==areaId||(payload.data.planPlacement&&JSON.stringify(payload.data.planPlacement)!==JSON.stringify(parseObjectJson(old.dataJson).planPlacement)))throw new Error("area_not_available");}
 }
 const dataJson=JSON.stringify(payload.data);let updateData:string|SQL=dataJson;
 if(!Object.prototype.hasOwnProperty.call(payload.data,"areaId"))updateData=sql`CASE WHEN ${farmRecords.farmId} = ${payload.farmId} THEN json_set(${dataJson}, '$.areaId', json_extract(${farmRecords.dataJson}, '$.areaId')) ELSE ${dataJson} END`;
 if(!Object.prototype.hasOwnProperty.call(payload.data,"planPlacement")&&payload.recordType==="animal")updateData=sql`CASE WHEN ${farmRecords.farmId} = ${payload.farmId} THEN json_set(${updateData}, '$.planPlacement', CASE WHEN json_extract(${updateData}, '$.areaId') = json_extract(${farmRecords.dataJson}, '$.planPlacement.areaId') THEN json_extract(${farmRecords.dataJson}, '$.planPlacement') ELSE NULL END) ELSE ${updateData} END`;
 const values={farmId:payload.farmId,recordType:payload.recordType,category:payload.category,title:payload.title,dataJson,clientUpdatedAt:operation.clientUpdatedAt,serverUpdatedAt:syncedAt,deleted:false};
 return revisionWrite(farmRecords,operation,ownerId,values,{...values,dataJson:updateData});
}
async function syncListing(operation:Operation,ownerId:string,syncedAt:string){
 if(operation.action==="delete")return revisionWrite(marketplaceListings,operation,ownerId,{}, {deleted:true,serverUpdatedAt:syncedAt,clientUpdatedAt:operation.clientUpdatedAt});
 const payload=listingPayloadSchema.parse(operation.payload);const db=await getDb();
 const [existing]=await db.select().from(marketplaceListings).where(eq(marketplaceListings.id,operation.entityId)).limit(1);
 if(existing&&existing.ownerId!==ownerId)throw new Error("forbidden");
 const seo=buildListingSeo(payload);
 const imageKey=payload.imageDataUrl?await persistListingImage("listing",ownerId,operation.entityId,operation.id,payload.imageDataUrl):existing?.imageKey??null;
 const {imageDataUrl,contactProfile,...base}=payload;void imageDataUrl;
 const values={...base,...seo,contact:contactProfile?encodeListingContact(contactProfile):payload.contact,imageKey,status:"pending",clientUpdatedAt:operation.clientUpdatedAt,serverUpdatedAt:syncedAt,deleted:false};
 return revisionWrite(marketplaceListings,operation,ownerId,values,values);
}
async function syncProfessional(operation:Operation,ownerId:string,syncedAt:string){
 if(operation.action==="delete")return revisionWrite(professionals,operation,ownerId,{}, {status:"deleted",updatedAt:syncedAt});
 const payload=professionalPayloadSchema.parse(operation.payload);const db=await getDb();
 const [existing]=await db.select().from(professionals).where(eq(professionals.id,operation.entityId)).limit(1);
 if(existing&&existing.ownerId!==ownerId)throw new Error("forbidden");
 const {profileDetails,...base}=payload;let credentialNote=base.credentialNote;
 if(profileDetails){const {imageDataUrl,...details}=profileDetails;if(imageDataUrl)details.imageKey=await persistListingImage("professional",ownerId,operation.entityId,operation.id,imageDataUrl);else {const old=existing?parseObjectJson(existing.credentialNote||"{}"):{};const oldDetails=old.details && typeof old.details==="object"?old.details as Record<string,unknown>:{};if(typeof oldDetails.imageKey==="string")details.imageKey=oldDetails.imageKey;else delete details.imageKey;}credentialNote=JSON.stringify({version:1,credentialNote,details});}
 const values={...base,credentialNote,status:"pending",updatedAt:syncedAt};
 return revisionWrite(professionals,operation,ownerId,{...values,createdAt:syncedAt},values);
}
async function syncProject(operation:Operation,ownerId:string,syncedAt:string){
 if(operation.action==="delete")return revisionWrite(projectProposals,operation,ownerId,{}, {status:"deleted",updatedAt:syncedAt});
 const p=projectPayloadSchema.parse(operation.payload);
 const values={title:p.title,sector:p.sector,state:p.state,summary:p.summary,hasJson:JSON.stringify(p.has),needsJson:JSON.stringify(p.needs),impact:p.impact,requestedSupport:p.requestedSupport,contact:p.contact,status:"pending",updatedAt:syncedAt};
 return revisionWrite(projectProposals,operation,ownerId,{...values,createdAt:syncedAt},values);
}

async function syncFeedback(operation: Operation, ownerId: string | null, syncedAt: string) {
  if (operation.action === "delete") throw new Error("unsupported_operation");
  const payload = feedbackPayloadSchema.parse(operation.payload);
  const db = await getDb();
  const [existing]=await db.select().from(feedbackSubmissions).where(eq(feedbackSubmissions.id,operation.entityId)).limit(1);
  if(existing){if(existing.ownerId!==ownerId)throw new Error("forbidden");if(existing.message!==payload.message||existing.area!==payload.area||existing.role!==payload.role||(existing.contact||"")!==(payload.contact||""))throw new Error("immutable_record");return;}
  await db.insert(feedbackSubmissions).values({
    id: operation.entityId, ownerId, ...payload, contact: payload.contact || null,
    status: "new", createdAt: syncedAt, updatedAt: syncedAt,
  }).onConflictDoNothing();
}

async function syncOrder(operation: Operation, ownerId: string | null, syncedAt: string) {
  if (operation.action === "delete") throw new Error("unsupported_operation");
  const payload = orderPayloadSchema.parse(operation.payload);
  const db = await getDb();
  const [existing]=await db.select({ownerId:orderRequests.ownerId}).from(orderRequests).where(eq(orderRequests.id,operation.entityId)).limit(1);
  if(existing){if(existing.ownerId!==ownerId)throw new Error("forbidden");return;}
  await db
    .insert(orderRequests)
    .values({
      id: operation.entityId,
      ownerId,
      customerName: payload.customerName,
      email: payload.email || null,
      phone: payload.phone || null,
      itemsJson: JSON.stringify({ items: payload.items, channel: payload.channel, business: payload.business ?? null }),
      note: payload.note,
      status: "new",
      clientUpdatedAt: operation.clientUpdatedAt,
      serverUpdatedAt: syncedAt,
    })
    .onConflictDoNothing();
}

async function persistListingImage(kind:string,ownerId:string,listingId:string,operationId:string,dataUrl:string): Promise<string> {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) throw new Error("invalid_image");
  const bytes = Uint8Array.from(atob(match[2]), (character) => character.charCodeAt(0));
  if (bytes.byteLength > 2_000_000) throw new Error("image_too_large");
  const extension = match[1] === "image/jpeg" ? "jpg" : match[1].split("/")[1];
  const key = `marketplace/${kind}/${encodeURIComponent(ownerId)}/${listingId}/${operationId}/cover.${extension}`;
  const { env } = await import("cloudflare:workers");
  const bucket = (env as unknown as { BUCKET?: R2Bucket }).BUCKET;
  if (!bucket) throw new Error("storage_unavailable");
  await bucket.put(key, bytes, {
    httpMetadata: { contentType: match[1], cacheControl: "public, max-age=86400" },
  });
  return key;
}
