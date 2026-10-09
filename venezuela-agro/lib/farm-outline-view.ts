import {normalizeSurveyPolygon,type SurveyVertex} from './farm-geometry';
import {validateNormalizedSketchPolygon,validateSurveyVertices,type NormalizedSketchPolygon} from './polygon-geometry';
export function propertyOutlinePoints(vertices:SurveyVertex[],sketch:unknown,preferSketch=false){
 const survey=validateSurveyVertices(vertices),draft=validateNormalizedSketchPolygon(sketch);
 if(!preferSketch&&survey.ok&&survey.vertices.length>=3)return {basis:'survey' as const,points:normalizeSurveyPolygon(survey.vertices,100,70,6)};
 if(draft.ok)return {basis:'sketch' as const,points:normalizeSurveyPolygon(draft.polygon.vertices.map(p=>({id:p.id,easting:p.x,northing:-p.y})),100,70,6)};
 if(survey.ok&&survey.vertices.length>=3)return {basis:'survey' as const,points:normalizeSurveyPolygon(survey.vertices,100,70,6)};
 return {basis:'reference' as const,points:normalizeSurveyPolygon([],100,70,6)};
}
export function areaOutlinePoints(outline:NormalizedSketchPolygon,layout:{x:number;y:number;width:number;height:number}){
 const scale=Math.min(layout.width,layout.height)/100;
 const x=layout.x+(layout.width-100*scale)/2,y=layout.y+(layout.height-100*scale)/2;
 return outline.vertices.map(p=>({id:p.id,x:x+p.x*scale,y:y+p.y*scale}));
}

/** Legacy backup values stay in storage; views never assume all old coordinates are numbers. */
export function formatSurveyCoordinate(value:unknown){
 if(typeof value==="number"&&Number.isFinite(value))return value.toLocaleString("es-VE",{maximumFractionDigits:3});
 if(typeof value==="string"&&value.trim()&&Number.isFinite(Number(value)))return value;
 return "Pendiente de revisión";
}
