/* SIRAI / Impact tree copy and gentle entrance. Count is reported-beneficiary data, not visits. */
(()=>{'use strict';
const root=document.querySelector('[data-sirai-impact-tree]');if(!root)return;
/* Update only when a person has explicitly reported that a SIRAI tool was useful. */
const reportedBeneficiaries=3;
const copy={
 en:{kicker:'SIRAI / OUR IMPACT',title:'Growing together. Creating real impact.',lead:'Every person who tells us a SIRAI tool made a difference helps this tree grow.',countLabel:'PEOPLE WHO REPORTED BENEFITING',countNote:'Real people. Real feedback. And counting.',footnote:'Each illuminated leaf represents one person who has reported benefiting from a SIRAI tool. No personal details are displayed.',treeCaption:'Three people have helped this tree take root.',key:'One illuminated leaf = one reported positive experience',verifiedTitle:'Reported, not assumed',verifiedText:'We count people who tell us a tool was useful, not visits or clicks.',privacyTitle:'Privacy comes first',privacyText:'No names or personal details appear in this visual.',growthTitle:'A tree that keeps growing',growthText:'As more people report benefiting, more leaves will light up.',aria:'A growing tree representing people who reported benefiting from SIRAI tools.'},
 ar:{kicker:'SIRAI / أثرنا',title:'ننمو معًا.<br>ونصنع أثرًا حقيقيًا.',lead:'كل شخص يخبرنا أن إحدى أدوات SIRAI أفادته يساهم في نمو هذه الشجرة.',countLabel:'أشخاص أفادوا باستعمال الأدوات',countNote:'أشخاص حقيقيون. آراء حقيقية. والعدد في ازدياد.',footnote:'تمثل كل ورقة مضيئة شخصًا أفاد بأنه استفاد من إحدى أدوات SIRAI. لا نعرض أي بيانات شخصية.',treeCaption:'ثلاثة أشخاص ساعدوا هذه الشجرة على ترسيخ جذورها.',key:'كل ورقة مضيئة تمثل تجربة إيجابية أُبلغنا بها',verifiedTitle:'أثر أُبلغنا به، لا نفترضه',verifiedText:'نحصي من أخبرونا أن الأداة أفادتهم، لا الزيارات أو النقرات.',privacyTitle:'الخصوصية أولًا',privacyText:'لا تظهر أسماء أو معلومات شخصية في هذا التصميم.',growthTitle:'شجرة تواصل النمو',growthText:'كلما أفاد أشخاص أكثر باستفادتهم، أضاءت أوراق جديدة.',aria:'شجرة نامية تمثل الأشخاص الذين أفادوا باستفادتهم من أدوات SIRAI.'},
 fr:{kicker:'SIRAI / NOTRE IMPACT',title:'Grandir ensemble.<br>Créer un impact réel.',lead:'Chaque personne qui nous dit qu’un outil SIRAI lui a été utile contribue à faire grandir cet arbre.',countLabel:'PERSONNES AYANT SIGNALÉ UN BÉNÉFICE',countNote:'Des personnes réelles. Des retours réels. Et la suite.',footnote:'Chaque feuille illuminée représente une personne ayant indiqué avoir bénéficié d’un outil SIRAI. Aucune donnée personnelle n’est affichée.',treeCaption:'Trois personnes ont aidé cet arbre à prendre racine.',key:'Une feuille illuminée = un retour positif signalé',verifiedTitle:'Déclaré, pas supposé',verifiedText:'Nous comptons les personnes qui nous disent qu’un outil leur a été utile, pas les visites ou les clics.',privacyTitle:'La confidentialité d’abord',privacyText:'Aucun nom ni renseignement personnel n’apparaît ici.',growthTitle:'Un arbre qui continue de grandir',growthText:'À mesure que d’autres personnes signalent un bénéfice, de nouvelles feuilles s’illuminent.',aria:'Un arbre en croissance représentant les personnes ayant signalé un bénéfice des outils SIRAI.'},
 de:{kicker:'SIRAI / UNSERE WIRKUNG',title:'Gemeinsam wachsen.<br>Wirkung entfalten.',lead:'Jede Person, die uns mitteilt, dass ein SIRAI-Tool hilfreich war, lässt diesen Baum wachsen.',countLabel:'PERSONEN MIT GEMELDETEM NUTZEN',countNote:'Echte Menschen. Echtes Feedback. Und es geht weiter.',footnote:'Jedes leuchtende Blatt steht für eine Person, die berichtet hat, von einem SIRAI-Tool profitiert zu haben. Persönliche Daten werden nicht angezeigt.',treeCaption:'Drei Menschen haben diesem Baum geholfen, Wurzeln zu schlagen.',key:'Ein leuchtendes Blatt = eine gemeldete positive Erfahrung',verifiedTitle:'Gemeldet, nicht vermutet',verifiedText:'Wir zählen Menschen, die uns den Nutzen bestätigen, keine Besuche oder Klicks.',privacyTitle:'Datenschutz zuerst',privacyText:'Namen und persönliche Angaben werden nicht angezeigt.',growthTitle:'Ein Baum, der weiterwächst',growthText:'Wenn weitere Menschen einen Nutzen melden, leuchten weitere Blätter auf.',aria:'Ein wachsender Baum für Menschen, die von SIRAI-Tools berichtet haben.'}
};
function render(){
 const lang=(document.documentElement.lang||'en').toLowerCase().split('-')[0],t=copy[lang]||copy.en;
 root.querySelectorAll('[data-impact]').forEach(el=>{const k=el.dataset.impact;if(t[k]!==undefined){if(k==='title')el.innerHTML=t[k];else el.textContent=t[k]}});
 const count=Math.max(0,reportedBeneficiaries);
 const number=root.querySelector('#sirai-impact-number');
 if(number){number.textContent=String(count).padStart(2,'0');number.setAttribute('aria-label',count+' people reported benefiting');}
 const caption=root.querySelector('.sirai-impact-tree-caption');
 if(caption&&count!==3)caption.querySelector('[data-impact="treeCaption"]').textContent=t.treeCaption.replace(/^Three|^Drei|^Trois|^ثلاثة/,String(count));
 const desc=root.querySelector('#sirai-tree-svg-desc');if(desc)desc.textContent=t.aria+' '+count;
}
let started=false;
function animate(){
 if(started)return;started=true;
 const leaves=[...root.querySelectorAll('.sirai-tree-leaf.is-lit')];
 leaves.forEach((leaf,i)=>{leaf.style.opacity='0';leaf.style.transform+=' scale(.25)';leaf.style.transition='opacity .7s ease, transform .9s cubic-bezier(.2,.8,.2,1)';requestAnimationFrame(()=>setTimeout(()=>{leaf.style.opacity='1';leaf.style.transform=leaf.getAttribute('transform')+' scale(1)'},220+i*280));});
}
render();
const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){animate();observer.disconnect()}},{threshold:.2});
observer.observe(root);
document.querySelectorAll('[data-lang-select]').forEach(el=>el.addEventListener('change',()=>setTimeout(render,0)));
new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
