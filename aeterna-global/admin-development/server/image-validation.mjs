import { HttpError } from './content-service.mjs';
export function inspectImage(bytes, declaredType) {
  const b=new Uint8Array(bytes), d=new DataView(bytes);
  if(b.length<24||b.length>5*1024*1024) throw new HttpError(400,'La imagen debe tener un máximo de 5 MB.');
  let type,extension,width,height;
  if(b[0]===137&&b[1]===80&&b[2]===78&&b[3]===71&&b[4]===13&&b[5]===10&&b[6]===26&&b[7]===10&&String.fromCharCode(...b.slice(12,16))==='IHDR') {
    if(b.length<45||d.getUint32(8)!==13||String.fromCharCode(...b.slice(-8,-4))!=='IEND')throw new HttpError(400,'PNG incompleto.');let offset=8,hasPixels=false,ended=false;
    while(offset+12<=b.length){const length=d.getUint32(offset),kind=String.fromCharCode(...b.slice(offset+4,offset+8));if(offset+12+length>b.length)throw new HttpError(400,'PNG incompleto.');if(kind==='acTL'||kind==='fcTL'||kind==='fdAT')throw new HttpError(400,'Usa una imagen estática, sin animación.');if(kind==='IDAT'&&length>0)hasPixels=true;if(kind==='IEND'){if(length!==0||offset+12!==b.length)throw new HttpError(400,'PNG inválido.');ended=true;break;}offset+=length+12;}
    if(!hasPixels||!ended)throw new HttpError(400,'PNG incompleto.');type='image/png';extension='png';width=d.getUint32(16);height=d.getUint32(20);
  } else if(b[0]===255&&b[1]===216&&b[2]===255) {
    if(b[b.length-2]!==255||b[b.length-1]!==217)throw new HttpError(400,'JPEG incompleto.');type='image/jpeg';extension='jpg'; let i=2;
    while(i<b.length-9) { if(b[i]!==255){i++;continue;} const marker=b[i+1]; if(marker===216||marker===217){i+=2;continue;} const length=d.getUint16(i+2);if(length<2||i+length+2>b.length)break; if([192,193,194].includes(marker)){height=d.getUint16(i+5);width=d.getUint16(i+7);break;}i+=length+2; }
  } else if(String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP') {
    if(d.getUint32(4,true)+8!==b.length)throw new HttpError(400,'WebP incompleto.');type='image/webp';extension='webp';const chunk=String.fromCharCode(...b.slice(12,16));
    if(chunk==='VP8X'&&b.length>=30){ if(b[20]&2) throw new HttpError(400,'Usa una imagen estática, sin animación.');width=1+b[24]+(b[25]<<8)+(b[26]<<16);height=1+b[27]+(b[28]<<8)+(b[29]<<16); }
    else if(chunk==='VP8 '&&b.length>=30&&b[23]===157&&b[24]===1&&b[25]===42){width=d.getUint16(26,true)&16383;height=d.getUint16(28,true)&16383;}
    else if(chunk==='VP8L'&&b.length>=25&&b[20]===47){width=1+b[21]+((b[22]&63)<<8);height=1+(b[22]>>6)+(b[23]<<2)+((b[24]&15)<<10);}
  }
  if(!type||type!==declaredType||!width||!height||width>6000||height>6000||width*height>24000000) throw new HttpError(400,'Usa PNG, JPEG o WebP estático válido, máximo 6000 px por lado y 24 megapíxeles.');
  return {type,extension,width,height};
}
