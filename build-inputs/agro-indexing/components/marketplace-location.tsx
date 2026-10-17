'use client';
import {useEffect,useRef,useState} from 'react';
import type {Map as LeafletMap,ImageOverlay,Path} from 'leaflet';
import type {GeoJsonObject} from 'geojson';
import 'leaflet/dist/leaflet.css';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import type {ProductDetails} from '@/lib/marketplace-details';
import {NATIONAL_MAP_PACK,MAP_PACK} from '@/lib/offline-map-pack';
import {publicMapContext} from '@/lib/public-map-context';
import {MAP_PLACE_LABEL_STYLE,readableMapLabelRules} from '@/lib/map-label-presentation';
import {SATELLITE_SAMPLE} from '@/lib/satellite-packs';
import {packCoversBounds} from '@/lib/offline-satellite-store';
import {declaredPointView} from '@/lib/marketplace-map-view';

function LocationCanvas({point,onSelect,expanded=false}:{point?:ProductDetails['publicLocation'];onSelect?:(latitude:number,longitude:number)=>void;expanded?:boolean}){
 const element=useRef<HTMLDivElement>(null),map=useRef<LeafletMap|null>(null),select=useRef(onSelect),initialPoint=useRef(point);
 const [epoch,setEpoch]=useState(0),[message,setMessage]=useState('Cargando mapa de Venezuela…'),[mode,setMode]=useState<'point'|'map'|'satellite'>('point'),[imageStatus,setImageStatus]=useState(''),[sample,setSample]=useState(false),[satelliteRequest,setSatelliteRequest]=useState(0);
 const satelliteAvailable=!!point&&packCoversBounds(SATELLITE_SAMPLE,[point.longitude,point.latitude,point.longitude,point.latitude]);
 const focusPoint=()=>{const view=declaredPointView(point);map.current?.setView(view.center,view.zoom,{animate:false});};
 const choosePoint=()=>{setSample(false);setMode('point');focusPoint();};
 const chooseStreets=()=>{setSample(false);setMode('map');focusPoint();};
 const chooseSatellite=()=>{setSatelliteRequest(v=>v+1);setSample(false);setImageStatus('Cargando imagen satelital histórica…');setMode('satellite');focusPoint();};
 useEffect(()=>{select.current=onSelect;},[onSelect]);
 useEffect(()=>{
  let disposed=false;let resize:ResizeObserver|undefined;const controller=new AbortController();
  void(async()=>{try{
   const L=await import('leaflet');if(disposed||!element.current)return;
   const p=initialPoint.current,view=declaredPointView(p),m=L.map(element.current,{scrollWheelZoom:false,minZoom:3,maxZoom:18}).setView(view.center,view.zoom);map.current=m;
   for(const [name,z] of [['market-base',300],['market-satellite',350],['market-boundaries',370],['market-labels',380]] as const){m.createPane(name).style.zIndex=String(z);if(name!=='market-boundaries')m.getPane(name)!.style.pointerEvents='none';}
   m.on('click',e=>select.current?.(Number(e.latlng.lat.toFixed(5)),Number(e.latlng.lng.toFixed(5))));
   resize=new ResizeObserver(()=>{if(!disposed)m.invalidateSize({pan:false});});resize.observe(element.current);
   m.attributionControl.addAttribution('geoBoundaries / OCHA / INE · CC BY 3.0 IGO');setEpoch(v=>v+1);
   // Geographic outlines remain independent of the base map and product marker.
   void fetch('/venezuela-states.geojson',{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error();return r.json();}).then(geo=>{if(disposed)return;L.geoJSON(geo as GeoJsonObject,{pane:'market-boundaries',style:{color:'#70825a',weight:1.2,fillColor:'#dde8c8',fillOpacity:.08},onEachFeature:(f,layer)=>{if(typeof f.properties?.name==='string'){const text=document.createElement('span');text.textContent=f.properties.name;layer.bindTooltip(text,{permanent:false,direction:'auto',className:'market-state-label'});layer.on('add',()=>{const path=(layer as Path).getElement();path?.setAttribute('tabindex','0');path?.setAttribute('aria-label',text.textContent??'Referencia territorial');path?.addEventListener('focus',()=>layer.openTooltip());path?.addEventListener('blur',()=>layer.closeTooltip());});}}}).addTo(m);}).catch(()=>{if(!disposed)setMessage('No se pudo cargar el contorno estatal. La referencia declarada se conserva.');});
   try{
    const [blob,{leafletLayer,CenteredTextSymbolizer},{PMTiles,FileSource}]=await Promise.all([publicMapContext(NATIONAL_MAP_PACK),import('protomaps-leaflet'),import('pmtiles')]);if(disposed)return;
    const addPack=(data:Blob,pack:typeof NATIONAL_MAP_PACK)=>{const [w,s,e,n]=pack.bounds;const options={url:new PMTiles(new FileSource(new File([data],pack.id+'.pmtiles'))),bounds:L.latLngBounds([[s,w],[n,e]]),noWrap:true,maxDataZoom:pack.maxZoom,attribution:'© OpenStreetMap · Protomaps · ODbL',lang:'es'};const base=leafletLayer({...options,flavor:'light',pane:'market-base'}),labels=leafletLayer({...options,paintRules:[],labelRules:readableMapLabelRules(base.labelRules,()=>new CenteredTextSymbolizer(MAP_PLACE_LABEL_STYLE)),pane:'market-labels'});base.labelRules=[];base.clearLayout();base.addTo(m);labels.addTo(m);};
    addPack(blob,NATIONAL_MAP_PACK);setMessage('Ciudades, nombres y vías principales del mapa nacional. El detalle termina en nivel 10; ampliar no añade calles ausentes.');
    if(p&&packCoversBounds(MAP_PACK,[p.longitude,p.latitude,p.longitude,p.latitude])){try{const detail=await publicMapContext(MAP_PACK);if(!disposed){addPack(detail,MAP_PACK);setMessage('Detalle de caminos y nombres hasta nivel 14 solo en la zona piloto de los Llanos; fuera de ella, contexto nacional hasta nivel 10.');}}catch{/* National context remains usable. */}}
   }catch{if(!disposed)setMessage('Calles y nombres no disponibles en esta visita. Se conserva el contorno estatal si pudo cargar y el punto declarado. Reabre el mapa con conexión.');}
  }catch{if(!disposed)setMessage('No pudimos cargar el mapa. Las coordenadas declaradas siguen disponibles debajo.');}})();
  return()=>{disposed=true;resize?.disconnect();controller.abort();map.current?.remove();map.current=null;};
 },[]);
 useEffect(()=>{let disposed=false;let clear:(()=>void)|undefined;void import('leaflet').then(L=>{const m=map.current;if(disposed||!m||!point)return;const label=document.createElement('span');label.textContent=point.label;const marker=L.circleMarker([point.latitude,point.longitude],{radius:10,color:'#fff',weight:3,fillColor:'#c9512c',fillOpacity:1}).addTo(m).bindTooltip(label);clear=()=>marker.remove();});return()=>{disposed=true;clear?.();};},[point,epoch]);
 useEffect(()=>{
  if(mode!=='satellite'||(!satelliteAvailable&&!sample))return;let disposed=false;let raster:ImageOverlay|undefined;
  void import('leaflet').then(L=>{const m=map.current;if(disposed||!m)return;const [w,s,e,n]=SATELLITE_SAMPLE.bounds;raster=L.imageOverlay(SATELLITE_SAMPLE.path,[[s,w],[n,e]],{pane:'market-satellite',alt:'Imagen histórica Sentinel de la zona pública de los Llanos',attribution:SATELLITE_SAMPLE.attribution});raster.on('load',()=>{if(!disposed)setImageStatus('Imagen histórica del 21 de enero de 2026 · 10 m de resolución. Solo cubre el rectángulo de muestra.');});raster.on('error',()=>{if(!disposed)setImageStatus('No se pudo cargar la imagen satelital. El mapa de calles permanece disponible.');});raster.addTo(m);if(sample)m.fitBounds([[s,w],[n,e]],{padding:[12,12],animate:false});else if(point)m.setView([point.latitude,point.longitude],14,{animate:false});});
  return()=>{disposed=true;raster?.remove();};
 },[mode,satelliteAvailable,sample,satelliteRequest,epoch,point]);
 return <><div ref={element} className={`relative z-0 w-full rounded-xl bg-[#e7eddf] ${expanded?'h-[65dvh] min-h-80':'h-96 sm:h-[28rem]'}`} role="region" aria-label="Mapa desplazable de la ubicación pública"/>
 <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Tipo de mapa del producto">
  {point&&<button type="button" className={mode==='point'?"button-dark":"button-light"} aria-pressed={mode==='point'} onClick={choosePoint}>Ver punto declarado</button>}
  <button type="button" className={mode==='map'?"button-dark":"button-light"} aria-pressed={mode==='map'} onClick={chooseStreets}>Calles</button>
  <button type="button" className={mode==='satellite'?"button-dark":"button-light"} aria-pressed={mode==='satellite'} onClick={chooseSatellite}>Satélite</button>
 </div>
 {mode==='satellite'&&!satelliteAvailable&&!sample&&<section className="mt-3 rounded-xl border bg-[#f3ebdd] p-4 text-sm" aria-label="Cobertura satelital">
  <p role="status">{point?'No hay imagen satelital alojada para este punto. Se conserva el punto declarado sobre el mapa.':'No hay un punto declarado para comprobar su cobertura satelital.'} La imagen disponible solo cubre una zona de muestra de unos 11 × 11 km en los Llanos.</p>
  <div className="mt-3 flex flex-wrap gap-2"><button type="button" className="button-light" onClick={()=>{setImageStatus('Cargando imagen satelital histórica…');setSample(true);}}>Ver muestra satelital de los Llanos</button><button type="button" className="button-light" onClick={point?choosePoint:chooseStreets}>{point?'Volver al punto declarado':'Volver al mapa'}</button></div>
 </section>}
 {sample&&mode==='satellite'&&<p className="mt-3 rounded-xl bg-[#f3ebdd] p-3 text-sm font-semibold">Zona pública de muestra. No representa la ubicación de este producto. Usa «Ver punto declarado» para regresar.</p>}
 <p role="status" className="mt-2 text-xs leading-5">{mode==='satellite'&&(satelliteAvailable||sample)?imageStatus:message}</p>
 <p className="mt-2 text-xs">{onSelect?'Toca el mapa para colocar el punto público. ':'El punto lo declara el anunciante. '}No es navegación vial. Cartografía de OpenStreetMap/Protomaps, 7 de octubre de 2026. Esta vista no garantiza disponibilidad sin conexión.</p>{point&&<p className="mt-2 text-xs">{point.latitude.toFixed(5)}, {point.longitude.toFixed(5)} · {point.precision==='approximate'?'Ubicación aproximada':'Punto exacto declarado'}</p>}</>;

}
export function MarketplaceLocation({point,location,demo=false,state,municipality,parish}:{point?:ProductDetails['publicLocation'];location:string;demo?:boolean;state?:string;municipality?:string;parish?:string}){const [open,setOpen]=useState(false);return <section className="mt-6 rounded-2xl border bg-white p-5"><h3 className="text-lg font-semibold">Ubicación del producto</h3><p className="my-3 text-sm leading-6">{location}</p><dl className="mb-3 grid gap-2 text-sm sm:grid-cols-3">{[['Estado',state],['Municipio',municipality],['Parroquia',parish]].map(([label,value])=><div key={label}><dt className="font-semibold">{label}</dt><dd>{value||'No declarado'}</dd></div>)}</dl><p className="mb-3 text-xs">Referencias declaradas; no se deducen del punto ni certifican límites administrativos.</p>{point?<><LocationCanvas point={point}/><button type="button" onClick={()=>setOpen(true)} className="button-light mt-3">Abrir mapa más grande</button></>:<p className="rounded-xl bg-[#f3ebdd] p-4 text-sm leading-6">El anunciante no ha indicado un punto público. Consulta la zona y acuerda la visita antes de desplazarte.</p>}{demo&&point&&<p className="mt-3 text-xs font-semibold text-[#8c4d25]">Punto ficticio para probar el mapa. No identifica una finca ni un producto disponible.</p>}<Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[94dvh] overflow-y-auto bg-[#f8f3ea] sm:max-w-5xl"><DialogTitle>Ubicación · {location}</DialogTitle><DialogDescription>{demo?'Punto ficticio de demostración.':'Solo se muestra el punto que el anunciante eligió hacer público.'}</DialogDescription><LocationCanvas point={point} expanded/></DialogContent></Dialog></section>;}
export {LocationCanvas};
