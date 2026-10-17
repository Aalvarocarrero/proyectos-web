import proj4 from 'proj4';
import type {SurveyPlan} from './farm-geometry';
import {validateSurveyVertices} from './polygon-geometry';
export type GeographicReference =
 | {version:1;source:'wgs84-point';latitude:number;longitude:number}
 | {version:1;source:'regven-utm19n-point';easting:number;northing:number}
 | {version:1;source:'regven-utm19n-survey'};
export type GeoPosition={latitude:number;longitude:number};
// EPSG:2202, operation1768: approximate REGVEN→WGS84, not a boundary accuracy guarantee.
export const REGVEN_UTM19N='+proj=utm +zone=19 +ellps=GRS80 +towgs84=0,0,0 +units=m +no_defs';
export function regven19ToGeographic(easting:number,northing:number):GeoPosition {
 if(!Number.isFinite(easting)||!Number.isFinite(northing)||easting<100000||easting>900000||northing<0||northing>10000000)throw new Error('Revisa Este y Norte en metros para el huso19N.');
 const [longitude,latitude]=proj4(REGVEN_UTM19N,'EPSG:4326',[easting,northing]);
 if(!Number.isFinite(latitude)||!Number.isFinite(longitude))throw new Error('No se pudo convertir la referencia.');
 return {latitude,longitude};
}
export function referenceFromSurveyMetadata(plan?:SurveyPlan):GeographicReference|undefined {
 const datum=(plan?.datum??"").trim().toUpperCase().replace(/[\s_-]+/g,"");
 const zone=(plan?.utmZone??"").trim().toUpperCase().replace(/\s+/g,"");
 if(datum!=="REGVEN"||!/^19N?$/.test(zone))return undefined;
 const checked=validateSurveyVertices(plan?.vertices??[]);
 return checked.ok?{version:1,source:'regven-utm19n-survey'}:undefined;
}
export function locateFarm(reference:GeographicReference|null|undefined,plan?:SurveyPlan):{positions:GeoPosition[];kind:'point'|'polygon'|'none';message:string}{
 if(!reference)return {positions:[],kind:'none',message:'Elige y confirma la fuente de coordenadas para ubicar la propiedad. El croquis por sí solo no tiene ubicación geográfica.'};
 try{
  let positions:GeoPosition[]=[];let kind:'point'|'polygon'='point';
  if(reference.source==='wgs84-point'){
   if(!Number.isFinite(reference.latitude)||!Number.isFinite(reference.longitude)||Math.abs(reference.latitude)>90||Math.abs(reference.longitude)>180)throw new Error('Revisa latitud y longitud en grados decimales.');
   positions=[{latitude:reference.latitude,longitude:reference.longitude}];
  }else if(reference.source==='regven-utm19n-point')positions=[regven19ToGeographic(reference.easting,reference.northing)];
  else{
   const check=validateSurveyVertices(plan?.vertices??[]);if(!check.ok||check.vertices.length<3)throw new Error('Completa al menos tres vértices válidos del levantamiento para ubicar el contorno.');
   positions=check.vertices.map(p=>regven19ToGeographic(p.easting,p.northing));kind='polygon';
  }
  if(positions.some(p=>p.latitude< -1||p.latitude>14||p.longitude< -74||p.longitude> -56))throw new Error('La referencia queda fuera del contexto de Venezuela incluido. Revisa el orden de ejes y el sistema; no desplazamos tus coordenadas automáticamente.');
  return {positions,kind,message:reference.source==='wgs84-point'?'Punto registrado en WGS84. Un punto no define los linderos.':'Ubicación aproximada calculada desde REGVEN / UTM19N. La precisión depende de las coordenadas originales; no certifica linderos.'};
 }catch(error){return {positions:[],kind:'none',message:error instanceof Error?error.message:'No se pudo interpretar esta referencia.'};}
}
