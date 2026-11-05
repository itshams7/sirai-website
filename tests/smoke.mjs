/* Run: node tests/smoke.mjs (no dependencies). */
import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const pages=['index.html','water-toolkit.html','projectstarter.html','taqawise.html','feedback.html','transparency.html'];
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
assert.ok(homepage.includes('assets/app.js?v=20261105-language-fix-1'),'Homepage uses a stale language script URL');
assert.ok(read('sw.js').includes('sirai-offline-v9-translation-20261105'),'Service worker cache not refreshed');
console.log('Homepage translation regression checks passed.');
