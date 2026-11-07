/* SIRAI Sudan displacement choropleth. State counts: IOM DTM June 2026, reproduced by UK Home Office.
 * Hosted IDPs by state, not state of origin. Source tables' rows sum to 8,685,253,
 * 20 fewer than the source's stated national total. Never reconcile by invention.
 */
(()=>{'use strict';
const map=document.getElementById('sirai-stats-map'),host=document.getElementById('sirai-idp-map'),svg=document.getElementById('sirai-idp-svg'),panel=document.getElementById('sirai-idp-panel'),selector=document.getElementById('sirai-idp-select');
if(!map||!host||!svg||!panel||!selector)return;
const entries=[
['SD-GZ','Gezira','الجزيرة','Gezira','Gezira',44790],['SD-NB','Blue Nile','النيل الأزرق','Nil Bleu','Blauer Nil',364828],
['SD-DC','Central Darfur','وسط دارفور','Darfour central','Zentral-Darfur',992987],['SD-DE','East Darfur','شرق دارفور','Darfour de l’Est','Ost-Darfur',810109],
['SD-GD','Gedaref','القضارف','Gedaref','Gedaref',169109],['SD-KA','Kassala','كسلا','Kassala','Kassala',42061],
['SD-KH','Khartoum','الخرطوم','Khartoum','Khartum',399631],['SD-DN','North Darfur','شمال دارفور','Darfour du Nord','Nord-Darfur',1684727],
['SD-KN','North Kordofan','شمال كردفان','Kordofan du Nord','Nord-Kordofan',226443],['SD-NO','Northern','الشمالية','Nord','Nordstaat',396438],
['SD-RS','Red Sea','البحر الأحمر','Mer Rouge','Rotes Meer',91492],['SD-NR','River Nile','نهر النيل','Nil','Nil-Fluss',298529],
['SD-SI','Sennar','سنار','Sennar','Sennar',25578],['SD-DS','South Darfur','جنوب دارفور','Darfour du Sud','Süd-Darfur',1764980],
['SD-KS','South Kordofan','جنوب كردفان','Kordofan du Sud','Süd-Kordofan',334032],['SD-DW','West Darfur','غرب دارفور','Darfour de l’Ouest','West-Darfur',374532],
['SD-GK','West Kordofan','غرب كردفان','Kordofan de l’Ouest','West-Kordofan',421828],['SD-NW','White Nile','النيل الأبيض','Nil Blanc','Weißer Nil',243159]
];
const data=new Map(entries.map(x=>[x[0],x]));
const names={en:1,ar:2,fr:3,de:4};
const messages={
en:{heading:'INTERNALLY DISPLACED PEOPLE BY HOST STATE',level1:'Under 100k',level2:'100k to 349k',level3:'350k to 699k',level4:'700k to 999k',level5:'1 million+',select:'Tap a state or choose from the list',prompt:'Choose a state',definition:'IDPs recorded in this state, not people originally displaced from it',footnote:'Map: June 2026 IOM DTM state estimates. The main 8.58M figure is August 2026. The source table sums to 20 fewer than its published June total.',source:'View source data',loading:'Loading state boundaries…',failure:'Map unavailable. Choose a state from the list.'},
ar:{heading:'النازحون داخل السودان حسب الولاية المستضيفة',level1:'أقل من ١٠٠ ألف',level2:'١٠٠ إلى ٣٤٩ ألفاً',level3:'٣٥٠ إلى ٦٩٩ ألفاً',level4:'٧٠٠ إلى ٩٩٩ ألفاً',level5:'مليون فأكثر',select:'المس الولاية على الخريطة أو اخترها من القائمة',prompt:'اختر ولاية',definition:'النازحون الموجودون في هذه الولاية، وليس بالضرورة النازحون منها',footnote:'الخريطة: تقديرات المنظمة الدولية للهجرة في يونيو ٢٠٢٦. الرقم الرئيسي ٨٫٥٨ مليون يعود إلى أغسطس ٢٠٢٦. مجموع قيم جدول الولايات أقل بـ٢٠ شخصاً من الإجمالي الوطني المنشور.',source:'عرض بيانات المصدر',loading:'جارٍ تحميل حدود الولايات…',failure:'الخريطة غير متاحة. اختر ولاية من القائمة.'},
fr:{heading:'PERSONNES DÉPLACÉES PAR ÉTAT D’ACCUEIL',level1:'Moins de 100k',level2:'100k à 349k',level3:'350k à 699k',level4:'700k à 999k',level5:'1 million et plus',select:'Touchez un État ou utilisez la liste',prompt:'Choisir un État',definition:'Personnes déplacées présentes ici, pas nécessairement originaires de cet État',footnote:'Carte : estimations OIM DTM de juin 2026. Le total principal 8,58M concerne août 2026. La somme du tableau est inférieure de 20 au total de juin publié.',source:'Consulter la source',loading:'Chargement des frontières…',failure:'Carte indisponible. Choisissez un État dans la liste.'},
de:{heading:'BINNENVERTRIEBENE NACH AUFNAHMEBUNDESSTAAT',level1:'Unter 100 Tsd.',level2:'100–349 Tsd.',level3:'350–699 Tsd.',level4:'700–999 Tsd.',level5:'1 Million+',select:'Bundesstaat auf der Karte oder in der Liste auswählen',prompt:'Bundesstaat wählen',definition:'Hier registrierte Vertriebene, nicht zwingend aus diesem Bundesstaat stammend',footnote:'Karte: IOM-DTM-Schätzungen für Juni 2026. Die große Zahl 8,58 Mio. bezieht sich auf August 2026. Die Zeilensumme liegt um 20 unter der veröffentlichten Juni-Gesamtsumme.',source:'Quelldaten anzeigen',loading:'Grenzen werden geladen…',failure:'Karte nicht verfügbar. Bitte Bundesstaat aus Liste wählen.'}
};
const l=()=>document.documentElement.lang in messages?document.documentElement.lang:'en';
const localName=x=>x[names[l()]]||x[1];
const fmt=n=>new Intl.NumberFormat(l()).format(n);
const color=n=>n>=1000000?'#8b405e':n>=700000?'#b97e99':n>=350000?'#c6a0b2':n>=100000?'#96758d':'#6a526b';
let selected='SD-DS',loaded=false,loading=false;
const ns='http://www.w3.org/2000/svg';
function selectState(id){
 if(!data.has(id))return;
 selected=id;selector.value=id;
 const entry=data.get(id);
 document.getElementById('sirai-idp-name').textContent=localName(entry);
 document.getElementById('sirai-idp-value').textContent=fmt(entry[5]);
 svg.querySelectorAll('[data-idp-state]').forEach(p=>p.classList.toggle('is-selected',p.dataset.idpState===id));
}
function translate(){
 const t=messages[l()];
 panel.querySelectorAll('[data-idp]').forEach(el=>{if(t[el.dataset.idp])el.textContent=t[el.dataset.idp]});
 const previous=selector.value||selected;
 selector.replaceChildren();
 const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent=t.prompt;selector.append(placeholder);
 for(const e of entries.slice().sort((a,b)=>a[names[l()]].localeCompare(b[names[l()]],l()))){const opt=document.createElement('option');opt.value=e[0];opt.textContent=localName(e);selector.append(opt)}
 svg.querySelectorAll('[data-idp-state]').forEach(p=>{const e=data.get(p.dataset.idpState);if(!e)return;const label=localName(e)+': '+fmt(e[5]);p.setAttribute('aria-label',label);const title=p.querySelector('title');if(title)title.textContent=label});
 selectState(previous);
}
function pointPath(ring,project){return ring.map((p,i)=>(i?'L':'M')+project(p).map(x=>x.toFixed(1)).join(',')).join('')+'Z'}
async function load(){
 if(loaded||loading)return;loading=true;
 const loadingLabel=document.createElement('p');loadingLabel.className='sirai-idp-loading';loadingLabel.textContent=messages[l()].loading;host.append(loadingLabel);
 try{
  const response=await fetch('assets/sudan-states.geojson');
  if(!response.ok)throw Error('Missing geometry');
  const geo=await response.json();
  if(!geo||!Array.isArray(geo.features)||geo.features.length!==18)throw Error('Invalid state boundaries');
  const points=geo.features.flatMap(f=>f.geometry.coordinates.flatMap(r=>r));
  const minX=Math.min(...points.map(x=>x[0])),maxX=Math.max(...points.map(x=>x[0]));
  const minY=Math.min(...points.map(x=>x[1])),maxY=Math.max(...points.map(x=>x[1]));
  const scale=Math.min(448/(maxX-minX),341/(maxY-minY));
  const ox=(472-scale*(maxX-minX))/2,oy=(365-scale*(maxY-minY))/2;
  const project=p=>[ox+(p[0]-minX)*scale,oy+(maxY-p[1])*scale];
  for(const feature of geo.features){
   const id=feature.properties.id,entry=data.get(id);
   if(!entry)throw Error('Unmapped state '+id);
   const path=document.createElementNS(ns,'path');path.dataset.idpState=id;
   path.setAttribute('d',feature.geometry.coordinates.map(r=>pointPath(r,project)).join(' '));
   path.setAttribute('fill',color(entry[5]));
   path.setAttribute('tabindex','0');path.setAttribute('role','button');
   const title=document.createElementNS(ns,'title');path.append(title);
   path.addEventListener('click',()=>selectState(id));
   path.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();selectState(id)}});
   svg.append(path);
  }
  loaded=true;translate();selectState(selected);
 }catch(error){loadingLabel.textContent=messages[l()].failure;svg.setAttribute('aria-label',messages[l()].failure)}
 finally{loading=false;if(loaded)loadingLabel.remove()}
}
function sync(){
 const visible=map.dataset.statMode==='displaced';
 host.hidden=!visible;panel.hidden=!visible;
 if(visible)load();
}
selector.addEventListener('change',()=>selectState(selector.value));
document.querySelectorAll('[data-lang-select]').forEach(el=>el.addEventListener('change',()=>{setTimeout(translate,0)}));
new MutationObserver(sync).observe(map,{attributes:true,attributeFilter:['data-stat-mode']});
translate();sync();
})();
