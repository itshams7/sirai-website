/* Run: node tests/smoke.mjs (no dependencies). */
import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const pages=['index.html','privacy.html','terms.html','explorer.html','about.html','water-toolkit.html','projectstarter.html','taqawise.html','feedback.html','transparency.html','start-here.html','resources.html','faq.html','updates.html','get-involved.html','practical-guide.html','issues.html'];
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
assert.ok(homepage.includes('assets/app.js?v=20261105-stat-redesign-2'),'Homepage uses a stale language script URL');
assert.ok(read('sw.js').includes('sirai-offline-v20-interactive-stats-20261105'),'Service worker cache not refreshed');
console.log('Homepage translation regression checks passed.');

// Mobile iPhone header: connection status must live outside the header controls.
const offlineScript=read('assets/offline-share.js');
const accessibleCss=read('assets/launch-quality.css');
assert.ok(offlineScript.includes("header.insertAdjacentElement('afterend',el)"),'Status indicator must be placed outside sticky header');
assert.ok(accessibleCss.includes('#sirai-offline-indicator.sirai-offline-indicator{position:static!important'),'Status must not float over iPhone controls');
assert.ok(accessibleCss.includes('background:#e7efe8'),'Language control must use the distinctive sage style');
assert.ok(homepage.includes('assets/launch-quality.css?v=20261105-stat-redesign-2'),'Mobile CSS cache version not refreshed');
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

// Offline illustration and install shortcut regression checks.
for(const illustration of ['assets/watershare-resource-art.svg','assets/projectstarter-resource-art.svg','assets/taqawise-resource-art.svg']) assert.ok(sw.includes("'"+illustration+"'"),'Fallback image not cached: '+illustration);
const manifest=JSON.parse(read('manifest.webmanifest'));assert.equal(manifest.shortcuts.length,3,'Missing direct access to three tools');
console.log('Offline image fallback and home-screen shortcut checks passed.');

// Low-data mode, Arabic RTL and release controls.
for(const page of pages){const html=read(page);assert.ok(html.includes('assets/data-mode.js'),'Data mode missing from '+page);assert.ok(html.includes('assets/data-mode.css'),'RTL/data stylesheet missing from '+page);assert.ok(html.includes('data-lang-select'),'Language selector missing from '+page)}
for(const page of ['index.html','water-toolkit.html','projectstarter.html','taqawise.html']){
 const html=read(page);assert.ok(html.includes('data-sirai-remote-photo'),'Photographs must opt in after low-data preference: '+page);
 assert.doesNotMatch(html,/<img[^>]+src="https:\/\/images\.unsplash\.com\//,'Remote photo auto-loads before preferences: '+page);
}
const saver=read('assets/data-mode.js');assert.ok(saver.includes('sirai-low-data-v1'),'Persistent low-data preference missing');
assert.ok(saver.includes('data-sirai-remote-photo'),'Photo opt-in not implemented');
for(const locale of ['en','ar','fr','de'])assert.ok(saver.includes(locale+':{'),'Missing data-mode translation '+locale);
assert.ok(read('assets/data-mode.css').includes('html[dir=rtl]'),'RTL rules missing');
assert.ok(sw.includes("'assets/data-mode.js'")&&sw.includes("'assets/data-mode.css'"),'Offline package missing data saver');
assert.ok(read('RELEASE-VERIFICATION.md').includes('Field validation'),'Verification documentation missing');
console.log('Low-bandwidth, RTL, privacy and release-integrity checks passed.');

// Preserve original brand palette and useful changes after visual rollback.
for(const page of pages){const html=read(page);assert.ok(!html.includes('assets/modern-humanitarian.css'),'Experimental design must not load on '+page);assert.ok(html.includes('assets/premium-palette.css'),'Original palette missing on '+page);assert.ok(html.includes('href="about.html"'),'About link missing on '+page);assert.ok(html.includes('href="https://joinsirai.org"'),'Official domain absent on '+page);const start=html.indexOf('<nav class="nav" id="navigation"');const end=html.indexOf('</nav>',start);assert.ok(start>=0&&end>start,'Main navigation missing in '+page);const headerNav=html.slice(start,end);assert.equal(headerNav.split('<a ').length-1,5,'Expected five main navigation links in '+page);}
assert.ok(read('assets/premium-palette.css').includes('--sirai-beige:#f3ede0'),'Original linen color missing');
assert.ok(read('assets/premium-palette.css').includes('--sirai-forest:#123e30'),'Original forest color missing');
assert.ok(sw.includes("'about.html'"),'About page must remain offline');
assert.ok(!sw.includes("'assets/modern-humanitarian.css'"),'Old redesign must not be cached');
console.log('Original brand palette restored with About and navigation preserved.');

/* Sudan Explorer: real boundaries, source labels, zero tracking, accessible state selection. */
const mapData=JSON.parse(read('assets/sudan-states.geojson'));
assert.equal(mapData.features.length,18,'Expected Sudan 18-state geometry');
assert.equal(new Set(mapData.features.map(x=>x.properties.id)).size,18,'Duplicate Sudan state code');
assert.ok(mapData.features.every(x=>x.geometry.type==='Polygon'&&x.geometry.coordinates.length),'Invalid state geometry');
const explorer=read('explorer.html');
for(const id of ['explorer-map','explorer-search','explorer-select','explorer-download','explorer-actions'])assert.ok(explorer.includes('id="'+id+'"'),'Explorer control missing: '+id);
assert.ok(explorer.includes('assets/explorer.js')&&explorer.includes('assets/explorer.css'),'Explorer scripts missing');
assert.ok(explorer.includes('amcharts/amcharts4-geodata'),'Boundary attribution missing');
for(const page of ['index.html','resources.html'])assert.ok(read(page).includes('href="explorer.html"'),'Explorer entry missing: '+page);
const explorerJS=read('assets/explorer.js');
for(const code of ['en','ar','fr','de'])assert.ok(explorerJS.includes(code+':{'),'Explorer translation missing: '+code);
for(const key of ['aria-pressed','aria-label','keydown','reliefweb.int/updates','healthcluster.who.int','crisisresponse.iom.int','new Blob'])assert.ok(explorerJS.includes(key),'Expected Explorer feature missing: '+key);
assert.ok(!/\b(?:sendBeacon|geolocation|localStorage|analytics)\b/.test(explorerJS),'Explorer must not track user locations or personal data');
for(const asset of ['explorer.html','assets/sudan-states.geojson','assets/explorer.css','assets/explorer.js','assets/explorer-entry.css'])assert.ok(sw.includes("'"+asset+"'"),'Explorer offline asset missing: '+asset);
console.log('Sudan Explorer boundary, integrity, translation, privacy and offline tests passed.');

/* Design and trust regression checks: no drift from approved colors. */
const approvedPalette=read('assets/premium-palette.css');
assert.ok(approvedPalette.includes('--sirai-forest:#123e30'),'Forest brand color missing');
assert.ok(approvedPalette.includes('--sirai-beige:#f3ede0'),'Original beige missing');
assert.ok(approvedPalette.includes('SIRAI editorial refinement'),'Editorial design refinement absent');
assert.ok(approvedPalette.includes('.pillars .pillar'),'Editorial focus area layout absent');
assert.ok(approvedPalette.includes('.sirai-hub-timeline .sirai-hub-event'),'Development timeline refinement absent');
for(const page of pages){const html=read(page);
 assert.ok(html.includes('href="privacy.html"'),'Privacy link absent from '+page);
 assert.ok(html.includes('href="terms.html"'),'Terms link absent from '+page);
}
for(const p of ['privacy.html','terms.html']){
 const html=read(p);
 assert.ok(html.includes('data-policy-page='),'Legal policy page identifier missing: '+p);
 assert.ok(html.includes('assets/policies.js'),'Policy translations missing: '+p);
 assert.ok(html.includes('assets/policies.css'),'Policy styles missing: '+p);
 assert.ok(html.includes('href="feedback.html"'),'Feedback path missing from '+p);
}
const legal=read('assets/policies.js');
for(const code of ['ar','fr','de'])assert.ok(legal.includes('"'+code+'":{'),'Legal translation missing for '+code);
assert.ok(legal.includes('Formspree')&&legal.includes('GitHub Pages')&&legal.includes('Unsplash'),'Privacy disclosures incomplete');
assert.ok(read('index.html').includes('assets/sudan-overview.svg'),'Sudan Explorer preview is not geographic');
for(const asset of ['privacy.html','terms.html','assets/policies.css','assets/policies.js','assets/sudan-overview.svg'])assert.ok(sw.includes("'"+asset+"'"),'Offline release missing '+asset);
console.log('Trust and design refinement tests passed.');


// Interactive Sudan in Numbers regression.
const statsHome=read('index.html');
const statsSection=statsHome.slice(statsHome.indexOf('<section class="sirai-statistics"'),statsHome.indexOf('<section class="sirai-home-guide">'));
assert.ok(statsSection.includes('class="container sirai-statistics-layout"'),'Editorial statistics layout missing');
assert.ok(statsSection.includes('assets/sudan-overview.svg'),'Sudan map missing from statistics feature');
assert.equal((statsSection.match(/data-sirai-stat="/g)||[]).length,3,'Expected three interactive statistic options');
for(const figure of ['33.7M','17.3M','8.58M'])assert.ok(statsSection.includes('>'+figure+'</span>'),'Missing select option: '+figure);
assert.ok(!statsSection.includes('19.5'),'Removed fourth statistic reappeared');
assert.ok(statsSection.includes('aria-live="polite"')&&statsSection.includes('aria-pressed="true"'),'Accessible selected statistic missing');
assert.ok(statsSection.includes('unicef.org/sudan/reports/'),'UNICEF report link missing');
assert.ok(statsSection.includes('5 November 2026'),'Statistics source review date missing');
assert.ok(statsSection.includes('data-i18n="stats.note"'),'Statistics disclosure translation missing');
const statScript=read('assets/app.js');
for(const locale of ['"en":{','"ar":{','"fr":{','"de":{'])assert.ok(statScript.includes(locale+'"stats.kicker"'),'Interactive stats translation missing for '+locale);
for(const key of ['stats.detail1','stats.detail2','stats.detail3'])assert.ok(statScript.includes(key),'Missing selected statistic explanation: '+key);
assert.ok(statScript.includes('data-sirai-stat'),'Statistics selector code missing');
const statsCss=read('assets/launch-quality.css');
assert.ok(statsCss.includes('.sirai-statistics-map')&&statsCss.includes('.sirai-stat-choices'),'Interactive stats styling missing');
console.log('Interactive 3-stat map, source, a11y and four-language checks passed.');
