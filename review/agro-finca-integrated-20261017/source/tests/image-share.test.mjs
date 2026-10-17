import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
import {readFile} from 'node:fs/promises';
const root = fileURLToPath(new URL('..', import.meta.url));
const vite = await createServer({appType:'custom', configFile:false, root, resolve:{alias:{'@':root}}, server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
after(() => vite.close());
const sharing = await vite.ssrLoadModule('/lib/image-share.ts');
const image = await vite.ssrLoadModule('/lib/social-image.ts');
const png = () => new File([new Uint8Array([137,80,78,71])], 'public-card.png', {type:'image/png'});
const error = name => Object.assign(new Error(name), {name});

test('native payload contains the actual PNG only; invocation is synchronous within user activation', async () => {
  const file = png(), trace = []; let payload;
  const browser = {userActivation:{isActive:true}, canShare:data => {trace.push('canShare'); assert.deepEqual(data, {files:[file]}); return true;}, share:data => {trace.push('share'); payload=data; assert.equal(browser.userActivation.isActive,true); return Promise.resolve();}};
  const result=sharing.createImageShareController().share(file,browser);
  browser.userActivation.isActive=false;
  assert.deepEqual(trace,['canShare','share']);
  assert.deepEqual(Object.keys(payload),['files']);assert.equal(payload.files[0],file);
  assert.equal(payload.files[0].type,'image/png');assert.equal(payload.url,undefined);assert.equal(payload.text,undefined);
  assert.equal(await result,'opened');
});
test('missing file support, canShare false/throws, empty files and unsupported types never call share', async () => {
  let calls=0;const share=()=>{calls++;return Promise.resolve();};
  for (const browser of [{share},{canShare:()=>true},{share,canShare:()=>false},{share,canShare:()=>{throw error('NotAllowedError');}}]) assert.equal(await sharing.createImageShareController().share(png(),browser),'unsupported');
  for (const file of [new File([],'empty.png',{type:'image/png'}),new File(['svg'],'image.svg',{type:'image/svg+xml'})]) assert.equal(await sharing.createImageShareController().share(file,{share,canShare:()=>true}),'unsupported');
  assert.equal(calls,0);
});
test('expired user activation cannot trigger sharing, and a fresh tap can retry', async () => {
  let calls=0;const controller=sharing.createImageShareController(),browser={canShare:()=>true,userActivation:{isActive:false},share:()=>{calls++;return Promise.resolve();}};
  assert.equal(await controller.share(png(),browser),'gesture-required');assert.equal(calls,0);
  browser.userActivation.isActive=true;assert.equal(await controller.share(png(),browser),'opened');assert.equal(calls,1);
});
test('cancel does not invoke any fallback, copy a URL or reopen; repeated tap after cancellation works', async () => {
  let calls=0;const controller=sharing.createImageShareController(),browser={canShare:()=>true,share:()=>{calls++;return Promise.reject(error('AbortError'));}};
  assert.equal(await controller.share(png(),browser),'cancelled');assert.equal(calls,1);
  browser.share=()=>{calls++;return Promise.resolve();};assert.equal(await controller.share(png(),browser),'opened');assert.equal(calls,2);
});
test('double tap is locked until native sheet settles; failures release lock for retries', async () => {
  let settle,calls=0;const controller=sharing.createImageShareController(),browser={canShare:()=>true,share:()=>{calls++;return new Promise(resolve=>{settle=resolve;});}};
  const pending=controller.share(png(),browser);assert.equal(await controller.share(png(),browser),'busy');assert.equal(calls,1);
  settle();assert.equal(await pending,'opened');
  for (const [name,expected] of [['NotAllowedError','gesture-required'],['InvalidStateError','busy'],['DataError','failed'],['TypeError','failed']]) {
    browser.share=()=>Promise.reject(error(name));assert.equal(await controller.share(png(),browser),expected);
    browser.share=()=>{throw error(name);};assert.equal(await controller.share(png(),browser),expected);
  }
  browser.share=()=>Promise.resolve();assert.equal(await controller.share(png(),browser),'opened');
});
test('source selection does not fetch third-party, executable or arbitrary local data URLs',()=>{
  const origin='https://private.example';
  assert.equal(image.safeSocialImageSource('/api/media/public-image.webp',origin),origin+'/api/media/public-image.webp');
  assert.equal(image.safeSocialImageSource('data:image/png;base64,AAAA',origin),'data:image/png;base64,AAAA');
  for(const src of ['https://other.example/img.png','//other.example/img.png','javascript:alert(1)','data:image/svg+xml;base64,AAAA','file:///etc/passwd','blob:https://other.example/id']) assert.throws(()=>image.safeSocialImageSource(src,origin));
});
test('link-required photographs are not silently stripped of credits, while permitted photos export without credits',()=>{
  const original={src:'/products/res.webp',alt:'Res',caption:'Foto de FotoosVanRobin CC BY-SA 2.0'};
  const credit=image.socialImageCredit(original);
  assert.equal(credit.author,'FotoosVanRobin');assert.equal(credit.license,'CC BY-SA 2.0');
  assert.equal(credit.source,'https://commons.wikimedia.org/wiki/File:Raw_steak.jpeg');
  assert.equal(credit.licenseUrl,'https://creativecommons.org/licenses/by-sa/2.0/');
  // Catalog provenance stays intact, independent of the URL-free export selection.
  assert.deepEqual(image.socialImageAttribution(original),[]);
  for(const src of ['/products/pollo.webp','/products/cafe.webp','/products/cacao.webp','/photo-cacao.webp']){
    assert.equal(image.urlFreeSocialPhoto({src,alt:'Foto'}).omitted,false);assert.deepEqual(image.socialImageAttribution({src,alt:'Foto'}),[]);
  }
  assert.equal(image.urlFreeSocialPhoto({src:'/unknown.webp',alt:'Unknown',credit:{author:'Photographer',license:'License needing permission',source:'https://source.example',licenseUrl:'https://license.example'}}).omitted,true);
});
test('URL sanitizer removes links but preserves public phone, email, amounts and non-domain brand',()=>{
  for(const text of ['https://example.com/a?q=1','http://example.com','www.example.com/path','example.com/path','sub.example.com.ve?q=1','ftp://example.com/file','VenezuelaAgro.com'])assert.equal(image.withoutImageUrls(text),'');
  assert.equal(image.withoutImageUrls('Teléfono: tel:+58 414 1234567'),'Teléfono: +58 414 1234567');
  assert.equal(image.withoutImageUrls('Correo: mailto:ventas@example.com'),'Correo: ventas@example.com');
  assert.equal(image.withoutImageUrls('ventas@example.com y +58 414 1234567'),'ventas@example.com y +58 414 1234567');
  assert.equal(image.withoutImageUrls('VENEZUELA AGRO · USD 12.50 · 3.0 kg'),'VENEZUELA AGRO · USD 12.50 · 3.0 kg');
  assert.equal(image.withoutImageUrls('Visita (https://example.com/a) y consulta.'),'Visita y consulta.');
});
function canvasHarness({fail=false}={}){
  const text=[];const ctx={fillStyle:'',font:'',fillRect(){},fillText(value,x,y,max){text.push({value,x,y,max});},measureText:value=>({width:[...value].length*7}),save(){},beginPath(){},rect(){},clip(){},drawImage(){},restore(){}};
  const canvas={width:0,height:0,getContext:()=>ctx,toBlob:callback=>callback(fail?null:new Blob(['png-bytes'],{type:'image/png'}))};
  return {text,canvas,document:{createElement:name=>{assert.equal(name,'canvas');return canvas;}}};
}
test('text-only posts and profiles produce PNGs in all formats with demo disclosure and no sensitive extras',async()=>{
  const previous=global.document;
  try{for(const format of image.socialImageFormats){const harness=canvasHarness();global.document=harness.document;
    const blob=await image.buildSocialImage({id:'public',title:'Perfil público',category:'Comunidad',description:'Publicación sin fotografía',path:'/red/public',demo:true,privateOwner:'secret'},format);
    assert.equal(blob.type,'image/png');assert.ok(blob.size);assert.equal(harness.canvas.width,format.width);assert.equal(harness.canvas.height,format.height);
    assert.ok(harness.text.some(row=>row.value.includes('DEMOSTRACIÓN')));assert.ok(harness.text.some(row=>row.value.includes('Publicación sin fotografía')));assert.ok(harness.text.every(row=>!row.value.includes('secret')));
  }}finally{global.document=previous;}
});
test('canvas export errors are reported and a later generation can succeed',async()=>{
  const previous=global.document,content={id:'one',title:'Title',category:'Market',path:'/marketplace/one'};
  try{global.document=canvasHarness({fail:true}).document;await assert.rejects(image.buildSocialImage(content,image.socialImageFormats[0]),/image_export_failed/);
    global.document=canvasHarness().document;assert.ok((await image.buildSocialImage(content,image.socialImageFormats[0])).size);
  }finally{global.document=previous;}
});
test('preparation abort stops pending image load and late events cannot yield a shareable file',async()=>{
  const previous={Image:global.Image,location:global.location};let instance;
  try{global.location={origin:'https://private.example'};global.Image=class{constructor(){return instance={src:'',naturalWidth:0};}};
    const controller=new AbortController();const promise=image.buildSocialImage({id:'one',title:'Title',category:'Market',path:'/marketplace/one',photo:{src:'/image.webp',alt:'Photo'}},image.socialImageFormats[0],controller.signal);
    assert.equal(instance.src,'https://private.example/image.webp');controller.abort();await assert.rejects(promise,{name:'AbortError'});assert.equal(instance.src,'');assert.equal(instance.onload,null);assert.equal(instance.onerror,null);
    await assert.rejects(image.buildSocialImage({id:'one',title:'Title',category:'Market',path:'/marketplace/one'},image.socialImageFormats[0],controller.signal),{name:'AbortError'});
  }finally{global.Image=previous.Image;global.location=previous.location;}
});
test('dialog keeps separate explicit link action, revokes previews, and invalidates old preparation on close/switch',async()=>{
  const source=await readFile(root+'components/image-share.tsx','utf8');
  for(const pattern of [/new AbortController\(\)/,/controller\.abort\(\)/,/preparationEpoch.current !== epoch/,/prepared\?\.key === preparationKey/,/URL.revokeObjectURL\(previewUrl\)/,/open && <ImageSharePanel/,/Copiar enlace de la ficha/,/download=\{ready.file.name\}/])assert.match(source,pattern);
  assert.doesNotMatch(source,/window.open|wa\.me|sharer.php|intent\/tweet/);
  const handler=source.slice(source.indexOf('function share()'),source.indexOf('return <div',source.indexOf('function share()')));
  assert.doesNotMatch(handler,/await|buildSocialImage|fetch\(/);assert.match(handler,/imageShareController.share\(ready.file, navigator\)/);
});

 test('a late canvas callback after close cannot finish image preparation', async()=>{
 const previous=global.document;let callback;
 try{const harness=canvasHarness();harness.canvas.toBlob=cb=>{callback=cb;};global.document=harness.document;
 const controller=new AbortController();const promise=image.buildSocialImage({id:'late',title:'Title',category:'Market',path:'/red/late'},image.socialImageFormats[0],controller.signal);
 controller.abort();callback(new Blob(['png'],{type:'image/png'}));await assert.rejects(promise,{name:'AbortError'});
 }finally{global.document=previous;}
});

test('rendered pixels keep real public phone, name, value and description while stripping every URL field',async()=>{
  const previous=global.document;
  try{for(const format of image.socialImageFormats){const harness=canvasHarness();global.document=harness.document;
    await image.buildSocialImage({id:'public',title:'Novillas https://title.example',category:'Ganadería www.category.example',detail:'USD 500 · Apure example.com.ve/info',description:'Novillas criadas en potrero. Consulta https://description.example más detalles.',publicContact:{name:'Productora Ana',phone:'+58 414 1234567'},facts:['Raza Brahman','Edad: 18 meses'],path:'/marketplace/public'},format);
    const rendered=harness.text.map(row=>row.value).join(' ');
    for(const text of ['Productora Ana','+58 414 1234567','USD 500','Novillas criadas en potrero','VENEZUELA AGRO'])assert.ok(rendered.includes(text),`${format.id}: ${text}`);
    assert.doesNotMatch(rendered,/https?:|www\.|example\.|creativecommons|FotoosVanRobin/);
    assert.ok(harness.text.every(row=>row.y<harness.canvas.height));
  }}finally{global.document=previous;}
});
test('long descriptions use a visible excerpt notice and never enlarge the chosen format or print demo phones',async()=>{
  const previous=global.document;
  try{const harness=canvasHarness();global.document=harness.document;
    await image.buildSocialImage({id:'demo',title:'Perfil ficticio',category:'Ejemplo',description:'Descripción pública de demostración. '.repeat(300),publicContact:{name:'Persona ficticia',phone:'+58 414 1234567'},path:'/demo',demo:true},image.socialImageFormats[2]);
    const rendered=harness.text.map(row=>row.value).join(' ');assert.match(rendered,/Texto resumido/);assert.match(rendered,/DEMOSTRACIÓN/);assert.doesNotMatch(rendered,/1234567/);assert.equal(harness.canvas.width,1200);assert.equal(harness.canvas.height,630);
  }finally{global.document=previous;}
});
