import assert from 'node:assert/strict';
import test,{after} from 'node:test';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {Box3,Vector3} from 'three';
import {createServer} from 'vite';

const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({root,configFile:false,appType:'custom',resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
after(()=>vite.close());
const catalog=await vite.ssrLoadModule('/lib/farm-plan-catalog.ts');
const {createCropModel,createPlanStructureModel}=await vite.ssrLoadModule('/lib/farm-crop-models.ts');
const {illustratedPlan}=await vite.ssrLoadModule('/lib/illustrated-plan-adapter.ts');
const {edgeClearance}=await vite.ssrLoadModule('/lib/illustrated-geometry.ts');
const {farmRecordPayloadSchema}=await vite.ssrLoadModule('/lib/sync-validation.ts');
const {readLayout}=await vite.ssrLoadModule('/components/farm-map-editor.tsx');
const {deriveAreaSplit}=await vite.ssrLoadModule('/lib/area-split-payload.ts');
const {normalizedDemoRecord}=await vite.ssrLoadModule('/lib/farm-demo-store.ts');

test('six explicit crop kinds use the existing editable crop labels',()=>{
  assert.deepEqual(catalog.PLAN_CROP_CATALOG.map(c=>c.kind),['tomato','maize','onion','cilantro','parsley','soy']);
  for(const crop of catalog.PLAN_CROP_CATALOG){assert.equal(catalog.cropModelKind(crop.label),crop.kind);assert.equal(catalog.catalogCropLabel({crop:crop.kind}),crop.label);}
  for(const [input,kind]of [['MAÍZ AMARILLO','maize'],[' Cebolla morada ','onion'],['Perejil rizado','parsley'],['Soja','soy'],['Soya','soy']])assert.equal(catalog.cropModelKind(input),kind);
  for(const value of ['Tomate de árbol','Tomate y maíz','Cebollín','Cacao','Un área de cilantro',null,{},17,''])assert.equal(catalog.cropModelKind(value),undefined);
  assert.equal(catalog.catalogCropLabel(),undefined);
});

const signatures=new Set();
for(const entry of catalog.PLAN_CROP_CATALOG)test(`${entry.label}: grounded distinct bounded geometry with shared reusable buffers`,()=>{
  const resources=[],model=createCropModel(entry.kind,r=>(resources.push(r),r)),box=new Box3().setFromObject(model),size=box.getSize(new Vector3());
  assert.equal(model.userData.kind,entry.kind);assert.equal(model.userData.illustrative,true);assert.equal(model.userData.units,'visual-units');assert.equal(model.userData.silhouette,entry.silhouette);
  assert.ok(Math.abs(box.min.y)<1e-6);assert.ok(Math.abs(box.min.x+box.max.x)<1e-6);assert.ok(Math.abs(box.min.z+box.max.z)<1e-6);
  assert.ok(Math.abs(Math.max(size.x,size.z)-1)<1e-6);assert.ok(Math.abs(size.y-entry.visualHeight)<1e-6);
  assert.ok(model.children.length>=2&&model.children.length<=4,'at most four material draw calls per template');
  let triangles=0;
  for(const mesh of model.children){assert.ok(mesh.isMesh);assert.ok(mesh.castShadow&&mesh.receiveShadow);for(const attribute of ['position','normal'])for(const n of mesh.geometry.attributes[attribute].array)assert.ok(Number.isFinite(n));triangles+=mesh.geometry.attributes.position.count/3;}
  assert.equal(model.userData.triangleCount,triangles);assert.equal(model.userData.drawCalls,model.children.length);assert.ok(triangles<4500,'bounded original schematic mesh');
  assert.ok(model.userData.footprintRadius>=.5&&model.userData.footprintRadius<=Math.SQRT1_2+1e-6);
  const clone=model.clone(true);for(let i=0;i<model.children.length;i++){assert.equal(clone.children[i].geometry,model.children[i].geometry);assert.equal(clone.children[i].material,model.children[i].material);}
  assert.equal(resources.length,model.children.length*2,'every retained geometry/material is owned exactly once');
  signatures.add(JSON.stringify([triangles,size.toArray(),model.userData.features]));
  for(const resource of resources)resource.dispose();
});

test('botanical features differ: fruits, tassel, bulb, lobed/curled foliage and trifoliate pods',()=>{
  const resources=[],model=Object.fromEntries(catalog.PLAN_CROP_CATALOG.map(e=>[e.kind,createCropModel(e.kind,r=>(resources.push(r),r))]));
  assert.equal(model.tomato.userData.features.fruits,4);assert.equal(model.tomato.userData.features.trifoliateGroups,0);
  assert.equal(model.maize.userData.features.tassels,1);assert.equal(model.maize.userData.features.blades,8);
  assert.equal(model.onion.userData.features.bulbs,1);assert.equal(model.onion.userData.features.blades,7);
  assert.equal(model.cilantro.userData.features.leaflets,24);assert.equal(model.parsley.userData.features.leaflets,27);
  assert.notEqual(model.cilantro.userData.silhouette,model.parsley.userData.silhouette);
  assert.equal(model.soy.userData.features.trifoliateGroups,5);assert.equal(model.soy.userData.features.pods,4);
  assert.equal(signatures.size,6,'each template has a distinct topology and silhouette');
  for(const resource of resources)resource.dispose();
});

for(const kind of ['vaquera','fence','gate'])test(`${kind} is a bounded distinct facility symbol`,()=>{
  const resources=[],model=createPlanStructureModel(kind,r=>(resources.push(r),r)),box=new Box3().setFromObject(model),size=box.getSize(new Vector3());
  assert.equal(model.userData.kind,kind);assert.equal(model.userData.illustrative,true);assert.ok(Math.abs(box.min.y)<1e-6);assert.ok(Math.abs(Math.max(size.x,size.z)-1)<1e-6);
  assert.ok(model.userData.triangleCount<1000);assert.ok(model.children.length<=6);assert.equal(resources.length,model.children.length*2);
  for(const mesh of model.children)for(const n of mesh.geometry.attributes.position.array)assert.ok(Number.isFinite(n));
  for(const resource of resources)resource.dispose();
});

test('structure classification uses category/custom usage without guessing from titles',()=>{
  for(const [category,usage,kind]of [['Casa','','house'],['Galpón','','barn'],['Vaquera / corrales','','vaquera'],['Otro','Cerca','fence'],['Portón','','gate']])assert.equal(catalog.structureModelKind(category,usage),kind);
  assert.equal(catalog.structureModelKind('Cultivo','Casa'),undefined);assert.equal(catalog.structureModelKind('Otro','Tomates junto al portón'),undefined);
});

test('illustrative crop rows fit both concave saved boundaries, remain bounded and never imply counts',()=>{
  const property=[{x:0,y:0},{x:100,y:0},{x:100,y:70},{x:60,y:70},{x:60,y:30},{x:40,y:30},{x:40,y:70},{x:0,y:70}],area=[{x:5,y:5},{x:90,y:5},{x:90,y:65},{x:5,y:65}],before=structuredClone({property,area});
  const slots=catalog.cropIllustrationSlots(area,property,2,99999);assert.ok(slots.length>0&&slots.length<=64);
  for(const point of slots){assert.ok(edgeClearance(point,area)>=2);assert.ok(edgeClearance(point,property)>=2);assert.deepEqual(Object.keys(point).sort(),['x','y']);}
  assert.deepEqual({property,area},before);
  for(const radius of [0,-1,NaN,Infinity])assert.deepEqual(catalog.cropIllustrationSlots(area,property,radius),[]);
  assert.deepEqual(catalog.cropIllustrationSlots(area,property,1,NaN),[]);assert.deepEqual(catalog.cropIllustrationSlots([],property,1),[]);
});

test('adapter metadata preserves actual records, geometry, dimensions and persistence schema',()=>{
  const rows=catalog.PLAN_CROP_CATALOG.map((crop,i)=>({id:`area-${i}`,payload:{farmId:'farm-test',recordType:'area',category:'Cultivo',title:'Nombre independiente',data:{crop:catalog.catalogCropLabel({crop:crop.kind}),usage:'Cultivo',areaSqM:600,lengthM:30,widthM:20,mapX:10,mapY:10,mapWidth:20,mapHeight:10}}}));
  rows.push({id:'area-water',payload:{farmId:'farm-test',recordType:'area',category:'Laguna / agua',title:'Laguna',data:{usage:'Laguna / agua',areaSqM:450,lengthM:30,widthM:20,diameterM:null}}});
  const before=JSON.stringify(rows),layout={x:10,y:12,width:20,height:10},adapted=illustratedPlan(rows.map(area=>({area,layout})),{x:4,y:6,scale:.8},[],false);
  assert.deepEqual(adapted.areas.slice(0,6).map(a=>a.cropKind),catalog.PLAN_CROP_CATALOG.map(c=>c.kind));
  assert.deepEqual(adapted.areas.at(-1).declaredDimensions,{lengthM:30,widthM:20});assert.equal(adapted.areas.at(-1).outline.length,32);assert.equal(adapted.areas.at(-1).cropKind,undefined);
  for(const row of rows){assert.equal(farmRecordPayloadSchema.safeParse(row.payload).success,true);assert.deepEqual(JSON.parse(JSON.stringify(row)),row);assert.equal('plantCount' in row.payload.data,false);}
  assert.equal(JSON.stringify(rows),before);assert.equal(adapted.animals.length,0);
  const namedOnly={id:'untyped',payload:{farmId:'farm-test',recordType:'area',category:'Cultivo',title:'Tomate',data:{}}};assert.equal(illustratedPlan([{area:namedOnly,layout}],{x:0,y:0,scale:1},[],false).areas[0].cropKind,undefined);
  assert.equal(catalog.declaredPlanDimensions({lengthM:'30',widthM:-1,diameterM:Infinity,mapWidth:20}),undefined);
});

test('catalog selection reaches both existing area draft flows before normal confirmation',async()=>{
  const [editor,dashboard,demo]=await Promise.all(['components/farm-map-editor.tsx','components/farm-dashboard.tsx','components/farm-demo-workspace.tsx'].map(path=>readFile(root+path,'utf8')));
  assert.match(editor,/beginPlacement\(\{preset:"Cultivo",catalog:\{crop:item.kind\}\}\)/);assert.match(editor,/onAddPreset\(placement.preset,\{\.\.\.value,preferSketch\},placement.catalog\)/);
  assert.match(dashboard,/setCropType\(catalogCropLabel\(catalog\)\?\?"Cacao"\)/);assert.match(demo,/onAddPreset=\{\(preset,placement,catalog\)=>add\("area",preset,undefined,placement,catalog\)\}/);assert.match(demo,/payload.data=freshDemoAreaData\(preset\?\?"Potrero",placement,catalog/);
  assert.match(editor,/Las plantas 3D son esquemáticas/);assert.match(editor,/no cuentan plantas ni representan distancias de siembra/);
  assert.doesNotMatch(editor,/queueMutation|mutateDemo/);
});

test('lagoon ellipse calculations use declared length and width, without treating one diameter as an ellipse',()=>{
  assert.equal(catalog.measuredAreaFromDimensions('Ovalada',{lengthM:30,widthM:20}),Math.PI*150);
  assert.equal(catalog.measuredAreaFromDimensions('Rectangular',{lengthM:30,widthM:20}),600);
  assert.equal(catalog.measuredAreaFromDimensions('Circular',{diameterM:20}),Math.PI*100);
  for(const input of [{diameterM:20},{lengthM:30},{lengthM:30,widthM:-10},{lengthM:Infinity,widthM:20},{mapWidth:30,mapHeight:20},{lengthM:1e300,widthM:1e300}])assert.equal(catalog.measuredAreaFromDimensions('Ovalada',input),0);
  assert.equal(catalog.measuredAreaFromDimensions('Irregular',{lengthM:30,widthM:20}),0);
});

test('explicit layout v2 preserves small dimensions and inverse-viewport offsets; invalid values use legacy fallback',()=>{
  const data={mapLayoutVersion:2,mapX:-10.3921568627,mapY:-2.7450980392,mapWidth:120.7843137254,mapHeight:75.4901960784,areaSqM:130},record={id:'test-area',payload:{category:'Cerca',data}};
  assert.deepEqual(readLayout(record,0,100000),{x:data.mapX,y:data.mapY,width:data.mapWidth,height:data.mapHeight});
  assert.deepEqual(readLayout({...record,payload:{...record.payload,data:{...data,mapX:0,mapY:0,mapWidth:.05,mapHeight:.1}}},0,100000),{x:0,y:0,width:.05,height:.1});
  for(const change of [{mapX:NaN},{mapY:Infinity},{mapWidth:.049},{mapHeight:201},{mapX:-100.001},{mapY:200.001},{mapX:'0'},{mapLayoutVersion:'2'}]){
    const invalid={...data,...change},fallback=readLayout({...record,payload:{...record.payload,data:invalid}},0,100000);
    assert.equal(catalog.exactPlanLayout(invalid),undefined);assert.ok(fallback.width>=8&&fallback.width<=44);assert.ok(fallback.height>=5&&fallback.height<=31);
  }
  const legacy={...data};delete legacy.mapLayoutVersion;assert.equal(readLayout({...record,payload:{...record.payload,data:legacy}},0,100000).width,44);
  assert.equal(data.mapLayoutVersion,2);
});

test('fences have no opaque area fill and explicit crop fence flags are not inferred',async()=>{
  const [editor,scene]=await Promise.all(['components/farm-map-editor.tsx','components/farm-illustrated-scene.tsx'].map(path=>readFile(root+path,'utf8')));
  assert.match(editor,/const tone=isFence\?"none":planAreaTone/);assert.match(editor,/!isFence&&<FarmAreaIllustration/);assert.match(editor,/pointerEvents=\{isFence\?"stroke":undefined\}/);
  assert.match(scene,/a.structureKind!=='fence'&&/);assert.match(scene,/fill=\{a.structureKind==='fence'\?"none":"transparent"\}/);assert.match(scene,/pointerEvents=\{a.structureKind==='fence'\?"stroke":undefined\}/);
  const row=fenced=>({id:'crop-a',payload:{farmId:'farm-test',recordType:'area',category:'Cultivo',title:'Tomate con cerca',data:{crop:'Tomate',...(fenced===undefined?{}:{fenced})}}}),adapt=fenced=>illustratedPlan([{area:row(fenced),layout:{x:10,y:10,width:20,height:20}}],{x:0,y:0,scale:1},[],false).areas[0];
  assert.equal(adapt(undefined).fenced,false);assert.equal(adapt('true').fenced,false);assert.equal(adapt(true).fenced,true);
});

test('six locally bundled geometry previews are lightweight valid WebP files',async()=>{
  let bytes=0;
  for(const crop of catalog.PLAN_CROP_CATALOG){const image=await readFile(root+`public/farm-3d/previews/crop-${crop.kind}.webp`);assert.equal(image.toString('ascii',0,4),'RIFF');assert.equal(image.toString('ascii',8,12),'WEBP');assert.ok(image.length>500);bytes+=image.length;}
  assert.ok(bytes<100_000,'all six catalog previews stay below 100 KB combined');
});

test('crop row marks cover both axes of the full plot before the visual count is capped',()=>{
  const area=[{x:0,y:0},{x:100,y:0},{x:100,y:70},{x:0,y:70}],points=catalog.cropIllustrationSlots(area,area,1,48);
  assert.equal(points.length,48);assert.equal(new Set(points.map(p=>`${p.x},${p.y}`)).size,48);
  const xs=points.map(p=>p.x),ys=points.map(p=>p.y);
  assert.ok(Math.max(...xs)-Math.min(...xs)>80,'marks span the plot width');assert.ok(Math.max(...ys)-Math.min(...ys)>56,'marks span the plot height');
  assert.ok(Math.abs(xs.reduce((a,b)=>a+b,0)/points.length-50)<10);assert.ok(Math.abs(ys.reduce((a,b)=>a+b,0)/points.length-35)<7);
  for(const point of points)assert.ok(edgeClearance(point,area)>=1);
  assert.deepEqual(catalog.cropIllustrationSlots(area,area,1,48),points,'selection stays deterministic');
});

test('v2 split preserves negative origin, exact half footprints and declared area without jumping to legacy minima',()=>{
  for(const dimensions of [{mapWidth:120.7843137254,mapHeight:75.4901960784},{mapWidth:.4,mapHeight:.2},{mapWidth:.2,mapHeight:.4}]){
    const input={farmId:'farm-test',recordType:'area',category:'Cultivo',title:'Lote sintético',data:{mapLayoutVersion:2,mapX:-10.3921568627,mapY:-2.7450980392,...dimensions,areaSqM:101.25,crop:'Tomate',notes:'Conservar',fenced:true}},before=structuredClone(input),[a,b]=deriveAreaSplit(input),la=readLayout({id:'a',payload:a},0,100000),lb=readLayout({id:'b',payload:b},1,100000);
    assert.equal(a.data.areaSqM+b.data.areaSqM,input.data.areaSqM);assert.equal(a.data.mapLayoutVersion,2);assert.equal(b.data.mapLayoutVersion,2);assert.equal(la.x,input.data.mapX);assert.equal(la.y,input.data.mapY);
    if(dimensions.mapWidth>=dimensions.mapHeight){assert.equal(la.width+lb.width,dimensions.mapWidth);assert.equal(lb.x,la.x+la.width);assert.equal(lb.y,la.y);assert.equal(la.height,dimensions.mapHeight);}
    else{assert.equal(la.height+lb.height,dimensions.mapHeight);assert.equal(lb.y,la.y+la.height);assert.equal(lb.x,la.x);assert.equal(la.width,dimensions.mapWidth);}
    for(const half of [a,b]){assert.equal(half.data.crop,'Tomate');assert.equal(half.data.fenced,true);assert.equal(half.data.notes,'Conservar');assert.doesNotThrow(()=>normalizedDemoRecord(half));}
    assert.deepEqual(input,before);
  }
});

test('invalid or unsplittably small v2 geometry is rejected instead of silently changing size or coordinates',()=>{
  for(const override of [{mapWidth:.05,mapHeight:.05},{mapX:200,mapWidth:100,mapHeight:20},{mapX:NaN},{mapWidth:201}]){
    const input={farmId:'farm-test',recordType:'area',category:'Cultivo',title:'Lote',data:{mapLayoutVersion:2,mapX:-2,mapY:-3,mapWidth:10,mapHeight:8,areaSqM:100,...override}},before=structuredClone(input);
    assert.throws(()=>deriveAreaSplit(input),/area_layout_(invalid|split_out_of_range)/);assert.deepEqual(input,before);
  }
});

test('fresh demo areas never inherit template fencing, proportional layouts, measured dimensions or crop notes',()=>{
  const inherited={fenced:true,mapLayoutVersion:2,mapX:-10,mapY:-2,mapWidth:80,mapHeight:30,lengthM:250,widthM:100,areaSqM:25000,crop:'Maíz',typedAreaOutline:{version:1},notes:'400 × 250 m'};
  for(const preset of ['Cultivo','Casa','Laguna / agua','Portón','Cerca']){
    const draft=catalog.freshDemoAreaData(preset);assert.equal(draft.usage,preset);assert.equal(draft.crop,'');assert.equal(draft.areaSqM,null);assert.equal(draft.lengthM,null);assert.equal(draft.widthM,null);
    for(const key of ['fenced','mapLayoutVersion','mapX','mapY','typedAreaOutline'])assert.equal(key in draft,false,key);
    assert.doesNotMatch(draft.notes,/400|250/);assert.match(draft.notes,/ficticia/);assert.equal(draft.shape,preset==='Laguna / agua'?'Ovalada':'Rectangular');
    assert.doesNotThrow(()=>normalizedDemoRecord({farmId:'farm-test',recordType:'area',category:preset,title:'Nuevo ejemplo',data:{...draft,areaSqM:5}}));
  }
  const placed=catalog.freshDemoAreaData('Cultivo',{x:12,y:14,width:9,height:6},{crop:'soy'});
  assert.deepEqual([placed.mapX,placed.mapY,placed.mapWidth,placed.mapHeight],[12,14,9,6]);assert.equal(placed.crop,'Soya');assert.equal('mapLayoutVersion' in placed,false);assert.equal('fenced' in placed,false);
  assert.equal(inherited.mapX,-10,'source template is never mutated');
});
