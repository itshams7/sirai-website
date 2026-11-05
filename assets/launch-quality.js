/* SIRAI Phase 1: unobtrusive navigation, language and connection safety. */
(()=>{'use strict';
const name=()=>document.documentElement.lang||'en';
const notes={en:'You are offline. Opened tools remain usable, but feedback needs a connection.',ar:'أنت غير متصل بالإنترنت. يمكنك استخدام الأدوات المحمّلة، لكن إرسال الملاحظات يحتاج إلى اتصال.',fr:'Vous êtes hors ligne. Les outils déjà chargés restent utilisables, mais l’envoi d’avis nécessite une connexion.',de:'Sie sind offline. Bereits geladene Tools bleiben nutzbar, aber Feedback benötigt Internet.'};
const nav=document.querySelector('.nav');const menu=document.querySelector('[data-menu]');
if(nav&&menu){document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.focus();}});document.addEventListener('click',event=>{if(nav.classList.contains('open')&&!nav.contains(event.target)&&!menu.contains(event.target)){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');}});}
const feedback=document.getElementById('feedback-form');
let note=null;
if(feedback){note=document.createElement('p');note.className='sirai-offline-submit-note';note.setAttribute('role','status');note.hidden=true;feedback.prepend(note);}
function refresh(){if(!note)return;note.textContent=notes[name()]||notes.en;note.hidden=navigator.onLine;}
window.addEventListener('online',refresh);window.addEventListener('offline',refresh);
document.querySelectorAll('[data-lang-select]').forEach(el=>el.addEventListener('change',()=>setTimeout(refresh,0)));
refresh();
})();
