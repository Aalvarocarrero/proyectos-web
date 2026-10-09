import {revisionWrite,type VersionedOperation} from "@/lib/revision-write";
import {and,desc,eq,inArray,sql} from 'drizzle-orm';
import {getDb} from '@/db';
import {publicFarmProfiles,communityPosts,communityComments,communityReactions} from '@/db/schema';
import {publicFarmSchema,socialPostSchema,socialCommentSchema,socialReactionSchema,type PublicFarm,type SocialPost} from '@/lib/network-profile';
export function mapPublicFarm(row:typeof publicFarmProfiles.$inferSelect):PublicFarm {
 const p=publicFarmSchema.parse(JSON.parse(row.profileJson));
 const {imageDataUrl,actingUserId,...publicData}=p;
 return {...publicData,id:row.id,status:row.status};
}
export async function networkSnapshot(viewerId?:string){
 const db=await getDb();
 const farms=await db.select().from(publicFarmProfiles).where(eq(publicFarmProfiles.status,'active')).orderBy(desc(publicFarmProfiles.updatedAt)).limit(60);
 const mine=viewerId?await db.select().from(publicFarmProfiles).where(and(eq(publicFarmProfiles.ownerId,viewerId),sql`${publicFarmProfiles.status} != 'deleted'`)).limit(50):[];
 const rows=farms.length?await db.select().from(communityPosts).where(and(eq(communityPosts.status,'active'),inArray(communityPosts.farmId,farms.map(f=>f.id)))).orderBy(desc(communityPosts.createdAt)).limit(30):[];
 const ids=rows.map(p=>p.id);
 const [comments,counts,ownLikes]=ids.length?await Promise.all([
  db.select().from(communityComments).where(and(eq(communityComments.status,'active'),inArray(communityComments.postId,ids))).orderBy(desc(communityComments.createdAt)).limit(300),
  db.select({postId:communityReactions.postId,total:sql<number>`count(*)`}).from(communityReactions).where(and(eq(communityReactions.liked,true),inArray(communityReactions.postId,ids))).groupBy(communityReactions.postId),
  viewerId?db.select({postId:communityReactions.postId}).from(communityReactions).where(and(eq(communityReactions.ownerId,viewerId),eq(communityReactions.liked,true),inArray(communityReactions.postId,ids))):Promise.resolve([])
 ]):[[],[],[]];
 const posts:SocialPost[]=rows.map(p=>({id:p.id,farmId:p.farmId,text:p.body,authorName:farms.find(f=>f.id===p.farmId)?.name||'Finca',createdAt:p.createdAt,likes:Number(counts.find(c=>c.postId===p.id)?.total||0),liked:ownLikes.some(l=>l.postId===p.id),comments:comments.filter(c=>c.postId===p.id).map(c=>({id:c.id,text:c.body,authorName:c.authorName,createdAt:c.createdAt}))}));
 return {farms:farms.map(mapPublicFarm),mine:mine.map(row=>({...mapPublicFarm(row),revision:row.revision})),posts};
}
type NetworkOperation=VersionedOperation;
export async function syncNetworkOperation(op:NetworkOperation,userId:string,authorName:string,now:string){
 if(op.action!=='delete'&&op.payload.actingUserId!==userId)throw new Error('account_changed_reopen_form');
 const db=await getDb();
 if(op.entityType==='public-farm'){
  const [existing]=await db.select().from(publicFarmProfiles).where(eq(publicFarmProfiles.id,op.entityId)).limit(1);
  if(existing&&existing.ownerId!==userId)throw new Error('forbidden');
  if(op.action==='delete')return revisionWrite(publicFarmProfiles,op,userId,{}, {status:'deleted',updatedAt:now});
  const p=publicFarmSchema.parse(op.payload);
  const {imageDataUrl,actingUserId,imageKey,...profile}=p;
  let savedKey=existing?JSON.parse(existing.profileJson).imageKey:undefined;
  if(imageDataUrl){
   const {env}=await import('cloudflare:workers');
   if(!env.BUCKET)throw new Error('image_storage_unavailable');
   const [,mime,encoded]=imageDataUrl.match(/^data:(image\/(?:webp|jpeg|png));base64,(.+)$/)||[];
   if(!encoded)throw new Error('invalid_image');
   const bytes=Uint8Array.from(atob(encoded),x=>x.charCodeAt(0));
   const ext=mime==='image/webp'?'webp':mime==='image/jpeg'?'jpg':'png';
   savedKey=`marketplace/public-farms/${encodeURIComponent(userId)}/${op.entityId}/${op.id}/cover.${ext}`;
   await env.BUCKET.put(savedKey,bytes,{httpMetadata:{contentType:mime}});
  }
  const values={name:p.name,state:p.state,profileJson:JSON.stringify({...profile,...(savedKey?{imageKey:savedKey}:{})}),status:'pending',updatedAt:now};
  return revisionWrite(publicFarmProfiles,op,userId,{...values,createdAt:now},values);
 }
 if(op.entityType==='social-post'){
  const [existing]=await db.select().from(communityPosts).where(eq(communityPosts.id,op.entityId)).limit(1);
  if(existing&&existing.ownerId!==userId)throw new Error('forbidden');
  if(op.action==='delete')return revisionWrite(communityPosts,op,userId,{}, {status:'deleted',updatedAt:now});
  const p=socialPostSchema.parse(op.payload);
  const [farm]=await db.select().from(publicFarmProfiles).where(eq(publicFarmProfiles.id,p.farmId)).limit(1);
  if(!farm||farm.ownerId!==userId||farm.status!=='active')throw new Error('published_owned_farm_required');
  const values={farmId:p.farmId,body:p.text,status:'pending',updatedAt:now};
  return revisionWrite(communityPosts,op,userId,{...values,createdAt:now},values);
 }
 if(op.entityType==='social-comment'&&op.action==='delete')return revisionWrite(communityComments,op,userId,{}, {status:'deleted',updatedAt:now});
 const p=op.entityType==='social-comment'?socialCommentSchema.parse(op.payload):socialReactionSchema.parse(op.payload);
 const [post]=await db.select().from(communityPosts).where(and(eq(communityPosts.id,p.postId),eq(communityPosts.status,'active'))).limit(1);
 if(!post)throw new Error('published_post_required');
 const [farm]=await db.select().from(publicFarmProfiles).where(and(eq(publicFarmProfiles.id,post.farmId),eq(publicFarmProfiles.status,'active'))).limit(1);
 if(!farm)throw new Error('published_farm_required');
 if('text' in p){
  const [existing]=await db.select().from(communityComments).where(eq(communityComments.id,op.entityId)).limit(1);
  if(existing&&existing.ownerId!==userId)throw new Error('forbidden');
  const values={postId:p.postId,authorName,body:p.text,status:'pending',updatedAt:now};
  return revisionWrite(communityComments,op,userId,{...values,createdAt:now},values);
 }else{
  const id=`${p.postId}:${userId}`;
  await db.insert(communityReactions).values({id,ownerId:userId,postId:p.postId,liked:op.action!=='delete'&&p.liked,updatedAt:op.clientUpdatedAt}).onConflictDoUpdate({target:communityReactions.id,set:{liked:op.action!=='delete'&&p.liked,updatedAt:op.clientUpdatedAt},setWhere:sql`${communityReactions.updatedAt} <= ${op.clientUpdatedAt}`});
 }
}
export async function getPublicFarm(id:string){
 const db=await getDb();const [row]=await db.select().from(publicFarmProfiles).where(and(eq(publicFarmProfiles.id,id),eq(publicFarmProfiles.status,'active'))).limit(1);return row?mapPublicFarm(row):undefined;
}
export async function getPublicPost(id:string,viewerId?:string){
 const db=await getDb();const [post]=await db.select().from(communityPosts).where(and(eq(communityPosts.id,id),eq(communityPosts.status,'active'))).limit(1);if(!post)return undefined;
 const farm=await getPublicFarm(post.farmId);if(!farm)return undefined;
 const [comments,count,ownLike]=await Promise.all([db.select().from(communityComments).where(and(eq(communityComments.postId,id),eq(communityComments.status,'active'))).orderBy(desc(communityComments.createdAt)).limit(100),db.select({total:sql<number>`count(*)`}).from(communityReactions).where(and(eq(communityReactions.postId,id),eq(communityReactions.liked,true))),viewerId?db.select({liked:communityReactions.liked}).from(communityReactions).where(and(eq(communityReactions.postId,id),eq(communityReactions.ownerId,viewerId))).limit(1):Promise.resolve([])]);
 return {farm,post:{id:post.id,farmId:post.farmId,text:post.body,authorName:farm.name,createdAt:post.createdAt,likes:Number(count[0]?.total||0),liked:Boolean(ownLike[0]?.liked),comments:comments.map(c=>({id:c.id,text:c.body,authorName:c.authorName,createdAt:c.createdAt}))} satisfies SocialPost};
}
