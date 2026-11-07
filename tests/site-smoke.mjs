import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = path => readFileSync(path,'utf8');
const home=read('index.html'),about=read('about.html');
const resources=read('resources.html'),updates=read('updates.html'),involved=read('get-involved.html');
const locales=read('assets/app.js'),css=read('assets/community-hub.css'),sw=read('sw.js');
const expect=(yes,message)=>assert.ok(yes,message);
for(const [name,html] of Object.entries({'index.html':home,'about.html':about,'resources.html':resources,'updates.html':updates,'get-involved.html':involved})){
 expect(html.includes('assets/unified-header.css'),name+' lacks shared navigation');
 expect(html.includes('name="viewport"'),name+' lacks mobile viewport');
 expect(html.includes('data-lang-select'),name+' lacks language selector');
}
expect(home.includes('sirai-quick-tools'),'Missing quick access to practical tools');
for(const target of ['water-toolkit.html','projectstarter.html','taqawise.html','explorer.html']){
 expect(home.includes('href="'+target+'"'),'Quick resource missing: '+target);
 expect(existsSync(target),'Resource file missing: '+target);
}
expect(!home.includes('class="sirai-home-guide"'),'Duplicate start guide still on homepage');
expect(!home.includes('class="sirai-founder-editorial"'),'Founder section duplicated on homepage');
expect(about.includes('sirai-founder-editorial'),'Founder section missing from About');
expect(about.includes('sirai-development-alignment'),'About lacks development context');
expect(about.includes('https://sdgs.un.org/2030agenda'),'UN source missing');
expect(about.includes('https://au.int/en/agenda2063/goals'),'African Union source missing');
expect(about.includes('not affiliated with the UN or African Union'),'Framework independence disclosure missing');
for(const [name,page] of Object.entries({about,resources,updates,involved})){
 expect(page.includes('sirai-hero-photo-note'),name+' lacks photographic disclosure');
}
for(const lang of ['en','ar','fr','de']){
 expect(locales.includes(''+lang+':')||locales.includes('"'+lang+'":'),'Missing locale: '+lang);
}
expect(locales.includes('photo.disclaimer'),'Localized photo disclosure missing');
expect(locales.includes('alignment.disclaimer'),'Localized framework disclosure missing');
expect(sw.includes('assets/sirai-alignment.css'),'Offline cache missing context stylesheet');
expect(sw.includes('assets/unified-header.css'),'Offline cache missing global header');
expect(involved.includes('https://formspree.io/f/mnpplgae'),'Existing feedback endpoint missing');
expect(involved.includes('name="consent"'),'Consent input missing');
expect(css.includes('photo-1531482615713-2afd69097998'),'Lagos resources photograph missing');
console.log('SIRAI static smoke checks passed. This is NOT real-device, offline, or email-delivery validation.');
