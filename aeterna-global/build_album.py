from pathlib import Path
from PIL import Image
import json,re,html,shutil
P=Path(__file__).parent;D=P/'dist';A=D/'assets/maternity';A.mkdir(parents=True,exist_ok=True)
S=Path('/workspace/shared/maternity-gold-coast/edited')
manifest=[]
# Source masters stay separate; only resized delivery encodings enter the website.
for i,f in enumerate(sorted(S.glob('*.png')),1):
 im=Image.open(f).convert('RGB'); w,h=im.size; versions={}
 for target in (640,1280,1920):
  copy=im.copy();copy.thumbnail((target,target));name=f'gold-coast-maternity-{i:02d}-{target}.webp';dest=A/name
  if not dest.exists():copy.save(dest,'WEBP',quality=88,method=6)
  versions[target]={'url':'/assets/maternity/'+name,'width':copy.width,'height':copy.height,'bytes':dest.stat().st_size}
 manifest.append({'number':i,'original':f.name,'width':w,'height':h,'versions':versions})
(D/'album.json').write_text(json.dumps(manifest,indent=2));(P/'docs/album-manifest.json').write_text(json.dumps(manifest,indent=2))
def img(n,cls='',eager=False):
 p=manifest[n-1];v=p['versions'];ss=', '.join(x['url']+' '+str(x['width'])+'w' for x in v.values());alt='Maternity portrait by the ocean at sunset, Gold Coast — photograph '+str(n)
 return f'<img class="{cls}" src="{v[1280]["url"]}" srcset="{ss}" sizes="(max-width: 650px) 100vw, (max-width: 1000px) 50vw, 33vw" width="{p["width"]}" height="{p["height"]}" alt="{alt}" '+('fetchpriority="high"' if eager else 'loading="lazy"')+' decoding="async">'
base=(P/'source/home-base.html').read_text();base=base.replace('</head>','<meta name="robots" content="noindex,nofollow"><link rel="stylesheet" href="/album.css"></head>')
base=base.replace('<a href="#ag-work">Our approach</a>','<a href="#ag-work">Our approach</a><a href="/maternity-gold-coast/">Maternity album</a>')
feature='''<section class="maternity-feature ag-section" id="maternity-session"><a class="maternity-feature-photo" href="/maternity-gold-coast/" aria-label="Explore the Gold Coast maternity album">'''+img(16)+'''</a><div class="maternity-feature-copy"><div class="ag-eyebrow">A real session · Gold Coast</div><h2>Before the world<br>meets you.</h2><p>Salt air, soft evening light and a moment worth keeping. Explore a complete maternity session photographed on the Gold Coast.</p><a class="ag-action" href="/maternity-gold-coast/">Explore the 22-photo album</a><span class="session-meta">MATERNITY PHOTOGRAPHY · COASTAL PORTRAITS</span></div></section>'''
base=base.replace('<section class="ag-section about-story"',feature+'<section class="ag-section about-story"',1)
base=base.replace('<article><img src="assets/family.jpg" alt="Dirección visual ilustrativa para maternidad y recién nacidos"><h3>For your family</h3><p>Warmth · Simplicity · Natural light</p></article>','<article><a href="/maternity-gold-coast/">'+img(3)+'<h3>Maternity on the Gold Coast</h3></a><p>Our photography · View the real session</p></article>')
base=base.replace('Concept imagery · A glimpse of our creative direction.','Food and event images illustrate our creative direction. The maternity session is our own photography.')
def dimensions(match):
 tag=match.group(0)
 if 'width=' in tag:return tag
 src=re.search(r'src="([^"]+)"',tag)
 if src and not src.group(1).startswith('http'):
  im=Image.open(D/src.group(1).lstrip('/'));return tag[:-1]+f' width="{im.width}" height="{im.height}">'
 return tag
base=re.sub(r'<img[^>]+>',dimensions,base)
(D/'index.html').write_text(base)
style=re.search(r'<style>(.*?)</style>',base,re.S).group(0)
header=re.search(r'<header class="ag-header">.*?</header>',base,re.S).group(0).replace('href="#top"','href="/"')
header=re.sub(r'href="#([^"]+)"',r'href="/#\1"',header)
footer=re.search(r'<footer class="ag-footer">.*?</footer>',base,re.S).group(0).replace('href="#top"','href="/"')
wa='https://wa.me/61415979973?text=Hi%20Aeterna%20Global%2C%20I%20saw%20your%20Gold%20Coast%20maternity%20album%20and%20would%20like%20to%20ask%20about%20a%20session.'
order=[16,2,21,1,3,11,13,15,7,17,8,5,4,10,19,9,12,14,20,22,6,18]
photos=''.join('<figure class="album-item"><a href="'+manifest[n-1]['versions'][1920]['url']+'" data-photo="'+str(n)+'" aria-label="Open photograph '+str(n)+'">'+img(n)+'</a><figcaption><span>'+str(k+1).zfill(2)+'</span><span>Gold Coast · Maternity</span></figcaption></figure>' for k,n in enumerate(order))
structured={'@context':'https://schema.org','@type':'ImageGallery','name':'Gold Coast Maternity Photography — Aeterna Global','description':'A real coastal maternity session photographed on the Gold Coast, Australia.','inLanguage':'en-AU','numberOfItems':22,'creator':{'@type':'Organization','name':'Aeterna Global'}}
head='<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Gold Coast Maternity Photography | Aeterna Global</title><meta name="description" content="Explore a real Gold Coast maternity photography session: 22 coastal portraits in natural evening light by Aeterna Global. Enquire about your session."><meta name="theme-color" content="#111214"><meta property="og:title" content="Before the world meets you — Aeterna Global"><meta property="og:description" content="A real maternity session on the Gold Coast. Explore the album."><meta property="og:type" content="website"><meta property="og:locale" content="en_AU"><link rel="icon" href="/assets/favicon.svg">'+style+'<link rel="stylesheet" href="/album.css"><script src="/album.js" defer></script><script type="application/ld+json">'+json.dumps(structured)+'</script></head><body><a class="skip" href="#album-main">Skip to maternity album</a><div id="aeterna-preview"><div class="ag-site">'+header
body='''<main id="album-main"><section class="album-hero"><div class="album-intro"><a class="album-back" href="/">Back to Aeterna</a><div class="ag-eyebrow">Maternity · Gold Coast, Australia</div><h1>Before the world<br><em>meets you.</em></h1><p>A quiet chapter. An unforgettable place.<br>Coastal maternity portraits in the light of the evening.</p><div class="album-hero-actions"><a class="ag-action" href="#photographs">Explore the session</a><a class="album-text-link" href="'''+wa+'''" target="_blank" rel="noopener">Enquire about your session</a></div><div class="album-details"><span>22 photographs</span><span>Natural light</span><span>Aeterna Global</span></div></div><div class="album-hero-photo">'''+img(16,'',True)+'''</div></section><section class="album-story"><span class="ag-eyebrow">The session</span><p>From gentle waves to the last glow over the coast. A collection of portraits that holds on to this moment, just as it felt.</p></section><section class="album-section" id="photographs" aria-labelledby="album-title"><div class="album-heading"><h2 id="album-title">A chapter to keep.</h2><p>22 photographs · Select a photograph to view it in full.</p></div><div class="album-grid">'''+photos+'''</div></section><section class="album-enquire"><span class="ag-eyebrow">Your own story</span><h2>Let’s make something<br>you’ll want to keep.</h2><p>Tell us about your preferred date and the kind of session you have in mind. We’ll talk through availability, location and the details together.</p><div class="album-hero-actions"><a class="ag-action" href="'''+wa+'''" target="_blank" rel="noopener">Enquire on WhatsApp</a><a class="album-text-link" href="https://ig.me/m/aeterna.global" target="_blank" rel="noopener">Message on Instagram</a></div></section></main>'''
dialog='''<dialog class="album-lightbox" id="album-lightbox" aria-label="Gold Coast maternity photographs"><div class="lightbox-bar"><p id="lightbox-count" aria-live="polite"></p><button id="lightbox-close" aria-label="Close photograph">Close ×</button></div><div class="lightbox-stage"><button id="lightbox-prev" aria-label="Previous photograph">‹</button><img id="lightbox-photo" alt=""><button id="lightbox-next" aria-label="Next photograph">›</button></div><p class="lightbox-hint">Use the arrows or swipe to explore · Escape to close</p></dialog>'''
page=D/'maternity-gold-coast';page.mkdir(exist_ok=True);(page/'index.html').write_text(head+body+footer+'</div></div>'+dialog+'</body></html>')
(D/'robots.txt').write_text('User-agent: *\nDisallow: /\n# Private owner review\n')
print('Built real 22-photo album; '+str(sum(v['bytes'] for p in manifest for v in p['versions'].values()))+' image bytes in all sizes.')
