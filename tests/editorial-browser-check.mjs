import { chromium, devices } from 'playwright';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const base='http://127.0.0.1:8765';
const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
let browser;
const warnings=[];
const check=(condition,message)=>assert.ok(condition,message);
try{
 await mkdir('test-artifacts',{recursive:true});
 await sleep(1500);
 browser=await chromium.launch({headless:true,executablePath:process.env.CI?'/usr/bin/google-chrome':undefined,args:['--no-sandbox']});
 for(const preset of [
  {name:'desktop',viewport:{width:1440,height:900},mobile:false},
  {name:'tablet',viewport:{width:748,height:1100},mobile:false},
  {name:'mobile',...devices['iPhone 13'],mobile:true}
 ]){
  const context=await browser.newContext({viewport:preset.viewport,deviceScaleFactor:1,isMobile:preset.mobile,hasTouch:preset.mobile,locale:'en-US'});
  const page=await context.newPage();
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:30000});
  await page.locator('.hero h1').waitFor({state:'visible'});
  await page.screenshot({path:'test-artifacts/home-'+preset.name+'.png',fullPage:true,animations:'disabled',timeout:30000});
  const dims=await page.evaluate(()=>{
    const hero=document.querySelector('.hero').getBoundingClientRect();
    const figure=document.querySelector('.hero-art').getBoundingClientRect();
    const h1=document.querySelector('.hero h1').getBoundingClientRect();
    const styles=getComputedStyle(document.querySelector('.hero h1'));
    return {hero:{x:hero.x,width:hero.width,height:hero.height},figure:{x:figure.x,width:figure.width,height:figure.height},h1:{x:h1.x,width:h1.width},font:styles.fontFamily,letterSpacing:styles.letterSpacing,viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth};
  });
  check(dims.hero.height>500,preset.name+': missing tall hero');
  check(Math.abs(dims.figure.width-dims.hero.width)<5,preset.name+': hero figure is not full bleed');
  check(dims.h1.x>=0 && dims.h1.x+dims.h1.width<=dims.viewport+2,preset.name+': h1 outside viewport');
  if(dims.scrollWidth>dims.viewport+3){const overflow=await page.evaluate(()=>[...document.querySelectorAll('*')].map(e=>({tag:e.tagName,cls:(typeof e.className==='string'?e.className:'').slice(0,90),right:Math.round(e.getBoundingClientRect().right),left:Math.round(e.getBoundingClientRect().left),width:Math.round(e.getBoundingClientRect().width)})).filter(x=>x.right>innerWidth+3||x.left< -3).sort((a,b)=>b.right-a.right).slice(0,15));console.log('OVERFLOW '+preset.name,JSON.stringify(overflow));}
  check(dims.scrollWidth<=dims.viewport+3,preset.name+': horizontal overflow '+dims.scrollWidth+' > '+dims.viewport);
  check(dims.font.includes('Instrument Serif'),preset.name+': editorial heading font missing');
  check(dims.letterSpacing==='-2.46px',preset.name+': letter spacing mismatch: '+dims.letterSpacing);
  check(await page.locator('#sirai-stat-number').count()===1,preset.name+': statistics missing');
  for (const mode of ['need','children']) {
    await page.locator('[data-sirai-stat="'+mode+'"]').click();
    const geometry=await page.evaluate(()=>{
      const box=selector=>document.querySelector(selector).getBoundingClientRect();
      const top=box('.sirai-statistics-map-top');
      const panel=box('.sirai-national-visual');
      const foot=box('.sirai-national-footer');
      const insight=box('.sirai-map-insight');
      const visualHeader=box('.sirai-national-visual-top');
      return {topBottom:top.bottom,panelTop:panel.top,panelBottom:panel.bottom,footBottom:foot.bottom,insightTop:insight.top,visualHeaderTop:visualHeader.top,scroll:document.documentElement.scrollWidth,viewport:innerWidth};
    });
    check(geometry.panelTop>=geometry.topBottom-2,preset.name+' '+mode+': indicator panel overlaps map heading '+JSON.stringify(geometry));
    check(geometry.visualHeaderTop>=geometry.panelTop-1,preset.name+' '+mode+': indicator header overlaps');
    check(geometry.footBottom<=geometry.panelBottom+2,preset.name+' '+mode+': source footer escapes indicator panel');
    check(geometry.panelBottom<=geometry.insightTop+2,preset.name+' '+mode+': indicator overlaps explainer '+JSON.stringify(geometry));
    check(geometry.scroll<=geometry.viewport+3,preset.name+' '+mode+': indicator causes horizontal overflow');
  }
  await page.locator('[data-sirai-stat="children"]').click();
  check((await page.locator('#sirai-stat-number').innerText()).includes('17.3'),preset.name+': humanitarian indicator not responding');
  await page.locator('[data-sirai-stat="displaced"]').click();
  check(await page.locator('#sirai-idp-panel').isVisible(),preset.name+': displacement map UI not shown');
  // Selected states must follow the state boundary, not draw a rectangular SVG focus box.
  await page.locator('#sirai-idp-svg path[data-idp-state="SD-NO"]').waitFor({state:'visible',timeout:15000});
  const northern=page.locator('#sirai-idp-svg path[data-idp-state="SD-NO"]');
  await northern.click();
  check(await northern.evaluate(node=>node.classList.contains('is-selected')),preset.name+': selected state not highlighted');
  await northern.focus();
  const mapFocus=await northern.evaluate(node=>({outline:getComputedStyle(node).outlineStyle,stroke:getComputedStyle(node).strokeWidth,tabindex:node.getAttribute('tabindex')}));
  check(mapFocus.outline==='none',preset.name+': native rectangular SVG outline persists '+JSON.stringify(mapFocus));
  check(mapFocus.tabindex==='0',preset.name+': keyboard state selection lost');
  check(Number.parseFloat(mapFocus.stroke)>=3,preset.name+': selected focus ring too subtle');
  const explorer=page.locator('.sirai-explorer-home .sirai-lightbeam');
  check(await explorer.getAttribute('href')==='explorer.html',preset.name+': explorer CTA destination changed');
  const beam=await explorer.evaluate(el=>({border:getComputedStyle(el).borderRadius,background:getComputedStyle(el).backgroundImage}));
  check(beam.border==='999px',preset.name+': beam button shape not applied');
  check(beam.background.includes('conic-gradient'),preset.name+': beam gradient missing');
  if(preset.mobile){
    await page.locator('[data-menu]').click();
    check(await page.locator('#navigation').isVisible(),'mobile: menu did not open');
  }
  await page.locator('[data-lang-select]').selectOption('ar');
  await page.waitForTimeout(300);
  check(await page.locator('html').getAttribute('dir')==='rtl',preset.name+': Arabic RTL did not activate');
  await page.screenshot({path:'test-artifacts/arabic-'+preset.name+'.png',fullPage:false,animations:'disabled'});
  await page.locator('[data-lang-select]').selectOption('en');
  check(pageErrors.length===0,preset.name+': JavaScript errors: '+pageErrors.join(' | '));
  console.log('PASS '+preset.name+' '+JSON.stringify(dims));
  await context.close();
 }
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const page=await context.newPage();
 await page.goto(base+'/index.html',{waitUntil:'domcontentloaded'});
 const animation=await page.locator('.hero h1').evaluate(x=>getComputedStyle(x).animationName);
 check(animation==='none','reduced motion fails: '+animation);
 console.log('PASS reduced motion');
 await context.close();
 console.log('ALL BROWSER TESTS PASSED');
}catch(error){
 console.error('BROWSER TEST FAILED:',error.stack||error);
 process.exitCode=1;
}finally{await browser?.close();server.kill();}
