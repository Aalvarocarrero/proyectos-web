import {listingMediaBelongsTo,listingMediaKeys} from "@/lib/marketplace-details";
import { companyFromRow } from "@/lib/company-db";
import { companyImageKeySchema, companyMediaKeys } from "@/lib/company";
import {isAdminIdentity} from "@/lib/admin-access";
import { eq,sql } from "drizzle-orm";
import {getDb} from "@/db";
import {companies,marketplaceListings,professionals,publicFarmProfiles} from "@/db/schema";
import {getChatGPTUser} from "@/app/chatgpt-auth";
export const dynamic="force-dynamic";
export async function GET(_request:Request,context:{params:Promise<{key:string[]}>}){
 const {key:segments}=await context.params;const key=segments.join("/");
 if((!key.startsWith("marketplace/")&&!key.startsWith("companies/"))||key.includes(".."))return new Response("Not found",{status:404});
 const db=await getDb();
 if (key.startsWith("companies/")) {
  if (!companyImageKeySchema.safeParse(key).success) return new Response("Not found", {status:404});
  const [company] = await db.select().from(companies).where(eq(companies.id, segments[1])).limit(1);
  if (!company || company.status === "deleted") return new Response("Not found", {status:404});
  try { if (!companyMediaKeys(companyFromRow(company)).includes(key)) return new Response("Not found", {status:404}); }
  catch { return new Response("Not found", {status:404}); }
  const published = company.status === "active";
  if (!published) { const user = await getChatGPTUser(); if (!user || (user.id !== company.ownerId && !isAdminIdentity(user))) return new Response("Not found", {status:404}); }
  const {env} = await import("cloudflare:workers");
  if (!env.BUCKET) return new Response("Storage unavailable", {status:503});
  const object = await env.BUCKET.get(key);
  if (!object) return new Response("Not found", {status:404});
  const headers = new Headers(); object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag); headers.set("x-content-type-options", "nosniff");
  headers.set("cache-control", published ? "public, no-cache, must-revalidate" : "private, no-store");
  return new Response(object.body, {headers});
 }
 const listingFields={id:marketplaceListings.id,ownerId:marketplaceListings.ownerId,status:marketplaceListings.status,deleted:marketplaceListings.deleted,contact:marketplaceListings.contact};
 let [listing]=await db.select(listingFields).from(marketplaceListings).where(eq(marketplaceListings.imageKey,key)).limit(1);
 if(!listing){
  const namespace=/^marketplace\/listing(?:-gallery-[0-4]|-seller)\/[^/]+\/([a-zA-Z0-9_-]+)\//.exec(key);
  if(namespace){const [candidate]=await db.select(listingFields).from(marketplaceListings).where(eq(marketplaceListings.id,namespace[1])).limit(1);if(candidate&&listingMediaBelongsTo(key,candidate.ownerId,candidate.id)&&listingMediaKeys(candidate.contact).includes(key))listing=candidate;}
 }
 // A removed listing image cannot acquire a new authority through a JSON alias in another table.
 if(!listing&&/^marketplace\/listing(?:-gallery-[0-4]|-seller)?\//.test(key))return new Response("Not found",{status:404});
 const professionalNamespace=/^marketplace\/professional\/([^/]+)\/([a-zA-Z0-9_-]+)\/[a-zA-Z0-9_-]+\/cover\.(?:webp|jpg|png)$/.exec(key);
 const [professional]=listing||!professionalNamespace?[]:await db.select({id:professionals.id,ownerId:professionals.ownerId,status:professionals.status}).from(professionals).where(eq(professionals.id,professionalNamespace[2])).limit(1);
 if(professional&&(professionalNamespace![1]!==encodeURIComponent(professional.ownerId||"")||!(await db.select({id:professionals.id}).from(professionals).where(sql`${professionals.id} = ${professional.id} AND CASE WHEN json_valid(${professionals.credentialNote}) THEN json_extract(${professionals.credentialNote}, '$.details.imageKey') END = ${key}`).limit(1)).length))return new Response("Not found",{status:404});
 const farmNamespace=/^marketplace\/public-farms\/([^/]+)\/([a-zA-Z0-9_-]+)\/[a-zA-Z0-9_-]+\/cover\.(?:webp|jpg|png)$/.exec(key);
 const [farm]=listing||professional||!farmNamespace?[]:await db.select({id:publicFarmProfiles.id,ownerId:publicFarmProfiles.ownerId,status:publicFarmProfiles.status}).from(publicFarmProfiles).where(eq(publicFarmProfiles.id,farmNamespace[2])).limit(1);
 if(farm&&(farmNamespace![1]!==encodeURIComponent(farm.ownerId||"")||!(await db.select({id:publicFarmProfiles.id}).from(publicFarmProfiles).where(sql`${publicFarmProfiles.id} = ${farm.id} AND CASE WHEN json_valid(${publicFarmProfiles.profileJson}) THEN json_extract(${publicFarmProfiles.profileJson}, '$.imageKey') END = ${key}`).limit(1)).length))return new Response("Not found",{status:404});
 const record=listing||professional||farm;
 if(!record)return new Response("Not found",{status:404});
 const published=record.status==="active"&&!("deleted" in record&&record.deleted);
 if(!published){const user=await getChatGPTUser();if(!user||(user.id!==record.ownerId&&!isAdminIdentity(user)))return new Response("Not found",{status:404});}
 const {env}=await import("cloudflare:workers");if(!env.BUCKET)return new Response("Storage unavailable",{status:503});
 const object=await env.BUCKET.get(key);if(!object)return new Response("Not found",{status:404});
 const headers=new Headers();object.writeHttpMetadata(headers);headers.set("etag",object.httpEtag);headers.set("x-content-type-options","nosniff");
 // Revalidate publication status on every fetch; a withdrawn photograph must not linger in HTTP caches.
 headers.set("cache-control",published?"public, no-cache, must-revalidate":"private, no-store");
 return new Response(object.body,{headers});
}
