import { isNotNull, ne, and, desc, eq, like, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { marketplaceListings } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("categoria")?.trim();
  const query = request.nextUrl.searchParams.get("q")?.trim();
  const conditions = [
    eq(marketplaceListings.status, "active"),
    eq(marketplaceListings.deleted, false), isNotNull(marketplaceListings.imageKey), ne(marketplaceListings.imageKey, ""),
  ];

  if (category && category !== "Todo") {
    conditions.push(eq(marketplaceListings.category, category));
  }
  if (query) {
    const match = `%${query.slice(0, 80)}%`;
    const searchCondition = or(
      like(marketplaceListings.title, match),
      like(marketplaceListings.description, match),
      like(marketplaceListings.location, match),
    );
    if (searchCondition) conditions.push(searchCondition);
  }

  const db = await getDb();
  const rows = await db
    .select()
    .from(marketplaceListings)
    .where(and(...conditions))
    .orderBy(desc(marketplaceListings.serverUpdatedAt))
    .limit(100);

  return NextResponse.json({
    listings: rows.map((listing) => ({
      ...listing,
      ownerId:undefined,lastOperationId:undefined,lastOperationHash:undefined,revision:undefined,
      imageUrl: listing.imageKey
        ? `/api/media/${listing.imageKey.split("/").map(encodeURIComponent).join("/")}`
        : null,
    })),
  });
}
