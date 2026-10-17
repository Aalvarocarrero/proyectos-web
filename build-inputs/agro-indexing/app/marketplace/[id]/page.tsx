import {DirectoryReturnLink} from "@/components/directory-return-link";
import { robotsPolicy } from "@/lib/indexing-policy";
import { serializeJsonLd } from "@/lib/json-ld";
import {MarketplaceDetail} from "@/components/marketplace-detail";
import {publicMarketplaceRow,getMarketplaceSuggestions} from "@/lib/marketplace-db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isNotNull, ne, and, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { PublicFooter } from "@/components/public-footer";
import { SiteHeader } from "@/components/site-header";
import { getDb } from "@/db";
import { marketplaceListings } from "@/db/schema";


export const dynamic = "force-dynamic";
type PageProps = { params: Promise<{ id: string }> };

async function findListing(id: string) {
  if (id.length < 3 || id.length > 160) return null;
  const db = await getDb();
  const rows = await db.select().from(marketplaceListings).where(and(
    eq(marketplaceListings.id, id),
    eq(marketplaceListings.status, "active"),
    eq(marketplaceListings.deleted, false), isNotNull(marketplaceListings.imageKey), ne(marketplaceListings.imageKey, ""),
  )).limit(1);
  return rows[0] ?? null;
}

function listingImage(key: string | null) {
  return key ? `/api/media/${key.split("/").map(encodeURIComponent).join("/")}` : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const listing = await findListing((await params).id);
  if (!listing) return { title: "Publicación no disponible" };
  const image = listingImage(listing.imageKey);
  const title = listing.seoTitle || listing.title;
  const description = listing.seoDescription || listing.description.slice(0, 160);
  return {
    title,
    description,
    alternates: { canonical: `/marketplace/${listing.id}` },
    robots: robotsPolicy(),
    openGraph: { title, description, images: image ? [{ url: image, alt: listing.imageAlt || listing.title }] : [] },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : [] },
  };
}

export default async function ListingPage({ params }: PageProps) {
  const listing = await findListing((await params).id);
  if (!listing) notFound();
  const imageUrl = listingImage(listing.imageKey);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": /servicio|profesional|asesoría|transporte/i.test(listing.category)?"Service":/finca|terreno|propiedad/i.test(listing.category)?"RealEstateListing":"Product",
    name: listing.title,
    description: listing.seoDescription || listing.description,
    category: listing.category,
    image: imageUrl || undefined,
    areaServed: { "@type": "AdministrativeArea", name: listing.state || listing.location },
    offers: listing.priceCents != null ? {
      "@type": "Offer", price: (listing.priceCents / 100).toFixed(2), priceCurrency: listing.currency,

      availableAtOrFrom: { "@type": "Place", name: listing.location },
    } : undefined,
  };

  return (
    <main className="interior-page min-h-screen bg-[#f3ebdd]">
      <SiteHeader />
      <section className="mx-auto max-w-[1180px] px-5 pb-20 pt-32 sm:px-8 lg:px-12 lg:pt-40">
        <DirectoryReturnLink href="/marketplace" className="inline-flex min-h-11 items-center gap-2 text-sm text-[#71685f]"><ArrowLeft size={16} /> Volver al mercado</DirectoryReturnLink>
        <div className="mt-10"><MarketplaceDetail listing={publicMarketplaceRow(listing)} rows={await getMarketplaceSuggestions(listing.id).catch(()=>[])}/></div>
      </section>
      <PublicFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
    </main>
  );
}
