import type { Metadata } from "next";
import { HomePageContent } from "@/components/home-page-content";
import { readPublishedHome } from "@/lib/home-content-db";
import { SITE_ORIGIN } from "@/lib/site-identity";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const content = await readPublishedHome();
  return {
    title: {absolute: content.seoTitle}, description: content.seoDescription,
    alternates: {canonical: "/"},
    openGraph: {type: "website", locale: "es_VE", siteName: "VenezuelaAgro", url: SITE_ORIGIN, title: content.seoTitle, description: content.seoDescription, images: [{url: content.heroImage, alt: content.heroImageAlt}]},
    twitter: {card: "summary_large_image", title: content.seoTitle, description: content.seoDescription, images: [content.heroImage]},
  };
}
export default async function Home() {
  return <HomePageContent content={await readPublishedHome()} />;
}
