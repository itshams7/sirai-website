/* Shared offline state and privacy-aware text sharing. Never sends plans to SIRAI. */
(()=>{'use strict';
const tr={
 en:{online:'Offline tools ready',offline:'Offline mode',loading:'Preparing offline tools',failed:'Offline setup unavailable',share:'Share by WhatsApp / text',review:'Before sharing, review the message. Remove private names, locations, movement times or sensitive resource details. Continue?',copied:'Summary copied. Paste into WhatsApp or SMS.',copyFailed:'Copy unavailable. Select and copy the summary manually.',open:'Share text',safety:'Share only non-identifying details. Never publish water-point locations, movement times or volunteer identities.'},
 ar:{online:'الأدوات جاهزة دون إنترنت',offline:'وضع عدم الاتصال',loading:'جارٍ تجهيز الأدوات دون إنترنت',failed:'التشغيل دون إنترنت غير متاح',share:'مشاركة عبر واتساب / رسالة',review:'راجع النص قبل المشاركة. احذف الأسماء والمواقع وأوقات التنقل وأي معلومات حساسة. هل تريد المتابعة؟',copied:'تم نسخ الملخص. الصقه في واتساب أو رسالة نصية.',copyFailed:'تعذر النسخ. حدد الملخص وانسخه يدويًا.',open:'مشاركة النص',safety:'شارك معلومات عامة فقط. لا تنشر مواقع مصادر المياه أو أوقات التحرك أو أسماء المتطوعين.'},
 fr:{online:'Outils disponibles hors ligne',offline:'Mode hors ligne',loading:'Préparation du mode hors ligne',failed:'Mode hors ligne indisponible',share:'Partager via WhatsApp / SMS',review:'Relisez ce message avant de le partager. Retirez les noms, lieux, horaires de déplacement et informations sensibles. Continuer ?',copied:'Résumé copié. Collez-le dans WhatsApp ou un SMS.',copyFailed:'Copie impossible. Copiez le résumé manuellement.',open:'Partager le texte',safety:'Ne partagez pas les lieux de collecte, horaires de déplacement ou identités des bénévoles.'},
 de:{online:'Tools offline verfügbar',offline:'Offline-Modus',loading:'Offline-Tools werden vorbereitet',failed:'Offline-Modus nicht verfügbar',share:'Per WhatsApp / SMS teilen',review:'Bitte Nachricht prüfen: Namen, Orte, Bewegungszeiten und sensible Angaben entfernen. Fortfahren?',copied:'Zusammenfassung kopiert. In WhatsApp oder SMS einfügen.',copyFailed:'Kopieren nicht verfügbar. Text manuell kopieren.',open:'Text teilen',safety:'Keine Wasserstellen, Bewegungszeiten oder Namen von Freiwilligen veröffentlichen.'}
};
const l=()=>tr[document.documentElement.lang]||tr.en;
function badge(status){
 let el=document.getElementById('sirai-offline-indicator');
 if(!el){const root=document.querySelector('.header-inner');if(!root)return;el=document.createElement('span');el.id='sirai-offline-indicator';el.className='sirai-offline-indicator';root.appendChild(el)}
 el.dataset.status=status;el.textContent= status==='offline'?l().offline:status==='ready'?l().online:status==='failed'?l().failed:l().loading;
}
async function share(text){
 if(!text||!text.trim())return false;
 if(!window.confirm(l().review))return false;
 if(navigator.share){
  try{await navigator.share({text});return true}catch(e){if(e.name==='AbortError')return false}
 }
 if(navigator.clipboard&&navigator.clipboard.writeText){
  try{await navigator.clipboard.writeText(text);window.alert(l().copied);return true}catch(e){}
 }
 window.prompt(l().copyFailed,text);
 return false;
}
window.SIRAI_SHARE={share,label:()=>l().share,safety:()=>l().safety};
function update(){badge(navigator.onLine?'ready':'offline');document.querySelectorAll('[data-sirai-share]').forEach(b=>b.textContent=l().share);document.querySelectorAll('[data-sirai-safety]').forEach(b=>b.textContent=l().safety)}
window.addEventListener('online',update);window.addEventListener('offline',update);
document.querySelectorAll('[data-lang-select]').forEach(el=>el.addEventListener('change',()=>setTimeout(update,0)));
if('serviceWorker' in navigator&&location.protocol==='https:'){
 badge('loading');
 navigator.serviceWorker.register('./sw.js',{scope:'./'}).then(()=>navigator.serviceWorker.ready).then(()=>update()).catch(()=>badge('failed'));
}else if(!navigator.onLine)badge('offline');else badge('failed');
update();
})();
