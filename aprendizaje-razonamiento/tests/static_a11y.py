from html.parser import HTMLParser
from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[1]
html=(root/'dist/index.html').read_text();js='\n'.join(p.read_text() for p in (root/'dist').glob('*.mjs'));css=(root/'dist/styles.css').read_text()
class Parser(HTMLParser):
 def __init__(self):super().__init__();self.nodes=[]
 def handle_starttag(self,tag,attrs):self.nodes.append((tag,dict(attrs)))
p=Parser();p.feed(html);results=[]
def check(name,value):
 assert value,name
 results.append(name)
check('Spanish document language',any(t=='html' and a.get('lang')=='es' for t,a in p.nodes))
check('Single main and h1',sum(t=='main' for t,a in p.nodes)==1 and sum(t=='h1' for t,a in p.nodes)==1)
check('Skip link targets main',any(t=='a' and a.get('href')=='#main' for t,a in p.nodes))
check('Viewport metadata',any(t=='meta' and a.get('name')=='viewport' for t,a in p.nodes))
check('Unique static IDs',len([a['id'] for t,a in p.nodes if 'id'in a])==len(set(a['id'] for t,a in p.nodes if 'id'in a)))
check('Network blocked by CSP',"connect-src 'none'" in html)
check('No remote asset dependencies',not re.search(r'src=[\"\']https?://',html+js) and not any(t=='link' and a.get('href','').startswith('http') for t,a in p.nodes))
check('No remote telemetry or secondary persistence APIs',not re.search(r'\b(sessionStorage|indexedDB|fetch|XMLHttpRequest|sendBeacon|WebSocket)\b',js))
check('Local progress has explicit clear and failure status', 'clearProgress' in js and 'unsupported-version' in js and 'progress-delete-confirm' in js)
check('Native buttons with explicit type',all('type="button"'in x for x in re.findall(r'<button\b[^>]*>',js)))
check('Selection state exposed',js.count('aria-pressed=')>=2)
check('Grouped activities',js.count('<fieldset')>=4 and js.count('<legend')>=4)
check('Polite atomic feedback regions',(js+html).count('aria-live="polite" aria-atomic="true"')>=3)
check('Checkbox labels wrap inputs','<label class="supply"><input' in js)
check('Visible keyboard focus',':focus-visible' in css and 'outline:3px' in css)
check('Reduced motion honored','prefers-reduced-motion:reduce' in css)
check('Mobile breakpoint present','max-width:580px' in css)
check('Color always supplemented with label','${s.name}' in js and 'choice-text' in js)
check('Explicit unvalidated prototype disclosure','no tiene eficacia educativa validada' in html)
check('No real child data inputs','type="text"' not in js and 'textarea' not in js)
activity_js='\n'.join(p.read_text() for p in (root/'dist').glob('*.mjs') if p.name not in ['local-speech.mjs','language-audio.mjs'])
check('No activity timers or autoplay; bounded audio watchdogs only', not re.search(r'\b(setTimeout|setInterval|requestAnimationFrame)\b',activity_js) and not re.search(r'\b(setInterval|requestAnimationFrame)\b',js) and 'autoplay' not in html)
check('No dragging required', 'draggable' not in js and 'data-move' in js)
check('Empty feedback live regions are not display-none', '.feedback:empty{display:none}' not in css)
check('Explicit session pause, resume, finish and restart',all(x in js for x in ['pause-session','resume-session','finish-session','restart-session']))
check('Readable small interface labels', '.stage-button span{font-size:13px' in css and '.supply small{font-size:14px}' in css)
check('Clinical limitations visible before start', 'recomendación clínica' in js and 'duración ideal' in html)
check('Honest curriculum gaps disclosed','todavía no están implementados' in html)
def luminance(h):
 c=[int(h[i:i+2],16)/255 for i in (1,3,5)];c=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in c];return sum(v*w for v,w in zip(c,[.2126,.7152,.0722]))
def contrast(a,b):
 x,y=sorted([luminance(a),luminance(b)]);return (y+.05)/(x+.05)
for name,a,b in [('body','#203c37','#faf8f1'),('secondary','#52655f','#faf8f1'),('button','#ffffff','#235646'),('selection','#203c37','#e4ecd3'),('step number','#526442','#e9eddf')]:check(f'Text contrast {name} at least 4.5:1 ({contrast(a,b):.2f})',contrast(a,b)>=4.5)
report={'passed':len(results),'checks':results,'limit':'Static inspection only. Does not establish WCAG conformance, real layout, keyboard behavior, assistive technology support or device compatibility.'};(root/'docs/static-a11y-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
