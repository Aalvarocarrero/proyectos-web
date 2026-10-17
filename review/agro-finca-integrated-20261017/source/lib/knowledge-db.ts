import { platformGuides } from "@/lib/platform-guides";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { knowledgeArticles } from "@/db/schema";
import { articles as builtInArticles, type KnowledgeArticle } from "@/lib/articles";

type Section = KnowledgeArticle["sections"][number];

function parseSections(value: string): Section[] {
  try {
    const parsed = JSON.parse(value) as Section[];
    return Array.isArray(parsed) && parsed.length ? parsed : [];
  } catch {
    return [];
  }
}

function mapRow(row: typeof knowledgeArticles.$inferSelect): KnowledgeArticle {
  return {
    slug: row.slug,
    category: row.category,
    emoji: row.emoji,
    title: row.title,
    description: row.description,
    publishedAt: row.createdAt.slice(0, 10),
    updatedAt: row.updatedAt.slice(0, 10),
    readMinutes: row.readMinutes,
    keywords: row.keywords.split(",").map((item) => item.trim()).filter(Boolean),
    sections: parseSections(row.bodyJson),
  };
}

export async function getPublishedKnowledgeArticles(): Promise<KnowledgeArticle[]> {
  const rows = await publishedRows();
  const merged = new Map([...platformGuides, ...builtInArticles].map((article) => [article.slug, article]));
  rows.forEach((row) => merged.set(row.slug, {...mapRow(row), tutorial:merged.get(row.slug)?.tutorial}));
  return [...merged.values()];
}

export async function getKnowledgeArticleBySlug(slug: string): Promise<KnowledgeArticle | undefined> {
  const original = [...platformGuides, ...builtInArticles].find(article => article.slug === slug);
  const rows = await publishedRows(slug);
  if (rows[0]) return {...mapRow(rows[0]),tutorial:original?.tutorial};
  return original;
}

async function publishedRows(slug?:string):Promise<Array<typeof knowledgeArticles.$inferSelect>> {
  try {
    const db=await getDb();
    if(slug)return await db.select().from(knowledgeArticles).where(eq(knowledgeArticles.slug,slug)).limit(1).then(rows=>rows.filter(row=>row.status==="published"));
    return await db.select().from(knowledgeArticles).where(eq(knowledgeArticles.status,"published")).orderBy(desc(knowledgeArticles.updatedAt)).limit(200);
  } catch {
    console.warn("Knowledge database unavailable; serving built-in educational content.");
    return [];
  }
}
