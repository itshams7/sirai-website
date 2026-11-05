/* SIRAI connection preferences. No analytics, no network requests of its own. */
(()=>{'use strict';
const copy={
 en:{on:'Low-data mode: ON',off:'Low-data mode: OFF',hint:'Use illustrations instead of external photographs. This setting is saved on this device.',aria:'Toggle low-data mode',arabic:'Read in Arabic'},
 ar:{on:'وضع توفير البيانات: مُفعّل',off:'وضع توفير البيانات: متوقف',hint:'استخدم الرسوم المحلية بدلاً من الصور الخارجية. يُحفظ الخيار على هذا الجهاز.',aria:'تبديل وضع توفير البيانات',arabic:'اقرأ بالعربية'},
 fr:{on:'Mode données réduites : ACTIVÉ',off:'Mode données réduites : DÉSACTIVÉ',hint:'Remplace les photos externes par des illustrations locales. Préférence conservée sur cet appareil.',aria:'Activer ou désactiver le mode données réduites',arabic:'Lire en arabe'},
 de:{on:'Datensparmodus: EIN',off:'Datensparmodus: AUS',hint:'Lokale Illustrationen statt externer Fotos. Einstellung auf diesem Gerät gespeichert.',aria:'Datensparmodus umschalten',arabic:'Auf Arabisch lesen'}
};
const key='sirai-low-data-v1';let manuallySet=false,low=false;
try{const saved=localStorage.getItem(key);manuallySet=saved!==null;low=manuallySet?saved==='1':!!navigator.connection?.saveData}catch(_){low=!!navigator.connection?.saveData}
const photos=[...document.querySelectorAll('img[data-sirai-remote-photo]')];
function applyImages(){
 document.documentElement.classList.toggle('sirai-low-data',low);
 photos.forEach(img=>{
  const remote=img.getAttribute('data-sirai-remote-photo');
  const fallback=img.getAttribute('data-sirai-local-photo');
  if(!remote||!fallback)return;
  if(low||!navigator.onLine){
   img.src=fallback;
   img.removeAttribute('srcset');
  }else if(img.dataset.siraiPhotoFailed!=='1'){
   img.onerror=()=>{img.dataset.siraiPhotoFailed='1';img.src=fallback;};
   img.src=remote;
  }
 });
}
const footer=document.querySelector('.site-footer .container');
let button=null,hint=null;
if(footer){
 const wrap=document.createElement('div');wrap.className='sirai-data-settings';
 button=document.createElement('button');button.type='button';button.className='sirai-data-toggle';
 hint=document.createElement('span');hint.className='sirai-data-note';
 wrap.append(button,hint);
 const bottom=footer.querySelector('.footer-bottom');if(bottom)footer.insertBefore(wrap,bottom);else footer.appendChild(wrap);
 button.addEventListener('click',()=>{low=!low;try{localStorage.setItem(key,low?'1':'0')}catch(_){}applyImages();render()});
}
function render(){
 const t=copy[document.documentElement.lang]||copy.en;
 if(button){button.textContent=low?t.on:t.off;button.setAttribute('aria-pressed',String(low));button.setAttribute('aria-label',t.aria)}
 if(hint)hint.textContent=t.hint;
}
document.querySelectorAll('[data-lang-select]').forEach(x=>x.addEventListener('change',()=>setTimeout(render,0)));
window.addEventListener('offline',applyImages);
window.addEventListener('online',applyImages);
applyImages();render();
})();