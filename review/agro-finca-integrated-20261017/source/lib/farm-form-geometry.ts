import {geographicReferenceSchema} from "@/lib/sync-validation";
import {calculateSurveyMetrics,type SurveyPlan,type SurveyVertex} from "@/lib/farm-geometry";
import {canonicalizeNormalizedSketchPolygon,validateSurveyVertices,type NormalizedSketchPolygon} from "@/lib/polygon-geometry";
import type {FarmPayload} from "@/lib/farm-types";
export function readSurveyDraft(json:string):SurveyVertex[]{
 let rows:unknown;try{rows=JSON.parse(json);}catch{throw new Error("Revisa: no se pudo leer la lista de coordenadas.");}
 if(!Array.isArray(rows))throw new Error("Revisa: las coordenadas deben ser una lista ordenada.");
 if(rows.every(row=>row&&row.easting===""&&row.northing===""))return [];
 const vertices=rows.map((row,index)=>{
  if(!row||!["string","number"].includes(typeof row.easting)||!["string","number"].includes(typeof row.northing)||String(row.easting).trim()===""||String(row.northing).trim()==="")throw new Error(`Revisa: completa ambas coordenadas del punto ${index+1}, o elimina esa fila.`);
  return {id:row.id,easting:Number(row.easting),northing:Number(row.northing)};
 });
 const result=validateSurveyVertices(vertices);if(!result.ok)throw new Error("Revisa: "+result.error);return result.vertices;
}

export function readFarmGeometry(form: FormData, areaUnit: string, boundaryShape: NonNullable<FarmPayload["boundaryShape"]>, previous?:FarmPayload) {
  const names = ["northM", "eastM", "southM", "westM", "baseM", "heightM", "thirdSideM", "majorDiameterM", "minorDiameterM"];
  const boundaryMeasurements = Object.fromEntries(names.map((name) => [name, form.has(name)?Number(form.get(name) || 0):previous?.boundaryMeasurements?.[name]??0]).filter(([, value]) => Number(value) > 0)) as Record<string, number>;
  const entered = form.has("area")?Number(form.get("area") || 0):(previous?.areaSqM??0)/(areaUnit==="ha"?10000:1);
  const vertices=readSurveyDraft(String(form.get("planVerticesDraftJson") || form.get("planVerticesJson") || JSON.stringify(previous?.surveyPlan?.vertices??[])));
  const coordinateArea=calculateSurveyMetrics(vertices).areaSqM;
  let areaSqM = entered > 0 ? (areaUnit === "ha" ? entered * 10_000 : entered) : coordinateArea;
  let propertySketch: NormalizedSketchPolygon | undefined;
  const sketch=form.has("propertySketchJson")?String(form.get("propertySketchJson")||""):previous?.propertySketch?JSON.stringify(previous.propertySketch):"";
  if(sketch){try{propertySketch=canonicalizeNormalizedSketchPolygon(JSON.parse(sketch));}catch(error){throw new Error("Revisa: "+(error instanceof Error?error.message:"el croquis de la propiedad."));}}
  if (!areaSqM && boundaryShape === "Rectángulo") {
    areaSqM = ((boundaryMeasurements.northM + boundaryMeasurements.southM) / 2) * ((boundaryMeasurements.eastM + boundaryMeasurements.westM) / 2);
  } else if (!areaSqM && boundaryShape === "Triángulo") {
    areaSqM = (boundaryMeasurements.baseM * boundaryMeasurements.heightM) / 2;
  } else if (!areaSqM && boundaryShape === "Óvalo") {
    areaSqM = Math.PI * (boundaryMeasurements.majorDiameterM / 2) * (boundaryMeasurements.minorDiameterM / 2);
  }
  const referenceMode=String(form.get("geographicReferenceMode")||"");
  let geographicReference=form.has("geographicReferenceMode")?undefined:previous?.geographicReference;
  if(referenceMode){
    const one=String(form.get("geographicFirst")||"").trim(),two=String(form.get("geographicSecond")||"").trim();
    if(referenceMode!=="regven-utm19n-survey"&&(!one||!two))throw new Error("Revisa: completa las dos coordenadas del punto de ubicación.");
    const raw=referenceMode==="wgs84-point"?{version:1,source:referenceMode,latitude:Number(one),longitude:Number(two)}:referenceMode==="regven-utm19n-point"?{version:1,source:referenceMode,easting:Number(one),northing:Number(two)}:{version:1,source:referenceMode};
    const checked=geographicReferenceSchema.safeParse(raw);if(!checked.success)throw new Error("Revisa: las coordenadas de ubicación no corresponden al sistema elegido.");geographicReference=checked.data;
  }
  const plan=previous?.surveyPlan;
  const fallback:Record<string,string|number|undefined>={planState:plan?.state,planMunicipality:plan?.municipality,planParish:plan?.parish,planSector:plan?.sector,planLot:plan?.lot,planNorthBoundary:plan?.northBoundary,planEastBoundary:plan?.eastBoundary,planSouthBoundary:plan?.southBoundary,planWestBoundary:plan?.westBoundary,planDatum:plan?.datum,planUtmZone:plan?.utmZone,planScale:plan?.scaleDenominator,planProcedure:plan?.procedureType,planApplication:plan?.applicationReference,planFile:plan?.fileReference,planStatus:plan?.status,planInspectionDate:plan?.inspectionDate,planTechnicalResponsible:plan?.technicalResponsible,planSource:plan?.sourceNote,planObservations:plan?.observations};
  const value = (name: string) => form.has(name)?String(form.get(name)??"").trim():String(fallback[name]??"");
  const surveyPlan: SurveyPlan = {
    version: 1,
    state: value("planState"),
    municipality: value("planMunicipality"),
    parish: value("planParish"),
    sector: value("planSector"),
    lot: form.has("planLot")?value("planLot"):plan?.lot??"1",
    northBoundary: value("planNorthBoundary"),
    eastBoundary: value("planEastBoundary"),
    southBoundary: value("planSouthBoundary"),
    westBoundary: value("planWestBoundary"),
    datum: form.has("planDatum")?value("planDatum"):plan?.datum??"",
    utmZone: value("planUtmZone"),
    scaleDenominator: Math.max(0, Math.round(Number(value("planScale") || 0))),
    procedureType: value("planProcedure"),
    applicationReference: value("planApplication"),
    fileReference: value("planFile"),
    status: value("planStatus"),
    inspectionDate: value("planInspectionDate"),
    technicalResponsible: value("planTechnicalResponsible"),
    sourceNote: form.has("planSource")?value("planSource"):plan?.sourceNote??"Datos registrados por el usuario",
    observations: value("planObservations"),
    vertices,
  };
  return { areaSqM: Math.round(areaSqM || 0), boundaryShape, boundaryMeasurements, surveyPlan, propertySketch, geographicReference };
}

