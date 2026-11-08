/* SIRAI maintained static-site regression checks, no browser dependencies. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const exists=path=>fs.existsSync(new URL('../'+path,import.meta.url));
const pages=[
 'index.html','about.html','resources.html','updates.html','get-involved.html',
 'explorer.html','water-toolkit.html','projectstarter.html','taqawise.html',
 'feedback.html','start-here.html','faq.html','transparency.html',
 'privacy.html','terms.html','cooking-energy.html','issues.html',
 'practical-guide.html','footage-credits.html'
];
for(const file of pages){
 const html=read(file);
 assert.match(html,/<main\b[^>]*id="main"/,'Missing main landmark: '+file);
 assert.match(html,/<meta\s+name="viewport"/,'Missing viewport: '+file);
 assert.ok(html.includes('assets/theme-obsidian-ice-burgundy.css'),'Missing site theme: '+file);
 assert.ok(html.includes('rel="icon" href="favicon.png"'),'Missing standardized teal PNG favicon: '+file);
 assert.equal((html.match(/<section\b/g)||[]).length,(html.match(/<\/section>/g)||[]).length,'Mismatched section tags: '+file);
 assert.ok(!html.includes('joinsirai.org/index.html'),'Unnecessary index URL in '+file);
 for(const image of html.matchAll(/<img\b[^>]*>/g))assert.match(image[0],/\balt=/,'Missing image alt: '+file);
 for(const link of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g))
  assert.match(link[0],/\brel="[^"]*noopener/,'Unsafe external new-tab link: '+file);
}
const home=read('index.html'),about=read('about.html'),resources=read('resources.html');
const updates=read('updates.html'),feedback=read('feedback.html');
const roadmap=read('assets/road-ahead.js'),roadmapCss=read('assets/road-ahead.css');
assert.match(home,/id="roadmap"[^>]*data-sirai-roadmap/,'Roadmap missing');
assert.equal((home.match(/id="roadmap"/g)||[]).length,1,'Duplicate homepage roadmap');
assert.equal((home.match(/data-roadmap-step="/g)||[]).length,4,'Roadmap needs four selectable stages');
assert.ok(home.includes('assets/road-ahead.js')&&home.includes('assets/road-ahead.css'),'Roadmap dependencies not loaded');
for(const lang of ['en','ar','fr','de'])assert.ok(roadmap.includes(lang+':{'),'Roadmap translation missing: '+lang);
assert.ok(roadmap.includes('aria-current')&&roadmap.includes('ArrowRight')&&roadmap.includes('ArrowLeft'),'Keyboard and selected-state support missing');
assert.ok(roadmapCss.includes('prefers-reduced-motion'),'Reduced motion support missing');
assert.ok(!home.includes('sirai-2028-section')&&!about.includes('class="roadmap"'),'Redundant roadmap remains');
assert.ok(!about.includes('sirai-objectives-grid'),'Duplicated priorities remain');
assert.ok(!updates.includes('data-hub="updates.now"'),'Redundant status card remains');
assert.ok(!resources.includes('data-i18n="new.testing"'),'Repeated limitations panel remains');
assert.ok(!feedback.includes('class="sf-end"'),'Repeated feedback ending remains');
assert.ok(!home.includes('sf-inline-invite'),'Repeated feedback banner remains on homepage');

const sw=read('sw.js'),offline=read('assets/offline-share.js');
assert.match(sw,/const VERSION='sirai-offline-v\d+/,'Missing cache version');
assert.ok(offline.includes('keys.some('),'Offline status uses obsolete fixed cache version');
for(const asset of [...sw.matchAll(/'([^']+\.(?:html|css|js|svg|png|geojson|webmanifest))'/g)].map(m=>m[1]))
 assert.ok(exists(asset),'Offline asset missing: '+asset);
for(const asset of ['assets/road-ahead.js','assets/road-ahead.css','favicon.png'])
 assert.ok(sw.includes("'"+asset+"'"),'Offline resource absent: '+asset);

const manifest=JSON.parse(read('manifest.webmanifest'));
assert.ok(manifest.icons.some(i=>i.src==='favicon.png'),'Installable icon missing');
for(const p of ['water-toolkit.html','projectstarter.html','taqawise.html'])
 assert.ok(read(p).includes('assets/sirai-math.js'),'Calculation module absent: '+p);
for(const p of ['feedback.html','get-involved.html']){
 const html=read(p);
 assert.ok(/name="adult_confirmation"[^>]*required/.test(html),'Adult confirmation missing: '+p);
 assert.ok(html.includes('privacy.html#rights'),'Data-rights link missing: '+p);
}
assert.ok(read('privacy.html').includes('id="rights"'),'Privacy deletion instructions missing');
assert.equal(JSON.parse(read('assets/sudan-states.geojson')).features.length,18,'Expected 18 Sudan states');
assert.ok(home.includes('id="sirai-idp-map"'),'Sudan data map missing');
assert.ok(home.includes('footage-credits.html'),'Media attribution link missing');
console.log('SIRAI current-site regression checks passed on '+pages.length+' pages. Browser/device checks remain separate.');
