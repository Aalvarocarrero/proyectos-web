"use client";

import { useEffect, useMemo, useState } from "react";

export const VENEZUELA_STATES = [
  "Amazonas",
  "Anzoátegui",
  "Apure",
  "Aragua",
  "Barinas",
  "Bolívar",
  "Carabobo",
  "Cojedes",
  "Delta Amacuro",
  "Distrito Capital",
  "Falcón",
  "Guárico",
  "La Guaira",
  "Lara",
  "Mérida",
  "Miranda",
  "Monagas",
  "Nueva Esparta",
  "Portuguesa",
  "Sucre",
  "Táchira",
  "Trujillo",
  "Yaracuy",
  "Zulia",
  "Dependencias Federales",
] as const;

type Ring = number[][];
type Geometry = { type: "Polygon"; coordinates: Ring[] } | { type: "MultiPolygon"; coordinates: Ring[][] };
type MapContext = "venezuela" | "disputed" | "guyana";
type StateFeature = { type: "Feature"; properties: { name: string; iso: string; context?: MapContext }; geometry: Geometry };
type StateCollection = { type: "FeatureCollection"; attribution: string; source: string; disputeNote?: string; features: StateFeature[] };

export function VenezuelaStateMap({
  selectedState,
  onSelect,
  compact = false,
  referencePoint,
  referenceLabel="Referencia de la finca",
}: {
  selectedState?: string;
  onSelect?: (state: string) => void;
  compact?: boolean;
  referencePoint?:{latitude:number;longitude:number};
  referenceLabel?:string;
}) {
  const [failed,setFailed]=useState(false),[reload,setReload]=useState(0);
  const [collection, setCollection] = useState<StateCollection | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/venezuela-states.geojson", { cache: "force-cache" })
      .then((response) => response.ok ? response.json() as Promise<StateCollection> : Promise.reject(new Error("map_unavailable")))
      .then((data) => { if (active) {setCollection(data);setFailed(false);} })
      .catch(() => {if(active)setFailed(true);});
    return () => { active = false; };
  }, [reload]);
  useEffect(()=>{const retry=()=>setReload(value=>value+1);window.addEventListener("online",retry);return()=>window.removeEventListener("online",retry);},[]);

  const geography = useMemo(() => collection ? buildPaths(collection.features,referencePoint) : {paths:[],point:null}, [collection,referencePoint]);
  const paths=geography.paths;
  const normalizedSelection = normalizeStateName(selectedState ?? "");

  return (
    <div className={`min-w-0 max-w-full rounded-2xl border border-[#3e2a19]/12 bg-[#f7f2e8] ${compact ? "p-3" : "p-4"}`}>
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-[.65rem] font-bold uppercase tracking-[.14em] text-[#4c6b3a]">Situación relativa nacional</p><p className="mt-1 text-xs text-[#71685f]">{selectedState ? `Estado seleccionado: ${selectedState}` : referencePoint?referenceLabel:onSelect?"Selecciona el estado de la finca":"Estado no indicado"}</p></div>
        <span className="h-3 w-3 shrink-0 rounded-sm bg-[#171512]" aria-hidden="true" />
      </div>
      {collection ? (
        <svg viewBox="0 0 270 190" className={`${compact ? "mt-2" : "mt-4"} aspect-[27/19] w-full`} role="img" aria-label={selectedState ? `Mapa de Venezuela con ${selectedState} resaltado, Guyana y la Guayana Esequiba como contexto` : "Mapa de Venezuela, Guyana y la Guayana Esequiba como contexto territorial"}>
          <defs>
            <pattern id="esequibo-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="4" height="4" fill="#e8dfd1" />
              <line x1="0" y1="0" x2="0" y2="4" stroke="#58483b" strokeWidth="1" opacity=".55" />
            </pattern>
          </defs>
          {paths.map((state) => {
            const isVenezuelanState = state.context === "venezuela";
            const selected = isVenezuelanState && normalizeStateName(state.name) === normalizedSelection;
            const fill = selected ? "#171512" : state.context === "disputed" ? "url(#esequibo-hatch)" : state.context === "guyana" ? "#ece7df" : "#dfe9d5";
            return (
              <path
                key={`${state.context}-${state.iso}-${state.name}`}
                d={state.path}
                fill={fill}
                stroke={state.context === "guyana" ? "#9a9188" : "#3e2a19"}
                strokeWidth={selected ? 1.35 : state.context === "disputed" ? .8 : .5}
                strokeDasharray={state.context === "disputed" ? "2 1.4" : undefined}
                fillRule="evenodd"
                className={onSelect && isVenezuelanState ? "cursor-pointer transition-colors hover:fill-[#b7caa2] focus:outline-none focus:[filter:drop-shadow(0_0_3px_#4c6b3a)]" : undefined}
                role={onSelect && isVenezuelanState ? "button" : undefined}
                tabIndex={onSelect && isVenezuelanState ? 0 : undefined}
                aria-label={isVenezuelanState ? (onSelect ? `Seleccionar ${state.name}` : state.name) : state.context === "disputed" ? `${state.name}, referencia de la Guayana Esequiba, territorio en disputa` : `${state.name}, Guyana`}
                onClick={() => { if (isVenezuelanState) onSelect?.(state.name); }}
                onKeyDown={(event) => {
                  if (!onSelect || !isVenezuelanState || !["Enter", " "].includes(event.key)) return;
                  event.preventDefault();
                  onSelect(state.name);
                }}
              />
            );
          })}
          {geography.point&&<g aria-label={referenceLabel}><circle cx={geography.point[0]} cy={geography.point[1]} r="4" fill="#7b452b" stroke="#fff" strokeWidth="1.5"/><title>{referenceLabel}</title></g>}
        </svg>
      ) : failed ? <div role="status" className="mt-4 rounded-xl border bg-white p-4 text-sm leading-6"><p>No se pudo abrir el mapa nacional. Si no está guardado, prepara el dispositivo con conexión.</p><button type="button" onClick={()=>setReload(value=>value+1)} className="mt-3 min-h-11 rounded-full border px-4 font-semibold">Reintentar mapa nacional</button></div> : (
        <div className={`${compact ? "mt-2" : "mt-4"} aspect-[24/19] animate-pulse rounded-xl bg-[#e9ddca]`} role="status" aria-label="Cargando mapa de Venezuela" />
      )}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[.62rem] leading-4 text-[#71685f]" aria-label="Leyenda del mapa">
        {referencePoint&&<span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#7b452b]"/>{referenceLabel}</span>}<span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-[2px] bg-[#171512]" /> Estado seleccionado</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-[2px] border border-dashed border-[#3e2a19] bg-[repeating-linear-gradient(45deg,#e8dfd1,#e8dfd1_2px,#78675a_2px,#78675a_3px)]" /> Guayana Esequiba · territorio en disputa</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-[2px] bg-[#ece7df] ring-1 ring-[#9a9188]" /> Guyana</span>
      </div>
      <p className="mt-2 text-[.62rem] leading-4 text-[#837a71]">Referencia informativa, no cartografía oficial. Límites: <a href="https://www.geoboundaries.org/" target="_blank" rel="noreferrer" className="underline underline-offset-2">geoBoundaries</a>; Venezuela CC BY 3.0 IGO y Guyana <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline underline-offset-2">OpenStreetMap</a>/ODbL 1.0. La controversia territorial continúa ante la <a href="https://www.icj-cij.org/case/171" target="_blank" rel="noreferrer" className="underline underline-offset-2">CIJ</a>.</p>
    </div>
  );
}

export function buildPaths(features: StateFeature[],referencePoint?:{latitude:number;longitude:number}) {
  const allPoints = features.flatMap((feature) => ringsFor(feature.geometry).flat());
  const minLon = Math.min(...allPoints.map((point) => point[0]));
  const maxLon = Math.max(...allPoints.map((point) => point[0]));
  const minLat = Math.min(...allPoints.map((point) => point[1]));
  const maxLat = Math.max(...allPoints.map((point) => point[1]));
  const usableWidth = 250;
  const usableHeight = 170;
  const scale = Math.min(usableWidth / Math.max(.001, maxLon - minLon), usableHeight / Math.max(.001, maxLat - minLat));
  const renderedWidth = (maxLon - minLon) * scale;
  const renderedHeight = (maxLat - minLat) * scale;
  const offsetX = (270 - renderedWidth) / 2;
  const offsetY = (190 - renderedHeight) / 2;

  const point = ([lon, lat]: number[]) => [offsetX + (lon - minLon) * scale, offsetY + (maxLat - lat) * scale];
  const paths=features.map((feature) => ({
    name: feature.properties.name,
    iso: feature.properties.iso,
    context: feature.properties.context ?? "venezuela",
    path: ringsFor(feature.geometry)
      .map((ring) => ring.map((coordinate, index) => {
        const [x, y] = point(coordinate);
        return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
      }).join(" ") + " Z")
      .join(" "),
  }));
  return {paths,point:referencePoint?point([referencePoint.longitude,referencePoint.latitude]):null};
}

function ringsFor(geometry: Geometry): Ring[] {
  return geometry.type === "Polygon" ? geometry.coordinates : geometry.coordinates.flat();
}

function normalizeStateName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^estado\s+/i, "")
    .trim()
    .toLowerCase();
}
