import { cache } from "react";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { websiteContent } from "@/db/schema";
import { HOME_DEFAULTS, parseHomeContent } from "@/lib/home-content";

export async function readHomeDocument() {
  const db = await getDb();
  const [row] = await db.select().from(websiteContent).where(eq(websiteContent.id, "home")).limit(1);
  return row ?? null;
}
// Cache only within a server render so HTML and metadata share the same publication.
// A missing table during rollout or temporary D1 failure must not take down the homepage.
export const readPublishedHome = cache(async () => {
  try { return parseHomeContent((await readHomeDocument())?.publishedJson) ?? HOME_DEFAULTS; }
  catch { return HOME_DEFAULTS; }
});
