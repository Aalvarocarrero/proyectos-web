import assert from 'node:assert/strict';
import test, {after} from 'node:test';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createServer} from 'vite';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
after(()=>vite.close());
const {readBoundedJson}=await vite.ssrLoadModule('/lib/request-body.ts');
const {decodeUploadedImage}=await vite.ssrLoadModule('/lib/uploaded-image.ts');
const {publicSyncError}=await vite.ssrLoadModule('/lib/sync-error.ts');
const {parseStringListJson}=await vite.ssrLoadModule('/lib/safe-json.ts');
const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jCrkAAAAASUVORK5CYII=';
function req(text,type='application/json'){return new Request('https://synthetic.test/api/sync',{method:'POST',headers:{'content-type':type},body:text});}

test('JSON reader validates type, stated length, actual UTF-8 bytes and broken input',async()=>{
 assert.deepEqual(await readBoundedJson(req('{"ok":true}'),11),{ok:true});
 await assert.rejects(readBoundedJson(req('{}','text/plain'),99),{code:'json_required',status:415});
 const stated=req('{}');stated.headers.set('content-length','100');await assert.rejects(readBoundedJson(stated,10),{code:'request_too_large',status:413});
 await assert.rejects(readBoundedJson(req('{"é":"é"}'),9),{code:'request_too_large',status:413});
 await assert.rejects(readBoundedJson(req('{broken'),100),{code:'invalid_json',status:400});
 const invalid=new Request('https://synthetic.test',{method:'POST',headers:{'content-type':'application/json'},body:new Uint8Array([0xff,0xfe])});await assert.rejects(readBoundedJson(invalid,100),{code:'invalid_json'});
});
test('chunked requests are cancelled at the byte limit rather than fully buffered',async()=>{
 let reads=0,cancelled=false;
 const stream=new ReadableStream({pull(controller){reads++;controller.enqueue(new TextEncoder().encode('x'.repeat(10)));},cancel(){cancelled=true;}});
 const request=new Request('https://synthetic.test',{method:'POST',headers:{'content-type':'application/json'},body:stream,duplex:'half'});
 await assert.rejects(readBoundedJson(request,25),{code:'request_too_large'});
 assert.equal(cancelled,true);assert.ok(reads<=4);
});
test('valid PNG and actual repository WebP decode with bounded raster dimensions',()=>{
 assert.deepEqual([decodeUploadedImage(png).width,decodeUploadedImage(png).height],[1,1]);
 const image=decodeUploadedImage('data:image/webp;base64,'+readFileSync(root+'public/photos/vacas-llano.webp').toString('base64'));
 assert.equal(image.mime,'image/webp');assert.ok(image.width>0&&image.height>0);
});
test('MIME spoofing, truncated images, SVG and excessive dimensions are rejected',()=>{
 for(const data of ['data:image/png;base64,'+btoa('<html>this is an executable document</html>'),'data:image/png;base64,iVBORw0KGgo=','data:image/svg+xml;base64,'+btoa('<svg/>'),png.replace('image/png','image/jpeg'),'data:image/png;base64,===='])assert.throws(()=>decodeUploadedImage(data));
 const bytes=Buffer.from(png.split(',')[1],'base64');bytes.writeUInt32BE(100_000,16);
 assert.throws(()=>decodeUploadedImage('data:image/png;base64,'+bytes.toString('base64')),{code:'invalid_image_dimensions'});
 assert.throws(()=>decodeUploadedImage(png,{maxBytes:16}),{code:'image_too_large'});
});
test('legacy list parsing preserves strings and cannot throw through bootstrap',()=>{
 assert.deepEqual(parseStringListJson('["Cacao",1,null,{"x":"private"}]'),['Cacao']);
 for(const input of ['{broken','{}','null','42'])assert.deepEqual(parseStringListJson(input),[]);
});
test('sync errors expose protocol codes rather than SQL or arbitrary internal messages',()=>{
 assert.equal(publicSyncError(new Error('version_conflict')),'version_conflict');
 assert.equal(publicSyncError(new Error('Failed query: INSERT private contact@example.test')),'sync_failed');
 assert.equal(publicSyncError({message:'forbidden'}),'sync_failed');
});
test('all non-media API responses are explicitly private and non-cacheable at the worker boundary',()=>{
 const worker=readFileSync(root+'worker/index.ts','utf8');
 assert.match(worker,/pathname\.startsWith\("\/api\/"\) && !pathname\.startsWith\("\/api\/media\/"\)/);
 assert.match(worker,/response\.headers\.set\("cache-control", "private, no-store"\)/);
});

test('public projections are field allowlists, including server-to-client professional props',async()=>{
 const {publicProfessionalRow,publicProjectRow}=await vite.ssrLoadModule('/lib/public-records.ts');
 const common={id:'published',status:'active',ownerId:'PRIVATE_OWNER',revision:'PRIVATE_REVISION',lastOperationId:'PRIVATE_OPERATION',lastOperationHash:'PRIVATE_HASH',futurePrivateColumn:'PRIVATE_FUTURE'};
 for(const projection of [publicProfessionalRow(common),publicProjectRow({...common,hasJson:'[]',needsJson:'[]'})]){
  for(const key of ['ownerId','revision','lastOperationId','lastOperationHash','futurePrivateColumn'])assert.equal(Object.hasOwn(projection,key),false,key);
 }
 assert.match(readFileSync(root+'app/profesionales/page.tsx','utf8'),/initial=\{rows\.map\(publicProfessionalRow\)\}/);
 assert.match(readFileSync(root+'lib/professional-db.ts','utf8'),/publicProfessionalRow\(rows\[0\]\)/);
});
