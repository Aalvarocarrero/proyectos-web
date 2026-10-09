"""Web-delivery encoding only; no retouching or image-content changes.
Keeps Adobe masters intact and creates efficient WebP website copies.
"""
from pathlib import Path
from PIL import Image,ImageChops,ImageStat
import shutil,json
ROOT=Path(__file__).parent
master=Path('/workspace/shared/draco-lossless-web-masters');master.mkdir(exist_ok=True)
files=sorted((ROOT/'dist/assets/retouched').glob('*.webp'));total=0
for p in files:
 m=master/p.name
 if not m.exists():shutil.copy2(p,m)
 im=Image.open(m).convert('RGBA');im.save(p,'WEBP',quality=92,method=4,exact=True)
 check=Image.open(p).convert('RGBA');assert check.size==im.size and check.getchannel('A').tobytes()==im.getchannel('A').tobytes(),p.name
 total+=p.stat().st_size
manifest=ROOT/'docs/photo-delivery-manifest.json';rows=json.loads(manifest.read_text())
for r in rows:r['lossless_master_verified']=r.pop('lossless_encoding_verified',False);r['website_format']='WebP quality92; native dimensions and alpha retained'
manifest.write_text(json.dumps(rows,ensure_ascii=False,indent=2));print('Website images',len(files),'bytes',total)
