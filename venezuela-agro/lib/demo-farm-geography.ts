import type {FarmPayload} from './farm-types';
import type {SurveyPlan} from './farm-geometry';
import {validateNormalizedSketchPolygon} from './polygon-geometry';
/** Presentation-only synthetic coordinates. Never import or persist these in a real workspace. */
export function demoFarmSurvey(farm:FarmPayload):SurveyPlan{
 const sketch=validateNormalizedSketchPolygon(farm.propertySketch);
 const points=sketch.ok?sketch.polygon.vertices:[{id:'1',x:0,y:0},{id:'2',x:100,y:0},{id:'3',x:100,y:100},{id:'4',x:0,y:100}];
 const signed=points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p.x*q.y-q.x*p.y;},0)/2;
 const north=Number(farm.boundaryMeasurements?.northM),east=Number(farm.boundaryMeasurements?.eastM);
 const ratio=Number.isFinite(north)&&Number.isFinite(east)&&north>0&&east>0?Math.min(10,Math.max(.1,north/east)):1;
 const scale=Math.sqrt(Math.max(1,farm.areaSqM)/Math.abs(signed));
 const vertices=points.map(p=>({id:p.id,easting:580000+p.x*scale*Math.sqrt(ratio),northing:1040000-p.y*scale/Math.sqrt(ratio)}));
 return {version:1,state:'',municipality:'',parish:'',sector:'Escenario ficticio',lot:'DEMO',northBoundary:'',eastBoundary:'',southBoundary:'',westBoundary:'',datum:'REGVEN',utmZone:'19N',scaleDenominator:0,procedureType:'Demostración',applicationReference:'',fileReference:'',status:'Ficticio',inspectionDate:'',technicalResponsible:'',sourceNote:'Coordenadas simuladas para aprendizaje; no corresponden a una propiedad real.',observations:'No usar para trámites, obras o localización de fincas reales.',vertices};
}
