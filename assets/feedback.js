(() => {
'use strict';
const form=document.getElementById('feedback-form');if(!form)return;
const $=id=>document.getElementById(id);
const en={};
document.querySelectorAll('[data-sf]').forEach(n=>{if(!en[n.dataset.sf])en[n.dataset.sf]=n.textContent.trim()});
Object.assign(en,{sending:'Sending…',success:'Thank you. Your feedback was submitted successfully for SIRAI to review.',failed:'Your report could not be sent. Nothing was submitted. Please try again.',connection:'Unable to connect to the feedback service. Check your internet connection and try again.',invalid:'Please complete the required fields and check the email format.',rateLimit:'The feedback service is temporarily unavailable or has reached a limit. Please try again later.',phMessage:'What were you trying to do, and what happened?',phDetails:'For example: On Android Chrome, I opened WaterShare...',phDevice:'e.g. Android / Chrome',phEmail:'you@example.com'});
const ar={
heroKicker:'SIRAI / آراء المجتمع',heroTitle:'الأفكار الأفضل تبدأ بالاستماع.',heroText:'أخبرنا بما ينفع وما يحتاج إلى تحسين، وكيف يمكن لـ SIRAI أن تكون أكثر فائدة. ملاحظاتك المحددة تساعدنا على تطوير مواردنا المجانية.',start:'أرسل ملاحظاتك ↘',heroFine:'دون حساب · يمكن المشاركة دون اسم · أربع لغات',notice:'هذا النموذج لتقييم موارد SIRAI، وليس لخدمات الطوارئ أو طلبات التمويل أو المساعدة الشخصية.',
formKicker:'تجربتك مهمة',formTitle:'ساعدنا في تحسين ما يهم.',formText:'أبلغ عن مشكلة، واقترح تحسينًا، أو شارك تجربتك. ثلاثة أسئلة رئيسية فقط مطلوبة.',
resourceLabel:'أي مورد تقيم؟',chooseResource:'اختر المورد',typeLabel:'ما نوع الملاحظة؟',chooseType:'اختر الفئة',typeBug:'شيء لا يعمل',typeIdea:'اقتراح أو فكرة جديدة',typeTranslation:'اللغة أو الترجمة',typeUsability:'صعب الفهم أو الاستخدام',typeExperience:'تجربة عملية',typeOther:'أخرى',
messageLabel:'ماذا حدث أو ما الذي يحتاج إلى تحسين؟',messageHint:'١٠ أحرف على الأقل. كن محددًا قدر الإمكان.',detailsLabel:'خطوات تكرار المشكلة أو الحل المقترح (اختياري)',languageLabel:'اللغة المستخدمة (اختياري)',notSpecified:'غير محددة',arabic:'العربية',english:'الإنجليزية',french:'الفرنسية',german:'الألمانية',deviceLabel:'الجهاز أو المتصفح (اختياري)',emailLabel:'بريد إلكتروني للمتابعة (اختياري)',emailHint:'اتركه فارغًا لإرسال الملاحظة دون اسم. لا يمكننا ضمان الرد على جميع الرسائل.',
privacyTitle:'خصوصيتك مهمة',privacyText:'لا تشارك أسماء أشخاص آخرين أو أرقام هواتف أو كلمات مرور أو مواقع حساسة. تُرسل الملاحظات عبر Formspree التي قد تحتفظ بها لتتمكن SIRAI من مراجعتها. لا تُنشر الملاحظات على الموقع.',privacyLink:'سياسة خصوصية Formspree ↗',consentText:'أفهم أن Formspree ستعالج ملاحظتي وأن SIRAI ستراجعها.',send:'إرسال الملاحظات',sendNote:'لن تُرسل رسالتك إلا عند الضغط على إرسال.',
asideKicker:'ماذا يحدث بعد الإرسال؟',asideTitle:'ملاحظاتك تساعد على تحسين مواردنا.',stage1Title:'تشارك ملاحظتك',stage1Text:'صف تجربتك بكلماتك.',stage2Title:'نراجع الرسالة',stage2Text:'نعطي الأولوية للمشكلات العملية ومخاوف السلامة.',stage3Title:'نُحسّن ما يحتاج إلى تطوير',stage3Text:'نوثق التحسينات بعد تنفيذها فعليًا.',asideNote:'العمل مع المجتمع يبدأ بالاستماع قبل الادعاء بتحقيق أثر.',resourcesTitle:'استكشف مواردنا',endKicker:'نبني مع المجتمعات',endTitle:'التقدم الحقيقي يبدأ بملاحظات حقيقية.',endText:'SIRAI مبادرة مستقلة قيد التطوير. نقدر الملاحظات المحددة أكثر من المجاملات.',back:'العودة إلى SIRAI ↗',
sending:'جارٍ الإرسال…',success:'شكرًا لك. أُرسلت ملاحظتك بنجاح لمراجعتها من SIRAI.',failed:'تعذّر إرسال الملاحظة. لم تُرسل أي بيانات. حاول مرة أخرى.',connection:'تعذر الاتصال بخدمة الملاحظات. تحقق من الإنترنت وحاول مجددًا.',invalid:'أكمل الحقول المطلوبة وتأكد من صحة البريد الإلكتروني.',rateLimit:'خدمة الملاحظات غير متاحة مؤقتًا أو وصلت إلى حد الاستخدام. حاول لاحقًا.',phMessage:'ماذا كنت تحاول فعله، وماذا حدث؟',phDetails:'مثال: فتحت WaterShare على هاتف أندرويد...',phDevice:'مثال: هاتف أندرويد / كروم',phEmail:'you@example.com'
};
const fr={
heroKicker:'SIRAI / RETOURS DE LA COMMUNAUTÉ',heroTitle:'Les meilleures idées commencent par l’écoute.',heroText:'Dites-nous ce qui fonctionne, ce qui doit changer et comment SIRAI pourrait devenir plus utile. Vos observations nous aident à améliorer les ressources gratuites.',start:'Donner mon avis ↘',heroFine:'Sans compte · Réponse anonyme possible · Quatre langues',notice:'Ce formulaire concerne les ressources de SIRAI. Ce n’est ni un service d’urgence, ni une demande de financement ou d’aide personnelle.',
formKicker:'VOTRE EXPÉRIENCE COMPTE',formTitle:'Aidez-nous à améliorer l’essentiel.',formText:'Signalez un problème, proposez une idée ou partagez une expérience. Seules trois questions principales sont obligatoires.',
resourceLabel:'Quelle ressource ?',chooseResource:'Choisissez une ressource',typeLabel:'Quel type de retour ?',chooseType:'Choisissez une catégorie',typeBug:'Quelque chose ne fonctionne pas',typeIdea:'Suggestion ou nouvelle idée',typeTranslation:'Langue ou traduction',typeUsability:'Difficile à comprendre ou utiliser',typeExperience:'Expérience pratique',typeOther:'Autre',
messageLabel:'Que s’est-il passé ou que faut-il améliorer ?',messageHint:'10 caractères minimum. Soyez aussi précis que possible.',detailsLabel:'Étapes pour reproduire le problème ou solution proposée (facultatif)',languageLabel:'Langue utilisée (facultatif)',notSpecified:'Non précisé',arabic:'Arabe',english:'Anglais',french:'Français',german:'Allemand',deviceLabel:'Appareil ou navigateur (facultatif)',emailLabel:'Adresse e-mail pour un suivi (facultatif)',emailHint:'Laissez ce champ vide pour rester anonyme. Nous ne pouvons pas garantir une réponse.',
privacyTitle:'Votre vie privée compte',privacyText:'Ne communiquez pas les noms d’autres personnes, numéros de téléphone, mots de passe ou lieux sensibles. Les messages passent par Formspree, qui peut les conserver pour examen par SIRAI. Ils ne sont pas publiés sur le site.',privacyLink:'Politique de confidentialité de Formspree ↗',consentText:'Je comprends que Formspree traitera mon message et que SIRAI l’examinera.',send:'Envoyer mon avis',sendNote:'Votre message est envoyé seulement lorsque vous cliquez sur Envoyer.',
asideKicker:'ET ENSUITE ?',asideTitle:'Vos retours contribuent à améliorer les ressources.',stage1Title:'Vous partagez une observation',stage1Text:'Décrivez votre expérience avec vos mots.',stage2Title:'Nous examinons le message',stage2Text:'Nous donnons priorité aux problèmes concrets et de sécurité.',stage3Title:'Nous améliorons ce qui compte',stage3Text:'Nous documentons les améliorations après leur réalisation.',asideNote:'Construire avec les communautés commence par écouter.',resourcesTitle:'Découvrez nos ressources',endKicker:'CONSTRUIRE AVEC LES COMMUNAUTÉS',endTitle:'Le progrès réel commence par des retours réels.',endText:'SIRAI est une initiative indépendante en développement. Nous privilégions les observations précises.',back:'Retour à SIRAI ↗',
sending:'Envoi en cours…',success:'Merci. Votre message a bien été envoyé pour examen par SIRAI.',failed:'Votre message n’a pas été envoyé. Veuillez réessayer.',connection:'Connexion au service impossible. Vérifiez votre connexion et réessayez.',invalid:'Remplissez les champs obligatoires et vérifiez l’adresse e-mail.',rateLimit:'Le service est temporairement indisponible ou sa limite est atteinte. Réessayez plus tard.',phMessage:'Que souhaitiez-vous faire et que s’est-il passé ?',phDetails:'Exemple : j’ai ouvert WaterShare sur Android Chrome...',phDevice:'p. ex. Android / Chrome',phEmail:'vous@exemple.com'
};
const de={
heroKicker:'SIRAI / FEEDBACK AUS DER GEMEINSCHAFT',heroTitle:'Bessere Ideen beginnen mit Zuhören.',heroText:'Teilen Sie mit, was funktioniert, was nicht und wie SIRAI nützlicher werden kann. Konkrete Beobachtungen helfen uns, unsere kostenlosen Hilfsmittel zu verbessern.',start:'Feedback geben ↘',heroFine:'Ohne Konto · Anonym möglich · Vier Sprachen',notice:'Dieses Formular dient der Rückmeldung zu SIRAI. Es ist kein Notdienst und kein Antrag auf Förderung oder persönliche Unterstützung.',
formKicker:'IHRE ERFAHRUNG ZÄHLT',formTitle:'Helfen Sie uns, Wichtiges zu verbessern.',formText:'Melden Sie ein Problem, schlagen Sie etwas vor oder schildern Sie Ihre Erfahrung. Nur drei Hauptfragen sind Pflicht.',
resourceLabel:'Welche Ressource?',chooseResource:'Ressource wählen',typeLabel:'Welche Art von Feedback?',chooseType:'Kategorie wählen',typeBug:'Etwas funktioniert nicht',typeIdea:'Vorschlag oder neue Idee',typeTranslation:'Sprache oder Übersetzung',typeUsability:'Schwer verständlich oder bedienbar',typeExperience:'Praktische Erfahrung',typeOther:'Sonstiges',
messageLabel:'Was ist passiert oder was sollte verbessert werden?',messageHint:'Mindestens 10 Zeichen. Bitte möglichst genau beschreiben.',detailsLabel:'Schritte zur Wiederholung oder Lösungsvorschlag (optional)',languageLabel:'Verwendete Sprache (optional)',notSpecified:'Nicht angegeben',arabic:'Arabisch',english:'Englisch',french:'Französisch',german:'Deutsch',deviceLabel:'Gerät oder Browser (optional)',emailLabel:'E-Mail für Rückfragen (optional)',emailHint:'Leer lassen, um anonym zu bleiben. Eine Antwort können wir nicht versprechen.',
privacyTitle:'Ihre Privatsphäre ist wichtig',privacyText:'Bitte keine Namen anderer Personen, Telefonnummern, Passwörter oder sensible Ortsangaben teilen. Feedback wird über Formspree übertragen und dort eventuell für die Prüfung durch SIRAI gespeichert. Es wird nicht auf dieser Website veröffentlicht.',privacyLink:'Datenschutzhinweise von Formspree ↗',consentText:'Ich verstehe, dass Formspree mein Feedback verarbeitet und SIRAI es prüft.',send:'Feedback senden',sendNote:'Ihre Nachricht wird erst nach Klick auf Senden übermittelt.',
asideKicker:'WIE GEHT ES WEITER?',asideTitle:'Aus Feedback entstehen bessere Ressourcen.',stage1Title:'Sie teilen eine Beobachtung',stage1Text:'Beschreiben Sie Ihre Erfahrung.',stage2Title:'Wir prüfen den Hinweis',stage2Text:'Praktische Probleme und Sicherheit gehen vor.',stage3Title:'Wir verbessern, was zählt',stage3Text:'Verbesserungen dokumentieren wir erst nach Umsetzung.',asideNote:'Mit Gemeinschaften arbeiten heißt zuerst zuhören.',resourcesTitle:'Unsere Ressourcen',endKicker:'GEMEINSAM GESTALTEN',endTitle:'Echter Fortschritt beginnt mit echtem Feedback.',endText:'SIRAI ist eine unabhängige Initiative im Aufbau. Uns helfen konkrete Hinweise.',back:'Zurück zu SIRAI ↗',
sending:'Wird gesendet…',success:'Vielen Dank. Ihr Feedback wurde zur Prüfung durch SIRAI erfolgreich übermittelt.',failed:'Ihr Feedback wurde nicht gesendet. Bitte versuchen Sie es erneut.',connection:'Keine Verbindung zum Feedback-Dienst. Internetverbindung prüfen und erneut versuchen.',invalid:'Pflichtfelder ausfüllen und E-Mail-Adresse prüfen.',rateLimit:'Der Dienst ist vorübergehend nicht verfügbar oder das Limit ist erreicht. Bitte später erneut versuchen.',phMessage:'Was wollten Sie tun und was ist passiert?',phDetails:'Beispiel: Ich habe WaterShare auf Android Chrome geöffnet...',phDevice:'z. B. Android / Chrome',phEmail:'sie@beispiel.de'
};
const localeTable={en,ar,fr,de};
const lang=()=>['en','ar','fr','de'].includes(document.documentElement.lang)?document.documentElement.lang:'en';
const T=k=>localeTable[lang()][k]??en[k]??k;
const languageNames={en:'English',ar:'Arabic',fr:'French',de:'German'};
const placeholders=[['sf-message','phMessage'],['sf-details','phDetails'],['sf-device','phDevice'],['sf-email','phEmail']];
let busy=false,manualLanguage=false;
function render(){
 document.querySelectorAll('[data-sf]').forEach(node=>{node.textContent=T(node.dataset.sf)});
 for(const [id,key] of placeholders)$(id).placeholder=T(key);
 if(!manualLanguage)$('sf-language').value=languageNames[lang()];
 const status=$('sf-result');if(!status.hidden&&status.dataset.message)status.textContent=T(status.dataset.message);
 if(busy)$('sf-submit-text').textContent=T('sending');
}
function setStatus(key,error=false){
 const el=$('sf-result');el.dataset.message=key;el.textContent=T(key);el.classList.toggle('error',error);el.hidden=false;
 if(typeof el.focus==='function')el.focus({preventScroll:true});
}
$('sf-language').addEventListener('change',()=>{manualLanguage=true});
document.querySelectorAll('[data-lang-select]').forEach(x=>x.addEventListener('change',render));
try{const q=new URLSearchParams(window.location.search);const requested=q.get('resource');if(['SIRAI website','WaterShare','ProjectStarter','TaqaWise'].includes(requested))$('sf-resource').value=requested}catch(e){}
form.addEventListener('submit',async event=>{
 if(!window.fetch)return; // HTML form remains usable when JavaScript fetch is unavailable.
 event.preventDefault();if(busy)return;
 if(!form.checkValidity()){form.reportValidity();setStatus('invalid',true);return}
 busy=true;const button=$('sf-submit');button.disabled=true;$('sf-submit-text').textContent=T('sending');$('sf-result').hidden=true;
 try{
  const response=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});
  let payload={};try{payload=await response.json()}catch(e){}
  if(response.ok&&payload.ok!==false){
   form.reset();manualLanguage=false;render();setStatus('success');
  }else{
   setStatus(response.status===429?'rateLimit':'failed',true);
  }
 }catch(e){setStatus('connection',true)}
 finally{busy=false;button.disabled=false;$('sf-submit-text').textContent=T('send')}
});
render();
})();