/* SIRAI / Impact tree. The count represents reported beneficiaries, never visits. */
(()=>{'use strict';
const root=document.querySelector('[data-sirai-impact-tree]');if(!root)return;
const reportedBeneficiaries=7;
const copy={
en:{kicker:'SIRAI / OUR IMPACT',title:'Growing together. <em>Creating real impact.</em>',lead:'Every person who tells us a SIRAI tool made a difference helps this tree grow.',countLabel:'PEOPLE WHO REPORTED BENEFITING',countNote:'Seven people have reported benefiting from SIRAI tools.',treeCaption:'Seven people have helped this tree take root.',key:'One illuminated leaf = one reported positive experience',aria:'A tree with seven illuminated leaves, representing seven people who reported benefiting from SIRAI tools.'},
ar:{kicker:'SIRAI / أثرنا',title:'ننمو معًا. <em>ونصنع أثرًا حقيقيًا.</em>',lead:'كل شخص يخبرنا أن إحدى أدوات SIRAI أفادته يساهم في نمو هذه الشجرة.',countLabel:'أشخاص أفادوا باستعمال الأدوات',countNote:'أفاد سبعة أشخاص باستفادتهم من أدوات SIRAI.',treeCaption:'ساهم سبعة أشخاص في ترسيخ جذور هذه الشجرة.',key:'كل ورقة مضيئة تمثل تجربة إيجابية أُبلغنا بها',aria:'شجرة بسبع أوراق مضيئة تمثل أشخاصًا أفادوا باستفادتهم من أدوات SIRAI.'},
fr:{kicker:'SIRAI / NOTRE IMPACT',title:'Grandir ensemble. <em>Créer un impact réel.</em>',lead:'Chaque personne qui nous dit qu’un outil SIRAI lui a été utile contribue à faire grandir cet arbre.',countLabel:'PERSONNES AYANT SIGNALÉ UN BÉNÉFICE',countNote:'Sept personnes ont déclaré avoir bénéficié des outils SIRAI.',treeCaption:'Sept personnes ont aidé cet arbre à prendre racine.',key:'Une feuille illuminée = un retour positif signalé',aria:'Un arbre avec sept feuilles illuminées, représentant les personnes ayant signalé un bénéfice des outils SIRAI.'},
de:{kicker:'SIRAI / UNSERE WIRKUNG',title:'Gemeinsam wachsen. <em>Wirkung entfalten.</em>',lead:'Jede Person, die uns mitteilt, dass ein SIRAI-Tool hilfreich war, lässt diesen Baum wachsen.',countLabel:'PERSONEN MIT GEMELDETEM NUTZEN',countNote:'Sieben Personen haben von den SIRAI-Tools profitiert.',treeCaption:'Sieben Menschen haben diesem Baum geholfen, Wurzeln zu schlagen.',key:'Ein leuchtendes Blatt = eine gemeldete positive Erfahrung',aria:'Ein Baum mit sieben leuchtenden Blättern für Menschen, die von SIRAI-Tools berichtet haben.'}
};
function render(){const lang=(document.documentElement.lang||'en').toLowerCase().split('-')[0],t=copy[lang]||copy.en;
root.querySelectorAll('[data-impact]').forEach(el=>{const k=el.dataset.impact;if(t[k]!==undefined)el.innerHTML=t[k]});
const number=root.querySelector('#sirai-impact-number');if(number){number.textContent=String(reportedBeneficiaries).padStart(2,'0');number.setAttribute('aria-label',reportedBeneficiaries+' people reported benefiting')}
const desc=root.querySelector('#sirai-tree-svg-desc');if(desc)desc.textContent=t.aria;
}
render();document.querySelectorAll('[data-lang-select]').forEach(el=>el.addEventListener('change',()=>setTimeout(render,0)));
new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
