'use client';

import {ListingPrice} from '@/components/listing-price';
import Link from 'next/link';
import {ArrowRight, MapPin, Store} from 'lucide-react';
import {AgroCategoryIcon} from '@/components/agro-category-icon';
import {listingPhotos, marketplacePath, type MarketListing} from '@/lib/marketplace-details';

/** Shared by the detail dialog and permanent listing page. Keep the action in
 * a growing column's footer so variable-length copy never moves it out of line. */
export function MarketplaceRelatedCard({listing, onSelect}: {
  listing: MarketListing;
  onSelect?: (listing: MarketListing) => void;
}) {
  const photo = listingPhotos(listing)[0];
  const actionClass = 'button-light w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4c6b3a]';
  const actionLabel = `Ver anuncio: ${listing.title}`;
  const actionContent = <>Ver anuncio<ArrowRight size={17} aria-hidden="true"/></>;

  return <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#ded2c1] bg-white [overflow-wrap:anywhere]">
    <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-[#f3eee5]">
      {photo ? <img src={photo.src} alt={photo.alt} width={400} height={250} loading="lazy"
        className={`h-full w-full ${listing.imageFit === 'contain' ? 'object-contain' : 'object-cover'}`}/>
        : <div className="flex h-full flex-col items-center justify-center gap-2 text-[#71685f]">
          <AgroCategoryIcon category={listing.category} size={36}/><span className="text-xs">Sin fotografía</span>
        </div>}
      {listing.demo && <span className="absolute left-3 top-3 rounded-full bg-[#211d1a]/90 px-3 py-1 text-[10px] font-bold tracking-wider text-white">DEMO</span>}
    </div>
    <div className="flex flex-1 flex-col p-4 sm:p-5">
      <p className="text-xs font-semibold text-[#4c6b3a]">{listing.category}</p>
      <h3 className="mt-2 text-base font-semibold leading-6 text-[#211d1a]">{listing.title}</h3>
      <div className="mt-3 space-y-2 text-xs leading-5 text-[#71685f]">
        <p className="flex items-start gap-2"><Store size={15} className="mt-0.5 shrink-0" aria-hidden="true"/><span>{listing.sellerName}</span></p>
        <p className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0" aria-hidden="true"/><span>{listing.location}</span></p>
      </div>
      <ListingPrice listing={listing}/>
      <div className="mt-auto pt-5">
        {onSelect
          ? <button type="button" className={actionClass} aria-label={actionLabel} onClick={() => onSelect(listing)}>{actionContent}</button>
          : <Link href={marketplacePath(listing)} className={actionClass} aria-label={actionLabel}>{actionContent}</Link>}
      </div>
    </div>
  </article>;
}
