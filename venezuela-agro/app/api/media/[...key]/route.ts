import {isAdminIdentity} from "@/lib/admin-access";
import { and,eq,sql } from "drizzle-orm";
import {getDb} from "@/db";
import {marketplaceListings,professionals,publicFarmProfiles} from "@/db/schema";
import {getChatGPTUser} from "@/app/chatgpt-auth";
export const dynamic="force-dynamic";
export async function GET(_request:Request,context:{params:Promise<{key:string[]}>}){
 const {key:segments}=await context.params;const key=segments.join("/");
 if(!key.startsWith("marketplace/")||key.includes(".."))return new Response("Not found",{status:404});
 const db=await getDb();
 const [listing]=await db.select({ownerId:marketplaceListings.ownerId,status:marketplaceListings.status,deleted:marketplaceListings.deleted}).from(marketplaceListings).where(eq(marketplaceListings.imageKey,key)).limit(1);
 const [professional]=listing?[]:await db.select({ownerId:professionals.ownerId,status:professionals.status}).from(professionals).where(sql`CASE WHEN json_valid(${professionals.credentialNote}) THEN json_extract(${professionals.credentialNote}, '$.details.imageKey') END = ${key}`).limit(1);
 const [farm]=listing||professional?[]:await db.select({ownerId:publicFarmProfiles.ownerId,status:publicFarmProfiles.status}).from(publicFarmProfiles).where(sql`CASE WHEN json_valid(${publicFarmProfiles.profileJson}) THEN json_extract(${publicFarmProfiles.profileJson}, '$.imageKey') END = ${key}`).limit(1);
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
