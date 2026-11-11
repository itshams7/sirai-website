/* SIRAI / Impact tree copy and gentle entrance. Count is reported-beneficiary data, not visits. */
(()=>{'use strict';
const root=document.querySelector('[data-sirai-impact-tree]');if(!root)return;
/* Update only when a person has explicitly reported that a SIRAI tool was useful. */
const reportedBeneficiaries=3;
const copy={
 en:{kicker:'SIRAI / OUR IMPACT',title:'Growing together. Creating real impact.',lead:'Every person who tells us a SIRAI tool made a difference helps this tree grow.',countLabel:'PEOPLE WHO REPORTED BENEFITING',countNote:'Real people. Real feedback. And counting.',treeCaption:'Three people have helped this tree take root.',key:'One illuminated leaf = one reported positive experience',verifiedTitle:'Reported, not assumed',verifiedText:'We count people who tell us a tool was useful, not visits or clicks.',growthTitle:'A tree that keeps growing',growthText:'As more people report benefiting, more leaves will light up.',aria:'A growing tree representing people who reported benefiting from SIRAI tools.'},
 ar:{kicker:'SIRAI / أثرنا',title:'ننمو معًا.<br>ونصنع أثرًا حقيقيًا.',lead:'كل شخص يخبرنا أن إحدى أدوات SIRAI أفادته يساهم في نمو هذه الشجرة.',countLabel:'أشخاص أفادوا باستعمال الأدوات',countNote:'أشخاص حقيقيون. آراء حقيقية. والعدد في ازدياد.',treeCaption:'ثلاثة أشخاص ساعدوا هذه الشجرة على ترسيخ جذورها.',key:'كل ورقة مضيئة تمثل تجربة إيجابية أُبلغنا بها',verifiedTitle:'أثر أُبلغنا به، لا نفترضه',verifiedText:'نحصي من أخبرونا أن الأداة أفادتهم، لا الزيارات أو النقرات.',growthTitle:'شجرة تواصل النمو',growthText:'كلما أفاد أشخاص أكثر باستفادتهم، أضاءت أوراق جديدة.',aria:'شجرة نامية تمثل الأشخاص الذين أفادوا باستفادتهم من أدوات SIRAI.'},
 fr:{kicker:'SIRAI / NOTRE IMPACT',title:'Grandir ensemble.<br>Créer un impact réel.',lead:'Chaque personne qui nous dit qu’un outil SIRAI lui a été utile contribue à faire grandir cet arbre.',countLabel:'PERSONNES AYANT SIGNALÉ UN BÉNÉFICE',countNote:'Des personnes réelles. Des retours réels. Et la suite.',treeCaption:'Trois personnes ont aidé cet arbre à prendre racine.',key:'Une feuille illuminée = un retour positif signalé',verifiedTitle:'Déclaré, pas supposé',verifiedText:'Nous comptons les personnes qui nous disent qu’un outil leur a été utile, pas les visites ou les clics.',growthTitle:'Un arbre qui continue de grandir',growthText:'À mesure que d’autres personnes signalent un bénéfice, de nouvelles feuilles s’illuminent.',aria:'Un arbre en croissance représentant les personnes ayant signalé un bénéfice des outils SIRAI.'},
 de:{kicker:'SIRAI / UNSERE WIRKUNG',title:'Gemeinsam wachsen.<br>Wirkung entfalten.',lead:'Jede Person, die uns mitteilt, dass ein SIRAI-Tool hilfreich war, lässt diesen Baum wachsen.',countLabel:'PERSONEN MIT GEMELDETEM NUTZEN',countNote:'Echte Menschen. Echtes Feedback. Und es geht weiter.',treeCaption:'Drei Menschen haben diesem Baum geholfen, Wurzeln zu schlagen.',key:'Ein leuchtendes Blatt = eine gemeldete positive Erfahrung',verifiedTitle:'Gemeldet, nicht vermutet',verifiedText:'Wir zählen Menschen, die uns den Nutzen bestätigen, keine Besuche oder Klicks.',growthTitle:'Ein Baum, der weiterwächst',growthText:'Wenn weitere Menschen einen Nutzen melden, leuchten weitere Blätter auf.',aria:'Ein wachsender Baum für Menschen, die von SIRAI-Tools berichtet haben.'}
};
function render(){
 const lang=(document.documentElement.lang||'en').toLowerCase().split('-')[0],t=copy[lang]||copy.en;
 root.querySelectorAll('[data-impact]').forEach(el=>{const k=el.dataset.impact;if(t[k]!==undefined){if(k==='title')el.innerHTML=t[k];else el.textContent=t[k]}});
 const count=Math.max(0,reportedBeneficiaries);
 const number=root.querySelector('#sirai-impact-number');
 if(number){number.textContent=String(count).padStart(2,'0');number.setAttribute('aria-label',count+' people reported benefiting');}
 
 const desc=root.querySelector('#sirai-tree-svg-desc');if(desc)desc.textContent=t.aria+' '+count;
}
/* CSS animates the trunk, branches and each of the three confirmed leaves. */
render();
const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){animate();observer.disconnect()}},{threshold:.2});
observer.observe(root);
document.querySelectorAll('[data-lang-select]').forEach(el=>el.addEventListener('change',()=>setTimeout(render,0)));
new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
