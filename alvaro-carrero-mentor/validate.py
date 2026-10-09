from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
class Check(HTMLParser):
 def __init__(self):
  super().__init__(); self.ids=[]; self.refs=[]; self.h1=0; self.labels=[]; self.controls=[]; self.label_depth=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a: self.ids.append(a['id'])
  if tag=='h1': self.h1+=1
  if tag=='label':
   self.label_depth+=1
   if 'for' in a:self.labels.append(a['for'])
  if tag in ('input','select','textarea') and a.get('type')!='hidden':
   self.controls.append((a,self.label_depth>0))
  for k in ('src','href'):
   if k in a:self.refs.append(a[k])
 def handle_endtag(self,tag):
  if tag=='label':self.label_depth-=1
root=Path('public').resolve(); pages={}
for f in root.rglob('*.html'):
 c=Check();c.feed(f.read_text());pages[f]=c
 assert len(c.ids)==len(set(c.ids)),f'Duplicate ID: {f}'
 assert c.h1==1,f'H1: {f}'
 for a,nested in c.controls:
  assert nested or a.get('id') in c.labels or a.get('aria-label') or a.get('aria-labelledby'),f'Unlabeled control: {f} {a}'
for f,c in pages.items():
 for v in c.refs:
  u=urlsplit(v)
  if u.scheme or u.netloc:continue
  target=(root/u.path.lstrip('/') if u.path.startswith('/') else f.parent/u.path) if u.path else f
  target=target.resolve()
  assert target.exists(),f'{f}: missing {v}'
  if target.is_dir():target=target/'index.html'
  if u.fragment and target in pages:assert unquote(u.fragment) in pages[target].ids,f'{f}: missing anchor {v}'
 print('PASS',f.relative_to(root),': local assets, routes, cross-page anchors, IDs, labels, H1')
assert len(pages)==22
for rel in ('comunidad/index.html','en/community/index.html'):
 s=(root/rel).read_text()
 assert 'class="seva-form formkit-form kit-live"' in s
 assert '<fieldset disabled>' not in s
 assert 'name="email_address" required type="email"' in s
 assert 'value="24349092" required' in s
 for tag in ['24349010','24349011','24349012']:
  assert ('value="'+tag+'"') in s
  assert ('value="'+tag+'" checked') not in s
print('PASS: 22 routes; verified Kit field IDs, separate unchecked consent, required adult self-declaration')
