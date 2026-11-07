/* Browser smoke test for SIRAI's pre-launch site.
   Run with Playwright Chromium after starting a local HTTP server on port 8765.
   External imagery / analytics are intentionally blocked for deterministic checks.
   Real iOS Safari and low-end Android testing is still required. */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
const origin='http://127.0.0.1:8765/';
const pages=[
 'index.html','about.html','resources.html','updates.html','get-involved.html',
 'explorer.html','water-toolkit.html','projectstarter.html','taqawise.html',
 'feedback.html','start-here.html','faq.html','transparency.html',
 'privacy.html','terms.html','cooking-energy.html','issues.html',
 'practical-guide.html','footage-credits.html'
];
const output='test-screenshots';
mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true});
const issues=[];
for(const view of [{name:'mobile',width:390,height:844},{name:'desktop',width:1440,height:900}]){
 const context=await browser.newContext({viewport:{width:view.width,height:view.height},locale:'en-US',reducedMotion:'reduce',serviceWorkers:'block'});
 await context.route(/https?:\/\//,route=>{
  const url=new URL(route.request().url());
  return url.hostname==='127.0.0.1'?route.continue():route.abort();
 });
 for(const file of pages){
  const page=await context.newPage();
  const failures=[];
  page.on('pageerror',error=>failures.push(error.message));
  const response=await page.goto(origin+file,{waitUntil:'domcontentloaded',timeout:15000});
  if(!response || response.status()>=400)issues.push(view.name+' '+file+': HTTP failure');
  await page.waitForTimeout(100);
  const info=await page.evaluate(()=>{
   const styles=sel=>{const el=document.querySelector(sel);if(!el)return null;
    const s=getComputedStyle(el);return {background:s.backgroundImage==='none'?s.backgroundColor:s.backgroundImage,color:s.color}};
   return {
    overflow:document.documentElement.scrollWidth-innerWidth,
    header:document.querySelector('header')!==null,
    theme:[...document.querySelectorAll('link[rel=stylesheet]')].some(el=>el.href.includes('theme-obsidian-ice-burgundy.css')),
    map:styles('.sirai-statistics-map'),
    insight:styles('.sirai-map-insight'),
    title:document.title
   };
  });
  if(info.overflow>10)issues.push(view.name+' '+file+': horizontal overflow '+info.overflow+'px');
  if(!info.header)issues.push(view.name+' '+file+': missing header');
  if(!info.theme)issues.push(view.name+' '+file+': premium stylesheet absent');
  for(const failure of failures.slice(0,2))issues.push(view.name+' '+file+': JS '+failure.slice(0,130));
  if(file==='index.html'){
   assert.ok(info.map && info.insight,'Homepage map panel missing');
   const green=/52, 97, 79|32, 76, 61|16, 53, 40|#34614f|#204c3d/i;
   if(green.test(info.map.background))issues.push('Legacy green map background detected');
   if(green.test(info.insight.background))issues.push('Legacy green map insight detected');
  }
  if(view.name==='mobile' && file!=='footage-credits.html'){
   const toggle=page.locator('[data-menu]');
   if(await toggle.count()){
    await toggle.click();
    const menu=page.locator('.site-header .nav.open');
    if(await menu.count()!==1)issues.push('Mobile navigation did not open: '+file);
    else {
     const surface=await menu.evaluate(el=>{
      const s=getComputedStyle(el);return {bg:s.backgroundColor,image:s.backgroundImage,opacity:s.opacity}
     });
     if(surface.image==='none' && /rgb\(255, 255, 255\)|rgb\(250, 250, 247\)/.test(surface.bg))
      issues.push('White mobile navigation detected: '+file);
     const links=await menu.locator('a:visible').count();
     if(links<4)issues.push('Missing mobile navigation links: '+file);
    }
   }
  }
  if(['index.html','about.html','resources.html','updates.html','get-involved.html'].includes(file)){
   await page.screenshot({path:output+'/'+view.name+'-'+file.replace('.html','.png'),fullPage:false});
  }
  await page.close();
 }
 await context.close();
}
await browser.close();
if(issues.length){
 console.error('SIRAI browser audit found '+issues.length+' issue(s):\n'+issues.map(x=>' - '+x).join('\n'));
 process.exitCode=1;
}else console.log('SIRAI browser audit passed for '+pages.length+' pages at mobile and desktop widths. Real-device testing remains pending.');
