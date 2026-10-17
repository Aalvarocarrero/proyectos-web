"""Prepare the eight reviewed crop characters using the supplied original logo.
Usage: python3 scripts/prepare-reviewed-sticker-additions.py INPUT_DIR REVIEW_DIR
INPUT_DIR contains the eight original PNGs and Logo_Principal.png.
No image generation: only label-region composition, resizing and encoding.
Run scripts/sticker-packs.py afterwards to regenerate collection archives.
"""
from pathlib import Path
from PIL import Image, ImageDraw
import hashlib, json, io, sys
root=Path(__file__).resolve().parents[1]
source=Path(sys.argv[1]).resolve()
review=Path(sys.argv[2]).resolve();review.mkdir(parents=True,exist_ok=True)
logo_path=source/'Logo_Principal.png'
expected=json.loads((root/'docs/qa/STICKER-ADDITIONS-2026-10-15.json').read_text())
assert hashlib.sha256(logo_path.read_bytes()).hexdigest()==expected['sourceLogoSha256'], 'Use the reviewed official logo file'
for entry in expected['items']:
 assert hashlib.sha256((source/entry['sourceFile']).read_bytes()).hexdigest()==entry['sourceSha256'], 'Source illustration changed'
logo=Image.open(logo_path).convert('RGBA')
# Preserve supplied logo geometry/alpha; use the approved white and Site-green colorway.
logo.putdata([(248,247,242,a) if r>g*1.25 and r>b*1.5 else (30,126,26,a) for r,g,b,a in list(logo.getdata())])
a=logo.getchannel('A');logo=logo.crop(a.point(lambda v:255 if v>16 else 0).getbbox())
# Reviewed rectangular interiors avoid the original white outline and every boot.
regions={
'cosechador-apio':(240,1028,1018,1201),
'cosechadora-apio':(260,1040,995,1202),
'cosechador-cilantro':(208,1009,1055,1205),
'cosechadora-cilantro':(190,1036,1071,1205),
'cosechador-perejil':(190,1004,1068,1201),
'cosechadora-perejil':(212,1018,1052,1205),
'cosechador-fresa':(230,1011,1030,1197),
'cosechadora-fresa':(240,1028,1019,1203),
}
items=[]; provenance=[]
for crop in ['apio','perejil','cilantro','fresa']:
 for gender,role in [('woman','cosechadora'),('man','cosechador')]:
  name=f'{role}-{crop}';src=source/(name+'.png');im=Image.open(src).convert('RGBA')
  box=regions[name];draw=ImageDraw.Draw(im);draw.rectangle(box,fill=(34,29,24,255))
  cleanup={
   'cosechadora-apio':[(914,1034,965,1040)],
   'cosechador-cilantro':[(920,1003,1030,1013)],
   'cosechadora-cilantro':[(930,1028,1020,1037)],
   'cosechador-fresa':[(925,1004,991,1016)],
   'cosechadora-fresa':[(930,1020,987,1036)],
  }.get(name,[])
  for patch in cleanup:draw.rectangle(patch,fill=(34,29,24,255))
  mark=logo.copy();mark.thumbnail((box[2]-box[0]-32,box[3]-box[1]-10),Image.Resampling.LANCZOS)
  im.alpha_composite(mark,(box[0]+(box[2]-box[0]-mark.width)//2,box[1]+(box[3]-box[1]-mark.height)//2))
  # Remove only barely-visible alpha noise at the outer edge, then pad explicitly.
  a=im.getchannel('A');bounds=a.point(lambda v:255 if v>16 else 0).getbbox();im=im.crop(bounds)
  im.save(review/(name+'-review.png'))
  item_id=f'agricultores-cosecha-agricultor-con-{crop}--'+('mujer' if gender=='woman' else 'hombre')
  label=f'{role.capitalize()} de '+('apio criollo' if crop=='apio' else crop)
  item={'id':item_id,'name':label,'familyId':'agricultores-cosecha','familyName':'Cosechadores del campo','aliases':[crop,role,'mujer' if gender=='woman' else 'hombre','arracacha' if crop=='apio' else crop, 'agricultora' if gender=='woman' else 'agricultor'],'pairId':f'agricultores-cosecha-agricultor-con-{crop}','characterVariant':gender}
  for key,directory,span,size,ext in [('download','png',480,512,'png'),('compactDownload','compact',312,512,'png'),('thumbnail','thumbs',240,256,'webp')]:
   fitted=im.copy();fitted.thumbnail((span,span),Image.Resampling.LANCZOS)
   canvas=Image.new('RGBA',(size,size));canvas.alpha_composite(fitted,((size-fitted.width)//2,(size-fitted.height)//2))
   buf=io.BytesIO()
   if ext=='png':canvas.quantize(colors=256,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE).save(buf,format='PNG',optimize=True)
   else:canvas.save(buf,format='WEBP',quality=85,method=6)
   raw=buf.getvalue();digest=hashlib.sha256(raw).hexdigest();rel=f'/sticker-packs/{directory}/{item_id}-{digest[:10]}.{ext}'
   (root/'public'/rel.lstrip('/')).write_bytes(raw)
   item[key]={'src':rel,'width':size,'height':size,'bytes':len(raw)}
   if ext=='png':assert len(raw)<102400
  item['aliases']=list(dict.fromkeys(item['aliases']))
  items.append(item);provenance.append({'id':item_id,'sourceFile':src.name,'sourceSha256':hashlib.sha256(src.read_bytes()).hexdigest(),'logoReplacementInterior':box,'logoCleanupInteriors':cleanup,'downloadSha256':hashlib.sha256((root/'public'/item['download']['src'].lstrip('/')).read_bytes()).hexdigest(),'compactSha256':hashlib.sha256((root/'public'/item['compactDownload']['src'].lstrip('/')).read_bytes()).hexdigest()})
catalog=json.loads((root/'lib/sticker-assets.json').read_text());old=[i for i in catalog['items'] if i['id'] not in {n['id'] for n in items}];catalog['items']=items+old
(root/'lib/sticker-assets.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')
provenance={'operation':'Deterministic resize and official logo composition; no image generation. Original characters preserved.','sourceLogo':'Logo_Principal.png','sourceLogoSha256':hashlib.sha256(logo_path.read_bytes()).hexdigest(),'logoColorVariant':'Site green #1e7e1a; brown lettering mapped to warm white #f8f7f2. Original geometry and alpha retained.','canvas':512,'completeVisibleBox':480,'compactVisibleBox':312,'items':provenance}
(root/'docs/qa/STICKER-ADDITIONS-2026-10-15.json').write_text(json.dumps(provenance,ensure_ascii=False,indent=2)+'\n')
print([(i['name'],i['download']['bytes'],i['compactDownload']['bytes']) for i in items])
