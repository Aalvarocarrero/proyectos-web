import assert from 'node:assert/strict';import test,{after} from 'node:test';import {readFile} from 'node:fs/promises';import {fileURLToPath} from 'node:url';import {createServer} from 'vite';import proj4 from 'proj4';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,cacheDir:'/tmp/agro-geography-tests',resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,ws:false,watch:null}});after(()=>vite.close());
const geo=await vite.ssrLoadModule('/lib/farm-geography.ts');const form=await vite.ssrLoadModule('/lib/farm-form-geometry.ts');const view=await vite.ssrLoadModule('/lib/farm-outline-view.ts');const schemas=await vite.ssrLoadModule('/lib/sync-validation.ts');
const sketch={version:1,coordinateSpace:'normalized-100',vertices:[{id:'one',x:10,y:10},{id:'two',x:80,y:10},{id:'three',x:30,y:70}]};
test('REGVEN19 synthetic origin and roundtrip preserve axis order without remote grids',()=>{
 const origin=geo.regven19ToGeographic(500000,0);assert.ok(Math.abs(origin.longitude+69)<1e-8);assert.ok(Math.abs(origin.latitude)<1e-8);
 const synthetic=[500123,900456],location=geo.regven19ToGeographic(...synthetic);const back=proj4('EPSG:4326',geo.REGVEN_UTM19N,[location.longitude,location.latitude]);assert.ok(Math.abs(back[0]-synthetic[0])<.01);assert.ok(Math.abs(back[1]-synthetic[1])<.01);
});
test('only an explicitly selected reference produces a point or polygon; sketches are not georeferenced',()=>{
 assert.equal(geo.locateFarm(undefined).kind,'none');
 const point=geo.locateFarm({version:1,source:'wgs84-point',latitude:8,longitude:-66});assert.equal(point.kind,'point');assert.equal(point.positions.length,1);
 assert.equal(geo.locateFarm({version:1,source:'wgs84-point',latitude:-66,longitude:8}).kind,'none');
 assert.equal(geo.locateFarm({version:1,source:'regven-utm19n-survey'},{vertices:[]}).kind,'none');
 const polygon=geo.locateFarm({version:1,source:'regven-utm19n-survey'},{vertices:[{id:'a',easting:500000,northing:900000},{id:'b',easting:500100,northing:900000},{id:'c',easting:500100,northing:900100}]});assert.equal(polygon.kind,'polygon');assert.match(polygon.message,/aproximada/);
});
test('declared area keeps full precision and takes priority over coordinate estimates',()=>{
 const data=new FormData();data.set('area','1.2345');data.set('planVerticesJson',JSON.stringify([{id:'a',easting:0,northing:0},{id:'b',easting:200,northing:0},{id:'c',easting:200,northing:100},{id:'d',easting:0,northing:100}]));
 assert.equal(form.readFarmGeometry(data,'ha','Irregular / polígono').areaSqM,12345);
 data.set('area','');assert.equal(form.readFarmGeometry(data,'ha','Irregular / polígono').areaSqM,20000);
});
test('collapsed metadata retains existing values, while explicit empty edits clear their fields',()=>{
 const prior={name:'Finca de prueba',location:'Zona de prueba',areaSqM:12345,objective:'',propertySketch:sketch,geographicReference:{version:1,source:'wgs84-point',latitude:8,longitude:-66},surveyPlan:schemas.legacySurveyPlanSchema.parse({version:1,municipality:'Municipio de prueba',parish:'Parroquia de prueba',lot:'Lote A',datum:'REGVEN',utmZone:'19',sourceNote:'Documento de prueba',scaleDenominator:5000})};
 const data=new FormData();data.set('area','1.2345');const saved=form.readFarmGeometry(data,'ha','Irregular / polígono',prior);
 assert.equal(saved.surveyPlan.municipality,prior.surveyPlan.municipality);assert.equal(saved.surveyPlan.utmZone,'19');assert.equal(saved.surveyPlan.scaleDenominator,5000);assert.deepEqual(saved.propertySketch,sketch);assert.deepEqual(saved.geographicReference,prior.geographicReference);
 data.set('planMunicipality','');data.set('planDatum','');data.set('planSource','');const cleared=form.readFarmGeometry(data,'ha','Irregular / polígono',prior);assert.equal(cleared.surveyPlan.municipality,'');assert.equal(cleared.surveyPlan.datum,'');assert.equal(cleared.surveyPlan.sourceNote,'');const collapsedAgain=form.readFarmGeometry(new FormData(),'ha','Irregular / polígono',{...prior,...cleared});assert.equal(collapsedAgain.surveyPlan.datum,'');assert.equal(collapsedAgain.surveyPlan.sourceNote,'');
});
test('incomplete coordinate drafts fail visibly instead of changing to a smaller ring',()=>{
 assert.deepEqual(form.readSurveyDraft(JSON.stringify([{id:'1',easting:'',northing:''}])),[]);
 assert.throws(()=>form.readSurveyDraft(JSON.stringify([{id:'1',easting:'0',northing:'0'},{id:'2',easting:'20',northing:'0'},{id:'3',easting:'',northing:'20'}])),/completa ambas/);
});
test('legacy missing coordinates render safely, and normalized outline scale keeps aspect ratio',()=>{
 assert.equal(view.formatSurveyCoordinate(null),'Pendiente de revisión');assert.equal(view.formatSurveyCoordinate(' 12.30 '),' 12.30 ');
 const positions=view.areaOutlinePoints(sketch,{x:5,y:6,width:40,height:20});assert.equal((positions[1].x-positions[0].x)/(positions[2].y-positions[0].y),70/60);
 assert.equal(view.propertyOutlinePoints([],sketch).basis,'sketch');
});
test('map context is same-origin and does not request geolocation or external tiles',async()=>{
 const source=await readFile(new URL('../components/private-farm-locator.tsx',import.meta.url),'utf8');assert.match(source,/fetch\('\/venezuela-states.geojson'/);assert.doesNotMatch(source,/tileLayer\(|navigator.geolocation|https?:\/\//);assert.match(source,/Solo al aceptar la consulta/);
});

test('collapsing metadata retains mounted controls and full precision area inputs',async()=>{
 const source=await readFile(new URL('../components/farm-plan-fields.tsx',import.meta.url),'utf8');
 assert.equal((source.match(/<AccordionContent forceMount/g)||[]).length,2);
 assert.match(source,/step="any"/);
 const dashboard=await readFile(new URL('../components/farm-dashboard.tsx',import.meta.url),'utf8');assert.match(dashboard,/defaultArea=\{displayedArea\}/);
});
