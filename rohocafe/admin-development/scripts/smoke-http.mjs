import assert from 'node:assert/strict';
const base=process.env.ROHO_PREVIEW_URL || 'http://127.0.0.1:4318';
for(const [path,status] of [['/',200],['/admin',200],['/styles.css',200],['/admin.js',200],['/api/catalog-script',200],['/api/admin/catalog',401],['/api/identity',401],['/media/00000000-0000-0000-0000-000000000000.png',404]]) {
 const response=await fetch(base+path);assert.equal(response.status,status,path);const body=await response.text();
 if(path==='/')assert.ok(body.includes('/api/catalog-script'));
 if(path==='/admin')assert.ok(body.includes('Guardar borrador'));
 if(path==='/api/catalog-script'){assert.ok(body.includes('ROHO_PUBLISHED_CATALOG'));assert.equal(response.headers.get('cache-control'),'no-store');}
 console.log(path,response.status);
}
// Local-only fixture header. Never use this to impersonate hosted identity.
if(new URL(base).hostname==='127.0.0.1') {
 const response=await fetch(base+'/api/admin/catalog',{headers:{'oai-authenticated-user-id':'local-test-no-grants'}});
 assert.equal(response.status,503);console.log('Unconfigured administrator allowlist:',response.status);
}
