import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {adminDocument} from '../src/admin-view.mjs';
import {DEFAULT_CONTENT} from '../src/content-fields.mjs';
const script=readFileSync('public/content-admin.js','utf8');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const boot=(version=0)=>{
 const dom=new JSDOM(adminDocument({version,draft:{...DEFAULT_CONTENT},published:null,publishedVersion:null,updatedAt:null}),{url:'https://example.test/admin',runScripts:'outside-only'});
 dom.window.confirm=()=>true;
 dom.window.eval(script);
 return dom;
};
function input(window,key,value){const field=window.document.querySelector(`[name="${key}"]`);field.value=value;field.dispatchEvent(new window.Event('input',{bubbles:true}));return field;}
function submit(window){window.document.getElementById('content-form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));}

test('editor switches real language sections, tracks dirty state, guards preview and publishes only saved content',async()=>{
 const dom=boot(),{window}=dom,document=window.document;let calls=[];
 window.fetch=async(url,options)=>{
  const body=JSON.parse(options.body);calls.push({url,options,body});
  return {ok:true,json:async()=>({ok:true,state:{version:calls.length,publishedVersion:calls.length===2?2:null,draft:body.content??{...DEFAULT_CONTENT,'en.hero.title':'New English title'}}})};
 };
 assert.equal(document.getElementById('publish').disabled,true);
 document.querySelector('[data-lang=en]').click();assert.equal(document.querySelector('[data-language=es]').hidden,true);assert.equal(document.querySelector('[data-language=en]').hidden,false);assert.match(document.getElementById('preview').href,/lang=en$/);
 input(window,'en.hero.title','New English title');assert.equal(document.getElementById('publish').disabled,true);assert.equal(document.getElementById('preview').getAttribute('aria-disabled'),'true');
 submit(window);assert.equal(document.querySelector('[name="en.hero.title"]').disabled,true);await tick();
 assert.equal(calls[0].options.method,'PUT');assert.equal(calls[0].options.headers['x-alvaro-admin'],'content-v1');assert.equal(calls[0].body.expectedVersion,0);assert.equal(calls[0].body.content['es.hero.title'],DEFAULT_CONTENT['es.hero.title']);assert.equal(calls[0].body.content['en.hero.title'],'New English title');
 assert.equal(document.getElementById('publish').disabled,false);assert.equal(document.querySelector('[name="en.hero.title"]').disabled,false);assert.equal(document.getElementById('preview').getAttribute('aria-disabled'),'false');
 document.getElementById('publish').click();await tick();assert.equal(calls[1].url,'/api/admin/content/publish');assert.deepEqual(calls[1].body,{expectedVersion:1});assert.match(document.getElementById('feedback').textContent,/Publicación confirmada/);dom.window.close();
});

test('conflict retains user text and disables stale save, publication and preview',async()=>{
 const dom=boot(2),{window}=dom,document=window.document;
 window.fetch=async()=>({ok:false,status:409,json:async()=>({ok:false,error:'version_conflict'})});
 input(window,'es.hero.title','Mi trabajo local');submit(window);await tick();
 assert.equal(document.querySelector('[name="es.hero.title"]').value,'Mi trabajo local');
 for(const id of ['save','publish'])assert.equal(document.getElementById(id).disabled,true);
 assert.equal(document.getElementById('reload').hidden,false);assert.equal(document.getElementById('preview').getAttribute('aria-disabled'),'true');assert.match(document.getElementById('feedback').textContent,/Tus cambios siguen aquí/);dom.window.close();
});

test('validation reveals the relevant hidden language and publication cancellation sends nothing',async()=>{
 const dom=boot(1),{window}=dom,document=window.document;let calls=0;
 window.fetch=async()=>{calls++;throw Error('should not send');};
 const english=input(window,'en.hero.title','');english.dispatchEvent(new window.Event('invalid',{bubbles:false,cancelable:true}));
 assert.equal(document.querySelector('[data-language=en]').hidden,false);
 input(window,'en.hero.title',DEFAULT_CONTENT['en.hero.title']);window.confirm=()=>false;document.getElementById('publish').click();await tick();assert.equal(calls,0);dom.window.close();
});

test('server/transport failures retain dirty fields and never display a success',async()=>{
 const dom=boot(),{window}=dom,document=window.document;
 window.fetch=async()=>{throw Error('synthetic offline');};
 input(window,'es.hero.title','Texto pendiente');submit(window);await tick();
 assert.equal(document.querySelector('[name="es.hero.title"]').value,'Texto pendiente');assert.equal(document.getElementById('publish').disabled,true);assert.notEqual(document.getElementById('feedback').textContent,'Borrador guardado. Puedes revisarlo en la vista previa privada.');assert.equal(document.getElementById('save').disabled,false);dom.window.close();
});
