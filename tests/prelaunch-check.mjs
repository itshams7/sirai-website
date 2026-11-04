/* SIRAI static pre-launch safeguards, no dependencies. */
import {readFileSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>readFileSync(p,'utf8');
const sw=read('sw.js');
const js=read('assets/offline-share.js');
const assetBlock=sw.match(/const ASSETS=\[([\s\S]*?)\];/)?.[1]||'';
const assets=[...assetBlock.matchAll(/'([^']+)'/g)].map(m=>m[1]);
assert(assets.length>=25,'Offline package should contain all local tools and translations');
for(const file of assets)assert(existsSync(file),'Missing offline asset: '+file);
assert(sw.includes("url.pathname===ROOT"),'Offline root path fallback is missing');
assert(sw.includes('await caches.delete(VERSION)'),'Atomic cache rollback is missing');
assert(js.includes('sirai-share-dialog'),'Editable share review is missing');
assert(js.includes('caches.keys()'),'Offline readiness must be verified');
const pages={
 'index.html':[],
 'water-toolkit.html':['ws-share','ws-plan'],
 'projectstarter.html':['ps-share','sirai-project-template'],
 'taqawise.html':['tq-share','sirai-battery-preset'],
 'feedback.html':[]
};
for(const [file,ids] of Object.entries(pages)){
 const page=read(file);
 assert(page.includes('rel="manifest"'),'PWA manifest missing: '+file);
 assert(page.includes('assets/offline-share.js'),'Offline helper missing: '+file);
 assert(page.includes('assets/offline-share.css'),'Offline styles missing: '+file);
 for(const id of ids)assert(page.includes('id="'+id+'"'),'Missing control '+id+' in '+file);
}
const water=read('assets/watershare.js');
const energy=read('assets/taqawise.js');
const project=read('assets/projectstarter.js');
assert(water.includes("window.SIRAI_SHARE?.share"),'Water sharing missing');
assert(water.includes("Times and locations are deliberately excluded"),'Water safety share text missing');
assert(project.includes('const siraiTemplates='),'Community project templates missing');
assert(project.includes("if(!(c.item||'').trim())"),'Budget blank-row handling missing');
assert(energy.includes('const batteryPresets='),'Battery examples missing');
assert(energy.includes("window.SIRAI_SHARE?.share"),'Energy share missing');
console.log('SIRAI static checks passed: '+assets.length+' offline assets, '+Object.keys(pages).length+' pages, 3 planning tools.');
