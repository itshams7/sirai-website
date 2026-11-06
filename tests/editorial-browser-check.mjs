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
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 for(const preset of [
  {name:'desktop',viewport:{width:1440,height:900},mobile:false},
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
  check(dims.scrollWidth<=dims.viewport+3,preset.name+': horizontal overflow');
  check(dims.font.includes('Instrument Serif'),preset.name+': editorial heading font missing');
  check(dims.letterSpacing==='-2.46px',preset.name+': letter spacing mismatch: '+dims.letterSpacing);
  check(await page.locator('#sirai-stat-number').count()===1,preset.name+': statistics missing');
  await page.locator('[data-sirai-stat="children"]').click();
  check((await page.locator('#sirai-stat-number').innerText()).includes('17.3'),preset.name+': humanitarian indicator not responding');
  await page.locator('[data-sirai-stat="displaced"]').click();
  check(await page.locator('#sirai-idp-panel').isVisible(),preset.name+': displacement map UI not shown');
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
