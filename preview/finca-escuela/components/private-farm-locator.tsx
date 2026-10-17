"use client";
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {farmReferenceAction} from "@/lib/farm-reference-action";
import {MAP_PLACE_LABEL_STYLE,readableMapLabelRules} from "@/lib/map-label-presentation";
import {clipMapPanes} from "@/lib/map-coverage-clip";
import {MapPackDownload} from "@/components/map-pack-download";
import {MAP_PACK,MAP_PACKS,NATIONAL_MAP_PACK,REGIONAL_CONTEXT,fetchMapPack,type MapPackDefinition,type SavedMapPack} from "@/lib/offline-map-pack";
import {selectCartography,type StoredCartography} from '@/lib/cartographic-selection';
import {focusSatelliteZone} from "@/lib/satellite-viewport";
import {SatelliteZoneDownload} from '@/components/satellite-zone-download';
import type {LocalSatelliteZone} from '@/lib/local-satellite-zone';
import type {ZoneBounds} from '@/lib/satellite-zone-contract';
import {SatelliteDownload} from '@/components/satellite-download';
import {SATELLITE_SAMPLE as satellitePack} from '@/lib/satellite-packs';
import {packCoversBounds,type SavedSatellitePack} from '@/lib/offline-satellite-store';
import type {Map as LeafletMap,FeatureGroup,GeoJSON} from 'leaflet';
import type {GeoJsonObject} from 'geojson';
import 'leaflet/dist/leaflet.css';
import {locateFarm,type GeographicReference} from '@/lib/farm-geography';
import type {SurveyPlan} from '@/lib/farm-geometry';

/** Same-origin context and optional fixed imagery. Private coordinates never enter external requests. */
export function PrivateFarmLocator({reference,surveyPlan,workspaceOwner,farmId,onConfigureReference,demonstration=false,imageryMode="auto",onModeChange}:{farmId?:string;onModeChange?:(mode:"map"|"satellite")=>void;imageryMode?:"map"|"satellite"|"auto";demonstration?:boolean;onConfigureReference?:()=>void;workspaceOwner?:string;reference?:GeographicReference|null;surveyPlan?:SurveyPlan}){
 const [localMode,setLocalMode]=useState<"map"|"satellite">(imageryMode==="satellite"?"satellite":"map");
 const displayMode=onModeChange?(imageryMode==="satellite"?"satellite":"map"):localMode;
 const element=useRef<HTMLDivElement>(null),map=useRef<LeafletMap|null>(null),library=useRef<typeof import('leaflet')|null>(null),country=useRef<GeoJSON|null>(null),overlay=useRef<FeatureGroup|null>(null);
 const modeIntent=useRef(displayMode);
 const regionalMap=useRef<LeafletMap|null>(null),regionalLayers=useRef<Array<ReturnType<typeof import('protomaps-leaflet').leafletLayer>>>([]);
 const [referenceNotice,setReferenceNotice]=useState(''),[zonePreview,setZonePreview]=useState(false);
 const [epoch,setEpoch]=useState(0),[status,setStatus]=useState('Preparando el mapa local…'),[interactive,setInteractive]=useState(true);
 const [satellite,setSatellite]=useState<{owner:string;saved:SavedSatellitePack}|null>(null),[coversView,setCoversView]=useState(false),[sampleFor,setSampleFor]=useState<string|null>(null),[imageVisible,setImageVisible]=useState(false),[imageError,setImageError]=useState<Blob|null>(null);
 const clipBounds=useRef<[number,number,number,number]|null>(MAP_PACK.bounds),coverageClip=useRef<ReturnType<typeof clipMapPanes>|null>(null);
 const [connectionEpoch,setConnectionEpoch]=useState(0);
 useEffect(()=>{const update=()=>setConnectionEpoch(value=>value+1);window.addEventListener('online',update);return()=>window.removeEventListener('online',update);},[]);
 const [nationalChecked,setNationalChecked]=useState<string|null>(null),[nationalLoading,setNationalLoading]=useState<{owner:string;text:string;failed?:boolean}|null>(null);
 const [cartography,setCartography]=useState<Record<string,StoredCartography|undefined>>({}),[cartographyStatus,setCartographyStatus]=useState(''),[viewBounds,setViewBounds]=useState<[number,number,number,number]|null>(null),[samplePackId,setSamplePackId]=useState(MAP_PACK.id);
 const receiveCartography=useCallback((saved:SavedMapPack|null,pack:MapPackDefinition)=>{setCartography(previous=>({...previous,[pack.id]:saved&&workspaceOwner?{owner:workspaceOwner,pack,saved,persisted:true}:undefined}));if(pack.id===NATIONAL_MAP_PACK.id)setNationalChecked(workspaceOwner??null);},[workspaceOwner]);
 const currentCartography=selectCartography(cartography,workspaceOwner,viewBounds);
 const nationalEntry=cartography[NATIONAL_MAP_PACK.id];
 const nationalNotice=nationalEntry?.owner===workspaceOwner?'':nationalLoading&&nationalLoading.owner===workspaceOwner?nationalLoading.text:'';
 useEffect(()=>{if(!workspaceOwner||nationalChecked!==workspaceOwner||nationalEntry?.owner===workspaceOwner||!navigator.onLine)return;const c=new AbortController();let disposed=false,timedOut=false;const expire=()=>{timedOut=true;c.abort();};let idle=setTimeout(expire,45000);const total=setTimeout(expire,15*60000);void fetchMapPack(c.signal,()=>{clearTimeout(idle);idle=setTimeout(expire,45000);if(!disposed&&!c.signal.aborted)setNationalLoading(previous=>previous?.owner===workspaceOwner&&previous.text==='Cargando calles y ciudades de Venezuela…'?previous:{owner:workspaceOwner,text:'Cargando calles y ciudades de Venezuela…'});},NATIONAL_MAP_PACK).then(blob=>{if(!disposed&&!c.signal.aborted){setCartography(previous=>previous[NATIONAL_MAP_PACK.id]?.owner===workspaceOwner&&previous[NATIONAL_MAP_PACK.id]?.persisted?previous:({...previous,[NATIONAL_MAP_PACK.id]:{owner:workspaceOwner,pack:NATIONAL_MAP_PACK,persisted:false,saved:{blob,sha256:NATIONAL_MAP_PACK.sha256,downloadedAt:new Date().toISOString()}}}));setNationalLoading(null);}}).catch(()=>{if(!disposed&&(!c.signal.aborted||timedOut))setNationalLoading({owner:workspaceOwner,text:'No se pudo cargar el mapa de calles. El contorno guardado sigue disponible.',failed:true});}).finally(()=>{clearTimeout(idle);clearTimeout(total);});return()=>{disposed=true;clearTimeout(idle);clearTimeout(total);c.abort();};},[workspaceOwner,nationalChecked,nationalEntry,connectionEpoch]);
 const receiveSatellite=useCallback((saved:SavedSatellitePack|null)=>setSatellite(saved&&workspaceOwner?{owner:workspaceOwner,saved}:null),[workspaceOwner]);
 const currentSatellite=satellite&&satellite.owner===workspaceOwner?satellite.saved:null;
 const [localZone,setLocalZone]=useState<{owner:string;farmId:string;zone:LocalSatelliteZone}|null>(null);
 const receiveLocalZone=useCallback((zone:LocalSatelliteZone|null)=>setLocalZone(zone&&workspaceOwner&&farmId?{owner:workspaceOwner,farmId,zone}:null),[workspaceOwner,farmId]);
 const currentLocalZone=localZone&&localZone.owner===workspaceOwner&&localZone.farmId===farmId?localZone.zone:null;
 const location=useMemo(()=>locateFarm(reference,surveyPlan),[reference,surveyPlan]);
 const nationalPoint=useMemo(()=>location.positions.length?{latitude:location.positions.reduce((n,p)=>n+p.latitude,0)/location.positions.length,longitude:location.positions.reduce((n,p)=>n+p.longitude,0)/location.positions.length}:undefined,[location]);
 const viewKey=useMemo(()=>JSON.stringify([workspaceOwner,location.positions]),[workspaceOwner,location]);
 const sampleView=sampleFor===viewKey,pilotView=sampleView&&samplePackId===MAP_PACK.id;
 const farmCovered=location.positions.length>0&&location.positions.every(p=>packCoversBounds(satellitePack,[p.longitude,p.latitude,p.longitude,p.latitude]));
 const activeRaster=useMemo(()=>currentLocalZone&&!pilotView?{blob:currentLocalZone.blob,bounds:currentLocalZone.bounds,date:currentLocalZone.scene.acquiredAt}:currentSatellite&&(pilotView||farmCovered)?{blob:currentSatellite.blob,bounds:satellitePack.bounds,date:satellitePack.acquiredAt}:null,[currentLocalZone,pilotView,currentSatellite,farmCovered]);
 const visibleSatellite=displayMode!=="map"&&!!activeRaster&&imageVisible;
 const rasterCoversView=!!activeRaster&&!!viewBounds&&packCoversBounds(activeRaster,viewBounds);
 const chooseMode=(mode:"map"|"satellite",center=false)=>{modeIntent.current=mode;if(mode==='satellite'&&center){const L=library.current,instance=map.current,raster=currentLocalZone??activeRaster;if(L&&instance&&raster){if(currentLocalZone)setSampleFor(null);const [w,s,e,n]=raster.bounds;focusSatelliteZone(instance,L.latLngBounds([[s,w],[n,e]]),true);}else setReferenceNotice('Satélite pendiente: prepara una imagen de esta zona. El mapa de calles sigue visible.');}if(onModeChange)onModeChange(mode);else setLocalMode(mode);};
 useEffect(()=>{
  let disposed=false;let resize:ResizeObserver|undefined;let clearCoverage:(()=>void)|undefined;const controller=new AbortController();
  void(async()=>{
   try{
    const L=await import('leaflet');if(disposed||!element.current)return;
    library.current=L;const instance=L.map(element.current,{center:[8,-66],zoom:5,minZoom:3,maxZoom:18,dragging:true,touchZoom:true,scrollWheelZoom:false,doubleClickZoom:false,boxZoom:false,zoomControl:true,attributionControl:true});map.current=instance;resize=new ResizeObserver(()=>{if(!disposed&&element.current&&element.current.clientWidth>0&&element.current.clientHeight>0){const center=instance.getCenter(),zoom=instance.getZoom();instance.invalidateSize({pan:false,animate:false});instance.setView(center,zoom,{animate:false});}});resize.observe(element.current);
    instance.createPane('country-context').style.zIndex='300';
    instance.createPane('regional-context-base').style.zIndex='310';instance.createPane('regional-context-labels').style.zIndex='370';instance.getPane('regional-context-base')!.style.pointerEvents='none';instance.getPane('regional-context-labels')!.style.pointerEvents='none';
    instance.createPane('satellite-image').style.zIndex='350';
    instance.createPane('cartographic-base').style.zIndex='320';instance.createPane('cartographic-labels').style.zIndex='380';
    instance.getPane('cartographic-base')!.style.pointerEvents='none';instance.getPane('cartographic-labels')!.style.pointerEvents='none';
    coverageClip.current=clipMapPanes(instance,()=>clipBounds.current,['cartographic-base','cartographic-labels']);clearCoverage=coverageClip.current;
    const updateCoverage=()=>{if(disposed)return;const b=instance.getBounds();const bounds:[number,number,number,number]=[b.getWest(),b.getSouth(),b.getEast(),b.getNorth()];setViewBounds(bounds);setCoversView(packCoversBounds(satellitePack,bounds));};instance.on('moveend',updateCoverage);updateCoverage();
    instance.attributionControl.setPrefix('Leaflet');instance.attributionControl.addAttribution('geoBoundaries / OCHA / INE · CC BY3.0 IGO; OSM · ODbL1.0');
    setEpoch(value=>value+1);
    const response=await fetch('/venezuela-states.geojson',{cache:'force-cache',signal:controller.signal});if(!response.ok)throw new Error('context_unavailable');const data=await response.json();if(disposed)return;
    country.current=L.geoJSON(data as GeoJsonObject,{pane:'country-context',style:{color:'#59704b',weight:1,fillColor:'#e1e8d5',fillOpacity:.65},interactive:false}).addTo(instance);country.current.bringToBack();
    setStatus('Contexto de límites estatales cargado desde este sitio.');
   }catch{if(!disposed)setStatus('No se pudo cargar el contexto estatal. Prepara este dispositivo con conexión; tus coordenadas privadas se conservan.');}
  })();
  return()=>{disposed=true;clearCoverage?.();resize?.disconnect();controller.abort();map.current?.remove();map.current=null;regionalMap.current=null;regionalLayers.current=[];country.current=null;overlay.current=null;library.current=null;};
 },[]);
 useEffect(()=>{const instance=map.current,L=library.current;if(!instance||!L||regionalMap.current===instance&&regionalLayers.current.length)return;const c=new AbortController(),timer=setTimeout(()=>c.abort(),180000);let disposed=false;const layers:Array<ReturnType<typeof import('protomaps-leaflet').leafletLayer>>=[];void(async()=>{try{const blob=await fetchMapPack(c.signal,()=>{},REGIONAL_CONTEXT);const [{leafletLayer,CenteredTextSymbolizer},{PMTiles,FileSource}]=await Promise.all([import('protomaps-leaflet'),import('pmtiles')]);if(disposed||c.signal.aborted)return;const source=new PMTiles(new FileSource(new File([blob],REGIONAL_CONTEXT.id+'.pmtiles'))),[w,s,e,n]=REGIONAL_CONTEXT.bounds,options={url:source,bounds:L.latLngBounds([[s,w],[n,e]]),noWrap:true,maxDataZoom:6,attribution:'© OpenStreetMap · Protomaps · ODbL',lang:'es'};const base=leafletLayer({...options,flavor:'light',pane:'regional-context-base'}),labels=leafletLayer({...options,paintRules:[],labelRules:readableMapLabelRules(base.labelRules,()=>new CenteredTextSymbolizer(MAP_PLACE_LABEL_STYLE)),pane:'regional-context-labels'});base.labelRules=[];base.clearLayout();base.addTo(instance);labels.addTo(instance);layers.push(base,labels);regionalMap.current=instance;regionalLayers.current=layers;setStatus('Mapa general de Venezuela y alrededores cargado desde este sitio.');}catch{if(!disposed)setStatus('El contexto amplio no está disponible todavía. Se conserva el mapa o contorno que ya tengas; prepara Mi Finca con conexión para guardarlo.');}finally{clearTimeout(timer);}})();return()=>{disposed=true;clearTimeout(timer);c.abort();};},[epoch,connectionEpoch]);
 useEffect(()=>{const pane=map.current?.getPane('regional-context-labels');if(pane)pane.style.visibility=currentCartography?'hidden':'';},[currentCartography,epoch]);
 useEffect(()=>{
  const L=library.current,instance=map.current;if(!L||!instance)return;
  overlay.current?.remove();const layer=L.featureGroup().addTo(instance);overlay.current=layer;
  const positions=location.positions.map(p=>[p.latitude,p.longitude] as [number,number]);
  if(location.kind==='polygon'&&positions.length>=3)L.polygon(positions,{color:'#7b452b',weight:3,fillColor:'#6b873f',fillOpacity:.4}).addTo(layer);
  for(const point of positions)L.circleMarker(point,{radius:5,color:'#3e2a19',weight:2,fillColor:'#f4dba3',fillOpacity:1}).addTo(layer);
  const [w,s,e,n]=NATIONAL_MAP_PACK.bounds;instance.fitBounds([[s,w],[n,e]],{padding:[16,16],maxZoom:6,animate:false});
  return()=>{layer.remove();};
 },[location,epoch]);
 useEffect(()=>{
  const L=library.current,instance=map.current;if(!L||!instance)return;
  if(displayMode==="map"||!activeRaster)return;
  let alive=true;const url=URL.createObjectURL(activeRaster.blob);const [w,s,e,n]=activeRaster.bounds;
  const layer=L.imageOverlay(url,[[s,w],[n,e]],{pane:'satellite-image',alt:'Imagen satelital histórica de la zona descargada',interactive:false});
  layer.on('load',()=>{if(alive){setImageVisible(true);setImageError(null);}});layer.on('error',()=>{if(alive){setImageVisible(false);setImageError(activeRaster.blob);}});layer.addTo(instance);
  return()=>{alive=false;setImageVisible(false);layer.remove();URL.revokeObjectURL(url);};
 },[activeRaster,epoch,displayMode]);
 useEffect(()=>{
  const instance=map.current,L=library.current;if(!instance||!L)return;
  if(!currentCartography)return;
  const selectedPack=currentCartography.pack;clipBounds.current=selectedPack.kind==='national'?null:selectedPack.bounds;coverageClip.current?.update();
  let disposed=false;const layers:Array<ReturnType<typeof import('protomaps-leaflet').leafletLayer>>=[];
  void(async()=>{try{
   const [{leafletLayer,CenteredTextSymbolizer},{PMTiles,FileSource}]=await Promise.all([import('protomaps-leaflet'),import('pmtiles')]);if(disposed)return;
   const source=new PMTiles(new FileSource(new File([currentCartography.saved.blob],selectedPack.id+'.pmtiles')));
   const [w,s,e,n]=selectedPack.bounds;const bounds=L.latLngBounds([[s,w],[n,e]]);
   const options={url:source,bounds,noWrap:true,maxDataZoom:selectedPack.maxZoom,attribution:'© OpenStreetMap · Protomaps · ODbL',lang:'es'};
   const base=leafletLayer({...options,flavor:'light',pane:'cartographic-base'});
   const labels=leafletLayer({...options,paintRules:[],labelRules:readableMapLabelRules(base.labelRules,()=>new CenteredTextSymbolizer(MAP_PLACE_LABEL_STYLE)),pane:'cartographic-labels'});base.labelRules=[];base.clearLayout();
   base.addTo(instance);layers.push(base);labels.addTo(instance);layers.push(labels);
   setCartographyStatus(selectedPack.kind==='national'?(currentCartography.persisted?'Contexto nacional guardado:':'Contexto nacional cargado para esta visita:')+' ciudades, vías principales y nombres disponibles. El detalle termina en nivel 10; ampliar no revela más calles.':'Mapa regional guardado: caminos, agua y nombres disponibles en la zona piloto.');
  }catch{if(!disposed)setCartographyStatus('No se pudo dibujar el mapa descargado. Tus registros y la copia local se conservan.');}})();
  return()=>{disposed=true;for(const layer of layers)layer.remove();};
 },[currentCartography,epoch]);
 useEffect(()=>{const covered=location.positions.length>0&&location.positions.every(p=>packCoversBounds(satellitePack,[p.longitude,p.latitude,p.longitude,p.latitude]));const visible=!sampleView||covered;overlay.current?.eachLayer(layer=>{if('setStyle' in layer)(layer as import('leaflet').Path).setStyle({opacity:visible?1:0,fillOpacity:visible ? .4 : 0});});},[sampleView,location,epoch]);
 const showReference=()=>{const action=farmReferenceAction(location.positions.length,Boolean(map.current&&overlay.current));if(action==='configure'){setReferenceNotice(location.message+' Completa la fuente y los valores de coordenadas para ver tu propiedad.');onConfigureReference?.();return;}if(action==='loading'){setReferenceNotice('El mapa se está preparando. Puedes revisar tus coordenadas mientras carga.');return;}setZonePreview(false);setSampleFor(null);map.current?.invalidateSize();if(location.positions.length===1){const p=location.positions[0];map.current?.setView([p.latitude,p.longitude],13,{animate:false});}else{const bounds=overlay.current?.getBounds();if(bounds?.isValid())map.current?.fitBounds(bounds,{padding:[28,28],maxZoom:16,animate:false});}setReferenceNotice(location.kind==='polygon'?'Vista centrada en el contorno registrado.':'Vista centrada en el punto registrado. Un punto no dibuja los linderos.');};
 const explorePack=(pack:MapPackDefinition)=>{const L=library.current,instance=map.current;if(!L||!instance)return;const [w,s,e,n]=pack.bounds;const bounds=L.latLngBounds([[s,w],[n,e]]);setZonePreview(false);setSamplePackId(pack.id);setSampleFor(viewKey);if(pack.kind==='national')instance.fitBounds(bounds,{padding:[12,12],animate:false});else instance.setView(bounds.getCenter(),Math.min(18,Math.ceil(instance.getBoundsZoom(bounds,true))+1),{animate:false});};
 const exploreSample=()=>explorePack(MAP_PACK);
 const previewLocalZone=(bounds:ZoneBounds,fill=false)=>{if(fill&&modeIntent.current!=="satellite")return;const L=library.current,instance=map.current;if(!L||!instance)return;setZonePreview(true);setSampleFor(null);const [w,s,e,n]=bounds;focusSatelliteZone(instance,L.latLngBounds([[s,w],[n,e]]),fill);chooseMode('satellite');setReferenceNotice('Vista del rectángulo solicitado. El contorno de tu finca se conserva por separado.');};
 useEffect(()=>{const instance=map.current;if(!instance)return;if(interactive){instance.dragging.enable();instance.touchZoom.enable();instance.doubleClickZoom.enable();}else{instance.dragging.disable();instance.touchZoom.disable();instance.doubleClickZoom.disable();}},[interactive,epoch]);
 return <section className="my-5 min-w-0 overflow-hidden rounded-3xl border border-[#4c6b3a]/20 bg-white p-3 sm:p-5" aria-label={demonstration?"Mapa geográfico de práctica":"Ubicación privada de la propiedad"}>
  <header className="mb-3 flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-display text-2xl sm:text-3xl">Venezuela y tu finca</h2><p className="mt-1 text-sm text-[#56644b]">{demonstration?"Referencia ficticia de práctica.":location.kind==='none'?"Agrega las coordenadas para señalar tu finca.":"Tu referencia guardada, sobre el mapa del país."}</p></div>{location.kind==='none'&&onConfigureReference&&<button type="button" onClick={onConfigureReference} className="min-h-11 rounded-full bg-[#365026] px-4 text-sm text-white">Ubicar mi finca</button>}</header>
  <div className="relative"><div ref={element} className="farm-locator relative z-0 isolate h-[24rem] w-full rounded-2xl bg-[#dfe9d4] sm:h-[30rem]" role="region" aria-label={demonstration?"Mapa de Venezuela con referencia ficticia":"Mapa de Venezuela con referencia privada"}/>
   <div className="absolute bottom-7 left-3 z-[450] flex max-w-[calc(100%-1.5rem)] gap-1 rounded-2xl border border-[#3e2a19]/20 bg-white/95 p-1 shadow" role="group" aria-label="Tipo de mapa">{(["map","satellite"] as const).map(mode=><button key={mode} type="button" aria-pressed={displayMode===mode} className={`min-h-11 rounded-xl px-4 text-sm font-semibold ${displayMode===mode?"bg-[#365026] text-white":"text-[#3e2a19]"}`} onClick={()=>chooseMode(mode,true)}>{mode==="map"?"Calles":"Satélite"}</button>)}</div>
   <div className="absolute right-3 top-3 z-[450] flex max-w-[calc(100%-4rem)] flex-wrap justify-end gap-2"><button type="button" onClick={showReference} className="min-h-11 rounded-full border bg-white/95 px-4 text-sm font-semibold shadow">{demonstration?"Ver referencia ficticia":"Ver mi referencia"}</button><button type="button" disabled={!epoch} onClick={()=>{setZonePreview(false);setSampleFor(null);const [w,s,e,n]=NATIONAL_MAP_PACK.bounds;map.current?.fitBounds([[s,w],[n,e]],{padding:[16,16],maxZoom:6,animate:false});}} className="min-h-11 rounded-full border bg-white/95 px-4 text-sm shadow">Venezuela</button></div>
  </div>
  {displayMode==='satellite'&&<p role="status" className="mt-2 rounded-xl bg-[#f3f6ed] p-3 text-sm font-semibold">{activeRaster?(imageError===activeRaster.blob?'No se pudo mostrar la imagen guardada. El mapa de calles sigue disponible.':imageVisible?'Satélite visible · imagen histórica de cobertura limitada.':'Cargando la imagen satelital guardada…'):'No hay una imagen satelital preparada para esta vista. Se mantiene el mapa de calles.'}</p>}
  {nationalNotice&&<p role="status" className="mt-2 text-sm">{nationalNotice}</p>}{nationalNotice&&nationalLoading?.failed&&<button type="button" className="mt-2 min-h-11 rounded-full border px-4 text-sm" onClick={()=>{setNationalLoading(null);setConnectionEpoch(value=>value+1);}}>Reintentar mapa de calles</button>}
  {referenceNotice&&<p role="status" className="mt-2 text-sm">{referenceNotice}</p>}
  {zonePreview&&<p className="mt-2 text-xs">Rectángulo de la imagen solicitada; el contorno de la finca se conserva por separado.</p>}
  {sampleView&&<p className="mt-2 text-sm">{pilotView?"Zona pública de muestra · no es tu finca":"Contexto general del país; no es una imagen satelital."}</p>}
  {displayMode==='satellite'&&<p role="status" className="mt-3 rounded-xl bg-[#f3f6ed] p-3 text-sm leading-6">{visibleSatellite?`Imagen del ${new Date(activeRaster!.date).toLocaleDateString('es-VE')}. Resolución de origen:10m. ${rasterCoversView?'':'La imagen cubre solo su rectángulo; el resto conserva el mapa.'}`:currentLocalZone?'Usa Ver zona guardada para centrar la imagen local.':'Prepara una imagen de la zona de tu finca abajo. Se requiere tu consentimiento antes de consultar al proveedor.'}</p>}
  {workspaceOwner&&farmId&&<div hidden={displayMode==='map'}><SatelliteZoneDownload key={workspaceOwner+farmId} owner={workspaceOwner} farmId={farmId} demonstration={demonstration} point={demonstration?{longitude:-68.35,latitude:9.45}:nationalPoint} onAvailable={receiveLocalZone} onPreview={previewLocalZone}/></div>}
  <details className="mt-3 rounded-xl border border-[#4c6b3a]/20 p-3"><summary className="min-h-11 cursor-pointer text-sm font-semibold">¿Sin internet? Guardar mapas en este dispositivo</summary><p className="mt-2 text-sm">El contexto general se incluye al preparar Mi Finca. Puedes guardar además el mapa nacional con mayor detalle. Tus registros se conservan por separado.</p>{workspaceOwner&&MAP_PACKS.map(pack=><MapPackDownload key={workspaceOwner+pack.id} owner={workspaceOwner} pack={pack} coversView={viewBounds?packCoversBounds(pack,viewBounds):false} onExplore={()=>explorePack(pack)} onAvailable={receiveCartography}/>)}{workspaceOwner&&<details className="mt-3 rounded-xl border p-3"><summary className="min-h-11 cursor-pointer text-sm">Imagen de muestra pública</summary><SatelliteDownload key={workspaceOwner} owner={workspaceOwner} coversView={coversView} onExplore={exploreSample} onAvailable={receiveSatellite}/></details>}</details>
  <details className="mt-3 rounded-xl border border-[#4c6b3a]/15 p-3"><summary className="min-h-11 cursor-pointer text-sm">Referencia, cobertura y fuentes</summary><p className="text-sm leading-6">{demonstration?"Coordenadas simuladas: no identifican una finca real.":location.message} El contexto nacional y sus mosaicos vecinos muestran ciudades y vías principales hasta nivel 10; no incluye todas las calles. La imagen Sentinel tiene 10 m de resolución, fecha histórica y puede contener nubes; no certifica linderos. Solo al aceptar la consulta se envía el rectángulo al proveedor. No se usa GPS en vivo.</p><dl className="mt-3 grid min-w-0 grid-cols-2 gap-3 text-sm sm:grid-cols-4" aria-label="Localización registrada">{([["Estado",surveyPlan?.state],["Municipio",surveyPlan?.municipality],["Parroquia",surveyPlan?.parish],["Sector",surveyPlan?.sector]] as const).map(([label,value])=><div key={label} className="min-w-0"><dt className="font-semibold">{label}</dt><dd className="break-words">{value||"Sin registrar"}</dd></div>)}</dl><p className="mt-3 text-xs">Los nombres registrados no se deducen del punto ni acreditan límites. La referencia administrativa contiene 335 municipios y 1134 parroquias. La representación territorial conserva información de áreas en disputa; no sustituye datos catastrales.</p>{cartographyStatus&&currentCartography&&<p className="mt-2 text-xs">{cartographyStatus} Fuente: OpenStreetMap/Protomaps, 7 de octubre de 2026.</p>}<p className="mt-2 text-xs">{status}</p><button type="button" className="mt-2 min-h-11 rounded-full border px-4 text-sm" onClick={()=>setInteractive(!interactive)}>{interactive?'Fijar mapa para desplazar la página':'Mover y ampliar el mapa'}</button></details>
 </section>;
}
