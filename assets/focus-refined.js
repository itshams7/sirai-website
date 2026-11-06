/* SIRAI priorities: no external network, honors document translations. */
(()=>{'use strict';
 const root=document.querySelector('.sirai-focus-section');
 if(!root)return;
 const buttons=[...root.querySelectorAll('[data-focus-choice]')];
 const showcase=root.querySelector('.sirai-focus-showcase');
 const visual=[...showcase.querySelectorAll('.sirai-focus-visual')];
 const title=showcase.querySelector('.sirai-focus-showcase-title');
 const detail=showcase.querySelector('.sirai-focus-showcase-summary');
 const number=showcase.querySelector('[data-focus-number]');
 let current=0;
 const labels={
  en:['Practical approaches to everyday challenges, shaped by people who know their communities.','Sharing accessible information, practical skills and opportunities to learn from one another.','Considering local resources and livelihood needs alongside environmental care.'],
  ar:['حلول عملية للتحديات اليومية تنطلق من خبرة الناس بمجتمعاتهم.','إتاحة المعلومات المفيدة والمهارات العملية وفرص التعلم المتبادل.','مراعاة الموارد المحلية واحتياجات سبل العيش جنباً إلى جنب مع حماية البيئة.'],
  fr:['Des réponses pratiques aux défis quotidiens, façonnées par les communautés elles-mêmes.','Partager des informations accessibles, des compétences pratiques et des occasions d’apprendre ensemble.','Prendre en compte les ressources locales, les moyens de subsistance et l’environnement.'],
  de:['Praktische Antworten auf alltägliche Herausforderungen, gemeinsam mit den Menschen vor Ort.','Zugängliche Informationen, praktische Fähigkeiten und gemeinsames Lernen.','Lokale Ressourcen, Lebensgrundlagen und Umweltschutz zusammendenken.']
 };
 function update(index){
  current=index;
  buttons.forEach((b,i)=>{const active=i===index;b.classList.toggle('is-current',active);b.setAttribute('aria-pressed',String(active))});
  visual.forEach((v,i)=>v.hidden=i!==index);
  showcase.dataset.focusActive=String(index);
  const key='focus.'+(index+1)+'.title';
  title.dataset.i18n=key;
  const language=document.documentElement.lang;
  title.textContent=buttons[index].querySelector('strong').textContent;
  detail.textContent=(labels[language]||labels.en)[index];
  number.textContent=String(index+1).padStart(2,'0');
 }
 buttons.forEach((b,i)=>b.addEventListener('click',()=>update(i)));
 document.querySelectorAll('[data-lang-select]').forEach(select=>select.addEventListener('change',()=>requestAnimationFrame(()=>update(current))));
 update(0);
})();
