export function encodeWav(chunks, rate) {
  const length=chunks.reduce((n,c)=>n+c.length,0)
  const input=new Float32Array(length)
  let offset=0;for(const chunk of chunks){input.set(chunk,offset);offset+=chunk.length}
  const frames=Math.min(480000,Math.floor(length*16000/rate))
  if(frames<1600)throw new Error('La grabación es demasiado breve.')
  const buffer=new ArrayBuffer(44+frames*2),v=new DataView(buffer)
  const str=(at,value)=>{for(let i=0;i<value.length;i++)v.setUint8(at+i,value.charCodeAt(i))}
  str(0,'RIFF');v.setUint32(4,36+frames*2,true);str(8,'WAVE');str(12,'fmt ')
  v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,16000,true);v.setUint32(28,32000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,frames*2,true)
  for(let i=0;i<frames;i++){
    const pos=i*rate/16000,lo=Math.floor(pos),mix=pos-lo
    const sample=Math.max(-1,Math.min(1,input[lo]*(1-mix)+(input[Math.min(lo+1,length-1)]||0)*mix))
    v.setInt16(44+i*2,Math.round(sample*(sample<0?32768:32767)),true)
  }
  return buffer
}
