const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const base=process.env.BASE_URL||'http://127.0.0.1:4196';
const evidence=process.env.V37_EVIDENCE_DIR||fs.mkdtempSync(path.join(os.tmpdir(),'education-v37-'));
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 let checks=0;const check=(condition,label)=>{assert.ok(condition,label);checks++};
 try{
  for(const width of [320,390,768,1440]){
   const context=await browser.newContext({viewport:{width,height:1000},hasTouch:true,reducedMotion:'reduce'});
   const page=await context.newPage();await page.goto(base);await page.locator('#welcome-begin').waitFor();
   await page.locator('#welcome-begin').focus();await page.keyboard.press('Enter');
   await page.locator('[data-role="adult"]').focus();await page.keyboard.press('Enter');
   check(await page.locator('.welcome-stage-art').count()===6,'six illustrated age bands '+width);
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no age-selector overflow '+width);
   check(await page.locator('#guided-home button:visible').evaluateAll(es=>es.every(e=>e.getBoundingClientRect().height>=44)),'touch target size '+width);
   if(width===390)await page.locator('#guided-home').screenshot({path:path.join(evidence,'00-age-selector.png')});
   await page.locator('[data-band="18m"]').focus();await page.keyboard.press('Enter');
   check(await page.locator('[data-welcome-route]:visible').count()===1,'one real adult guide '+width);
   check((await page.locator('#guided-home').innerText()).includes('pelota grande y blanda'),'adult cue before entry '+width);
   await page.locator('#welcome-demo').click();
   check((await page.locator('#guided-home').innerText()).includes('Aparta la pantalla'),'adult instructions separated '+width);
   check(await page.evaluate(()=>localStorage.getItem('education-facilitation-guide:progress')===null),'age selection does not change game progress '+width);
   if(width===390)await page.locator('#guided-home').screenshot({path:path.join(evidence,'01-18m-adult-entry.png')});
   await page.locator('[data-welcome-route="18m:original"]').click();
   check(await page.locator('.adult-turns li').count()===4,'real four-step offline guide '+width);
   check(await page.locator('.adult-turns input,.adult-turns [data-quantity-give]').count()===0,'no child task on screen '+width);
   await page.locator('#back-home').click();await page.locator('#welcome-begin').click();await page.locator('#welcome-band').click();
   await page.locator('[data-band="3y"]').click();
   check((await page.locator('#guided-home').innerText()).includes('3–5 años'),'age label '+width);
   check(await page.locator('[data-welcome-route]:visible').count()===1,'one primary 3–5 offer '+width);
   check(await page.locator('.welcome-more summary').isVisible(),'other offers remain accessible '+width);
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no 3–5 overflow '+width);
   if(width===390)await page.locator('#guided-home').screenshot({path:path.join(evidence,'02-3-5-entry.png')});
   await page.locator('#welcome-band').click();await page.locator('[data-band="12y"]').click();
   check((await page.locator('#guided-home h1').innerText()).includes('¿Qué te apetece'),'older-stage headline '+width);
   check(await page.locator('[data-welcome-route]:visible').count()===1,'one main older-stage offer '+width);
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no older-stage overflow '+width);
   if(width===390)await page.locator('#guided-home').screenshot({path:path.join(evidence,'03-13-18-entry.png')});
   await context.close();
  }
  const screenshots=fs.readdirSync(evidence).filter(name=>name.endsWith('.png'));
  check(screenshots.length===4,'four real screenshots created outside repository');
  console.log(JSON.stringify({checks,widths:[320,390,768,1440],screenshots:screenshots.map(name=>path.join(evidence,name)),browser:'Chromium; reduced motion; mouse, touch and keyboard. Not Safari certification.'},null,2));
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});
