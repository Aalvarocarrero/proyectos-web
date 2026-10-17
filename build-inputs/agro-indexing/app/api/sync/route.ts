import { matchesStoredOrder } from "@/lib/immutable-order";
import { publicSyncError } from "@/lib/sync-error";
import { readBoundedJson, RequestBodyError } from "@/lib/request-body";
import { decodeUploadedImage } from "@/lib/uploaded-image";
import { assertAnimalLinkTarget, preserveAnimalRecordData } from "@/lib/animal-records";
import {parseObjectJson} from "@/lib/safe-json";
import { ZodError } from "zod";
import { revisionWrite, RevisionConflict, operationHash } from "@/lib/revision-write";
import { CURRENT_POLICY_VERSION } from "@/lib/policy-version";
import {syncNetworkOperation} from "@/lib/community-network-db";
import { encodeListingEnvelope, safeStoredProductDetails } from "@/lib/marketplace-details";
import { readListingContact } from "@/lib/listing-contact";
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
  let body: unknown;
  try { body = await readBoundedJson(request, 8 * 1024 * 1024); }
  catch (error) {
    const tooLarge = error instanceof RequestBodyError && error.status === 413;
    return NextResponse.json({ error: tooLarge ? "sync_batch_too_large" : error instanceof RequestBodyError && error.status === 415 ? "json_required" : "invalid_sync_batch" }, { status: error instanceof RequestBodyError ? error.status : 400 });
  }
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
    // Invalid public submissions must not create durable receipt rows. Anonymous
    // clients can otherwise grow storage even though every payload is rejected.
    if (operation.entityType === "order" || operation.entityType === "feedback") {
      if (operation.action !== "upsert") { rejected.push({id:operation.id,reason:"unsupported_operation"}); continue; }
      const validation=(operation.entityType === "order" ? orderPayloadSchema : feedbackPayloadSchema).safeParse(operation.payload);
      if (!validation.success) { rejected.push({id:operation.id,reason:"invalid_payload"}); continue; }
    }
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
        reason: error instanceof ZodError ? "invalid_payload" : publicSyncError(error),
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
 const db=await getDb();
 const [previous]=await db.select().from(farmRecords).where(eq(farmRecords.id,operation.entityId)).limit(1);
 if(previous&&previous.ownerId!==ownerId)throw new Error("forbidden");
 // Retry identity is checked by revisionWrite even when its receipt was interrupted.
 if(previous?.lastOperationId===operation.id)return revisionWrite(farmRecords,operation,ownerId,{},{});
 // The complete merge is based on this revision; revisionWrite also compares it
 // atomically when writing, so a concurrent edit cannot lose newly added details.
 if(previous&&operation.baseRevision!==previous.revision)throw new RevisionConflict(previous.revision);
 const previousPayload=previous?{farmId:previous.farmId,recordType:previous.recordType,data:parseObjectJson(previous.dataJson)}:undefined;
 const merged=preserveAnimalRecordData({farmId:operation.payload.farmId,recordType:operation.payload.recordType,data:operation.payload.data},previousPayload);
 const payload=farmRecordPayloadSchema.parse({...operation.payload,...(merged?{data:merged}:{})});
 const [farm]=await db.select().from(farms).where(and(eq(farms.id,payload.farmId),eq(farms.ownerId,ownerId),eq(farms.deleted,false))).limit(1);
 if(!farm)throw new Error("farm_not_found");
 let requireLiveAnimal=false;
 let movingLinkedAnimal=false;
 const animalId=payload.data.animalId;
 if(typeof animalId==="string"){
  if(animalId===operation.entityId)throw new Error("animal_not_available");
  const [animal]=await db.select().from(farmRecords).where(eq(farmRecords.id,animalId)).limit(1);
  const unchanged=!!previous&&!previous.deleted&&previous.farmId===payload.farmId&&previous.recordType===payload.recordType&&previousPayload?.data.animalId===animalId;
  assertAnimalLinkTarget(animal,payload.farmId,ownerId,unchanged);
  requireLiveAnimal=!unchanged;
 }
 const hasLinkedHistory=sql`EXISTS (SELECT 1 FROM farm_records AS linked_history WHERE linked_history.owner_id = ${ownerId} AND linked_history.farm_id = ${previous?.farmId??payload.farmId} AND linked_history.deleted = 0 AND linked_history.record_type IN ('weight','health','reproduction') AND json_extract(linked_history.data_json, '$.animalId') = ${operation.entityId})`;
 if(previous?.recordType==="animal"&&(payload.recordType!=="animal"||payload.farmId!==previous.farmId)){
  movingLinkedAnimal=true;
  const [linked]=await db.select({id:farmRecords.id}).from(farmRecords).where(hasLinkedHistory).limit(1);
  if(linked)throw new Error("animal_has_linked_records");
 }
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
 // These checks also execute inside the final SQLite statement. If an animal
 // moves or a new linked event arrives after preflight, NOT NULL aborts the
 // complete revision write rather than persisting an invalid relationship.
 let guardedFarmId:string|SQL=payload.farmId;
 if(requireLiveAnimal)guardedFarmId=sql`CASE WHEN EXISTS (SELECT 1 FROM farm_records AS linked_animal WHERE linked_animal.id = ${animalId} AND linked_animal.owner_id = ${ownerId} AND linked_animal.farm_id = ${payload.farmId} AND linked_animal.record_type = 'animal' AND linked_animal.deleted = 0) THEN ${payload.farmId} ELSE NULL END`;
 if(movingLinkedAnimal)guardedFarmId=sql`CASE WHEN NOT ${hasLinkedHistory} THEN ${guardedFarmId} ELSE NULL END`;
 const values={farmId:guardedFarmId,recordType:payload.recordType,category:payload.category,title:payload.title,dataJson,clientUpdatedAt:operation.clientUpdatedAt,serverUpdatedAt:syncedAt,deleted:false};
 try{return await revisionWrite(farmRecords,operation,ownerId,values,{...values,dataJson:updateData});}
 catch(error){
  const cause=error instanceof Error?error.cause:undefined;
  if((requireLiveAnimal||movingLinkedAnimal)&&cause instanceof Error&&/NOT NULL constraint failed: farm_records\.farm_id/.test(cause.message))throw new Error(movingLinkedAnimal?"animal_has_linked_records":"animal_not_available");
  throw error;
 }
}
async function syncListing(operation:Operation,ownerId:string,syncedAt:string){
 if(operation.action==="delete")return revisionWrite(marketplaceListings,operation,ownerId,{}, {deleted:true,serverUpdatedAt:syncedAt,clientUpdatedAt:operation.clientUpdatedAt});
 const payload=listingPayloadSchema.parse(operation.payload);const db=await getDb();
 const [existing]=await db.select().from(marketplaceListings).where(eq(marketplaceListings.id,operation.entityId)).limit(1);
 if(existing&&existing.ownerId!==ownerId)throw new Error("forbidden");
 // Reject known conflicts and invalid galleries before creating any upload.
 if(existing && existing.lastOperationId!==operation.id && existing.revision!==operation.baseRevision)throw new RevisionConflict(existing.revision);
 if(!existing && operation.baseRevision!=null)throw new RevisionConflict(null);
 for(const image of [payload.imageDataUrl,...(payload.additionalImageDataUrls??[]),payload.sellerImageDataUrl])if(image)decodeUploadedImage(image);
 const seo=buildListingSeo(payload);
 const imageKey=payload.imageDataUrl?await persistListingImage("listing",ownerId,operation.entityId,operation.id,payload.imageDataUrl):existing?.imageKey??null;
 const {imageDataUrl,contactProfile,productDetails,additionalImageDataUrls,sellerImageDataUrl,...base}=payload;void imageDataUrl;
 const oldDetails=safeStoredProductDetails(existing?.contact,ownerId,operation.entityId);
 const galleryKeys=additionalImageDataUrls?await Promise.all(additionalImageDataUrls.map((image,index)=>persistListingImage(`listing-gallery-${index}`,ownerId,operation.entityId,operation.id,image))):oldDetails.galleryKeys;
 const sellerImageKey=sellerImageDataUrl?await persistListingImage("listing-seller",ownerId,operation.entityId,operation.id,sellerImageDataUrl):oldDetails.sellerImageKey;
 const details={...oldDetails,...productDetails,galleryKeys,...(sellerImageKey?{sellerImageKey}:{})};
 const profile=contactProfile||readListingContact(existing?.contact)||readListingContact(payload.contact)||undefined;
 const contact=encodeListingEnvelope(profile,details,payload.contact);
 const values={...base,...seo,contact,imageKey,status:"pending",clientUpdatedAt:operation.clientUpdatedAt,serverUpdatedAt:syncedAt,deleted:false};
 return revisionWrite(marketplaceListings,operation,ownerId,values,values);
}
async function syncProfessional(operation:Operation,ownerId:string,syncedAt:string){
 if(operation.action==="delete")return revisionWrite(professionals,operation,ownerId,{}, {status:"deleted",updatedAt:syncedAt});
 const payload=professionalPayloadSchema.parse(operation.payload);const db=await getDb();
 const [existing]=await db.select().from(professionals).where(eq(professionals.id,operation.entityId)).limit(1);
 if(existing&&existing.ownerId!==ownerId)throw new Error("forbidden");
 if(existing && existing.lastOperationId!==operation.id && existing.revision!==operation.baseRevision)throw new RevisionConflict(existing.revision);
 if(!existing && operation.baseRevision!=null)throw new RevisionConflict(null);
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
  const changed=await db.insert(feedbackSubmissions).values({
    id: operation.entityId, ownerId, ...payload, contact: payload.contact || null,
    status: "new", createdAt: syncedAt, updatedAt: syncedAt,
  }).onConflictDoNothing().returning({id:feedbackSubmissions.id});
  if (!changed.length) {
    const [existing]=await db.select().from(feedbackSubmissions).where(eq(feedbackSubmissions.id,operation.entityId)).limit(1);
    if(!existing)throw new Error("sync_failed");
    if(existing.ownerId!==ownerId)throw new Error("forbidden");
    if(existing.message!==payload.message||existing.area!==payload.area||existing.role!==payload.role||(existing.contact||"")!==(payload.contact||""))throw new Error("immutable_record");
  }
}

async function syncOrder(operation: Operation, ownerId: string | null, syncedAt: string) {
  if (operation.action === "delete") throw new Error("unsupported_operation");
  const payload = orderPayloadSchema.parse(operation.payload);
  const db = await getDb();
  const changed=await db
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
    .onConflictDoNothing().returning({id:orderRequests.id});
  // Check the winning row after the insert, including concurrent submissions.
  if (!changed.length) {
    const [existing]=await db.select().from(orderRequests).where(eq(orderRequests.id,operation.entityId)).limit(1);
    if(!existing)throw new Error("sync_failed");
    if(existing.ownerId!==ownerId)throw new Error("forbidden");
    if(!matchesStoredOrder(existing,payload))throw new Error("immutable_record");
  }
}

async function persistListingImage(kind:string,ownerId:string,listingId:string,operationId:string,dataUrl:string): Promise<string> {
  const { bytes, mime, extension } = decodeUploadedImage(dataUrl);
  const key = `marketplace/${kind}/${encodeURIComponent(ownerId)}/${listingId}/${operationId}/cover.${extension}`;
  const { env } = await import("cloudflare:workers");
  const bucket = (env as unknown as { BUCKET?: R2Bucket }).BUCKET;
  if (!bucket) throw new Error("storage_unavailable");
  await bucket.put(key, bytes, {
    httpMetadata: { contentType: mime, cacheControl: "private, no-store" },
  });
  return key;
}
