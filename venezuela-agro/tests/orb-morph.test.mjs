import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const vite = await createServer({ appType: 'custom', configFile: false, root, cacheDir: '/tmp/agro-orb-morph-vite', resolve: { alias: { '@': root } }, server: { middlewareMode: true, hmr: false, ws: false, watch: null } });
after(async () => { await vite.close(); });
const motion = await vite.ssrLoadModule('/lib/orb-morph.ts');
const from = { left: 25, top: 210, width: 340, height: 440 };
const to = { left: 310, top: 96, width: 60, height: 60 };
const near = (actual, expected) => assert.ok(Math.abs(actual-expected) < .0001, `${actual} differs from ${expected}`);
function transform(frame) { return frame.transform.match(/-?[\d.]+(?:e[+-]?\d+)?/g).map(Number).slice(1); }

test('measured endpoint reaches the real orb bounds at every requested responsive width', () => {
  for (const width of [320,390,768,1024,1440]) {
    const source = { left: (width-Math.min(820,width-24))/2, top: 126, width: Math.min(820,width-24), height: 524 };
    const target = { left: width-72, top: 96, width: 60, height: 60 };
    const frames = motion.buildOrbMorphFrames(source,target);
    const first=transform(frames.surface[0]), last=transform(frames.surface.at(-1));
    assert.deepEqual(first,[0,0,0,1,1]);
    const [dx,dy,,sx,sy]=last;
    near(source.width*sx,target.width); near(source.height*sy,target.height);
    near(source.left+source.width/2+dx,target.left+target.width/2);
    near(source.top+source.height/2+dy,target.top+target.height/2);
    assert.equal(frames.surface.at(-1).opacity,1,'surface never fades away before handoff');
  }
});

test('aspect-ratio change keeps a circular endpoint and the destination glyph at natural size', () => {
  const frames = motion.buildOrbMorphFrames(from,to,24);
  frames.surface.forEach((frame,index) => {
    const [, , ,sx,sy] = transform(frame);
    const inverse = frames.glyph[index].transform.match(/scale\(([^,]+), ([^)]+)\)/).slice(1).map(Number);
    near(sx*inverse[0],1); near(sy*inverse[1],1);
  });
  const radius = frames.surface.at(-1).borderRadius.match(/[\d.]+/g).map(Number);
  near(radius[0]*to.width/from.width,30); near(radius[1]*to.height/from.height,30);
  assert.equal(frames.glyph[0].opacity,0); assert.equal(frames.glyph.at(-1).opacity,1);
});

test('bad or zero geometry falls back without NaN transforms', () => {
  assert.equal(motion.buildOrbMorphFrames({...from,width:0},to),null);
  assert.equal(motion.buildOrbMorphFrames(from,{...to,top:NaN}),null);
  assert.equal(motion.IDEA_ORB_MORPH_MS,520);
});

function style(initial={}) {
  const map=new Map(Object.entries(initial));
  return { getPropertyValue:key=>map.get(key)??'', getPropertyPriority:()=>'', setProperty:(key,value)=>map.set(key,value), removeProperty:key=>map.delete(key), map };
}
function fakeElement(rect=from,children={}) {
  const animations=[];
  return {
    style:style({top:'50%',translate:'-50% -50%'}),animations,children,
    getBoundingClientRect:()=>({...rect}),querySelector:selector=>children[selector]??null,
    animate(frames,options) {
      let resolve,reject;
      const finished=new Promise((yes,no)=>{resolve=yes;reject=no;});
      const animation={frames,options,finished,reversed:false,cancelled:false,finish:()=>resolve(),reverse(){this.reversed=true;},cancel(){this.cancelled=true;reject(new Error('cancelled'));}};
      animations.push(animation);return animation;
    },
  };
}
const oldStyle=globalThis.getComputedStyle;
globalThis.getComputedStyle=()=>({borderTopLeftRadius:'24px',backgroundColor:'rgb(40, 55, 30)',color:'rgb(255, 250, 240)',borderColor:'rgb(240, 230, 210)',fontSize:'11px',fontWeight:'800',lineHeight:'12px',gap:'2px'});
after(()=>{if(oldStyle)globalThis.getComputedStyle=oldStyle;else delete globalThis.getComputedStyle;});
function scene() {
  const content=fakeElement(),glyph=fakeElement(),backdrop=fakeElement();
  const source=fakeElement(from,{'[data-orb-morph-content]':content,'[data-orb-morph-glyph]':glyph});
  const target=fakeElement(to);
  return {source,target,content,glyph,backdrop,all:()=>[...source.animations,...content.animations,...glyph.animations,...backdrop.animations]};
}

test('one live surface runs with content, glyph and backdrop; release restores inline styles exactly', async () => {
  const item=scene(),before=new Map(item.source.style.map);
  const run=motion.startOrbMorph({...item,duration:600,reducedMotion:false});
  assert.equal(item.source.animations.length,1);
  assert.equal(item.source.style.getPropertyValue('top'),'210px');assert.equal(item.source.style.getPropertyValue('translate'),'none');
  for(const animation of item.all()) {assert.equal(animation.options.duration,600);animation.finish();}
  assert.equal(await run.finished,'finished');run.release();run.release();
  assert.deepEqual(item.source.style.map,before);
  assert.ok(item.all().every(animation=>animation.cancelled));
});

test('reverse preserves the active animations and resolves without closing the original surface', async () => {
  const item=scene(),run=motion.startOrbMorph({...item,duration:520,reducedMotion:false});
  run.reverse();run.reverse();
  assert.ok(item.all().every(animation=>animation.reversed&&!animation.cancelled));
  for(const animation of item.all())animation.finish();
  assert.equal(await run.finished,'reversed');run.release();
  assert.equal(item.source.style.getPropertyValue('top'),'50%');
});

test('cancel on unmount or installed state settles once and cleans all retained animations', async () => {
  const item=scene(),run=motion.startOrbMorph({...item,duration:600,reducedMotion:false});
  run.cancel();run.cancel();run.reverse();
  assert.equal(await run.finished,'cancelled');
  assert.ok(item.all().every(animation=>animation.cancelled));
  assert.equal(item.source.style.getPropertyValue('translate'),'-50% -50%');
});

test('reduced motion switches without scale animation or inline geometry mutation', async () => {
  const item=scene(),before=new Map(item.source.style.map);
  const run=motion.startOrbMorph({...item,duration:600,reducedMotion:true});
  assert.equal(await run.finished,'finished');assert.equal(item.all().length,0);assert.deepEqual(item.source.style.map,before);
  run.release();assert.deepEqual(item.source.style.map,before);
});

test('animation setup failure restores the live element instead of leaving a frozen panel', async () => {
  const item=scene();item.glyph.animate=()=>{throw new Error('synthetic unsupported animation');};
  const run=motion.startOrbMorph({...item,duration:600,reducedMotion:false});
  assert.equal(await run.finished,'finished');assert.equal(item.source.style.getPropertyValue('top'),'50%');
  assert.ok(item.source.animations.every(animation=>animation.cancelled));
});

test('component contracts hide destination orbs until close and retain drafts and interruption guards', async () => {
  const idea=await readFile(new URL('../components/idea-invitation.tsx',import.meta.url),'utf8');
  const install=await readFile(new URL('../components/install-app-banner.tsx',import.meta.url),'utf8');
  const css=await readFile(new URL('../app/globals.css',import.meta.url),'utf8');
  assert.match(idea,/!open&&\(showOrb/);assert.match(idea,/backdrop: overlayRef.current/);assert.match(idea,/morphRef.current\?\.reverse\(\)/);
  assert.match(install,/startOrbMorph\(\{ source: banner, target: orb/);assert.match(install,/outcome === "reversed"/);
  assert.match(idea,/data-orb-morph-content/);assert.match(install,/data-orb-morph-content/);
  assert.match(idea,/value=\{message\}/);assert.match(idea,/value=\{contact\}/);
  assert.doesNotMatch(css,/idea-dialog-minimize|idea-orb-appear|calc\(50vw - 5rem\)/);
  assert.match(css,/\.glass-action-orb \{[^}]*width:var\(--agro-orb-size\)/);
});

test('mobile viewport updates cannot overwrite an active FLIP and resume after reversal or cancellation', async () => {
  const idea=await readFile(new URL('../components/idea-invitation.tsx',import.meta.url),'utf8');
  assert.match(idea,/if \(!mountedRef.current \|\| closingRef.current\) return;/);
  assert.match(idea,/setViewport\(previous => closingRef.current \|\|/);
  assert.match(idea,/const update=\(\)=>sampleViewport\(\);/);
  assert.match(idea,/outcome === "cancelled" \|\| outcome === "reversed"[\s\S]*?animation.release\(\);[\s\S]*?closingRef.current = false;[\s\S]*?sampleViewport\(\);/);
  assert.match(idea,/mountedRef.current = false; morphRef.current\?\.cancel\(\); morphRef.current = null; closingRef.current = false;/);
});

 test('popup transitions never animate a viewport backdrop or interpolate glass filters', async () => {
  const item=scene(),run=motion.startOrbMorph({...item,duration:520,reducedMotion:false});
  assert.equal(item.backdrop.animations.length,0);
  for(const animation of item.source.animations) for(const frame of animation.frames) {
    assert.equal(frame.backdropFilter,undefined); assert.equal(frame.webkitBackdropFilter,undefined);
  }
  for(const animation of item.all()) animation.finish();
  assert.equal(await run.finished,'finished');run.release();
  const idea=await readFile(new URL('../components/idea-invitation.tsx',import.meta.url),'utf8');
  assert.match(idea,/Dialog.Overlay[^>]*bg-transparent/);
  assert.doesNotMatch(idea,/bg-\[#211d1a\]\/65/);
});

test('terminal retirement never repaints the expanded card even when React removal is delayed',async()=>{
 for(const reducedMotion of [false,true]){
  const item=scene(),run=motion.startOrbMorph({...item,duration:520,reducedMotion});
  for(const animation of item.all())animation.finish();
  assert.equal(await run.finished,'finished');
  run.retire();
  // Model a node retained by React/Presence across any number of paint callbacks.
  for(let frame=0;frame<5;frame++){
   run.release();run.reverse();
   assert.equal(item.source.style.getPropertyValue('visibility'),'hidden');
   assert.equal(item.source.style.getPropertyValue('pointer-events'),'none');
   assert.equal(item.source.style.getPropertyValue('top'),'50%');
  }
 }
});
test('both close paths retire before a synchronous closed commit and automatic install offer cannot reenter',async()=>{
 for(const path of ['install-app-banner','idea-invitation']){
  const source=await readFile(new URL('../components/'+path+'.tsx',import.meta.url),'utf8');
  assert.match(source,/animation\?\.retire\(\);\s*flushSync\(\(\) =>/);
 }
 const install=await readFile(new URL('../components/install-app-banner.tsx',import.meta.url),'utf8');
 assert.match(install,/offer: \(\) => \{\s*if \(phaseRef.current !== "waiting" \|\| installedRef.current\) return;/);
});
