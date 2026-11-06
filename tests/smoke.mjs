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
assert.ok(homepage.includes('assets/app.js?v=20261106-objectives-1'),'Homepage uses a stale language script URL');
assert.ok(sw.includes("'assets/editorial-cinematic.css'"),'Editorial design is absent from offline cache');
for(const file of ['assets/founder-editorial.css','assets/founder-editorial.js'])assert.ok(sw.includes("'"+file+"'"),'Founder feature missing from offline assets: '+file);
for(const file of ['assets/focus-refined.css','assets/focus-refined.js'])assert.ok(sw.includes("'"+file+"'"),'Focus section missing from offline assets: '+file);
assert.ok(homepage.includes('sirai-focus-showcase') && homepage.includes('data-focus-choice="2"'),'Interactive priorities markup missing');
assert.ok(homepage.includes('id="sirai-2028-title"') && homepage.includes('data-i18n="goal.2028.title"'),'Missing public 2028 goal');
assert.ok(sw.includes("'assets/goal-2028.css'"),'Goal styles missing from offline cache');
assert.ok(sw.includes("'assets/objectives.css'"),'Objectives stylesheet not available offline');
for(const pg of ['index.html','about.html']){
 const html=read(pg);
 assert.ok(html.includes('class="sirai-objectives"'),'Missing objectives section in '+pg);
 assert.equal((html.match(/class="sirai-objective-card"/g)||[]).length,3,'Expected three objectives in '+pg);
 assert.ok(html.includes('assets/objectives.css'),'Objectives stylesheet missing in '+pg);
 assert.ok(html.includes('assets/app.js?v=20261106-objectives-1'),'Objective localization cache-bust missing in '+pg);
}
for(const key of ['about.objectives.title','about.objectives.1.title','about.objectives.2.title','about.objectives.3.title'])assert.ok(languageScript.includes('"'+key+'"'),'Objective translation missing '+key);

for(const file of ['assets/hero-montage.css','assets/hero-montage.js'])assert.ok(sw.includes("'"+file+"'"),'Cinematic montage not cached: '+file);
assert.ok(homepage.includes('data-sirai-hero-reel'),'Video hero missing');
assert.equal((homepage.match(/data-reel-video="/g)||[]).length,3,'Expected three archival documentary videos');
assert.ok(!homepage.includes('data-reel-photo='),'Still images must not be part of the montage');
assert.ok(!homepage.includes('data-reel-toggle'),'Visible playback button remains');
assert.ok(!homepage.includes('sirai-reel-credits'),'Visible source button remains');
assert.ok(!homepage.includes('sirai-photo-caption'),'Hero overlay caption remains');
assert.ok(!homepage.includes('Girls_playing_football.webm'),'Football scene remains');
assert.ok(homepage.includes('footage-credits.html'),'Footage sources must be linked from footer');
assert.ok(read('footage-credits.html').includes('Jawaher') && read('footage-credits.html').includes('Voice of America'),'Missing off-hero footage credits');
assert.ok(sw.includes("'footage-credits.html'"),'Video sources page not cached for offline use');

for(const key of ['goal.title','goal.lead','goal.condition','goal.2027.title','goal.2028.title','goal.report.title'])assert.ok(languageScript.includes('"'+key+'"'),'Missing goal translation '+key);
assert.ok(homepage.includes('sirai-founder-letter') && homepage.includes('founder-portrait-new.png'),'Founder letter or portrait missing');
console.log('Homepage translation regression checks passed.');

// Mobile iPhone header: connection status must live outside the header controls.
const offlineScript=read('assets/offline-share.js');
const accessibleCss=read('assets/launch-quality.css');
assert.ok(offlineScript.includes("document.getElementById('sirai-offline-indicator')?.remove()"),'Offline readiness badge must be removed');
assert.ok(accessibleCss.includes('#sirai-offline-indicator.sirai-offline-indicator{position:static!important'),'Status must not float over iPhone controls');
assert.ok(accessibleCss.includes('background:#e7efe8'),'Language control must use the distinctive sage style');
assert.ok(homepage.includes('assets/launch-quality.css?v=20261105-impact-bars-1'),'Mobile CSS cache version not refreshed');
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

// The map must convey data without inventing state-level values or displacement routes.
const mapHome=read('index.html');
const mapSection=mapHome.slice(mapHome.indexOf('<section class="sirai-statistics"'),mapHome.indexOf('<section class="sirai-home-guide">'));
for(const id of ['sirai-stats-map','sirai-map-overlay-number','sirai-map-heading','sirai-map-explainer','sirai-map-compare'])assert.ok(mapSection.includes('id="'+id+'"'),'Missing meaningful data map element: '+id);
assert.ok(mapSection.includes('17.3M children out of 33.7M people'),'No truthful national comparison in children mode');
assert.ok(mapSection.includes('id="sirai-map-compare" hidden'),'Comparison must be initially hidden');
assert.ok(!mapSection.includes('state-level hotspots')&&!mapSection.includes('migration routes'),'Unverified geography markers');
const mapJs=read('assets/app.js');
for(const key of ['stats.mapNeedTitle','stats.mapChildrenTitle','stats.mapDisplacedTitle','stats.mapChildrenCompare','stats.mapDisplacedText'])assert.ok(mapJs.includes(key),'Missing multilingual map key '+key);
assert.ok(mapJs.includes("comparison.hidden=key!=='children'"),'Child share comparison must only appear for child indicator');
assert.ok(mapJs.includes("map.dataset.statMode=key"),'Map must respond to selected statistic');
const mapCss=read('assets/launch-quality.css');
assert.ok(mapCss.includes('.sirai-map-visual-layer')&&mapCss.includes('.sirai-map-overlay')&&mapCss.includes('.sirai-map-compare-fill'),'Responsive map infographic styling missing');
assert.ok(mapCss.includes('width:51.3%'),'Children national-share bar not aligned with 17.3 / 33.7');
console.log('Data-bearing map, source integrity, interaction and offline release checks passed.');

// Source-grounded 18-state IOM DTM June 2026 hosted-IDP map.
const idpMapHtml=read('index.html');
for(const marker of ['id="sirai-idp-map"','id="sirai-idp-svg"','id="sirai-idp-select"','id="sirai-idp-panel"','id="sirai-idp-name"','id="sirai-idp-value"'])assert.ok(idpMapHtml.includes(marker),'Missing state map UI: '+marker);
assert.ok(idpMapHtml.includes('assets/state-displacement.js?v=20261105-idp-state-map-2'),'State map not loaded on homepage');
assert.ok(idpMapHtml.includes('2026 IOM DTM'),'Missing geographic data date');
assert.ok(idpMapHtml.includes('published June total differs'),'Missing disclosed source table discrepancy');
const idpScript=read('assets/state-displacement.js');
const idpRows=[...idpScript.slice(idpScript.indexOf('const entries=['),idpScript.indexOf('];',idpScript.indexOf('const entries=['))).matchAll(/\['(SD-[A-Z]{2})','[^']+','[^']+','[^']+','[^']+',([0-9]+)\]/g)];
assert.equal(idpRows.length,18,'Expected 18 sourced state displacement counts');
assert.equal(new Set(idpRows.map(x=>x[1])).size,18,'Duplicate state in IDP dataset');
assert.equal(idpRows.reduce((sum,x)=>sum+Number(x[2]),0),8685253,'IOM state table changed, recheck source before publishing');
const geoIds=new Set(JSON.parse(read('assets/sudan-states.geojson')).features.map(f=>f.properties.id));
assert.deepEqual(new Set(idpRows.map(x=>x[1])),geoIds,'Choropleth does not cover exactly the 18 map states');
assert.ok(idpScript.includes('host.hidden=!visible')&&idpScript.includes("map.dataset.statMode==='displaced'"),'State map must only appear for displaced indicator');
assert.ok(idpScript.includes("event.key==='Enter'"),'State keyboard selection missing');
assert.ok(idpScript.includes("role','button'"),'Interactive state accessibility missing');
assert.ok(read('sw.js').includes("'assets/state-displacement.js'"),'State map not available offline');
const idpCss=read('assets/launch-quality.css');
assert.ok(idpCss.includes('.sirai-idp-map path.is-selected')&&idpCss.includes('.sirai-idp-key'),'State highlighting and legend missing');
console.log('IOM June 2026 18-state data, geographic coverage, offline and accessibility checks passed.');

// Source-backed interactive national comparisons: no fake live counts or dot symbols.
const nationalHome=read('index.html');
for(const id of ['sirai-national-visual','sirai-national-need','sirai-national-children','sirai-national-source'])assert.ok(nationalHome.includes('id="'+id+'"'),'Missing national comparison component '+id);
for(const pair of ['33.7M','20.4M','10.6M','17.3M','16.4M','51.3%'])assert.ok(nationalHome.includes(pair),'Missing sourced national comparison value '+pair);
assert.equal((nationalHome.match(/data-bar-value="/g)||[]).length,3,'Need three common-scale bars');
assert.ok(nationalHome.includes('data-bar-value="60.5"')&&nationalHome.includes('data-bar-value="31.5"'),'Target and reach percentages must share need denominator');
assert.ok(nationalHome.includes('sirai-children-split')&&nationalHome.includes('sirai-children-split-child'),'Children share comparison not present');
assert.ok(!nationalHome.includes('sirai-national-dots'),'Old dot grid still loaded on homepage');
const nationalJs=read('assets/app.js');
assert.ok(nationalJs.includes("national.hidden=!showing"),'National comparison not tied to the selected statistic');
assert.ok(nationalJs.includes("needView.hidden=key!=='need'")&&nationalJs.includes("childView.hidden=key!=='children'"),'Unique national views not isolated');
assert.ok(nationalJs.includes("sourceLink.href=key==='children'"),'Mode-specific source link missing');
for(const language of ['"en":{','"ar":{','"fr":{','"de":{'])assert.ok(nationalJs.includes(language+'"stats.visualKicker"'),'Comparison translations incomplete for '+language);
const nationalCss=read('assets/launch-quality.css');
assert.ok(nationalCss.includes('.sirai-national-bar-fill')&&nationalCss.includes('.sirai-children-split'),'Interactive comparison CSS missing');
assert.ok(nationalCss.includes('prefers-reduced-motion'),'Reduced motion fallback missing');
assert.ok(nationalJs.includes('requestAnimationFrame'),'Bar animation must react to the active view');
assert.ok(nationalHome.includes('not a live counter'),'Never label published snapshots as a live count');
console.log('National aid and children comparisons: sources, dates, interaction and four languages passed.');
