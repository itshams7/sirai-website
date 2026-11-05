/* Run: node tests/smoke.mjs (no dependencies). */
import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const pages=['index.html','water-toolkit.html','projectstarter.html','taqawise.html','feedback.html','transparency.html','start-here.html','resources.html','faq.html','updates.html','get-involved.html','practical-guide.html','issues.html'];
for(const page of pages){const html=read(page);assert.match(html,/<main[^>]*id="main"/,'Main landmark missing in '+page);assert.match(html,/assets\/launch-quality\.css/,'Accessibility stylesheet missing in '+page);assert.match(html,/assets\/launch-quality\.js/,'Navigation script missing in '+page);assert.match(html,/property="og:title"/,'Sharing metadata missing in '+page);assert.match(html,/href="transparency\.html"/,'Transparency link missing in '+page);assert.doesNotMatch(html,/My earlier community experience is personal and should not be counted as SIRAI project work/,'Removed copy found in '+page);}
const sw=read('sw.js');const offline=read('assets/offline-share.js');const version=sw.match(/const VERSION='([^']+)'/)?.[1];assert.ok(version,'Service worker cache version missing');assert.ok(offline.includes(`keys.includes('${version}')`),'Offline status and worker versions differ');for(const asset of [...sw.matchAll(/'([^']+\.(?:html|css|js|webmanifest|svg))'/g)].map(m=>m[1]))assert.ok(fs.existsSync(new URL('../'+asset,import.meta.url)),'Missing cached asset: '+asset);
assert.ok(read('assets/app.js').includes("strings[locale]['nav.transparency']=value"),'Missing translated navigation label');
console.log('SIRAI smoke checks passed: 6 pages, cache manifest, disclosure, language navigation and metadata.');

// Phase 2: ensure the examples and tutorials remain connected after updates.
for(const [page,button,asset] of [['water-toolkit.html','ws-example','assets/watershare.js'],['projectstarter.html','ps-example','assets/projectstarter.js'],['taqawise.html','tq-example','assets/taqawise.js']]){
 assert.match(read(page),new RegExp('id="'+button+'"'),'Missing example button '+page);
 assert.ok(read(asset).includes("'"+button+"'"),'Missing example handler '+asset);
 assert.ok(read(page).includes('assets/phase2.js'),'Missing multilingual example UI '+page);
}
assert.match(read('start-here.html'),/sirai-guide-grid/,'Start guide missing');
assert.ok(read('assets/phase2-guide.js').includes('"ar":'),'Arabic guide missing');
console.log('Phase 2 example and tutorial wiring passed.');

// Translation regression: the homepage guide must have locale keys and a cache-busted script.
const homepage=read('index.html');const languageScript=read('assets/app.js');
for(const key of ['guide.kicker','guide.title','guide.text','guide.action']){
 assert.ok(homepage.includes('data-i18n="'+key+'"'),'Guide markup missing '+key);
 assert.ok(languageScript.includes("'"+key+"'"),'Guide translations missing '+key);
}
assert.ok(homepage.includes('assets/app.js?v=20261105-hub1'),'Homepage uses a stale language script URL');
assert.ok(read('sw.js').includes('sirai-offline-v13-practical-final-20261105'),'Service worker cache not refreshed');
console.log('Homepage translation regression checks passed.');

// Mobile iPhone header: connection status must live outside the header controls.
const offlineScript=read('assets/offline-share.js');
const accessibleCss=read('assets/launch-quality.css');
assert.ok(offlineScript.includes("header.insertAdjacentElement('afterend',el)"),'Status indicator must be placed outside sticky header');
assert.ok(accessibleCss.includes('#sirai-offline-indicator.sirai-offline-indicator{position:static!important'),'Status must not float over iPhone controls');
assert.ok(accessibleCss.includes('background:#e7efe8'),'Language control must use the distinctive sage style');
assert.ok(homepage.includes('assets/launch-quality.css?v=20261105-mobile-header-2'),'Mobile CSS cache version not refreshed');
console.log('Mobile header regression checks passed.');

// Community information hub integrity.
for(const page of pages){const html=read(page);for(const dest of ['resources.html','updates.html','get-involved.html','faq.html'])assert.ok(html.includes('href="'+dest+'"'),'Missing community navigation link to '+dest+' in '+page);}
for(const page of ['resources.html','faq.html','updates.html','get-involved.html']){const html=read(page);assert.ok(html.includes('assets/community-hub.js'),'Hub translations missing on '+page);assert.ok(html.includes('assets/community-hub.css'),'Hub stylesheet missing on '+page);}
const hubJs=read('assets/community-hub.js');for(const locale of ['en','ar','fr','de'])assert.ok(hubJs.includes('"'+locale+'":{'),'Missing hub locale '+locale);
for(const key of ['nav.updates','nav.involved','nav.faq'])assert.ok(read('assets/app.js').includes("'"+key+"'"),'Missing nav translation '+key);
const updates=read('updates.html');assert.ok(updates.includes('5 November 2026'),'Missing dated development log');
const faq=read('faq.html');assert.equal((faq.match(/class="sirai-hub-question"/g)||[]).length,8,'Expected eight FAQs');
assert.ok(read('get-involved.html').includes('feedback.html'),'No feedback route for participation');
console.log('Community hub integrity, language and transparency checks passed.');

// Advanced practical resource checks.
for(const page of ['water-toolkit.html','projectstarter.html','taqawise.html']){
 const html=read(page);assert.ok(html.includes('assets/sirai-math.js'),'Shared calculation library missing on '+page);
 assert.ok(html.includes('assets/practical.js'),'Result chart missing on '+page);
 assert.ok(html.indexOf('assets/sirai-math.js')<html.indexOf('assets/'+({['water-toolkit.html']:'watershare',['projectstarter.html']:'projectstarter',['taqawise.html']:'taqawise'})[page]+'.js'),'Calculation library loads after tool on '+page);
}
for(const page of ['practical-guide.html','issues.html']){const html=read(page);assert.ok(html.includes('assets/offline-share.js'),'Missing offline functionality on '+page);}
for(const name of ['water-worksheet','project-budget','energy-inventory'])for(const locale of ['en','ar'])assert.ok(fs.existsSync(new URL('../downloads/'+name+'-'+locale+'.csv',import.meta.url)),'Missing bilingual CSV: '+name+' '+locale);
const resources=read('resources.html');assert.ok(resources.includes('practical-guide.html'),'Printable guide not linked from Resource Library');assert.ok(resources.includes('downloads/project-budget-ar.csv'),'Arabic budget template not discoverable');
assert.ok(read('sw.js').includes('assets/offline-images.js'),'Image fallback missing from cache');
assert.ok(read('issues.html').includes('feedback.html'),'Public issue register must support safe private reports');
console.log('Practical resources, offline fallback, printable guides and issue register passed.');
