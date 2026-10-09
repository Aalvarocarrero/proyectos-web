'use client';
import {useEffect} from 'react';
import {shouldUseOfflineDocumentNavigation} from '@/lib/offline-document-navigation';
/** Document navigation keeps offline fallback reliable even when navigator.onLine incorrectly remains true. Never cache RSC/private API responses. */
export function OfflineNavigation(){useEffect(()=>{const navigate=(event:MouseEvent)=>{if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;const target=event.target instanceof Element?event.target.closest('a[href]'):null;if(!(target instanceof HTMLAnchorElement)||target.target==='_blank'||target.hasAttribute('download'))return;const url=new URL(target.href,location.href);if(!shouldUseOfflineDocumentNavigation(new URL(location.href),url))return;event.preventDefault();event.stopPropagation();location.assign(url.href);};document.addEventListener('click',navigate,true);return()=>document.removeEventListener('click',navigate,true);},[]);return null;}
