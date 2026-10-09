"""Import Adobe-edited deliverables and encode lossless web assets.
No retouching, masking, cropping or tonal edits are performed here.
Pixel equality is verified after lossless format encoding.
"""
from pathlib import Path
from PIL import Image,ImageChops
import json,math
ROOT=Path(__file__).parent
outdir=ROOT/'dist/assets/retouched';outdir.mkdir(parents=True,exist_ok=True)
photos={};sources=[];missing=[]
for group in sorted(Path('/workspace/shared/draco-retouched').glob('group-*')):
 mf=group/'manifest.json'
 if not mf.exists():mf=group/'results.json'
 if not mf.exists():continue
 rows=json.loads(mf.read_text());rows=rows.get('results',[]) if isinstance(rows,dict) else rows
 for r in rows:
  id=r['id'];src=Path(r.get('path') or r.get('pendingPath') or group/(id+'.png'))
  if not src.exists():missing.append(id);continue
  im=Image.open(src);im.load();original=im.convert('RGBA');alpha=original.getchannel('A');bbox=alpha.getbbox();assert bbox,(id,'empty alpha')
  transparent=alpha.getextrema()[0]<255
  scale=1.;x=y=0.
  if transparent:
   w,h=im.size;left,top,right,bottom=bbox;ratio=max(right-left,bottom-top)/max(w,h);scale=min(2.0,max(.55,.76/ratio));x=-(((left+right)/2-w/2)/max(w,h))*scale*100;y=-(((top+bottom)/2-h/2)/max(w,h))*scale*100
  dst=outdir/(id+'.webp');original.save(dst,'WEBP',lossless=True,quality=100,method=6,exact=True)
  decoded=Image.open(dst).convert('RGBA');assert decoded.size==original.size and original.tobytes()==decoded.tobytes(),(id,'lossless check')
  photos[id]={'image':'/assets/retouched/'+dst.name,'image_width':im.width,'image_height':im.height,'retouched':True,'photo_alpha':transparent,'photo_scale':round(scale,4),'photo_x':round(x,4),'photo_y':round(y,4),'photo_fallback':bool(r.get('fallback')) or 'fallback' in src.name}
  sources.append({'id':id,'adobe_file':src.name,'width':im.width,'height':im.height,'alpha':transparent,'lossless_encoding_verified':True,'faithful_fallback':photos[id]['photo_fallback']})
cat_path=ROOT/'data/catalog.json';catalog=json.loads(cat_path.read_text())
for p in catalog:
 if p['id'] in photos:p.update(photos[p['id']])
cat_path.write_text(json.dumps(catalog,ensure_ascii=False,indent=2));(ROOT/'data/retouched.json').write_text(json.dumps(photos,ensure_ascii=False,indent=2));(ROOT/'docs/photo-delivery-manifest.json').write_text(json.dumps(sources,ensure_ascii=False,indent=2))
print(json.dumps({'imported':len(photos),'missing':missing,'not_yet_processed':[p['id'] for p in catalog if p['id'] not in photos]},ensure_ascii=False))
