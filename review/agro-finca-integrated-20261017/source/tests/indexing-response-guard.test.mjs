import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../lib/indexing-policy.ts',import.meta.url),'utf8').replace('import {SITE_ORIGIN} from "@/lib/site-identity";','const SITE_ORIGIN="https://venezuelaagro.com";');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const exports={};vm.runInNewContext(js,{exports,URL});
const check=(path,status=200,cache=null,enabled=true,origin='https://venezuelaagro.com')=>exports.responseMustRemainNoindex(new URL(path,origin),status,cache,enabled);
test('canonical public response can be indexed only with explicit build switch',()=>{assert.equal(check('/'),false);assert.equal(check('/',200,null,false),true);});
test('preview and alternate host remain excluded even in public build',()=>{for(const origin of ['https://preview.test','http://venezuelaagro.com','https://venezuelaagro.aalvarocarrero.chatgpt.site','https://www.venezuelaagro.com'])assert.equal(check('/',200,null,true,origin),true);});
test('private, API, authentication and demo routes remain excluded',()=>{for(const path of ['/admin','/admin/users','/app','/app-local','/offline','/biblioteca-local','/finca-demo','/finca-modelo','/modelos-finca','/juego-finca','/auth/signin','/api/auth/csrf','/api/bootstrap','/marketplace/publicar','/empresas/registro'])assert.equal(check(path),true,path);});
test('errors, redirects and personalized/no-store responses remain excluded',()=>{for(const status of [301,302,400,401,403,404,500])assert.equal(check('/',status),true);for(const cache of ['private, no-store','no-store','public, no-store','PRIVATE'])assert.equal(check('/',200,cache),true);assert.equal(check('/',200,'public, no-cache, must-revalidate'),false);});
test('security headers derive indexing only after final privacy headers',()=>{const w=fs.readFileSync(new URL('../worker/index.ts',import.meta.url),'utf8');assert.ok(w.lastIndexOf('responseMustRemainNoindex(')>w.lastIndexOf('headers.set("cache-control"'));});

test('personalized directory routes stay out of the candidate sitemap until their anonymous output is separated',()=>{for(const p of ['/profesionales','/profesionales/alvaro-carrero','/red','/red/id','/fincas','/fincas/id','/proyectos'])assert.equal(exports.isPersonalizedPublicRoute(p),true);assert.equal(exports.isPersonalizedPublicRoute('/marketplace'),false);const s=fs.readFileSync(new URL('../app/sitemap.ts',import.meta.url),'utf8');assert.match(s,/!isPrivatePath\(path\)&&!isPersonalizedPublicRoute\(path\)/);});
