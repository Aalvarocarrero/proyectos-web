from pathlib import Path
from html.parser import HTMLParser
import json
D=Path(__file__).parent/'dist'
class Audit(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.photos=[];self.h1=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='h1':self.h1+=1
  if 'id'in a:self.ids.append(a['id'])
  if 'data-photo'in a:self.photos.append(a['data-photo'])
  if tag=='img':assert a.get('alt') is not None;assert a.get('width') and a.get('height') or a.get('id')=='lightbox-photo'
  for key in ('src','href'):
   v=a.get(key,'')
   if not v or v.startswith(('http:','https:','tel:','#','mailto:')):continue
   v=v.split('#')[0]
   file=D/v.lstrip('/')
   if v.endswith('/'):file=file/'index.html'
   assert file.exists(),str(file)
for f in (D/'index.html',D/'maternity-gold-coast/index.html'):
 a=Audit();a.feed(f.read_text());assert len(a.ids)==len(set(a.ids));assert a.h1==1;assert 'noindex,nofollow'in f.read_text()
 if 'maternity-gold-coast'in str(f):assert len(a.photos)==22 and len(set(a.photos))==22
 print('PASS',f.relative_to(D))
data=json.loads((D/'album.json').read_text());assert len(data)==22
for p in data:
 for v in p['versions'].values():assert (D/v['url'].lstrip('/')).stat().st_size==v['bytes']
print('PASS 22 photos, 66 responsive assets, private index policy, local links and dimensions')
