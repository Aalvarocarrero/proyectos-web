import { formatMoney } from '@/lib/exchange-rates';
import type { MarketListing } from '@/lib/marketplace-details';
import { QuoteConversion } from '@/components/quote-conversion';
import { PriceConversion } from '@/components/price-conversion';
export function listingUpdateLabel(listing: Pick<MarketListing,'demo'|'serverUpdatedAt'>) {
  if(listing.demo)return 'Datos ficticios';
  if(!listing.serverUpdatedAt || !Number.isFinite(Date.parse(listing.serverUpdatedAt)))return 'Fecha de actualización no indicada';
  return `Anuncio actualizado: ${new Intl.DateTimeFormat('es-VE',{timeZone:'America/Caracas',dateStyle:'short'}).format(new Date(listing.serverUpdatedAt))}`;
}
export function ListingPrice({listing,conversion=true,showUpdated=true}:{listing:MarketListing;conversion?:boolean;showUpdated?:boolean}) {
  return <div className="mt-3 min-w-0">{listing.priceCents!=null?<><p className="text-xl font-bold">{formatMoney(listing.priceCents/100,listing.currency||'USD')}<span className="ml-2 text-sm font-medium text-[#675f57]">por {listing.supplyUnit||'unidad'}</span></p>{conversion&&<PriceConversion amount={listing.priceCents/100} currency={listing.currency||'USD'} unit={listing.supplyUnit||'unidad'} showBasePrices/>}</>:<><p className="text-sm font-semibold text-[#4c6b3a]">Precio y disponibilidad por consultar</p>{conversion&&<QuoteConversion context={listing.title} demo={listing.demo}/>}</>}{showUpdated&&<p className="mt-2 text-xs leading-5 text-[#71685f]">{listingUpdateLabel(listing)}{listing.priceCents!=null&&!listing.demo?' · Precio declarado por el vendedor.':''}</p>}</div>;
}
