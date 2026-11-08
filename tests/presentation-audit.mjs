/* Presentation readiness check: real Chromium interactions at desktop and mobile.
   All external services are blocked deliberately. This checks local interface behavior,
   not provider delivery, actual field impact or cross-browser perfection. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const origin='http://127.0.0.1:8765/';
const screenshots='test-screenshots/';
mkdirSync(screenshots,{recursive:true});
const browser=await chromium.launch({headless:true});
const faults=[];
const widths=[{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}];
const note=(label,e)=>faults.push(label+': '+String(e.message||e).slice(0,240));
for(const size of widths){
 const context=await browser.newContext({viewport:{width:size.width,height:size.height},serviceWorkers:'block',reducedMotion:'reduce'});
 await context.route(/https?:\/\//,route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
 const page=await context.newPage();
 page.on('pageerror',e=>note(size.name+' runtime',e));
 try{
  await page.goto(origin+'index.html',{waitUntil:'domcontentloaded'});
  const roadmap=page.locator('[data-sirai-roadmap]');
  assert.equal(await roadmap.count(),1);
  await roadmap.locator('[data-roadmap-step="3"]').click();
  assert.match(await roadmap.locator('[data-roadmap="title"]').textContent(),/Grow with communities/);
  assert.equal(await roadmap.locator('[data-roadmap-step="3"]').getAttribute('aria-current'),'step');
  await roadmap.locator('[data-roadmap="previous"]').click();
  assert.match(await roadmap.locator('[data-roadmap="title"]').textContent(),/Launch and share/);
  await roadmap.locator('[data-roadmap-step="1"]').click();
  assert.match(await roadmap.locator('[data-roadmap="status"]').textContent(),/CURRENT FOCUS/);
  for(const [lang,expected] of [['ar','التجربة'],['fr','Tester'],['de','Testen'],['en','Test and improve']]){
   await page.locator('[data-lang-select]').first().selectOption(lang);
   await page.waitForTimeout(130);
   assert.equal(await page.locator('html').getAttribute('lang'),lang,'Language not switched: '+lang);
   assert.ok((await roadmap.locator('[data-roadmap="title"]').textContent()).includes(expected),'Roadmap not localized: '+lang);
  }
  await page.locator('[data-lang-select]').first().selectOption('en');
  await page.screenshot({path:screenshots+size.name+'-roadmap-final.png',fullPage:false});
 }catch(e){note(size.name+' interactive roadmap',e)}
 try{
  await page.goto(origin+'about.html#founder',{waitUntil:'domcontentloaded'});
  await page.locator('#founder').scrollIntoViewIfNeeded();
  await page.waitForTimeout(160);
  const visual=await page.locator('#founder').evaluate(el=>{
   const css=getComputedStyle(el),head=getComputedStyle(el.querySelector('h2'));
   const img=el.querySelector('img.founder-photo');
   return {background:css.backgroundImage,color:css.backgroundColor,heading:head.color,imageLoaded:img?.complete&&img?.naturalWidth>100};
  });
  assert.ok(/gradient/i.test(visual.background),'Founder gallery dark gradient missing');
  assert.ok(/17, 17, 22|rgb\(17, 17, 22\)/.test(visual.color)||visual.background.includes('17, 17, 22')||visual.background.includes('#111116'),'Founder background may be pale');
  assert.ok(visual.imageLoaded,'Founder portrait not loaded');
  assert.ok(/rgb\(252, 249, 251\)|rgb\(255, 255, 255\)/.test(visual.heading),'Founder heading is not bright');
  await page.screenshot({path:screenshots+size.name+'-founder-final.png',fullPage:false});
 }catch(e){note(size.name+' founder section',e)}
 try{
  await page.goto(origin+'resources.html',{waitUntil:'domcontentloaded'});
  assert.ok(await page.locator('a[href="water-toolkit.html"]').count());
  assert.ok(await page.locator('a[href="projectstarter.html"]').count());
  assert.ok(await page.locator('a[href="taqawise.html"]').count());
  if(size.name==='mobile'){
   const menu=page.locator('[data-menu]').first();await menu.click();
   assert.equal(await page.locator('.site-header .nav.open').count(),1,'Mobile menu failed to open');
   await menu.click();assert.equal(await page.locator('.site-header .nav.open').count(),0,'Mobile menu failed to close');
  }
 }catch(e){note(size.name+' resources navigation',e)}
 try{
  await page.goto(origin+'cooking-energy.html',{waitUntil:'domcontentloaded'});
  if(size.name==='mobile'){
   const menu=page.locator('[data-menu]').first();await menu.click();
   assert.equal(await page.locator('.site-header .nav.open').count(),1,'Cooking page mobile menu failed');
  }
 }catch(e){note(size.name+' cooking navigation',e)}
 try{
  await page.goto(origin+'feedback.html',{waitUntil:'domcontentloaded'});
  const consent=page.locator('input[name="adult_confirmation"]');
  assert.equal(await consent.getAttribute('required'),'','Feedback adult assurance not required');
  assert.equal(await page.locator('input[name="submission_acknowledged"]').getAttribute('required'),'','Feedback consent missing');
  assert.equal(await page.locator('input[name="email"]').count()>0,true);
 }catch(e){note(size.name+' feedback safeguards',e)}
 await context.close();
}
await browser.close();
if(faults.length){console.error('Presentation audit failed:\n'+faults.map(x=>' - '+x).join('\n'));process.exitCode=1}
else console.log('Presentation readiness browser checks passed on 390px mobile and 1440px desktop: roadmap/4 languages, founder, 2 mobile navigation implementations, tools, forms.');
