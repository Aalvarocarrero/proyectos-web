// Energy/hysteresis design informed by adewaskar/jarvis src/lib/vad.ts (MIT).
// PCM segmentation is independent of browser SpeechRecognition and cloud STT.
export class Segmenter {
 constructor(rate,{onStart,onEnd,onLevel}){this.rate=rate;this.h={onStart,onEnd,onLevel};this.floor=.004;this.reset()}
 reset(){this.chunks=[];this.pre=[];this.preFrames=0;this.frames=0;this.quiet=0;this.onset=0;this.speaking=false}
 push(samples,guard=false){
  let sum=0;for(const x of samples)sum+=x*x;const rms=Math.sqrt(sum/samples.length)
  const ms=samples.length/this.rate*1000
  this.h.onLevel(Math.min(1,rms*12))
  const threshold=Math.max(.009,this.floor*2.6)*(guard?2.4:1)
  if(!this.speaking){
   this.pre.push(samples);this.preFrames+=samples.length
   while(this.preFrames>this.rate*.22&&this.pre.length>1)this.preFrames-=this.pre.shift().length
   if(rms>threshold)this.onset+=ms
   else {this.onset=0;this.floor+=(rms-this.floor)*(rms<this.floor?.02:.0008)}
   if(this.onset>=120){this.speaking=true;this.chunks=this.pre;this.frames=this.preFrames;this.pre=[];this.preFrames=0;this.h.onStart()}
  }else{
   this.chunks.push(samples);this.frames+=samples.length
   this.quiet=rms>threshold*.6?0:this.quiet+ms
   if(this.quiet>=750||this.frames/this.rate>=20){const chunks=this.chunks;this.reset();this.h.onEnd(chunks)}
  }
 }
}
export function isUsableTranscript(text,lastSpoken=''){
 if(typeof text!=='string')return false
 const cleaned=text.replace(/\[[^\]]*\]|\([^)]*\)/g,'').trim()
 if(cleaned.length<2||/^(gracias por ver|suscr[ií]bete|subt[ií]tulos)/i.test(cleaned))return false
 const words=s=>s.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu)||[]
 const a=words(cleaned),b=new Set(words(lastSpoken));return !(a.length>=1&&b.size&&a.filter(w=>b.has(w)).length/a.length>.85)
}

export class RepeatGuard {
 constructor(){this.last='';this.at=0}
 accept(text,now){const value=text.toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu,'');if(value===this.last&&now-this.at<12000)return false;this.last=value;this.at=now;return true}
}
