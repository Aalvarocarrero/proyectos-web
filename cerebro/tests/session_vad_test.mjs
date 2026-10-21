import assert from 'node:assert/strict'
import {Segmenter,isUsableTranscript} from '../jarvis-ui-preview/src/sessionVad.js'
import {encodeWav} from '../jarvis-ui-preview/src/audioWav.js'
let starts=0,segments=[]
const vad=new Segmenter(16000,{onStart:()=>starts++,onEnd:x=>segments.push(x),onLevel:()=>{}})
const push=(level,ms,guard=false)=>{for(let i=0;i<ms/10;i++)vad.push(new Float32Array(160).fill(level),guard)}
push(0,1000);assert.equal(starts,0)
push(.2,50);push(0,900);assert.equal(starts,0,'click must not trigger')
push(.15,700);push(0,800);assert.equal(starts,1);assert.equal(segments.length,1)
const audio=encodeWav(segments[0],16000);assert.ok(audio.byteLength>44)
push(.2,22000);assert.ok(segments.length>=2,'long speech bounded');vad.reset()
assert.equal(isUsableTranscript('[Música] [Música]'),false)
assert.equal(isUsableTranscript('Esta es la respuesta hablada','Esta es la respuesta hablada'),false)
assert.equal(isUsableTranscript('Cuál es mi siguiente tarea'),true)
console.log('VAD: silence, transient, segmentation, 20s bound, WAV, music and echo checks passed')
