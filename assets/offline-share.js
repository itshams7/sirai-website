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
 if(!el){const header=document.querySelector('.site-header');if(!header)return;el=document.createElement('div');el.id='sirai-offline-indicator';el.className='sirai-offline-indicator';el.setAttribute('role','status');el.setAttribute('aria-live','polite');header.insertAdjacentElement('afterend',el)}
 el.dataset.status=status;el.textContent= status==='offline'?l().offline:status==='ready'?l().online:status==='failed'?l().failed:l().loading;
}
async function share(text){
 if(!text||!text.trim())return false;
 const loc=document.documentElement.lang;
 const words={
  en:['Review before sharing','Edit this summary to remove any names, locations, schedules, sensitive equipment details or identifying information. Your text stays on this device until you choose to share it.','Share or copy text','Cancel'],
  ar:['راجع النص قبل المشاركة','يمكنك تعديل الملخص وحذف الأسماء والمواقع والمواعيد والتفاصيل الحساسة. لن يُشارك النص حتى تختار ذلك بنفسك.','مشاركة أو نسخ النص','إلغاء'],
  fr:['Vérifier avant le partage','Modifiez ce résumé : retirez noms, lieux, horaires, équipements sensibles et données personnelles.','Partager ou copier','Annuler'],
  de:['Vor dem Teilen prüfen','Bearbeiten Sie die Zusammenfassung. Entfernen Sie Namen, Orte, Zeiten, sensible Geräteangaben und personenbezogene Daten.','Teilen oder kopieren','Abbrechen']
 }[loc]||['Review before sharing','Remove private names, locations, times and sensitive details before sharing.','Share or copy text','Cancel'];
 const dialog=document.createElement('dialog');dialog.className='sirai-share-dialog';dialog.setAttribute('aria-label',words[0]);
 const heading=document.createElement('h2');heading.textContent=words[0];
 const warning=document.createElement('p');warning.textContent=words[1];
 const input=document.createElement('textarea');input.value=text;input.rows=9;input.maxLength=6500;input.setAttribute('aria-label',words[0]);
 const actions=document.createElement('div');actions.className='sirai-share-dialog-actions';
 const cancel=document.createElement('button');cancel.type='button';cancel.textContent=words[3];
 const confirm=document.createElement('button');confirm.type='button';confirm.textContent=words[2];confirm.className='sirai-share-button';
 actions.append(cancel,confirm);dialog.append(heading,warning,input,actions);document.body.appendChild(dialog);
 return await new Promise(resolve=>{
  let settled=false;
  function finish(ok){if(settled)return;settled=true;dialog.close();dialog.remove();resolve(ok)}
  cancel.addEventListener('click',()=>finish(false));
  dialog.addEventListener('cancel',e=>{e.preventDefault();finish(false)});
  confirm.addEventListener('click',async()=>{
   const content=input.value.trim();if(!content){input.focus();return}
   if(navigator.share){
    try{await navigator.share({text:content});finish(true);return}
    catch(e){if(e.name==='AbortError'){finish(false);return}}
   }
   if(navigator.clipboard&&navigator.clipboard.writeText){
    try{await navigator.clipboard.writeText(content);finish(true);return}catch(e){}
   }
   window.prompt(l().copyFailed,content);finish(false);
  });
  if(typeof dialog.showModal==='function')dialog.showModal();
  else {dialog.setAttribute('open','');dialog.classList.add('sirai-dialog-fallback')}
  input.focus();input.setSelectionRange(0,0);
 });
}
window.SIRAI_SHARE={share,label:()=>l().share,safety:()=>l().safety};
let offlineReady=false,failed=false;
function update(){
 const status=failed?'failed':offlineReady?(navigator.onLine?'ready':'offline'):'loading';
 badge(status);
 document.querySelectorAll('[data-sirai-share]').forEach(b=>b.textContent=l().share);
 document.querySelectorAll('[data-sirai-safety]').forEach(b=>b.textContent=l().safety);
}
window.addEventListener('online',update);window.addEventListener('offline',update);
document.querySelectorAll('[data-lang-select]').forEach(el=>el.addEventListener('change',()=>setTimeout(update,0)));
(async()=>{
 if(!('serviceWorker' in navigator)||location.protocol!=='https:'){failed=true;update();return}
 try{
  await navigator.serviceWorker.register('./sw.js',{scope:'./'});
  await navigator.serviceWorker.ready;
  const keys=await caches.keys();
  offlineReady=keys.includes('sirai-offline-v29-focus-alignment-20261106');
  failed=!offlineReady;
 }catch(e){failed=true}
 update();
})();
update();
})();
