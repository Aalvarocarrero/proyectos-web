"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Clock3, MapPin, Search, SlidersHorizontal, WifiOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import {MarketplacePhoto} from "@/components/marketplace-photo";
import {hasListingPhoto} from "@/lib/listing-photo";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ListingContactCard } from "@/components/listing-contact-card";
import examplePhotos from "@/lib/market-example-photos.json";
import examples from "@/lib/market-examples.json";
import {AgroCategoryIcon} from "@/components/agro-category-icon";
import { marketplaceRootCategories, categoryMatches } from "@/lib/marketplace-categories";

type Listing = {
  id: string;
  sellerName: string;
  title: string;
  description: string;
  category: string;
  priceCents?: number | null;
  currency?: string;
  location: string;
  imageUrl?: string | null;
  imageDataUrl?: string;
  status?: string;
  contact?: string;
  contactProfile?: unknown;
  serverUpdatedAt?: string;
  demo?: boolean;
  imageAlt?: string;
  imageCreditHref?:string;
  imageFit?:"cover"|"contain";
  state?: string;
  municipality?: string;
  saleFormat?: string;
  supplyUnit?: string;
  minimumOrder?: string;
  buyerType?: string;
};

const photoExamples=new Map(examplePhotos.map(photo=>[photo.id,photo]));
export const demoListings:Listing[]=examples.map(row=>{const photo=photoExamples.get(row.id);return {...row,imageFit:photo&&(photo.width/photo.height>1.9||photo.width/photo.height<1.1)?"contain":"cover",imageUrl:photo?.src??null,imageAlt:photo?.alt??"",imageCreditHref:photo?`/creditos-fotograficos#mercado-${row.id}`:undefined};});
export function marketplaceSource(listings:Listing[],mode:"published"|"examples"|null){return mode==="examples"||(mode===null&&listings.length===0)?demoListings:listings.filter(row=>!row.demo&&hasListingPhoto(row));}

export function MarketplaceBrowser({
  initialCategory = "Todo",
}: {
  initialCategory?: string;
}) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [query, setQuery] = useState("");
  const [mode,setMode]=useState<"published"|"examples"|null>(null);
  const [category, setCategory] = useState(initialCategory);
  const [offline, setOffline] = useState(false);

  const [selected, setSelected] = useState<Listing | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setOffline(!navigator.onLine);
      try{const cached=JSON.parse(localStorage.getItem("venezuela-agro-public-market")||"[]") as Listing[];if(active&&Array.isArray(cached))setListings(cached.filter(item=>item&&item.status==="active"&&hasListingPhoto(item)));}catch{}
      if (navigator.onLine) {
        try {
          const response = await fetch("/api/marketplace", { cache: "no-store" });
          if (response.ok) {
            const data = (await response.json()) as { listings: Listing[] };
            if (active) setListings(data.listings);
            try{localStorage.setItem("venezuela-agro-public-market",JSON.stringify(data.listings));}catch{}
          }
        } catch {
          if (active) setOffline(true);
        }
      }

    }
    void load();
    const handleOnline = () => { setOffline(false); void load(); };
    const handleOffline = () => setOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      active = false;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const visible = useMemo(() => {
    const source = marketplaceSource(listings,mode);
    const normalizedQuery = query.trim().toLocaleLowerCase("es");
    return source.filter((listing) => {
      const inCategory = category === "Todo" || categoryMatches(listing.category, category);
      const inQuery =
        !normalizedQuery ||
        [listing.title, listing.description, listing.location, listing.category]
          .join(" ")
          .toLocaleLowerCase("es")
          .includes(normalizedQuery);
      return inCategory && inQuery;
    });
  }, [category, listings, query,mode]);

  const showingExamples=mode==="examples"||(mode===null&&listings.length===0);
  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-3" aria-label="Tipo de contenido del mercado"><button type="button" aria-pressed={!showingExamples} onClick={()=>setMode("published")} className={showingExamples?"button-light":"button-dark"}>Ofertas publicadas ({listings.filter(row=>!row.demo&&hasListingPhoto(row)).length})</button><button type="button" aria-pressed={showingExamples} onClick={()=>setMode("examples")} className={showingExamples?"button-dark":"button-light"}>Ejemplos por categoría</button></div>
      <Link href="/rubros" className="mb-4 inline-flex min-h-11 items-center text-sm font-semibold text-[#4c6b3a]">Explorar todos los rubros del agro →</Link>
      <div className="rounded-[1.6rem] border border-[#3e2a19]/10 bg-white p-4 shadow-[0_20px_60px_rgba(62,42,25,.06)]">
        <div className="flex flex-col gap-3 lg:flex-row">
          <label className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#746b62]" size={19} />
            <span className="sr-only">Buscar en Mercado Agro</span>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar animales, semillas, maquinaria, fincas…"
              className="h-14 rounded-2xl border-0 bg-[#f3ebdd] pl-12 text-base shadow-none"
            />
          </label>
          <Link href="/marketplace/publicar" className="button-dark min-h-14 shrink-0">
            Publicar un producto
          </Link>
        </div>
        {offline && (
          <p className="mt-3 flex items-center gap-2 rounded-xl bg-[#edf3e7] px-3 py-2 text-xs font-semibold text-[#365026]">
            <WifiOff size={15} /> {showingExamples?"Ejemplos incluidos en la aplicación; no son ofertas disponibles.":"Estás viendo publicaciones guardadas en este dispositivo."}
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2 pb-3">
        <button
          aria-pressed={category==="Todo"}
          onClick={() => setCategory("Todo")}
          className={`min-h-11 shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${category === "Todo" ? "border-[#3e2a19] bg-[#3e2a19] text-white" : "border-[#3e2a19]/12 bg-white"}`}
        >
          <AgroCategoryIcon category="Cultivos" size={18} className="mr-1 inline-block"/> Todo
        </button>
        {marketplaceRootCategories.map((item) => (
          <button
            key={item.value}
            aria-pressed={category===item.value}
            onClick={() => setCategory(item.value)}
            className={`min-h-11 shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${category === item.value ? "border-[#3e2a19] bg-[#3e2a19] text-white" : "border-[#3e2a19]/12 bg-white"}`}
          >
            <AgroCategoryIcon category={item.value} size={18} className="mr-1 inline-block"/> {item.value}
          </button>
        ))}
      </div>

      {showingExamples && (
        <div className="mt-4 flex items-center gap-2 text-xs text-[#746b62]">
          <SlidersHorizontal size={14} />
          Vista demostrativa: estas tarjetas muestran la estructura; no son ofertas reales.
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((listing) => (
          <article key={listing.id} className="relative min-w-0 [overflow-wrap:anywhere] overflow-hidden rounded-[1.6rem] border border-[#3e2a19]/10 bg-white text-left shadow-[0_20px_60px_rgba(62,42,25,.06)] transition hover:-translate-y-1 hover:border-[#4c6b3a]/35" aria-label={`Abrir publicación: ${listing.title}`}>
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#e8dece]">
              <MarketplacePhoto fit={listing.imageFit} src={listing.imageUrl || listing.imageDataUrl} alt={listing.imageAlt || `${listing.title} en ${listing.location}`}/>
              {listing.demo && (
                <span className="absolute left-3 top-3 rounded-full bg-[#211d1a]/85 px-3 py-1 text-[.68rem] font-bold text-white backdrop-blur">
                  DEMOSTRACIÓN
                </span>
              )}
            </div>
            <div className="p-5">
              {listing.demo&&<p className="mb-3 text-xs leading-5 text-[#71685f]">Fotografía ilustrativa · oferta ficticia. {listing.imageCreditHref&&<a href={listing.imageCreditHref} className="relative z-10 underline">Fuente y licencia</a>}</p>}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-[1_1_10rem]">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-[#4c6b3a]"><AgroCategoryIcon category={listing.category} size={18}/>{listing.category}</p>
                  <h2 className="mt-2 text-xl font-semibold leading-tight">{listing.title}</h2>
                </div>
                {listing.priceCents != null && (
                  <p className="shrink-0 text-sm font-bold">
                    {listing.currency ?? "USD"} {(listing.priceCents / 100).toLocaleString("es-VE")}
                  </p>
                )}
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#71685f]">{listing.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[#5f574f]">
                {listing.saleFormat && <span className="rounded-full bg-[#edf3e7] px-2.5 py-1">{listing.saleFormat}</span>}
                {listing.supplyUnit && <span className="rounded-full bg-[#f3ebdd] px-2.5 py-1">por {listing.supplyUnit}</span>}
                {listing.buyerType === "Solo empresas" && <span className="rounded-full bg-[#e9ddca] px-2.5 py-1">Empresarial</span>}
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#3e2a19]/8 pt-4 text-xs text-[#746b62]">
                <span className="flex items-center gap-1.5"><MapPin size={14} /> {listing.location}</span>
                <span className="flex items-center gap-1.5"><Clock3 size={14} /> {listing.demo?"Datos ficticios":listing.serverUpdatedAt?new Date(listing.serverUpdatedAt).toLocaleDateString("es-VE"):"Fecha no indicada"}</span>
              </div>
              {listing.demo?<button type="button" aria-haspopup="dialog" aria-label={`Ver detalles de ${listing.title}`} onClick={()=>setSelected(listing)} className="stretched-card-action mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3e2a19]">Ver detalles →</button>:<Link href={`/marketplace/${listing.id}`} aria-label={`Ver detalles de ${listing.title}`} className="stretched-card-action mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3e2a19]">Ver detalles →</Link>}
            </div>
          </article>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="mt-10 rounded-[1.6rem] border border-dashed border-[#3e2a19]/20 p-12 text-center">
          <p className="text-lg font-semibold">No encontramos resultados.</p>
          <p className="mt-2 text-sm text-[#71685f]">Prueba otra categoría o una búsqueda más amplia.</p>
        </div>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto bg-[#f8f3ea] sm:max-w-3xl">
          {selected && <div className="grid gap-6 md:grid-cols-[.9fr_1.1fr]">
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-[#e8dece]">
              <MarketplacePhoto fit={selected.imageFit} src={selected.imageUrl || selected.imageDataUrl} alt={selected.imageAlt || selected.title}/>
              {selected.demo && <span className="absolute left-3 top-3 rounded-full bg-[#211d1a]/85 px-3 py-1 text-[.68rem] font-bold text-white">DEMOSTRACIÓN</span>}
            </div>
            <div className="min-w-0 [overflow-wrap:anywhere]">
              <DialogHeader>
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-[#4c6b3a]"><AgroCategoryIcon category={selected.category} size={18}/>{selected.category}</p>
                <DialogTitle className="font-display text-3xl leading-tight sm:text-4xl">{selected.title}</DialogTitle>
                <DialogDescription>{selected.location}</DialogDescription>
              </DialogHeader>
              {selected.priceCents != null && <p className="mt-5 text-2xl font-bold">{selected.currency ?? "USD"} {(selected.priceCents / 100).toLocaleString("es-VE")}</p>}
              <div className="mt-5 grid gap-2 rounded-xl bg-white p-4 text-sm text-[#5f574f]">
                <p><strong>Modalidad:</strong> {selected.saleFormat || "A convenir"}</p>
                <p><strong>Unidad:</strong> {selected.supplyUnit || "unidad"}{selected.minimumOrder ? ` · mínimo: ${selected.minimumOrder}` : ""}</p>
                <p><strong>Atiende:</strong> {selected.buyerType || "Personas y empresas"}</p>
              </div>
              <p className="mt-5 whitespace-pre-line text-sm leading-7 text-[#5f574f]">{selected.description}</p>
              {selected.demo&&selected.imageCreditHref&&<a href={selected.imageCreditHref} className="mt-3 inline-flex min-h-11 items-center text-xs underline">Fotografía ilustrativa · fuente y licencia</a>}
              <ListingContactCard sellerName={selected.sellerName} contact={selected.contact} contactProfile={selected.contactProfile} location={selected.location} demo={selected.demo} />
              {selected.demo ? <p className="mt-4 rounded-xl bg-[#f4e3ce] p-4 text-xs leading-5 text-[#6b4a2f]">Ejemplo visual sin vendedor ni contacto real. Las publicaciones activas mostrarán aquí los datos declarados por su anunciante.</p> : <><Link href={`/marketplace/${selected.id}`} className="button-dark mt-4">Ver ficha permanente</Link></>}
            </div>
          </div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
