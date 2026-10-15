// Run only against an ephemeral local compiled Worker with fixture-owner and empty D1/R2.
import assert from 'node:assert/strict';
import template from '../server/home-template.mjs';
const base=process.env.AETERNA_TEST_ORIGIN||'http://127.0.0.1:4325';
assert.equal(new URL(base).hostname,'127.0.0.1','Never run this mutating fixture against a hosted site.');
const owner={'oai-authenticated-user-id':'fixture-owner'};
const get=(path,headers=owner)=>fetch(base+path,{headers});
const post=(path,body)=>fetch(base+path,{method:'POST',headers:{...owner,Origin:base,'X-Content-Admin':'1','Content-Type':'application/json'},body:JSON.stringify(body)});
for(const [path,status] of [['/',200],['/admin',401],['/api/admin/content',401],['/api/admin/media',401],['/api/admin/revisions',401],['/?content-preview=1',401],['/media/12345678-1234-1234-1234-123456789abc.png',404],['/maternity-gold-coast/',200],['/booking-preview/',200],['/quote-preview/',200],['/menus/menu-world.js?v=5',200],['/content-admin.js',200],['/content-admin.css',200],['/content-gallery.js',200]]){const response=await get(path,{});assert.equal(response.status,status,path);if(path==='/')assert.equal(await response.text(),template);console.log(path,status);}
assert.equal((await get('/api/admin/content',{'oai-authenticated-user-id':'another-user'})).status,403);
const initial=await(await get('/api/admin/content')).json();assert.equal(initial.version,0,'Fixture database must be empty.');
const content={...initial.draft,service1Title:'Local runtime proof',portfolioText3:'Runtime gallery proof'};
let response=await post('/api/admin/content',{action:'save',expectedVersion:0,content});assert.equal(response.status,200);assert.equal((await response.json()).version,1);
assert.ok(!(await(await get('/',{})).text()).includes('Local runtime proof'));
assert.ok((await(await get('/?content-preview=1')).text()).includes('Local runtime proof'));
assert.equal((await post('/api/admin/content',{action:'save',expectedVersion:0,content})).status,409);
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
response=await fetch(base+'/api/admin/media',{method:'POST',headers:{...owner,Origin:base,'X-Content-Admin':'1','Content-Type':'image/png'},body:png});assert.equal(response.status,201);const image=await response.json();
assert.equal((await get(image.image,{})).status,404);assert.equal((await get(image.preview,{})).status,401);assert.equal((await get(image.preview)).status,200);
content.featureImage=image.image;response=await post('/api/admin/content',{action:'publish',expectedVersion:1,content});assert.equal(response.status,200);
assert.ok((await(await get('/',{})).text()).includes('Local runtime proof'));assert.equal((await get(image.image,{})).status,200);
assert.equal((await post('/api/admin/restore',{version:0,expectedVersion:2})).status,200);
let state=await(await get('/api/admin/content')).json();assert.equal(state.draft.service1Title,initial.draft.service1Title);assert.equal(state.published.service1Title,'Local runtime proof');assert.equal(state.version,3);
assert.equal((await(await get('/api/admin/revisions')).json()).length,3);
console.log('PASS compiled Worker: real local D1 save/reload/CAS/history/restore; R2 upload/privacy/publish; preserved public routes; anonymous and non-owner denial.');
