import assert from 'node:assert/strict'
import {createNativeSpeech} from '../jarvis-ui-preview/src/nativeSpeech.js'
import {RepeatGuard,isUsableTranscript} from '../jarvis-ui-preview/src/sessionVad.js'
let played=0,paused=0,revoked=0,cancelled=0,events=[],timer,latest
class FakeAudio{constructor(){latest=this}async play(){played++}pause(){paused++}removeAttribute(){}load(){}}
const fetcher=async path=>path==='/api/session'?{json:async()=>({token:'fixture'})}:{ok:true,blob:async()=>({})}
const voice=createNativeSpeech({projectId:'fixture',onState:e=>events.push(e.state),fetcher,AudioClass:FakeAudio,urlAPI:{createObjectURL:()=> 'blob:fixture',revokeObjectURL:()=>revoked++},synthesis:{cancel:()=>cancelled++},timers:{setTimeout:f=>{timer=f;return 1},clearTimeout:()=>{}}})
await voice.speak('Hola, ¿en qué puedo ayudarte?');assert.equal(played,1);const staleEnd=latest.onended
voice.stop();staleEnd();assert.equal(events.filter(x=>x==='ended').length,0,'late onend cannot resume session');assert.ok(paused);assert.ok(revoked);assert.ok(cancelled)
voice.stop();assert.ok(cancelled>=3,'stop is unconditional even after internal state clears')
await voice.speak('Otra frase');timer();assert.equal(events.at(-1),'error');assert.equal(played,2,'watchdog never retries')
assert.equal(isUsableTranscript('Hola.','Hola, ¿en qué puedo ayudarte?'),false,'short self echo rejected')
assert.equal(isUsableTranscript('¿En qué puedo ayudarte?','Hola, ¿en qué puedo ayudarte?'),false)
assert.equal(isUsableTranscript('Ahora revisa las tareas','Hola, ¿en qué puedo ayudarte?'),true)
const guard=new RepeatGuard();assert.equal(guard.accept('Hola.',1000),true);assert.equal(guard.accept('hola',3000),false)
console.log('PASS: unconditional stop, late events, watchdog, short echo, repeat circuit and no automatic replay')
