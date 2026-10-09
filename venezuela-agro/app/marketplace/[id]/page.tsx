import { robotsPolicy } from "@/lib/indexing-policy";
import { serializeJsonLd } from "@/lib/json-ld";
import { ListingContactCard } from "@/components/listing-contact-card";
import type { Metadata } from "next";
import {MarketplacePhoto} from "@/components/marketplace-photo";
import {AgroCategoryIcon} from "@/components/agro-category-icon";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isNotNull, ne, and, eq } from "drizzle-orm";
import { ArrowLeft, Info, MapPin, ShieldCheck, Store } from "lucide-react";
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
    <main className="min-h-screen bg-[#f3ebdd]">
      <SiteHeader />
      <section className="mx-auto max-w-[1180px] px-5 pb-20 pt-32 sm:px-8 lg:px-12 lg:pt-40">
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm text-[#71685f]"><ArrowLeft size={16} /> Volver al mercado</Link>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[2rem] bg-[#e8dece]">
            <MarketplacePhoto src={imageUrl} alt={listing.imageAlt || listing.title}/>
          </div>
          <div className="min-w-0 [overflow-wrap:anywhere] lg:py-4">
            <p className="section-kicker flex items-center gap-2"><AgroCategoryIcon category={listing.category} size={20}/>{listing.category}</p>
            <h1 className="font-display mt-4 text-5xl leading-[.98] sm:text-6xl">{listing.title}</h1>
            {listing.priceCents != null && <p className="mt-6 text-2xl font-bold">{listing.currency} {(listing.priceCents / 100).toLocaleString("es-VE")}</p>}
            <div className="mt-6 rounded-2xl bg-white p-5 text-sm leading-7 text-[#5f574f]">
              <p><strong>Modalidad:</strong> {listing.saleFormat || "A convenir"}</p>
              <p><strong>Unidad de venta:</strong> {listing.supplyUnit || "unidad"}{listing.minimumOrder ? ` · pedido mínimo: ${listing.minimumOrder}` : ""}</p>
              <p><strong>Tipo de comprador:</strong> {listing.buyerType || "Personas y empresas"}</p>
            </div>
            <p className="mt-6 whitespace-pre-line text-base leading-8 text-[#5f574f]">{listing.description}</p>
            <div className="mt-7 space-y-3 border-y border-[#3e2a19]/10 py-6 text-sm">
              <p className="flex flex-wrap items-center gap-2"><Store size={17} className="text-[#4c6b3a]" /> Publicado por <strong>{listing.sellerName}</strong></p>
              <p className="flex flex-wrap items-center gap-2"><MapPin size={17} className="text-[#4c6b3a]" /> {listing.location}</p>
            </div>
            <ListingContactCard sellerName={listing.sellerName} contact={listing.contact} location={listing.location} />
          </div>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl bg-white p-5 text-sm leading-7 text-[#5f574f]"><ShieldCheck className="mt-1 shrink-0 text-[#4c6b3a]" /><p><strong>Verifica antes de negociar.</strong><br />Identidad, propiedad, sanidad, documentos, entrega y precio corresponden a las partes.</p></div>
          <div className="flex items-start gap-3 rounded-2xl bg-[#e9ddca] p-5 text-sm leading-7 text-[#5f574f]"><Info className="mt-1 shrink-0 text-[#4c6b3a]" /><p>El marketplace facilita el encuentro. Esta publicación no constituye certificación ni garantía de Parcela Los Morochos.</p></div>
        </div>
      </section>
      <PublicFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
    </main>
  );
}
