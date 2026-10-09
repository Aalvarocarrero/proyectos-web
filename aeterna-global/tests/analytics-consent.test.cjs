const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const raw = fs.readFileSync('dist/analytics-consent.js','utf8');
function setup({enabled=true,host='aeternaglobalstudio.com',path='/',protocol='https:',choice=null,broken=false}={}) {
  const elements=[]; const listeners={}; const writes=[];
  function el(tag) {return {tag,children:[],hidden:false,dataset:{},listeners:{},setAttribute(){},focus(){this.focused=true},appendChild(e){this.children.push(e);elements.push(e)},addEventListener(t,cb){this.listeners[t]=cb},querySelector(s){if(s==='button')return this.buttons[0];return this.status ||= {}},querySelectorAll(){return this.buttons ||= ['accepted','rejected'].map(c=>Object.assign(el('button'),{dataset:{choice:c}}))}};}
  const document={head:el('head'),body:el('body'),createElement:el};
  Object.defineProperty(document,'cookie',{get(){return '_ga=old; _ga_Z38KJGKPSV=old; other=keep'},set(x){writes.push(x)}});
  let value = choice && JSON.stringify({choice,at:Date.now()}); let reloads=0;
  const window={addEventListener(t,cb){listeners[t]=cb}};
  const localStorage={getItem(){if(broken)throw Error();return value},setItem(k,v){if(broken)throw Error();value=v}};
  const location={hostname:host,pathname:path,protocol,search:'?email=private@example.com&utm_source=private',hash:'#private',reload(){reloads++}};
  const source=enabled?raw.replace('const ENABLED = false;', 'const ENABLED = true;'):raw;
  const context=vm.createContext({window,document,localStorage,location,Date,JSON,Object});
  vm.runInContext(source,context);
  const panel=elements.find(e=>e.id==='aeterna-cookie-panel');
  return {window,document,elements,listeners,writes,panel,choose(c){panel.buttons.find(b=>b.dataset.choice===c).listeners.click()},scripts(){return elements.filter(e=>e.tag==='script')},reloads(){return reloads},rerun(){vm.runInContext(source,context)}};
}
test('release gate blocks loading even with saved acceptance',()=>{const x=setup({enabled:false,choice:'accepted'});assert.equal(x.scripts().length,0)});
test('unknown and rejected consent make no Google calls',()=>{for(const choice of [null,'rejected']){const x=setup({choice});assert.equal(x.scripts().length,0);assert.equal(x.window.dataLayer,undefined)}});
test('accept loads one tag and one sanitised page view',()=>{const x=setup();x.choose('accepted');x.choose('accepted');x.rerun();assert.equal(x.scripts().length,1);assert.equal(x.scripts()[0].referrerPolicy,'no-referrer');const commands=x.window.dataLayer;assert.equal(commands.filter(v=>v[0]==='event'&&v[1]==='page_view').length,1);const config=commands.find(v=>v[0]==='config')[2];assert.equal(config.page_location,'https://aeternaglobalstudio.com/');assert.equal(config.page_referrer,'');assert.equal(config.send_page_view,false);assert.equal(config.allow_google_signals,false);assert.equal(config.allow_ad_personalization_signals,false);assert.equal(JSON.stringify(commands).includes('private'),false)});
test('all preview, booking, quote, unknown and HTTP pages remain untracked',()=>{for(const options of [{host:'aeterna-global.aalvarocarrero.chatgpt.site'},{host:'www.aeternaglobalstudio.com'},{path:'/quote-preview/'},{path:'/booking-preview/'},{path:'/unknown'},{protocol:'http:'}]) {const x=setup({...options,choice:'accepted'});assert.equal(x.scripts().length,0)}});
test('withdraw disables collection, clears only GA cookies and reloads',()=>{const x=setup({choice:'accepted'});x.choose('rejected');assert.equal(x.window['ga-disable-G-Z38KJGKPSV'],true);assert.equal(x.reloads(),1);assert.equal(x.writes.length,6);assert.equal(x.writes.some(v=>v.startsWith('other=')),false)});
test('storage failure starts denied and explicit choice is session-local',()=>{const x=setup({broken:true});assert.equal(x.scripts().length,0);x.choose('accepted');assert.equal(x.scripts().length,1);x.choose('rejected');assert.equal(x.window['ga-disable-G-Z38KJGKPSV'],true);assert.equal(x.reloads(),0)});
test('every HTML page has one local consent loader and stylesheet',()=>{for(const file of fs.readdirSync('dist',{recursive:true}).filter(v=>v.endsWith('.html'))){const html=fs.readFileSync('dist/'+file,'utf8');assert.equal((html.match(/src="\/analytics-consent.js"/g)||[]).length,1,file);assert.equal((html.match(/href="\/analytics-consent.css"/g)||[]).length,1,file);assert.equal(html.includes('googletagmanager.com'),false)}});
