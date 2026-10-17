import assert from 'node:assert/strict';
import test,{after} from 'node:test';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createServer} from 'vite';

const root=fileURLToPath(new URL('..',import.meta.url));
const fixture=JSON.parse(await readFile(root+'lib/farm-demo-fixture.json','utf8'));
const vite=await createServer({root,configFile:false,appType:'custom',resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
after(()=>vite.close());
const {farmPayloadSchema,farmRecordPayloadSchema}=await vite.ssrLoadModule('/lib/sync-validation.ts');
const {propertyOutlinePoints}=await vite.ssrLoadModule('/lib/farm-outline-view.ts');
const {planViewport}=await vite.ssrLoadModule('/lib/farm-plan-presentation.ts');
const {readLayout}=await vite.ssrLoadModule('/components/farm-map-editor.tsx');
const {PLAN_CROP_CATALOG,cropModelKind,structureModelKind}=await vite.ssrLoadModule('/lib/farm-plan-catalog.ts');
const {FARM_ANIMAL_KINDS,animalModelSpecies,animalVisualLength}=await vite.ssrLoadModule('/lib/farm-animal-species.ts');
const {illustratedPlan}=await vite.ssrLoadModule('/lib/illustrated-plan-adapter.ts');
const {edgeClearance}=await vite.ssrLoadModule('/lib/illustrated-geometry.ts');
const farm=fixture.farms[0],areas=fixture.records.filter(r=>r.payload.recordType==='area'),animals=fixture.records.filter(r=>r.payload.recordType==='animal');
const property=propertyOutlinePoints([],farm.payload.propertySketch).points,viewport=planViewport(property);
const near=(actual,expected,epsilon=1e-7)=>assert.ok(Math.abs(actual-expected)<epsilon,`${actual} ≈ ${expected}`);
const layout=area=>readLayout(area,areas.indexOf(area),farm.payload.areaSqM);
const metres=area=>{const r=layout(area);return{x:(viewport.x+r.x*viewport.scale-6)/.22,y:(viewport.y+r.y*viewport.scale-7.5)/.22,width:r.width*viewport.scale/.22,height:r.height*viewport.scale/.22};};
const isLinear=area=>['fence','gate'].includes(structureModelKind(area.payload.category,area.payload.data.usage));

test('version 10 is one isolated fictional 400 × 250 m property with a 1.6-aspect sketch',()=>{
  assert.equal(fixture.metadata.version,10);assert.equal(fixture.metadata.persistence,'demo-only-local');
  assert.equal(fixture.metadata.canSynchronize,false);assert.equal(fixture.metadata.canPublish,false);
  assert.equal(fixture.farms.length,1);assert.equal(farm.payload.areaSqM,100000);
  assert.deepEqual(farm.payload.boundaryMeasurements,{northM:400,southM:400,eastM:250,westM:250});
  const vertices=farm.payload.propertySketch.vertices;
  near((Math.max(...vertices.map(p=>p.x))-Math.min(...vertices.map(p=>p.x)))/(Math.max(...vertices.map(p=>p.y))-Math.min(...vertices.map(p=>p.y))),1.6);
  assert.deepEqual(property.map(({x,y})=>({x,y})),[{x:6,y:7.5},{x:94,y:7.5},{x:94,y:62.5},{x:6,y:62.5}]);
  assert.equal(farm.payload.geographicReference,null);assert.equal(farm.payload.surveyPlan,undefined);
  assert.equal(farmPayloadSchema.safeParse(farm.payload).success,true);
  assert.equal(new Set(fixture.records.map(r=>r.id)).size,193);
  for(const record of fixture.records){assert.match(record.id,/^demo_v\d+_/);assert.equal(record.payload.farmId,farm.id);assert.equal(farmRecordPayloadSchema.safeParse(record.payload).success,true,record.id);}
  for(const listing of fixture.listings)assert.equal(listing.payload.status,'draft');
});

test('all 41 saved v2 layouts preserve physical proportions, bounds and honest area arithmetic',()=>{
  assert.equal(areas.length,41);
  for(const area of areas){const data=area.payload.data,r=layout(area),m=metres(area);
    assert.equal(data.mapLayoutVersion,2);assert.deepEqual(r,{x:data.mapX,y:data.mapY,width:data.mapWidth,height:data.mapHeight});
    assert.ok(m.x>=-1e-7&&m.y>=-1e-7&&m.x+m.width<=400+1e-7&&m.y+m.height<=250+1e-7,area.id);
    if(structureModelKind(area.payload.category,data.usage)==='fence')continue;
    near(m.width,data.lengthM);near(m.height,data.widthM);
    const physicalArea=['Ovalada','Circular'].includes(data.shape)?Math.PI*data.lengthM*data.widthM/4:data.lengthM*data.widthM;
    near(data.areaSqM,physicalArea,1e-6);
  }
  const sum=areas.reduce((n,a)=>n+a.payload.data.areaSqM,0);
  near(sum,65902.477736,1e-6);near(fixture.metadata.allocatedAreaSqM,sum,1e-6);
  near(sum+fixture.metadata.remainingAreaSqM,100000,1e-6);
  // Only fences and gates are intentional boundary overlays. Productive footprints
  // and road strips never overlap, so their declared surfaces cannot double-count.
  const footprints=areas.filter(a=>!isLinear(a));
  for(let i=0;i<footprints.length;i++)for(let j=i+1;j<footprints.length;j++){
    const a=metres(footprints[i]),b=metres(footprints[j]);
    const overlapX=Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x),overlapY=Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y);
    assert.ok(overlapX<1e-7||overlapY<1e-7,`${footprints[i].id} overlaps ${footprints[j].id}`);
  }
});

test('exactly six explicit crops match the closed catalog; buildings and unequal water footprints remain distinct',()=>{
  const crops=areas.filter(a=>a.payload.category==='Cultivo');assert.equal(crops.length,6);
  assert.deepEqual(new Set(crops.map(a=>a.payload.data.crop)),new Set(PLAN_CROP_CATALOG.map(c=>c.label)));
  assert.deepEqual(new Set(crops.map(a=>cropModelKind(a.payload.data.crop))),new Set(PLAN_CROP_CATALOG.map(c=>c.kind)));
  assert.equal(areas.filter(a=>a.payload.data.crop).length,6,'no inferred seventh crop from greenhouse, title or nursery');
  const ponds=areas.filter(a=>a.payload.category==='Laguna / agua');assert.equal(ponds.length,2);
  assert.deepEqual(ponds.map(a=>[a.payload.data.lengthM,a.payload.data.widthM,a.payload.data.shape]),[[42,32,'Ovalada'],[30,22,'Ovalada']]);
  const tank=areas.find(a=>a.payload.category==='Tanque de agua');assert.equal(tank.payload.data.diameterM,10);near(tank.payload.data.areaSqM,Math.PI*25,1e-6);
  assert.ok(areas.some(a=>structureModelKind(a.payload.category,a.payload.data.usage)==='house'));
  assert.ok(areas.some(a=>structureModelKind(a.payload.category,a.payload.data.usage)==='vaquera'));
  assert.ok(areas.filter(a=>structureModelKind(a.payload.category,a.payload.data.usage)==='barn').length>=2);
});

test('the full fence outlines the exact property and gated roads reach its perimeter',()=>{
  const fence=areas.find(a=>a.payload.category==='Cerca'),rect=metres(fence);assert.ok(fence);
  near(rect.x,0);near(rect.y,0);near(rect.width,400);near(rect.height,250);
  assert.equal(fence.payload.data.lengthM,1300);assert.equal(fence.payload.data.widthM,.1);assert.equal(fence.payload.data.areaSqM,130);
  assert.match(fence.payload.data.notes,/postes de madera y alambre/);assert.match(fence.payload.data.notes,/no vuelve a sumar/);
  const gates=areas.filter(a=>a.payload.category==='Portón');assert.equal(gates.length,8);
  const roadIds=['demo_v1_area_vial','demo_v7_area_via_oeste','demo_v5_area_access_east','demo_v7_area_via_servicios_oeste','demo_v7_area_via_servicios_este'];
  assert.equal(areas.filter(a=>a.payload.category==='Vías').length,roadIds.length);
  const roads=roadIds.map(id=>metres(areas.find(a=>a.id===id))),main=roads[0];
  near(main.x,196);near(main.width,8);near(main.height,250);
  for(const road of roads.slice(1)){assert.ok(Math.abs(road.x-main.x-main.width)<1e-7||Math.abs(road.x+road.width-main.x)<1e-7,'every branch connects to the main lane');}
  for(const gate of gates){const g=metres(gate);assert.ok(roads.some(r=>Math.min(g.x+g.width,r.x+r.width)-Math.max(g.x,r.x)>=-1e-7&&Math.min(g.y+g.height,r.y+r.height)-Math.max(g.y,r.y)>=-1e-7),`${gate.id} reaches a road`);}
  assert.equal(areas.filter(a=>a.payload.category==='Potrero'&&a.payload.data.fenced===true).length,4);
});

test('101 explicitly positioned fictional records cover all 20 supported kinds in suitable saved areas',()=>{
  assert.equal(animals.length,101);assert.deepEqual(new Set(animals.map(a=>animalModelSpecies(a.payload.category,a.payload.data.species))),new Set(FARM_ANIMAL_KINDS));
  assert.equal(new Set(animals.map(a=>a.payload.data.tag)).size,animals.length);
  const allowed={cattle:['Potrero'],buffalo:['Potrero'],horse:['Potrero'],donkey:['Potrero'],mule:['Potrero'],sheep:['Potrero'],goat:['Potrero'],pig:['Porqueriza'],hen:['Gallinero'],rooster:['Gallinero'],quail:['Gallinero'],turkey:['Gallinero'],rabbit:['Galpón'],duck:['Corral'],goose:['Corral'],fish:['Laguna / agua'],shrimp:['Laguna / agua'],bee:['Apiario'],hive:['Apiario'],worm:['Compostera']};
  for(const row of animals){const data=row.payload.data,area=areas.find(a=>a.id===data.areaId),kind=animalModelSpecies(row.payload.category,data.species),p=data.demoPlanPlacement;
    assert.ok(area,row.id);assert.ok(allowed[kind].includes(area.payload.data.usage),row.id);assert.equal(p.source,'fictional-demo');assert.equal(p.areaId,area.id);assert.ok(p.x>0&&p.x<100&&p.y>0&&p.y<100);
    assert.equal(data.planPlacement,undefined);assert.equal(data.scale,undefined);assert.equal(data.size,undefined);
  }
  const layouts=areas.map(area=>({area,layout:layout(area)})),before=JSON.stringify(fixture);
  const scene=illustratedPlan(layouts,viewport,fixture.records,true);assert.equal(scene.animals.length,101,'tiny valid housing must not erase explicit 3D records');
  for(const animal of scene.animals){const area=scene.areas.find(a=>a.id===animal.areaId);assert.ok(edgeClearance(animal.position,area.outline)>0);assert.ok(edgeClearance(animal.position,property)>0);}
  assert.equal(illustratedPlan(layouts,viewport,fixture.records,false).animals.length,0);
  assert.equal(JSON.stringify(fixture),before);
});

test('the enlarged saved herds have exact bounded counts and preserve the original 45 animal IDs',()=>{
  const counts={};
  for(const row of animals){const kind=animalModelSpecies(row.payload.category,row.payload.data.species);counts[kind]=(counts[kind]??0)+1;}
  assert.deepEqual(counts,{cattle:30,pig:4,hen:6,buffalo:16,horse:4,donkey:1,mule:1,sheep:12,goat:12,rooster:1,quail:2,turkey:1,rabbit:2,duck:2,goose:1,fish:2,shrimp:1,hive:1,bee:1,worm:1});
  const oldIds=[
    'demo_v1_animal_alba','demo_v1_animal_trigo','demo_v1_animal_nube',
    ...Array.from({length:6},(_,i)=>`demo_v1_animal_alba_scene_${i+1}`),
    ...Array.from({length:3},(_,i)=>`demo_v1_animal_trigo_scene_${i+1}`),
    ...Array.from({length:5},(_,i)=>`demo_v1_animal_nube_scene_${i+1}`),
    ...Object.entries({bufalo:3,caballo:2,burro:1,mula:1,oveja:3,cabra:3,gallo:1,codorniz:2,pavo:1,conejo:2,pato:2,ganso:1,pez:2,camaron:1,colmena:1,abeja:1,lombriz:1}).flatMap(([kind,count])=>Array.from({length:count},(_,i)=>`demo_v7_animal_${kind}_${i+1}`))
  ];
  assert.equal(oldIds.length,45);
  assert.deepEqual(new Set(animals.filter(a=>!a.id.startsWith('demo_v8_')).map(a=>a.id)),new Set(oldIds));
  assert.equal(animals.filter(a=>a.id.startsWith('demo_v8_')).length,56);
  for(const row of animals){assert.match(row.payload.title,/ejemplo/);assert.match(row.payload.data.notes,/ficticio/);assert.match(row.payload.data.notes,/no recomienda alojamiento.*ni carga animal/);}
});

test('every saved animal has a non-overlapping physical footprint inside its linked area',()=>{
  // A circumscribed square is deliberately more conservative than each species'
  // actual mesh width, and remains safe for any of the renderer's stable headings.
  const footprints=animals.map(row=>{
    const data=row.payload.data,area=areas.find(a=>a.id===data.areaId),p=data.demoPlanPlacement;
    const width=area.payload.data.lengthM,height=area.payload.data.widthM;
    const radius=animalVisualLength[animalModelSpecies(row.payload.category,data.species)]/Math.SQRT2;
    const x=p.x*width/100,y=p.y*height/100;
    assert.ok(Math.min(x,y,width-x,height-y)>radius,`${row.id} crosses its area boundary`);
    return{id:row.id,areaId:area.id,x,y,radius};
  });
  for(let i=0;i<footprints.length;i++)for(let j=i+1;j<footprints.length;j++){
    const a=footprints[i],b=footprints[j];if(a.areaId!==b.areaId)continue;
    assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>a.radius+b.radius,`${a.id} overlaps ${b.id}`);
  }
});

test('four saved fictional water troughs fit paddock corners without overlapping animals or adding land area',()=>{
  const troughAreas=areas.filter(a=>a.payload.data.waterTrough);assert.equal(troughAreas.length,4);
  for(const area of troughAreas){
    assert.equal(area.payload.category,'Potrero');
    const t=area.payload.data.waterTrough;
    assert.deepEqual(t,{version:1,source:'fictional-demo',x:86,y:15,lengthM:4,widthM:1.5,heightM:.65});
    assert.deepEqual(farmRecordPayloadSchema.parse(area.payload).data.waterTrough,t,'normalization must preserve the saved accessory');
    const width=area.payload.data.lengthM,height=area.payload.data.widthM,x=t.x*width/100,y=t.y*height/100;
    assert.ok(x>t.lengthM/2&&width-x>t.lengthM/2&&y>t.widthM/2&&height-y>t.widthM/2);
    for(const row of animals.filter(a=>a.payload.data.areaId===area.id)){
      const p=row.payload.data.demoPlanPlacement,ax=p.x*width/100,ay=p.y*height/100;
      const radius=animalVisualLength[animalModelSpecies(row.payload.category,row.payload.data.species)]/Math.SQRT2;
      const dx=Math.max(Math.abs(ax-x)-t.lengthM/2,0),dy=Math.max(Math.abs(ay-y)-t.widthM/2,0);
      assert.ok(Math.hypot(dx,dy)>radius,`${row.id} overlaps the trough`);
    }
  }
  assert.equal(areas.length,41);near(areas.reduce((n,a)=>n+a.payload.data.areaSqM,0),fixture.metadata.allocatedAreaSqM,1e-6);
});

test('version 10 adds clearly fictional exact-linked health and reproduction while preserving legacy group records',()=>{
 const health=fixture.records.filter(r=>r.payload.recordType==='health'&&r.payload.data.animalId);
 const reproduction=fixture.records.filter(r=>r.payload.recordType==='reproduction');
 assert.equal(health.length,4);assert.equal(reproduction.length,2);
 assert.deepEqual(new Set(health.map(r=>r.payload.data.eventType)),new Set(['vaccination','deworming','illness','review']));
 assert.deepEqual(new Set(reproduction.map(r=>r.payload.data.eventType)),new Set(['pregnancy-check','birth']));
 for(const row of [...health,...reproduction]){
   const animal=animals.find(a=>a.id===row.payload.data.animalId);
   assert.ok(animal);assert.equal(animal.payload.farmId,row.payload.farmId);
   assert.match(row.payload.title,/ficticio/);assert.match(row.payload.data.notes,/enteramente ficticio/);
   assert.match(row.payload.data.date,/^\d{4}-\d{2}-\d{2}$/);
   assert.equal(row.payload.data.dose,undefined);assert.equal(row.payload.data.healthScore,undefined);
 }
 assert.equal(fixture.records.filter(r=>r.payload.recordType==='health'&&!r.payload.data.animalId).length,2);
});
