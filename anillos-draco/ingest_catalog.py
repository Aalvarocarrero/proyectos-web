from pathlib import Path
import json,hashlib,unicodedata,re
from PIL import Image,ImageOps
ROOT=Path(__file__).parent
out=[]; seen={}; provenance=[]
upgrade_file=Path('/workspace/shared/draco-drive-catalog/existing-image-upgrades.json')
upgrades=json.loads(upgrade_file.read_text()) if upgrade_file.exists() else {}
def category(name):
 n=unicodedata.normalize('NFKD',name).encode('ascii','ignore').decode().lower()
 if any(t in n for t in ['dragon','dracon','bestia alada']):return 'Dragones'
 if any(t in n for t in ['serpiente','cobra','anaconda','piton','cascabel']):return 'Serpientes'
 if any(t in n for t in ['calavera','alma perdida','demoni','caos','siniestra']):return 'Oscuros'
 if any(t in n for t in ['alas','angel','pluma','vuelo']):return 'Alas'
 if any(t in n for t in ['aguila','buho','bufalo','conejo','gato','pulpo','felin','leon','lobo','tigre']):return 'Naturaleza'
 return 'Símbolos'
assets=ROOT/'dist/assets/productos';assets.mkdir(parents=True,exist_ok=True)
sources=sorted(Path('/workspace/shared').glob('draco-catalog-batch*/catalog-products.json'))
new_source=Path('/workspace/shared/draco-catalog-drive-new/catalog-products.json')
if new_source.exists():sources.append(new_source)
for f in sources:
 for p in json.loads(f.read_text()):
  image=Path(p.get('primary_image_path') or p['image_path']);h=hashlib.sha256(image.read_bytes()).hexdigest();pid=p['id']
  if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',pid):raise ValueError('Unsafe product ID')
  if h in seen and seen[h]==pid:
   provenance.append({'batch':f.parent.name,'id':pid,'duplicate_of':seen[h]});continue
  if pid in [x['id'] for x in out]:raise ValueError('Conflicting ID '+pid)
  seen[h]=pid
  if pid in upgrades:image=Path(upgrades[pid]['local_path'])
  im=ImageOps.exif_transpose(Image.open(image));im.thumbnail((1200,1200));dest=assets/(pid+'.webp');im.save(dest,'WEBP',quality=88)
  desc=p.get('description') or p.get('description_from_visual_inspection') or ''
  if isinstance(desc,dict):raise ValueError('Unexpected description')
  entry={'id':pid,'share_id':hashlib.sha256(pid.encode()).hexdigest()[:8],'name':p['name'] if p['name'].startswith('Anillo ') else 'Anillo '+p['name'],'category':category(p['name']),'description':desc,'image':'/assets/productos/'+dest.name,'image_width':im.width,'image_height':im.height,'material':'Zamak' if 'zamak' in str(p.get('material_if_explicit') or p.get('material_as_stated_in_documents') or '').lower() else None,'adjustable':p.get('adjustable_as_stated'),'price':p.get('price'),'currency':'COP' if p.get('price') is not None else None,'stock':None,'url':'/producto/'+pid+'/'}
  out.append(entry);provenance.append({'batch':f.parent.name,'source':p,'published_id':pid,'image_sha256':h})
commerce=json.loads((ROOT/'data/commerce.json').read_text()) if (ROOT/'data/commerce.json').exists() else None
if commerce:
 for entry in out:entry.update(price=commerce['price'],currency=commerce['currency'],shipping_cost=commerce['shipping_cost'],shipping_country=commerce['shipping_country'])
photo_manifest=ROOT/'data/retouched.json'
if photo_manifest.exists():
 photo_map=json.loads(photo_manifest.read_text())
 for entry in out:
  if entry['id'] in photo_map:entry.update(photo_map[entry['id']])
from sku_registry import apply_skus
apply_skus(out)
out.sort(key=lambda x:x['name'])
(ROOT/'data/catalog.json').write_text(json.dumps(out,ensure_ascii=False,indent=2));(ROOT/'docs/catalog-provenance.json').write_text(json.dumps(provenance,ensure_ascii=False,indent=2));print('Imported',len(out),'unique image/model entries from',len(provenance),'source records')
