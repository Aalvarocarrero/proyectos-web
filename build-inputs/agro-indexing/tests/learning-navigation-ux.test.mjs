import assert from 'node:assert/strict';
import test, {after} from 'node:test';
import {readFileSync} from 'node:fs';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({configFile:false,root,cacheDir:root+'.sites-runtime/test-learning-navigation',server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
after(()=>vite.close());
const {filterLearningArticles}=await vite.ssrLoadModule('/lib/learning-search.ts');
const {libraryLocation,readLibraryLocation}=await vite.ssrLoadModule('/lib/offline-library-navigation.ts');
const entries=[{title:'Producción de cacao',description:'Guía del cultivo',category:'Cultivos',keywords:['cosecha']},{title:'Mi Finca sin señal',description:'Preparar el dispositivo',category:'Mi Finca',keywords:['pesaje','offline']}];
test('learning search ignores accents and casing, matches keywords and combines words and category',()=>{
 assert.equal(filterLearningArticles(entries,' PRODUCCION ')[0],entries[0]);
 assert.equal(filterLearningArticles(entries,'cosecha cacao','Cultivos').length,1);
 assert.equal(filterLearningArticles(entries,'pesaje','Cultivos').length,0);
 assert.equal(filterLearningArticles(entries,'SIN SENAL')[0],entries[1]);
 assert.equal(filterLearningArticles(entries,'  ').length,2);
 assert.equal(filterLearningArticles(entries,'no existe').length,0);
});
test('offline section and guide round-trip safely through a namespaced history hash',()=>{
 assert.deepEqual(readLibraryLocation(libraryLocation('aprende','ganadería & café')), {section:'aprende',detail:'ganadería & café'});
 assert.deepEqual(readLibraryLocation(libraryLocation('post')), {section:'post',detail:''});
 assert.equal(readLibraryLocation('#participar'),null);
 assert.equal(readLibraryLocation('#biblioteca?seccion=unknown'),null);
});
test('guide navigation supplies anchors and return actions without altering approved home',()=>{
 const article=readFileSync(root+'/app/aprende/[slug]/page.tsx','utf8');
 assert.match(article,/aria-label="Contenido de esta guía"/);
 assert.match(article,/id=\{`paso-\$\{index\+1\}`\}/);
 assert.match(article,/Volver a las guías/);
 const offline=readFileSync(root+'/components/offline-library.tsx','utf8');
 assert.match(offline,/addEventListener\('hashchange',navigate\)/);
 assert.match(offline,/removeEventListener\('hashchange',navigate\)/);
 assert.match(offline,/Ver guías incluidas/);
});
test('community detail does not infer a missing farm and empty store requests have an exit',()=>{
 const community=readFileSync(root+'/components/agro-network.tsx','utf8');
 assert.match(community,/singlePost=cacheScope\.startsWith\('post:'\)/);
 assert.match(community,/userId&&!singlePost&&/);
 const store=readFileSync(root+'/components/store-catalog.tsx','utf8');
 assert.match(store,/Volver al catálogo/);
 assert.match(store,/Abrir cotización/);
});
