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
  {name:'small-desktop',viewport:{width:1024,height:850},mobile:false},
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
  // The active reel has three documentary videos, no slides or overlay UI.
  const reel=page.locator('[data-sirai-hero-reel]');
  check(await reel.count()===1,preset.name+': video reel missing');
  check(await page.locator('.sirai-hero-reel video').count()===3,preset.name+': expected three video scenes');
  check(await page.locator('.sirai-hero-reel img').count()===0,preset.name+': still image slide remains');
  check(await page.locator('.sirai-reel-tools, .sirai-photo-caption').count()===0,preset.name+': unwanted hero controls or caption visible');
  check(!(await page.locator('html').innerText()).includes('Pause motion'),preset.name+': pause control remains');
  const sources=await page.locator('.sirai-hero-reel video').evaluateAll(v=>v.map(x=>x.dataset.reelVideo));
  check(sources.every(x=>x?.endsWith('480p.vp9.webm')),preset.name+': expected bandwidth-aware VP9 footage');
  check(sources.every(x=>!x.includes('football')),preset.name+': football footage still included');
  check((await page.locator('.site-footer a[href="footage-credits.html"]').count())===1,preset.name+': documentary credits link absent');
  const photoFallback=await page.locator('.sirai-cinematic-hero>img').evaluate(img=>img.dataset.siraiLocalPhoto);
  check(photoFallback?.endsWith('.svg'),preset.name+': static reduced-motion fallback absent');
  if(preset.name==='desktop'){
    await page.waitForTimeout(6000);
    const media=await page.locator('.sirai-hero-reel video').evaluateAll(v=>v.map(x=>({readyState:x.readyState,error:x.error?.code||null,src:x.getAttribute('src')})));
    console.log('MONTAGE_MEDIA '+JSON.stringify(media));
    check(media[0].readyState>=2 && !media[0].error,'First Sudan footage clip did not load in Chromium');
    check(['1','2','3'].includes(await reel.getAttribute('data-scene')),'Documentary video montage never became active');
    // Validate every actual remote documentary source, not only its URL syntax.
    const verified=await page.locator('.sirai-hero-reel video').evaluateAll(async clips=>
      Promise.all(clips.map(video=>new Promise(resolve=>{
        const finish=()=>{
          clearTimeout(watchdog);
          video.removeEventListener('loadedmetadata',finish);
          video.removeEventListener('error',finish);
          resolve({readyState:video.readyState,error:video.error?.code||null,clip:video.dataset.reelVideo});
        };
        const watchdog=setTimeout(finish,18000);
        video.addEventListener('loadedmetadata',finish,{once:true});
        video.addEventListener('error',finish,{once:true});
        if(!video.getAttribute('src')){video.src=video.dataset.reelVideo;video.preload='metadata';video.load();}
        if(video.readyState>=1||video.error)finish();
      })))
    );
    console.log('MONTAGE_VERIFIED '+JSON.stringify(verified));
    check(verified.every(v=>v.readyState>=1&&!v.error),'One or more archival video sources failed to load '+JSON.stringify(verified));
  }
  // Offline capability remains; no persistent readiness/status UI in the header.
  await page.waitForTimeout(300);
  check(await page.locator('#sirai-offline-indicator').count()===0,preset.name+': offline readiness badge still appears');
  check(!(await page.locator('body').innerText()).includes('Offline tools ready'),preset.name+': offline ready text visible');
  check(!(await page.locator('body').innerText()).includes('Preparing offline tools'),preset.name+': offline setup text visible');
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
  await page.waitForTimeout(300); // allow the accessible border transition to finish
  const mapFocus=await northern.evaluate(node=>({outline:getComputedStyle(node).outlineStyle,stroke:getComputedStyle(node).strokeWidth,tabindex:node.getAttribute('tabindex')}));
  check(mapFocus.outline==='none',preset.name+': native rectangular SVG outline persists '+JSON.stringify(mapFocus));
  check(mapFocus.tabindex==='0',preset.name+': keyboard state selection lost');
  check(Number.parseFloat(mapFocus.stroke)>=3,preset.name+': selected focus ring too subtle '+JSON.stringify(mapFocus));
  const explorer=page.locator('.sirai-explorer-home .sirai-lightbeam');
  check(await explorer.getAttribute('href')==='explorer.html',preset.name+': explorer CTA destination changed');
  const beam=await explorer.evaluate(el=>({border:getComputedStyle(el).borderRadius,background:getComputedStyle(el).backgroundImage}));
  check(beam.border==='999px',preset.name+': beam button shape not applied');
  check(beam.background.includes('conic-gradient'),preset.name+': beam gradient missing');
  // Priorities: every option must update the illustration, heading and accessible state.
  const focusSection=page.locator('#focus');
  await focusSection.scrollIntoViewIfNeeded();
  for(let i=0;i<3;i++){
    const b=page.locator('[data-focus-choice="'+i+'"]');
    await b.click();
    check(await b.getAttribute('aria-pressed')==='true',preset.name+': focus priority '+i+' is not active');
    check(await page.locator('.sirai-focus-visual:not([hidden])').count()===1,preset.name+': focus illustrations not synchronized');
    check(await page.locator('#sirai-focus-showcase').getAttribute('data-focus-active')===String(i),preset.name+': focus showcase not updated');
    const visual=page.locator('.sirai-focus-showcase-title');
    check((await visual.innerText()).trim()===(await b.locator('strong').innerText()).trim(),preset.name+': focus preview title mismatch');
  }
  // Real photographs replace the primary artwork when online, while
  // existing offline/low-data preferences retain local illustrations.
  const photos=page.locator('.sirai-focus-visual .sirai-focus-photo');
  check(await photos.count()===3,preset.name+': priorities are missing photographic assets');
  for(const photo of await photos.all()){
    const source=await photo.getAttribute('data-sirai-remote-photo');
    const fallback=await photo.getAttribute('data-sirai-local-photo');
    check(source?.startsWith('https://images.unsplash.com/photo-'),preset.name+': real image source missing');
    check(fallback?.endsWith('.svg'),preset.name+': local offline fallback missing');
  }
  const dataToggle=page.locator('.sirai-data-toggle');
  await dataToggle.click();
  check(await page.locator('html.sirai-low-data').count()===1,preset.name+': data saving toggle failed');
  const fallbackSources=await photos.evaluateAll(imgs=>imgs.map(img=>img.getAttribute('src')));
  check(fallbackSources.every(src=>src?.endsWith('.svg')),preset.name+': illustrations not restored in low-data mode '+fallbackSources.join(', '));
  await dataToggle.click();
  await page.locator('[data-focus-choice="0"]').click();
  const focusGeom=await focusSection.evaluate(el=>{const r=el.getBoundingClientRect(),s=el.querySelector('.sirai-focus-showcase').getBoundingClientRect();return {left:s.left,right:s.right,viewport:innerWidth,height:r.height}});
  check(focusGeom.left>=-2&&focusGeom.right<=focusGeom.viewport+2,preset.name+': focus preview overflowing viewport '+JSON.stringify(focusGeom));
  check(focusGeom.height<1100,preset.name+': excessive focus section height '+JSON.stringify(focusGeom));
  await focusSection.screenshot({path:'test-artifacts/focus-'+preset.name+'.png',animations:'disabled'});
  // Purpose sections: compact objective cards remain contained at all breakpoints.
  const obj=page.locator('#about .sirai-objectives');
  check(await obj.count()===1,preset.name+': objectives not shown under mission and vision');
  check(await obj.locator('.sirai-objective-card').count()===3,preset.name+': objectives card count wrong');
  const objGeom=await obj.evaluate(el=>{
    const rects=[...el.querySelectorAll('.sirai-objective-card')].map(x=>x.getBoundingClientRect());
    return {left:Math.min(...rects.map(x=>x.left)),right:Math.max(...rects.map(x=>x.right)),width:innerWidth,top:rects.map(x=>x.top)};
  });
  check(objGeom.left>=-2 && objGeom.right<=objGeom.width+2,preset.name+': objective cards overflow '+JSON.stringify(objGeom));
  if(preset.name==='desktop')check(Math.max(...objGeom.top)-Math.min(...objGeom.top)<3,preset.name+': objective cards not aligned');
  await obj.screenshot({path:'test-artifacts/objectives-'+preset.name+'.png',animations:'disabled'});
  // Footer paragraph must have enough width to wrap naturally, without
  // crowding navigation or creating horizontal scroll at any breakpoint.
  const footer=page.locator('.sirai-footer-refined');
  const footGeo=await footer.evaluate(root=>{
    const rect=el=>el.getBoundingClientRect();
    const brand=rect(root.querySelector('.sirai-footer-brand'));
    const para=rect(root.querySelector('.sirai-footer-brand p'));
    const nav=rect(root.querySelector('.sirai-footer-nav'));
    const groups=[...root.querySelectorAll('.sirai-footer-group')].map(rect);
    return {brandWidth:brand.width,paraWidth:para.width,navLeft:nav.left,navRight:nav.right,navTop:nav.top,brandBottom:brand.bottom,groupCount:groups.length,footerScroll:document.documentElement.scrollWidth,viewport:innerWidth};
  });
  check(footGeo.paraWidth>=190,preset.name+': footer description squeezed into narrow column '+JSON.stringify(footGeo));
  check(footGeo.groupCount===3,preset.name+': footer link groups missing');
  check(footGeo.navLeft>=-2 && footGeo.navRight<=footGeo.viewport+2,preset.name+': footer links overflow '+JSON.stringify(footGeo));
  check(footGeo.footerScroll<=footGeo.viewport+3,preset.name+': footer creates horizontal scrolling');
  if(preset.name==='desktop'||preset.name==='small-desktop'){
    check(footGeo.navTop<footGeo.brandBottom,preset.name+': desktop footer links not placed beside description');
  }
  await footer.screenshot({path:'test-artifacts/footer-'+preset.name+'.png',animations:'disabled'});
  // Founder editorial regression: proper portrait, complete letter, accessible layout.
  const founder=page.locator('#founder');
  await founder.scrollIntoViewIfNeeded();
  await page.waitForTimeout(850);
  const founderGeometry=await page.evaluate(()=>{
    const root=document.querySelector('.sirai-founder-editorial');
    const letter=root.querySelector('.sirai-founder-letter');
    const portrait=root.querySelector('.sirai-founder-portrait');
    const quote=root.querySelector('.sirai-founder-quote');
    const rr=root.getBoundingClientRect(),lr=letter.getBoundingClientRect(),pr=portrait.getBoundingClientRect(),qr=quote.getBoundingClientRect();
    return {background:getComputedStyle(root).backgroundColor,paper:getComputedStyle(letter).backgroundColor,rootWidth:rr.width,letterRight:lr.right,letterLeft:lr.left,portraitLeft:pr.left,portraitTop:pr.top,portraitRight:pr.right,quoteLeft:qr.left,quoteRight:qr.right,quoteBottom:qr.bottom,letterTop:lr.top,letterBottom:lr.bottom,rootBottom:rr.bottom,viewport:innerWidth};
  });
  check(founderGeometry.background==='rgb(72, 31, 48)',preset.name+': incorrect burgundy founder background');
  check(founderGeometry.paper==='rgb(248, 240, 230)',preset.name+': incorrect champagne letter');
  check(founderGeometry.letterLeft>=-2&&founderGeometry.letterRight<=founderGeometry.viewport+2,preset.name+': founder letter overflows viewport '+JSON.stringify(founderGeometry));
  check(founderGeometry.letterBottom<=founderGeometry.rootBottom+2,preset.name+': founder letter extends outside its section');
  check(!(await page.locator('.sirai-founder-badge').innerText()).includes('Shamseldin Abdelrahim'),preset.name+': duplicate founder name remains on portrait');
  check((await page.locator('.sirai-letter-signature').innerText()).trim()==='Shamseldin Abdelrahim',preset.name+': founder signature missing');
  if(dims.viewport>=851){
    check(Math.abs(founderGeometry.quoteBottom-founderGeometry.letterBottom)<=4,preset.name+': portrait column and letter bottoms do not align '+JSON.stringify(founderGeometry));
    check(Math.abs(founderGeometry.portraitTop-founderGeometry.letterTop)<=3,preset.name+': portrait top and letter top do not align '+JSON.stringify(founderGeometry));
    check(Math.abs(founderGeometry.portraitLeft-founderGeometry.quoteLeft)<=3,preset.name+': portrait and quote left edges do not align '+JSON.stringify(founderGeometry));
    check(Math.abs(founderGeometry.portraitRight-founderGeometry.quoteRight)<=3,preset.name+': portrait and quote right edges do not align '+JSON.stringify(founderGeometry));
  }
  check(await page.locator('.sirai-founder-letter .sirai-letter-body p').count()===3,preset.name+': missing founder story paragraphs');
  check((await page.locator('.sirai-founder-letter .sirai-letter-body p').first().innerText()).includes('Port Sudan'),preset.name+': original story has changed');
  check(await page.locator('.sirai-founder-portrait img').evaluate(img=>img.complete && img.naturalWidth>0),preset.name+': founder portrait did not load');
  await founder.screenshot({path:'test-artifacts/founder-'+preset.name+'.png',animations:'disabled'});
  // Verify the goal is explicit, conditional and usable at every breakpoint.
  const goal=page.locator('#roadmap.sirai-2028-section');
  await goal.scrollIntoViewIfNeeded();
  const metrics=await goal.evaluate(root=>{
    const card=root.querySelector('.sirai-2028-feature').getBoundingClientRect();
    const year=root.querySelector('.sirai-2028-year').getBoundingClientRect();
    return {cardLeft:card.left,cardRight:card.right,yearLeft:year.left,yearRight:year.right,viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth};
  });
  check(metrics.cardLeft>=-2 && metrics.cardRight<=metrics.viewport+2,preset.name+': goal card overflows '+JSON.stringify(metrics));
  check(metrics.scrollWidth<=metrics.viewport+3,preset.name+': 2028 goal causes horizontal overflow '+JSON.stringify(metrics));
  check(await page.locator('.sirai-2028-step').count()===3,preset.name+': milestones missing');
  check((await page.locator('.sirai-2028-heading p').innerText()).includes('By the end of 2028'),preset.name+': target wording missing');
  check((await page.locator('.sirai-2028-conditional').innerText()).includes('depends on safety'),preset.name+': fieldwork caveat missing');
  check(await page.locator('.sirai-2028-link').getAttribute('href')==='updates.html',preset.name+': progress link broken');
  await goal.screenshot({path:'test-artifacts/goal-'+preset.name+'.png',animations:'disabled'});
  if(preset.mobile){
    await page.locator('[data-menu]').click();
    check(await page.locator('#navigation').isVisible(),'mobile: menu did not open');
  }
  await page.locator('[data-lang-select]').selectOption('ar');
  await page.waitForTimeout(300);
  check(await page.locator('html').getAttribute('dir')==='rtl',preset.name+': Arabic RTL did not activate');
  check((await page.locator('.sirai-founder-letter h3').innerText()).includes('قليل'),preset.name+': Arabic founder heading not translated');
  check((await page.locator('#about .sirai-objectives-heading h3').innerText()).includes('أهدافنا'),preset.name+': Arabic objectives heading not translated');
  check((await page.locator('.sirai-footer-group h2').first().innerText()).includes('استكشف'),preset.name+': Arabic footer headings not translated');
  check((await page.locator('.sirai-2028-heading h2').innerText()).includes('الأفكار'),preset.name+': Arabic goal not translated');
  await page.locator('[data-focus-choice="2"]').click();
  check((await page.locator('.sirai-focus-showcase-title').innerText()).includes('البيئة'),preset.name+': Arabic focus preview not translated');
  await page.screenshot({path:'test-artifacts/arabic-'+preset.name+'.png',fullPage:false,animations:'disabled'});
  await page.locator('[data-lang-select]').selectOption('en');
  check(pageErrors.length===0,preset.name+': JavaScript errors: '+pageErrors.join(' | '));
  // Cooking & Energy Explorer: source-labeled calculations and access constraints.
  await page.goto(base+'/cooking-energy.html',{waitUntil:'domcontentloaded',timeout:30000});
  await page.locator('#ce-status').waitFor({state:'visible'});
  const documentary=page.locator('.ce-hero-photo');
  await documentary.waitFor({state:'visible'});
  await page.waitForFunction(()=>{
    const img=document.querySelector('.ce-hero-photo');
    return img?.complete && img.naturalWidth>0 && img.currentSrc.includes('/02s.jpg');
  },{timeout:18000});
  check(await documentary.getAttribute('alt')!==null,preset.name+': documentary photo needs alt text');
  const native=await documentary.evaluate(img=>({width:img.naturalWidth,height:img.naturalHeight,ratio:img.naturalWidth/img.naturalHeight,renderedRatio:img.getBoundingClientRect().width/img.getBoundingClientRect().height}));
  check(native.width>=950 && native.ratio>1.4,preset.name+': source photo is a cropped thumbnail '+JSON.stringify(native));
  check(native.renderedRatio>=.9 && native.renderedRatio<=1.65,preset.name+': documentary photo panel has unexpected proportions '+JSON.stringify(native));
  check(await documentary.evaluate(img=>getComputedStyle(img).objectFit)==='cover',preset.name+': documentary photo should fill the entire large panel');

  check(await page.locator('.ce-hero-photo-credit').count()===0,preset.name+': photo caption still covers hero');
  check(await page.locator('.ce-photo-source-note a').count()===1,preset.name+': source credit missing from methodology');
  const heroImageGeometry=await documentary.evaluate(img=>{
    const r=img.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width,height:r.height,viewport:innerWidth}
  });
  check(heroImageGeometry.width>=220&&heroImageGeometry.right<=heroImageGeometry.viewport+2,preset.name+': hero photo not visible or overflow '+JSON.stringify(heroImageGeometry));
  if(preset.name==='desktop')check(heroImageGeometry.width>=500&&heroImageGeometry.height>=550,preset.name+': cooking photo must fill large right hero area '+JSON.stringify(heroImageGeometry));
  if(preset.name==='small-desktop')check(heroImageGeometry.width>=550&&heroImageGeometry.height>=400,preset.name+': cooking photo must remain large on laptop '+JSON.stringify(heroImageGeometry));
  if(preset.name==='desktop'||preset.name==='small-desktop')check(heroImageGeometry.height>=410,preset.name+': hero photo remains too small '+JSON.stringify(heroImageGeometry));

  check(await page.locator('#ce-watts').inputValue()==='1500',preset.name+': illustrative cooker power missing');
  check((await page.locator('#ce-kwh-day').innerText()).includes('1.50'),preset.name+': daily energy estimate incorrect');
  check((await page.locator('#ce-kwh-month').innerText()).includes('45.0'),preset.name+': 30-day energy estimate incorrect');
  check((await page.locator('#ce-electric-cost').innerText()).includes('Local price needed'),preset.name+': unverified local price must be blank');
  await page.locator('#ce-kwh-price').fill('15');
  check((await page.locator('#ce-electric-cost').innerText()).includes('675'),preset.name+': electricity math incorrect');
  await page.locator('#ce-lpg-price').fill('3000');
  await page.locator('#ce-lpg-days').fill('15');
  check((await page.locator('#ce-lpg-cost').innerText()).includes('6,000'),preset.name+': LPG math incorrect');
  await page.locator('#ce-charcoal').fill('2000');
  check((await page.locator('#ce-solid-cost').innerText()).includes('2,000'),preset.name+': charcoal spending missing');
  await page.locator('#ce-reliability').selectOption('yes');
  check((await page.locator('#ce-status').innerText()).includes('Supply capacity is not confirmed'),preset.name+': unknown outlet capacity marked as viable');
  await page.locator('#ce-capacity').fill('1200');
  check((await page.locator('#ce-status').innerText()).includes('not currently practical'),preset.name+': insufficient capacity not flagged');
  await page.locator('#ce-capacity').fill('2000');
  check((await page.locator('#ce-status').innerText()).includes('Potentially workable'),preset.name+': viable conditional outcome missing');
  await page.locator('#ce-supply').selectOption('none');
  check((await page.locator('#ce-status').innerText()).includes('not currently practical'),preset.name+': unavailable electricity not flagged');
  await page.locator('#ce-form').evaluate(form=>form.reset());
  await page.waitForTimeout(50);
  check((await page.locator('#ce-electric-cost').innerText()).includes('Local price needed'),preset.name+': reset did not clear local prices');
  await page.locator('#ce-lang').selectOption('ar');
  check(await page.locator('html').getAttribute('dir')==='rtl',preset.name+': Arabic cooking explorer not RTL');
  check((await page.locator('#ce-status').innerText()).includes('انتظام'),preset.name+': Arabic status not translated');
  const cookingGeometry=await page.evaluate(()=>{
    const root=document.querySelector('.ce-grid').getBoundingClientRect();
    const result=document.querySelector('.ce-results').getBoundingClientRect();
    return {left:root.left,right:root.right,resultLeft:result.left,resultRight:result.right,viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth};
  });
  check(cookingGeometry.left>=-2&&cookingGeometry.right<=cookingGeometry.viewport+2,preset.name+': cooking grid overflows viewport '+JSON.stringify(cookingGeometry));
  check(cookingGeometry.scrollWidth<=cookingGeometry.viewport+3,preset.name+': cooking explorer causes horizontal scroll '+JSON.stringify(cookingGeometry));
  await page.screenshot({path:'test-artifacts/cooking-energy-'+preset.name+'.png',fullPage:true,animations:'disabled'});
  await page.locator('#ce-lang').selectOption('en');
  console.log('PASS '+preset.name+' '+JSON.stringify(dims));
  await context.close();
 }
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const page=await context.newPage();
 await page.goto(base+'/index.html',{waitUntil:'domcontentloaded'});
 const animation=await page.locator('.hero h1').evaluate(x=>getComputedStyle(x).animationName);
 check(animation==='none','reduced motion fails: '+animation);
 check(await page.locator('.sirai-hero-reel').evaluate(el=>getComputedStyle(el).display)==='none','reduced motion should hide hero video');
 check(await page.locator('[data-reel-video]').evaluateAll(videos=>videos.every(v=>!v.getAttribute('src'))),'reduced motion must not request video clips');

 const founderLetterMotion=await page.locator('.sirai-letter-body p').first().evaluate(el=>({transition:getComputedStyle(el).transitionDuration,opacity:getComputedStyle(el).opacity}));
 check(founderLetterMotion.opacity==='1','reduced motion founder text hidden');
 console.log('PASS reduced motion');
 await context.close();
 console.log('ALL BROWSER TESTS PASSED');
}catch(error){
 console.error('BROWSER TEST FAILED:',error.stack||error);
 process.exitCode=1;
}finally{await browser?.close();server.kill();}
