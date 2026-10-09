import type {Map,LatLngBounds} from 'leaflet';
/** Explicit preview shows the full requested rectangle; viewing a saved image fills the viewport inside it. */
export function focusSatelliteZone(map:Map,bounds:LatLngBounds,fill=false){if(fill)map.setView(bounds.getCenter(),Math.min(18,Math.ceil(map.getBoundsZoom(bounds,true))),{animate:false});else map.fitBounds(bounds,{padding:[12,12],animate:false});}
