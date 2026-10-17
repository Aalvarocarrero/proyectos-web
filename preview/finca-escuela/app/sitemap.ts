import { PUBLIC_INDEXING_ENABLED } from "@/lib/indexing-policy";
import { SITE_ORIGIN } from "@/lib/site-identity";
import { getDb } from "@/db";
import { professionals, publicFarmProfiles, communityPosts, marketplaceListings } from "@/db/schema";
import { eq, and, isNotNull, ne } from "drizzle-orm";
import type { MetadataRoute } from "next";
import { getPublishedKnowledgeArticles } from "@/lib/knowledge-db";

const baseUrl = SITE_ORIGIN;

export async function publicSitemapCandidates(): Promise<MetadataRoute.Sitemap> {
  const articles = await getPublishedKnowledgeArticles();
  type PublicEntry={id:string;updatedAt:string};
  let profiles:PublicEntry[]=[],publicFarms:PublicEntry[]=[],posts:PublicEntry[]=[],listings:PublicEntry[]=[];
  try {
    const db=await getDb();
    [profiles,publicFarms,posts,listings]=await Promise.all([
      db.select({id:professionals.id,updatedAt:professionals.updatedAt}).from(professionals).where(eq(professionals.status,"active")).limit(1000),
      db.select({id:publicFarmProfiles.id,updatedAt:publicFarmProfiles.updatedAt}).from(publicFarmProfiles).where(eq(publicFarmProfiles.status,"active")).limit(1000),
      db.select({id:communityPosts.id,updatedAt:communityPosts.updatedAt}).from(communityPosts).innerJoin(publicFarmProfiles,eq(communityPosts.farmId,publicFarmProfiles.id)).where(and(eq(communityPosts.status,"active"),eq(publicFarmProfiles.status,"active"))).limit(1000),
      db.select({id:marketplaceListings.id,updatedAt:marketplaceListings.serverUpdatedAt}).from(marketplaceListings).where(and(eq(marketplaceListings.status,"active"),eq(marketplaceListings.deleted,false),isNotNull(marketplaceListings.imageKey),ne(marketplaceListings.imageKey,""))).limit(1000),
    ]);
  } catch { console.warn("Public sitemap database unavailable; returning principal pages and built-in guides."); }
  const pages: MetadataRoute.Sitemap = [
    ["", 1, "weekly"],
    ["/red",0.85,"daily"],
    ["/fincas",0.9,"weekly"],
    ["/tienda", 0.9, "weekly"],
    ["/creditos-fotograficos",0.3,"yearly"],
    ["/profesionales/alvaro-carrero",0.7,"monthly"],
    ["/marketplace", 0.9, "daily"],
    ["/plataforma", 0.9, "monthly"],
    ["/aprende", 0.9, "weekly"],
    ["/rubros", 0.85, "monthly"],
    ["/guia-institucional", 0.9, "monthly"],
    ["/profesionales", 0.85, "weekly"],
    ["/empresas", 0.85, "weekly"],
    ["/proyectos", 0.85, "weekly"],
    ["/nosotros", 0.8, "monthly"],
    ["/legal/privacidad", 0.3, "yearly"],
    ["/legal/terminos", 0.3, "yearly"],
    ["/legal/comercio", 0.3, "yearly"],
  ].map(([path, priority, changeFrequency]) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: changeFrequency as "daily" | "weekly" | "monthly" | "yearly",
    priority: priority as number,
  }));

  return [
    ...pages,
    ...listings.map(p=>({url:`${baseUrl}/marketplace/${p.id}`,lastModified:new Date(p.updatedAt),changeFrequency:"weekly" as const,priority:0.7})),
    ...publicFarms.map(f=>({url:`${baseUrl}/fincas/${f.id}`,lastModified:new Date(f.updatedAt),changeFrequency:"weekly" as const,priority:0.7})),
    ...posts.map(p=>({url:`${baseUrl}/red/${p.id}`,lastModified:new Date(p.updatedAt),changeFrequency:"weekly" as const,priority:0.6})),
    ...profiles.map(profile => ({ url: `${baseUrl}/profesionales/${profile.id}`, lastModified: new Date(profile.updatedAt), changeFrequency: "monthly" as const, priority: 0.7 })),
    ...articles.map((article) => ({
      url: `${baseUrl}/aprende/${article.slug}`,
      lastModified: new Date(`${article.updatedAt}T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
  ];
}

export default async function sitemap():Promise<MetadataRoute.Sitemap>{return PUBLIC_INDEXING_ENABLED?publicSitemapCandidates():[];}
