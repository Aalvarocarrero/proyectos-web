"use client";
import { PriceConversion } from "@/components/price-conversion";
import { ListingPrice, listingUpdateLabel } from "@/components/listing-price";

import { useDirectoryFilters } from "@/hooks/use-directory-filters";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Clock3, MapPin, Search, SlidersHorizontal, WifiOff } from "lucide-react";
import { readPublishedMarketplaceRows, marketplaceLoadMessage, marketplaceCountLabel, marketplacePreviewRows, marketplaceEmptyState } from "@/lib/marketplace-load-state";
import { matchesDirectorySearch } from "@/lib/directory-search";
import { Input } from "@/components/ui/input";
import {MarketplacePhoto} from "@/components/marketplace-photo";
import {hasListingPhoto} from "@/lib/listing-photo";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {AgroCategoryIcon} from "@/components/agro-category-icon";
import { marketplaceRootCategories, categoryMatches } from "@/lib/marketplace-categories";

import {MarketplaceDetail} from '@/components/marketplace-detail';
import {demoMarketplaceListings} from '@/lib/marketplace-demo';
import type {MarketListing as Listing} from '@/lib/marketplace-details';
import {MarketplaceSavedPanel} from '@/components/marketplace-saved-panel';
export const demoListings=demoMarketplaceListings;
export function marketplaceSource(listings:Listing[],mode:"published"|"examples"|null){return mode==="examples"||(mode===null&&listings.length===0)?demoListings:listings.filter(row=>!row.demo&&hasListingPhoto(row));}

export function MarketplaceBrowser({
  initialCategory = "Todo",
}: {
  initialCategory?: string;
}) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filters, changeFilters] = useDirectoryFilters({q:"",categoria:"Todo",contenido:""}, `?categoria=${encodeURIComponent(initialCategory)}`);
  const query=filters.q, category=filters.categoria;
  const mode=filters.contenido==="examples"?"examples":filters.contenido==="published"?"published":null;
  const setQuery=(value:string)=>changeFilters({q:value});
  const setCategory=(value:string)=>changeFilters({categoria:value});
  const setMode=(value:"published"|"examples")=>changeFilters({contenido:value});
  const searchInput = useRef<HTMLInputElement>(null);
  function clearFilters() { changeFilters({q:"",categoria:"Todo"}); searchInput.current?.focus({preventScroll:true}); }
  const [offline, setOffline] = useState(false);
  const [loadState, setLoadState] = useState<"loading"|"ready"|"error"|"offline">("loading");
  const [refreshKey, setRefreshKey] = useState(0);

  const [expandedExamples,setExpandedExamples]=useState(false);
  const [selected, setSelected] = useState<Listing | null>(null);

  useEffect(()=>{const syncSelection=()=>{const id=new URL(location.href).searchParams.get('ejemplo');setSelected(id?demoListings.find(row=>row.id===id)||null:null);};syncSelection();window.addEventListener('popstate',syncSelection);return()=>window.removeEventListener('popstate',syncSelection);},[]);
  function selectListing(row:Listing|null){setSelected(row);const url=new URL(location.href);if(row?.demo)url.searchParams.set('ejemplo',row.id);else url.searchParams.delete('ejemplo');history.replaceState(history.state,'',url);}
  useEffect(() => {
    let active = true;
    let request: AbortController | null = null;
    async function load() {
      request?.abort();
      const controller = new AbortController();
      request = controller;
      const connected = navigator.onLine;
      setOffline(!connected);
      setLoadState(connected ? "loading" : "offline");
      try {
        const cached = JSON.parse(localStorage.getItem("venezuela-agro-public-market") || "[]");
        const rows = readPublishedMarketplaceRows({listings:cached}) as Listing[];
        if (active) setListings(rows.filter(hasListingPhoto));
      } catch { /* Leave any existing valid snapshot in place. */ }
      if (!connected) return;
      try {
        const response = await fetch("/api/marketplace", {cache:"no-store", signal:controller.signal});
        if (!response.ok) throw new Error("No se pudo actualizar el mercado.");
        const rows = readPublishedMarketplaceRows(await response.json()) as Listing[];
        if (!active || controller.signal.aborted) return;
        setListings(rows);
        setLoadState("ready");
        try { localStorage.setItem("venezuela-agro-public-market",JSON.stringify(rows)); } catch { /* Browsing still works without persistent storage. */ }
      } catch {
        if (!active || controller.signal.aborted) return;
        setOffline(!navigator.onLine);
        setLoadState(navigator.onLine ? "error" : "offline");
      }
    }
    void load();
    const handleOnline = () => { void load(); };
    const handleOffline = () => { request?.abort(); setOffline(true); setLoadState("offline"); };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => { active = false; request?.abort(); window.removeEventListener("online",handleOnline); window.removeEventListener("offline",handleOffline); };
  }, [refreshKey]);

  const matching = useMemo(() => {
    const source = marketplaceSource(listings,mode);
    return source.filter((listing) => {
      const inCategory = category === "Todo" || categoryMatches(listing.category, category);
      const inQuery = matchesDirectorySearch(
        [listing.title, listing.description, listing.location, listing.category, listing.sellerName], query,
      );
      return inCategory && inQuery;
    });
  }, [category, listings, query,mode]);

  const showingExamples=mode==="examples"||(mode===null&&listings.length===0);
  const visible=marketplacePreviewRows(matching,expandedExamples);
  const hasPublications=marketplaceSource(listings,"published").length>0;
  const emptyState=marketplaceEmptyState(loadState,showingExamples,hasPublications);
  return (
    <div id="buscar-mercado" className="scroll-mt-28">
      <div className="mb-6"><p className="section-kicker">EXPLORA EL MERCADO</p><h2 className="font-display mt-2 text-3xl sm:text-4xl">¿Qué necesita tu producción?</h2><p className="mt-3 text-sm leading-6 text-[#675f57]">Busca por producto o zona y abre una ficha para revisar fotos, condiciones y contacto.</p></div>
      <div className="market-load-status mb-6" role="status" aria-live="polite"><div><p className="text-sm font-semibold">{marketplaceLoadMessage(loadState,listings.length > 0)}</p><p className="mt-1 text-xs leading-5 text-[#675f57]">Las demostraciones están separadas de las ofertas publicadas.</p></div><button type="button" className="button-light shrink-0" disabled={loadState === "loading" || offline} onClick={() => setRefreshKey(key=>key+1)}>{loadState === "loading" ? "Actualizando…" : "Actualizar ofertas"}</button></div>
      <div className="mb-5 flex flex-wrap gap-3" aria-label="Tipo de contenido del mercado"><button type="button" aria-pressed={!showingExamples} onClick={()=>setMode("published")} className={showingExamples?"button-light":"button-dark"}>Ofertas publicadas ({listings.filter(row=>!row.demo&&hasListingPhoto(row)).length})</button><button type="button" aria-pressed={showingExamples} onClick={()=>setMode("examples")} className={showingExamples?"button-dark":"button-light"}>Ejemplos por categoría</button></div>
      <MarketplaceSavedPanel rows={[...listings,...demoListings]} onSelect={selectListing}/>
      <Link href="/rubros" className="mb-4 inline-flex min-h-11 items-center text-sm font-semibold text-[#4c6b3a]">Explorar todos los rubros del agro →</Link>
      <div className="rounded-[1.6rem] border border-[#3e2a19]/10 bg-white p-4 shadow-[0_20px_60px_rgba(62,42,25,.06)]">
        <div className="flex flex-col gap-3 lg:flex-row">
          <label className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#746b62]" size={19} />
            <span className="sr-only">Buscar en Mercado Agro</span>
            <Input
              ref={searchInput}
              type="search"
              enterKeyHint="search"
              aria-describedby="market-search-help"
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
        <p id="market-search-help" className="mt-3 text-xs leading-5 text-[#675f57]">También puedes buscar por estado, municipio o anunciante, con o sin acentos.</p>
        {offline && (
          <p className="mt-3 flex items-center gap-2 rounded-xl bg-[#edf3e7] px-3 py-2 text-xs font-semibold text-[#365026]">
            <WifiOff size={15} /> {showingExamples?"Ejemplos incluidos en la aplicación; no son ofertas disponibles.":"Estás viendo publicaciones guardadas en este dispositivo."}
          </p>
        )}
      </div>

      <div role="group" aria-label="Filtrar por categoría" className="mt-5 flex flex-wrap gap-2 pb-3">
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

      <PriceConversion reference/>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><p role="status" aria-live="polite" className="text-sm text-[#675f57]">{marketplaceCountLabel(visible.length,showingExamples)}{showingExamples&&visible.length<matching.length ? ` visibles de ${matching.length}` : ""}{category!=="Todo" ? ` · ${category}` : ""}{query.trim() ? ` · búsqueda: ${query.trim()}` : ""}</p>{(query || category!=="Todo")&&<button type="button" className="min-h-11 rounded-full border border-[#d7c8b2] px-4 text-sm font-semibold" onClick={clearFilters}>Limpiar filtros</button>}</div>
      {showingExamples&&matching.length>2&&<button type="button" aria-expanded={expandedExamples} className="mt-3 min-h-11 rounded-full border border-[#d7c8b2] px-4 text-sm font-semibold" onClick={()=>setExpandedExamples(value=>!value)}>{expandedExamples?"Mostrar los dos principales":`Explorar más ejemplos (${matching.length})`}</button>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
                  <h3 className="mt-2 text-xl font-semibold leading-tight">{listing.title}</h3>
                </div>
              </div>
              <ListingPrice listing={listing} showUpdated={false}/>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#71685f]">{listing.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[#5f574f]">
                {listing.saleFormat && <span className="rounded-full bg-[#edf3e7] px-2.5 py-1">{listing.saleFormat}</span>}
                {listing.supplyUnit && <span className="rounded-full bg-[#f3ebdd] px-2.5 py-1">por {listing.supplyUnit}</span>}
                {listing.buyerType === "Solo empresas" && <span className="rounded-full bg-[#e9ddca] px-2.5 py-1">Empresarial</span>}
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#3e2a19]/8 pt-4 text-xs text-[#746b62]">
                <span className="flex items-center gap-1.5"><MapPin size={14} /> {listing.location}</span>
                <span className="flex items-center gap-1.5"><Clock3 size={14} /> {listingUpdateLabel(listing)}</span>
              </div>
              {listing.demo?<button type="button" aria-haspopup="dialog" aria-label={`Ver detalles de ${listing.title}`} onClick={()=>selectListing(listing)} className="stretched-card-action mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3e2a19]">Ver detalles →</button>:<Link href={`/marketplace/${listing.id}`} aria-label={`Ver detalles de ${listing.title}`} className="stretched-card-action mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3e2a19]">Ver detalles →</Link>}
            </div>
          </article>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="mt-10 rounded-[1.6rem] border border-dashed border-[#3e2a19]/20 bg-white/60 px-5 py-10 text-center sm:p-12">
          <p className="text-lg font-semibold">{emptyState.title}</p>
          <p className="mt-2 text-sm text-[#71685f]">{emptyState.description}</p>{(query || category!=="Todo")&&<button type="button" className="button-dark mt-5" onClick={clearFilters}>Ver todas las categorías</button>}
          {!showingExamples&&!hasPublications&&loadState!=="loading"&&<div className="mt-5 flex flex-wrap justify-center gap-3"><button type="button" onClick={()=>{setMode("examples");clearFilters();}} className="button-light">Explorar ejemplos</button><Link href="/marketplace/publicar" className="button-dark">Preparar una publicación</Link></div>}
        </div>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && selectListing(null)}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto bg-[#f8f3ea] sm:max-w-6xl">
          {selected && <><DialogHeader className="sr-only"><DialogTitle>{selected.title}</DialogTitle><DialogDescription>{selected.demo?'Anuncio ficticio para explorar las funciones del mercado.':selected.location}</DialogDescription></DialogHeader><MarketplaceDetail key={selected.id} listing={selected} rows={selected.demo?demoListings:listings} heading={false} onSelect={row=>{selectListing(row);document.querySelector('[role="dialog"]')?.scrollTo({top:0,behavior:'smooth'});}}/>{!selected.demo&&<Link href={`/marketplace/${selected.id}`} className="button-light">Ver ficha permanente</Link>}</>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
