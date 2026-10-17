"""Import verified static example photographs, never user-uploaded files."""
import json,hashlib
from pathlib import Path
from PIL import Image,ImageOps
root=Path(__file__).resolve().parents[1]
source=Path('/workspace/shared/agro-market-photo-mapping/mapping.json')
rows=json.loads(source.read_text())['items'];target=root/'public/photos/market-examples';target.mkdir(parents=True,exist_ok=True)
alt_overrides={'demo-apicultura-extractor':'Extractor de miel. Fotografía ilustrativa de un equipo, no de una oferta disponible.','demo-genetica-tanque':'Recipientes criogénicos. Fotografía ilustrativa; características de una oferta real por verificar.','demo-maquinaria-rastra':'Rastra de discos. Fotografía ilustrativa de maquinaria agrícola, no de una oferta disponible.'}
registry=[]
for row in rows:
 asset=row.get('asset')
 if not asset or row.get('status') not in ('contextual_photo_ready','contextual_photo_ready_after_accepted_reformulation'):continue
 path=Path(asset['local_path']);raw=path.read_bytes()
 if asset.get('sha256') and hashlib.sha256(raw).hexdigest()!=asset['sha256']:raise ValueError('Source checksum mismatch: '+str(path))
 im=ImageOps.exif_transpose(Image.open(path)).convert('RGB')
 if asset.get('recommended_crop_source_pixels'):im=im.crop(tuple(asset['recommended_crop_source_pixels']))
 im.thumbnail((960,720))
 output=target/(row['listing_id']+'.webp');im.save(output,'WEBP',quality=78,method=6)
 if output.stat().st_size>200000:im.save(output,'WEBP',quality=68,method=6)
 registry.append({'id':row['listing_id'],'src':'/photos/market-examples/'+output.name,'alt':alt_overrides.get(row['listing_id']) or asset.get('alt') or row['caption'],'author':asset['author'],'license':asset['license'],'licenseUrl':asset.get('license_url') or asset.get('licenseUrl'),'source':asset.get('source_url') or asset.get('source'),'changes':('Recorte central para mostrar el dron. ' if asset.get('recommended_crop_source_pixels') else '')+'Reducción y conversión a WebP; encuadre adaptable en la interfaz. La adaptación fotográfica conserva la licencia indicada.','width':im.width,'height':im.height,'bytes':output.stat().st_size,'sha256':hashlib.sha256(output.read_bytes()).hexdigest()})
(root/'lib/market-example-photos.json').write_text(json.dumps(registry,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'photos':len(registry),'bytes':sum(x['bytes'] for x in registry)}))
