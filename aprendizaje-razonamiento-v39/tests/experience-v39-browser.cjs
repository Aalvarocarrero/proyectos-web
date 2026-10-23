const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.env.BASE_URL||'http://127.0.0.1:4211';
const dir=process.env.TEST_EVIDENCE_DIR||'/tmp/education-v39';
const progress='education-facilitation-guide:progress';
const companion='education-facilitation-guide:companion';
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const {entriesFor}=await import('../dist/catalog.mjs');
 const errors=[],external=[],metrics={};let checks=0;
 const check=(ok,label)=>{assert.ok(ok,label);checks++};
 fs.mkdirSync(dir,{recursive:true});
 try{
  for(const width of [320,390,768,1440]){
   const context=await browser.newContext({viewport:{width,height:900},hasTouch:true,reducedMotion:'reduce'});
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
   page.on('request',r=>{if(!r.url().startsWith(base))external.push(r.url())});
   await page.goto(base);await page.locator('#welcome-begin').waitFor();
   metrics[width]=await page.evaluate(()=>({visibleActions:[...document.querySelectorAll('#guided-home button')].filter(e=>e.getClientRects().length).length,pageHeight:document.documentElement.scrollHeight}));
   check(metrics[width].visibleActions===5,'home exposes only five navigation/actions '+width);
   check(await page.locator('.welcome-introduction .primary').count()===1,'one main home action '+width);
   check(!await page.locator('#experience-library').isVisible(),'library is optional '+width);
   check(await page.evaluate(()=>localStorage.length===0),'no implicit writes '+width);
   await page.locator('#welcome-begin').focus();await page.keyboard.press('Enter');
   check(await page.locator('[data-band]').count()===6,'all six ages '+width);
   check(await page.locator('#guided-home button:visible').evaluateAll(es=>es.every(e=>e.getBoundingClientRect().height>=44)),'touch targets '+width);
   for(const band of ['18m','2y','3y','5y','7y','12y']){
    await page.locator(`[data-band="${band}"]`).focus();await page.keyboard.press('Enter');
    if(['7y','12y'].includes(band))await page.locator('[data-role=student]').click();
    check(await page.locator('[data-welcome-route]:visible').count()===1,'one primary proposal '+width+band);
    const keys=await page.locator('[data-welcome-route]').evaluateAll(es=>es.map(e=>e.dataset.welcomeRoute).sort());
    check(JSON.stringify(keys)===JSON.stringify(entriesFor(band).map(a=>a.key).sort()),'complete catalog retained '+width+band);
    check((await page.locator('.featured-choice .route-goal').textContent()).length>15,'real objective before entry '+width+band);
    check((await page.locator('.featured-choice .route-first').textContent()).startsWith('Primero:'),'first step visible '+width+band);
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no entry overflow '+width+band);
    if(width===390&&['18m','3y','12y'].includes(band))await page.locator('#guided-home').screenshot({path:`${dir}/after-entry-${band}.png`});
    if(['18m','2y'].includes(band)){
     const before=await page.evaluate(k=>localStorage.getItem(k),progress);
     await page.locator('#welcome-demo').click();
     check((await page.locator('.adult-layer').textContent()).includes('Aparta la pantalla'),'adult prepares physical play '+width+band);
     check(await page.evaluate(k=>localStorage.getItem(k),progress)===before,'preparation leaves progress alone '+width+band);
    }
    await page.locator('.featured-choice').click();
    check(await page.locator('#session-title').evaluate(e=>e===document.activeElement),'activity heading receives focus '+width+band);
    if(['18m','2y'].includes(band)){
     check(await page.locator('#activity-companion').count()===0,'no avatar in adult offline guide '+width+band);
     check(await page.locator('#exercise input,#exercise [data-answer]').count()===0,'no toddler screen task '+width+band);
    }
    await page.locator('#pause-session').click();check(await page.locator('#resume-session').isVisible(),'pause reachable '+width+band);
    await page.locator('#resume-session').click();check(await page.locator('#exercise').isVisible(),'resume reaches activity '+width+band);
    await page.locator('#back-home').click();check(!await page.locator('#experience-library').isVisible(),'home return stays simple '+width+band);
    await page.locator('#welcome-begin').click();await page.locator('#welcome-band').click();
   }
   await page.locator('#welcome-home').click();await page.locator('#welcome-explore').click();
   check(await page.locator('[data-dashboard-area]:visible').count()===8,'all areas visible in library '+width);
   check(await page.locator('[data-dashboard-route^="5y:language-"]:visible').count()===6,'six languages in library '+width);
   await page.locator('#welcome-home').click();
   await page.evaluate(()=>{const elements=[...document.querySelectorAll('#guided-home *')],sizes=elements.map(e=>getComputedStyle(e).fontSize);elements.forEach((e,i)=>e.style.fontSize=`${parseFloat(sizes[i])*2}px`)});
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'200 percent text without horizontal scroll '+width);
   await context.close();
  }
  const context=await browser.newContext({viewport:{width:390,height:900},reducedMotion:'reduce'}),page=await context.newPage();
  await page.goto(base);await page.locator('#welcome-begin').click();await page.locator('[data-band="3y"]').click();await page.locator('.featured-choice').click();
  await page.locator('[data-shape=a]').click();await page.waitForFunction(()=>document.querySelector('#progress-status').textContent.includes('Guardado en este navegador'));
  const raw=await page.evaluate(k=>localStorage.getItem(k),progress);
  await page.goBack();check(await page.locator('.featured-choice').isVisible(),'native Back returns to the chosen proposal');
  check(await page.evaluate(k=>localStorage.getItem(k),progress)===raw,'native Back preserves progress');
  check(await page.evaluate(()=>Object.keys(history.state).join(',')==='educationView'),'history stores only opaque navigation reference');
  await page.goForward();check(await page.locator('[data-shape=a]').getAttribute('aria-pressed')==='true','native Forward restores the activity with its choice');
  await page.locator('#activity-companion > summary').focus();await page.keyboard.press('Enter');await page.keyboard.press('Tab');
  check(await page.locator('#companion-hint').evaluate(e=>e===document.activeElement),'first help action reachable with keyboard');
  check(!await page.locator('#companion-options').evaluate(e=>e.open),'appearance controls stay out of the main task');
  await page.locator('#companion-hint').click();check((await page.locator('#companion-message').textContent()).length>25,'real contextual hint');
  check(await page.evaluate(k=>localStorage.getItem(k),progress)===raw,'hint preserves exact progress bytes');
  check(await page.evaluate(k=>localStorage.getItem(k),companion)===null,'help opening is not an avatar opt-in');
  await page.locator('#activity-companion').screenshot({path:`${dir}/after-help.png`});
  await page.locator('#companion-options summary').click();await page.locator('#companion-show').click();
  check(await page.locator('.companion-figure').count()===1,'explicit avatar choice works');
  await page.locator('#companion-hint').focus();await page.keyboard.press('Escape');
  check(!await page.locator('#activity-companion').evaluate(e=>e.open),'Escape closes help');
  check(await page.locator('#activity-companion > summary').evaluate(e=>e===document.activeElement),'Escape returns launcher focus');
  await page.locator('#back-home').click();await page.locator('#welcome-explore').click();await page.locator('#welcome-home').click();
  check(await page.evaluate(k=>localStorage.getItem(k),progress)===raw,'library round trip preserves progress');
  await page.reload();await page.locator('#welcome-continue').click();
  check(await page.locator('[data-shape=a]').getAttribute('aria-pressed')==='true','reload retains child choice');
  check(!await page.locator('#activity-companion').evaluate(e=>e.open),'avatar preference never opens help automatically');
  await page.locator('#back-home').click();
  const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-transparency',value:'reduce'}]});
  check(await page.locator('.experience-nav').evaluate(e=>getComputedStyle(e).backdropFilter)==='none','reduced transparency has a solid fallback');
  await context.close();check(errors.length===0,'no browser exceptions');check(external.length===0,'no app network requests');
  const report={checks,errors,external,metrics,viewports:[320,390,768,1440],scope:'Actual Chromium interactions and screenshots. Touch, keyboard, simulated accessibility preferences and 200% text. No child/caregiver validation or Safari certification.'};
  fs.writeFileSync(`${dir}/experience-v39-results.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
