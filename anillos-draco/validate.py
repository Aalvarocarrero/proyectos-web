from pathlib import Path
from html.parser import HTMLParser
import json
base=Path(__file__).parent/'dist'
class Check(HTMLParser):
 def __init__(self): super().__init__();self.h1=0;self.title=0;self.ids=[];self.refs=[]
 def handle_starttag(self,tag,a):
  a=dict(a)
  if tag=='h1': self.h1+=1
  if tag=='title': self.title+=1
  if 'id' in a:self.ids.append(a['id'])
  for k in ['href','src']:
   if a.get(k,'').startswith('/') and not a[k].startswith('//'): self.refs.append(a[k].split('#')[0])
for f in base.rglob('*.html'):
 c=Check();c.feed(f.read_text());assert c.h1==1,(f,c.h1);assert c.title==1;assert len(c.ids)==len(set(c.ids)),f
 for ref in c.refs:
  p=base/ref.lstrip('/');assert p.exists(),(f,ref)
 print('PASS',f.relative_to(base))
json.loads((base/'catalog.json').read_text());print('PASS catalog JSON, local references, headings, unique IDs')
