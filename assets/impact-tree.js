/* SIRAI / Impact tree. The count represents reported beneficiaries, never visits. */
(()=>{'use strict';
const root=document.querySelector('[data-sirai-impact-tree]');if(!root)return;
const reportedBeneficiaries=9;
const copy={
en:{kicker:'SIRAI / OUR IMPACT',title:'Growing together. <em>Creating real impact.</em>',lead:'Every person who tells us a SIRAI tool made a difference helps this tree grow.',countLabel:'PEOPLE WHO REPORTED BENEFITING',countNote:'Nine people have reported benefiting from SIRAI tools.',treeCaption:'Nine people have helped this tree take root.',key:'One illuminated leaf = one reported positive experience',aria:'A tree with nine illuminated leaves, representing nine people who reported benefiting from SIRAI tools.'},
ar:{kicker:'SIRAI / أثرنا',title:'ننمو معًا. <em>ونصنع أثرًا حقيقيًا.</em>',lead:'كل شخص يخبرنا أن إحدى أدوات SIRAI أفادته يساهم في نمو هذه الشجرة.',countLabel:'أشخاص أفادوا باستعمال الأدوات',countNote:'أفاد تسعة أشخاص باستفادتهم من أدوات SIRAI.',treeCaption:'ساهم تسعة أشخاص في ترسيخ جذور هذه الشجرة.',key:'كل ورقة مضيئة تمثل تجربة إيجابية أُبلغنا بها',aria:'شجرة بتسع أوراق مضيئة تمثل أشخاصًا أفادوا باستفادتهم من أدوات SIRAI.'},
fr:{kicker:'SIRAI / NOTRE IMPACT',title:'Grandir ensemble. <em>Créer un impact réel.</em>',lead:'Chaque personne qui nous dit qu’un outil SIRAI lui a été utile contribue à faire grandir cet arbre.',countLabel:'PERSONNES AYANT SIGNALÉ UN BÉNÉFICE',countNote:'Neuf personnes ont déclaré avoir bénéficié des outils SIRAI.',treeCaption:'Neuf personnes ont aidé cet arbre à prendre racine.',key:'Une feuille illuminée = un retour positif signalé',aria:'Un arbre avec neuf feuilles illuminées, représentant les personnes ayant signalé un bénéfice des outils SIRAI.'},
de:{kicker:'SIRAI / UNSERE WIRKUNG',title:'Gemeinsam wachsen. <em>Wirkung entfalten.</em>',lead:'Jede Person, die uns mitteilt, dass ein SIRAI-Tool hilfreich war, lässt diesen Baum wachsen.',countLabel:'PERSONEN MIT GEMELDETEM NUTZEN',countNote:'Neun Personen haben von den SIRAI-Tools profitiert.',treeCaption:'Neun Menschen haben diesem Baum geholfen, Wurzeln zu schlagen.',key:'Ein leuchtendes Blatt = eine gemeldete positive Erfahrung',aria:'Ein Baum mit neun leuchtenden Blättern für Menschen, die von SIRAI-Tools berichtet haben.'}
};
const extraLeaves=[
'M118 246 C98 231 100 210 123 208 C139 225 136 242 118 246Z',
'M318 160 C300 141 308 122 331 125 C344 146 336 161 318 160Z',
'M195 178 C178 162 182 144 203 143 C216 162 210 177 195 178Z',
'M370 250 C354 233 360 216 381 218 C393 237 386 251 370 250Z'
];
function ensureLeaves(){
 const group=root.querySelector('.sirai-tree-leaves');
 if(!group)return;
 let leaves=[...group.querySelectorAll('.sirai-tree-leaf')];
 // Add spare leaf shapes if we need more than are in the markup
 let i=0;
 while(leaves.length<reportedBeneficiaries && i<extraLeaves.length){
  const path=document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('class','sirai-tree-leaf');
  path.setAttribute('d',extraLeaves[i++]);
  path.setAttribute('fill','url(#sirai-tree-glow)');
  group.appendChild(path);
  leaves.push(path);
 }
 leaves.forEach((leaf,idx)=>{
  if(idx<reportedBeneficiaries)leaf.classList.add('is-lit');
  else leaf.classList.remove('is-lit');
 });
}
function render(){const lang=(document.documentElement.lang||'en').toLowerCase().split('-')[0],t=copy[lang]||copy.en;
root.querySelectorAll('[data-impact]').forEach(el=>{const k=el.dataset.impact;if(t[k]!==undefined)el.innerHTML=t[k]});
const number=root.querySelector('#sirai-impact-number');if(number){number.textContent=String(reportedBeneficiaries).padStart(2,'0');number.setAttribute('aria-label',reportedBeneficiaries+' people reported benefiting')}
const desc=root.querySelector('#sirai-tree-svg-desc');if(desc)desc.textContent=t.aria;
ensureLeaves();
}
render();document.querySelectorAll('[data-lang-select]').forEach(el=>el.addEventListener('change',()=>setTimeout(render,0)));
new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
