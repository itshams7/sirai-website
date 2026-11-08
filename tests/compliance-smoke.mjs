import {readFileSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
const read=f=>readFileSync(f,'utf8');
const pages=[
 'index.html','about.html','resources.html','updates.html','get-involved.html',
 'explorer.html','water-toolkit.html','projectstarter.html','taqawise.html',
 'feedback.html','start-here.html','faq.html','transparency.html',
 'privacy.html','terms.html','cooking-energy.html','issues.html',
 'practical-guide.html','footage-credits.html'
];
for(const file of pages){
 assert.ok(existsSync(file),'Missing page: '+file);
 const html=read(file);
 assert.ok(html.includes('assets/theme-obsidian-ice-burgundy.css'),'Premium CSS missing: '+file);
 assert.ok(!html.includes('joinsirai.org/index.html'),'Use canonical domain root rather than index.html: '+file);
 for(const m of html.matchAll(/<img\b[^>]*>/g))
  assert.ok(/\balt=/.test(m[0]),'Missing image alt attribute in '+file);
 for(const m of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g))
  assert.ok(/\brel="[^"]*noopener/.test(m[0]),'Unsafe target=_blank in '+file);
}
const privacy=read('privacy.html'),terms=read('terms.html'),feedback=read('feedback.html'),involved=read('get-involved.html'),media=read('footage-credits.html');
for(const id of ['cookies','children','rights'])
 assert.ok(privacy.includes('id="'+id+'"'),'Privacy disclosure missing: '+id);
assert.ok(privacy.includes('mailto:shaamsuni@gmail.com'),'Privacy request contact absent');
assert.ok(privacy.includes('Formspree'),'Form provider disclosure absent');
assert.ok(terms.includes('id="free"')&&terms.includes('id="age"'),'Free-service or age terms absent');
for(const [name,markup] of [['feedback',feedback],['idea',involved]]){
 assert.ok(/name="adult_confirmation"[^>]*required/.test(markup),'Adult confirmation missing on '+name);
 assert.ok(/type="checkbox"[^>]*required/.test(markup),'Consent checkbox missing on '+name);
 assert.ok(markup.includes('privacy.html#rights'),'Privacy request link missing on '+name);
}
assert.ok(media.includes('https://unsplash.com/license'),'Photo license link absent');
assert.ok(media.includes('https://fonts.google.com/specimen/Inter'),'Font source absent');
assert.ok(media.includes('Wikimedia Commons'),'Video attribution absent');
const trans=read('assets/policies.js'),feedbackJs=read('assets/feedback.js'),hubJs=read('assets/community-hub.js');
for(const key of ['cookies.h','children.h','rights.h','free.h','age.h'])
 assert.ok(trans.includes(key),'Policy translation missing: '+key);
assert.ok(feedbackJs.includes('ageConsent'),'Feedback age translation absent');
assert.ok(hubJs.includes('idea.ageConsent'),'Idea age translation absent');
const manifest=JSON.parse(read('manifest.webmanifest'));
assert.equal(manifest.theme_color.toLowerCase(),'#111116');
assert.equal(manifest.background_color.toLowerCase(),'#eef1f5');
console.log('SIRAI compliance-oriented static checks passed for '+pages.length+' pages. This is not a legal-compliance certification or provider-delivery test.');
