/* SIRAI public roadmap. Planned stages, never a fabricated percentage. */
(()=>{'use strict';
const root=document.querySelector('[data-sirai-roadmap]');if(!root)return;
const copy={
en:{eyebrow:'SIRAI / THE ROAD AHEAD',heading:'Small steps. A larger purpose.',intro:'Explore what SIRAI is building toward, from public planning tools to community-shaped action.',now:'CURRENT FOCUS',completed:'FOUNDATION BUILT',planned:'PLANNED',future:'LONGER-TERM',phase:'PHASE',previous:'Previous',next:'Next',foot:'A direction, not a percentage. No field outcomes are claimed.',action:'See development updates',items:[
 {title:'Build the foundation',text:'Publish free planning tools, clear documentation and accessible information. The initial website and resources are available for testing.',status:'completed'},
 {title:'Test and improve',text:'Validate calculations, review accessibility and languages, and learn from voluntary user feedback before formal launch.',status:'now'},
 {title:'Launch and share',text:'Release better-tested resources openly, explain what they can and cannot do, and make them usable across connections and devices.',status:'planned'},
 {title:'Grow with communities',text:'Explore one small community-shaped pilot by the end of 2027, only if safety, resources, feasibility and local collaboration allow.',status:'future'}
]},
ar:{eyebrow:'SIRAI / الطريق القادم',heading:'خطوات صغيرة. هدف أكبر.',intro:'تعرف على ما تسعى SIRAI إلى بنائه، من أدوات التخطيط المتاحة للجميع إلى العمل الذي تصوغه المجتمعات.',now:'محور العمل الحالي',completed:'تأسيس أولي مكتمل',planned:'مخطط له',future:'رؤية أطول مدى',phase:'المرحلة',previous:'السابق',next:'التالي',foot:'هذا مسار مقترح وليس نسبة إنجاز. لا ندعي تحقيق نتائج ميدانية.',action:'اطلع على تحديثات التطوير',items:[
 {title:'بناء الأساس',text:'نشر أدوات تخطيط مجانية وإرشادات واضحة ومعلومات يسهل الوصول إليها. تتوفر النسخة الأولى من الموقع والموارد للتجربة.',status:'completed'},
 {title:'التجربة والتحسين',text:'التحقق من الحسابات، ومراجعة سهولة الوصول واللغات، والاستفادة من آراء المستخدمين قبل الإطلاق الرسمي.',status:'now'},
 {title:'الإطلاق والمشاركة',text:'إتاحة موارد خضعت لمزيد من الاختبار مع توضيح حدودها والعمل على تشغيلها في ظروف اتصال وأجهزة مختلفة.',status:'planned'},
 {title:'النمو مع المجتمعات',text:'استكشاف مشروع تجريبي محلي صغير تقوده أولويات المجتمع بحلول نهاية ٢٠٢٧ فقط إذا سمحت السلامة والموارد والجدوى والتعاون المحلي.',status:'future'}
]},
fr:{eyebrow:'SIRAI / LA SUITE',heading:'De petits pas. Une ambition plus grande.',intro:'Découvrez ce que SIRAI souhaite construire, des outils publics aux actions définies avec les communautés.',now:'PRIORITÉ ACTUELLE',completed:'BASE EN PLACE',planned:'PRÉVU',future:'À PLUS LONG TERME',phase:'ÉTAPE',previous:'Précédent',next:'Suivant',foot:'Une orientation, pas un pourcentage. Aucun résultat de terrain n’est revendiqué.',action:'Voir les mises à jour',items:[
 {title:'Poser les bases',text:'Publier des outils gratuits, une documentation claire et des informations accessibles. Une première version est disponible pour les essais.',status:'completed'},
 {title:'Tester et améliorer',text:'Vérifier les calculs, l’accessibilité et les langues, puis apprendre des retours volontaires avant le lancement officiel.',status:'now'},
 {title:'Lancer et partager',text:'Diffuser des ressources mieux testées, préciser leurs limites et faciliter leur usage sur divers appareils et connexions.',status:'planned'},
 {title:'Grandir avec les communautés',text:'Explorer un petit projet pilote conçu avec une communauté d’ici fin 2027, uniquement si la sécurité, les ressources et la collaboration locale le permettent.',status:'future'}
]},
de:{eyebrow:'SIRAI / DER WEG NACH VORN',heading:'Kleine Schritte. Ein größeres Ziel.',intro:'Erfahren Sie, worauf SIRAI hinarbeitet, von frei verfügbaren Planungstools bis zu gemeinschaftlich gestalteten Vorhaben.',now:'AKTUELLER SCHWERPUNKT',completed:'GRUNDLAGE GESCHAFFEN',planned:'GEPLANT',future:'LANGFRISTIG',phase:'PHASE',previous:'Zurück',next:'Weiter',foot:'Eine Richtung, keine Prozentzahl. Es werden keine Feldergebnisse behauptet.',action:'Entwicklungsberichte ansehen',items:[
 {title:'Grundlage schaffen',text:'Kostenlose Planungstools, verständliche Dokumentation und zugängliche Informationen veröffentlichen. Erste Ressourcen sind zum Testen verfügbar.',status:'completed'},
 {title:'Testen und verbessern',text:'Berechnungen, Barrierefreiheit und Übersetzungen prüfen und vor der offiziellen Veröffentlichung aus freiwilligem Feedback lernen.',status:'now'},
 {title:'Veröffentlichen und teilen',text:'Besser geprüfte Ressourcen frei anbieten, ihre Grenzen offenlegen und die Nutzung auf verschiedenen Geräten erleichtern.',status:'planned'},
 {title:'Mit Gemeinschaften wachsen',text:'Bis Ende 2027 ein kleines, gemeinschaftlich entwickeltes Pilotvorhaben prüfen, nur wenn Sicherheit, Mittel, Machbarkeit und lokale Zusammenarbeit dies zulassen.',status:'future'}
]}
};
const $=name=>root.querySelector('[data-roadmap="'+name+'"]');
const steps=[...root.querySelectorAll('[data-roadmap-step]')];
let selected=1;
function render(){
 const language=document.documentElement.lang.toLowerCase().split('-')[0];
 const t=copy[language]||copy.en;
 for(const name of ['eyebrow','heading','intro','foot','action','previous','next']){
  const el=$(name);if(el)el.textContent=t[name];
 }
 const item=t.items[selected];$('phase').textContent=t.phase+' '+String(selected+1).padStart(2,'0');
 $('title').textContent=item.title;$('description').textContent=item.text;
 $('status').textContent=t[item.status];$('status').dataset.status=item.status;
 $('count').textContent=String(selected+1).padStart(2,'0')+' / 04';
 steps.forEach((b,i)=>{
  b.setAttribute('aria-current',i===selected?'step':'false');
  b.setAttribute('aria-label',String(i+1)+'. '+t.items[i].title+'. '+t[t.items[i].status]);
  b.title=t.items[i].title;
 });
 $('previous').disabled=selected===0;$('next').disabled=selected===steps.length-1;
}
function select(i){selected=Math.max(0,Math.min(steps.length-1,i));render()}
steps.forEach((button,i)=>button.addEventListener('click',()=>select(i)));
$('previous').addEventListener('click',()=>select(selected-1));
$('next').addEventListener('click',()=>select(selected+1));
root.querySelector('[data-roadmap-track]').addEventListener('keydown',e=>{
 if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
 e.preventDefault();
 const rtl=document.documentElement.dir==='rtl';
 const target=e.key==='Home'?0:e.key==='End'?steps.length-1:selected+(e.key==='ArrowRight'?(rtl?-1:1):(rtl?1:-1));
 select(target);steps[selected].focus();
});
document.querySelectorAll('[data-lang-select]').forEach(e=>e.addEventListener('change',()=>setTimeout(render,0)));
const observer=new MutationObserver(()=>render());
observer.observe(document.documentElement,{attributes:true,attributeFilter:['lang','dir']});
render();
})();