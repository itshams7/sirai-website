/* Accessible enhancement for SIRAI's optional community idea submission.
   Native form POST remains available if JavaScript is disabled. */
(()=>{
 'use strict';
 const form=document.querySelector('form.sirai-idea-form');
 if(!form)return;
 const button=form.querySelector('button[type="submit"]');
 const status=document.createElement('p');
 status.className='sirai-idea-status';
 status.setAttribute('role','status');
 status.setAttribute('aria-live','polite');
 form.appendChild(status);
 const copy={
  en:{sending:'Sending your idea…',ok:'Your idea was submitted to the feedback service for review. Thank you.',fail:'Your idea could not be submitted. Check your connection and try again.',offline:'Connect to the internet before sending your idea.'},
  ar:{sending:'جارٍ إرسال فكرتك…',ok:'تم إرسال فكرتك إلى خدمة استقبال الملاحظات للمراجعة. شكراً لك.',fail:'تعذر إرسال الفكرة. تحقق من الاتصال ثم حاول مرة أخرى.',offline:'اتصل بالإنترنت قبل إرسال فكرتك.'},
  fr:{sending:'Envoi de votre idée…',ok:'Votre idée a été transmise au service de retour pour examen. Merci.',fail:'L’envoi a échoué. Vérifiez votre connexion et réessayez.',offline:'Connectez-vous à Internet pour envoyer votre idée.'},
  de:{sending:'Ihre Idee wird gesendet…',ok:'Ihre Idee wurde zur Prüfung an den Feedbackdienst übermittelt. Vielen Dank.',fail:'Das Senden ist fehlgeschlagen. Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.',offline:'Verbinden Sie sich mit dem Internet, bevor Sie Ihre Idee senden.'}
 };
 const t=key=>(copy[document.documentElement.lang]||copy.en)[key];
 let sending=false;
 form.addEventListener('submit',async event=>{
  if(!form.reportValidity())return;
  event.preventDefault();
  if(sending)return;
  if(!navigator.onLine){status.textContent=t('offline');status.dataset.state='error';return}
  sending=true;button.disabled=true;status.dataset.state='sending';status.textContent=t('sending');
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),12000);
  try{
   const response=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'},signal:controller.signal});
   if(!response.ok)throw Error('Submission not accepted');
   status.textContent=t('ok');status.dataset.state='success';form.reset();
  }catch(error){
   status.textContent=t('fail');status.dataset.state='error';
  }finally{
   clearTimeout(timeout);sending=false;button.disabled=false;
  }
 });
})();
