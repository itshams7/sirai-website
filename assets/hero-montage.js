/* SIRAI hero montage: licensed archival Sudan footage mixed with original
   aerial hero and a Darfur water-collection photograph.
   Media is opt-in by capability; no autoplay on reduced-motion or low-data.
   Videos load one at a time. A static photo remains a permanent fallback. */
(()=>{
 'use strict';
 const stage=document.querySelector('.sirai-cinematic-hero');
 const reel=stage?.querySelector('[data-sirai-hero-reel]');
 if(!reel)return;
 const sources=[...reel.querySelectorAll('[data-reel-scene]')];
 const toggle=stage.querySelector('[data-reel-toggle]');
 const icon=stage.querySelector('.sirai-reel-toggle-icon');
 const text=stage.querySelector('.sirai-reel-toggle-text');
 const credits=stage.querySelector('.sirai-reel-credits');
 const mq=matchMedia('(prefers-reduced-motion: reduce)');
 const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
 const labels={
   en:['Pause motion','Play motion'],ar:['إيقاف الحركة مؤقتاً','تشغيل الحركة'],
   fr:['Mettre en pause','Reprendre la lecture'],de:['Bewegung pausieren','Bewegung fortsetzen']
 };
 let selected=0,timer=0,userPaused=false,seen=true,token=0,hasStarted=false;
 const isConstrained=()=>mq.matches
   ||document.documentElement.classList.contains('sirai-low-data')
   ||connection?.saveData===true
   ||['slow-2g','2g'].includes(connection?.effectiveType)
   ||!navigator.onLine;
 const canRun=()=>!isConstrained()&&!userPaused&&seen&&!document.hidden;
 const tr=()=>labels[document.documentElement.lang]||labels.en;
 function label(){
   const paused=userPaused||!canRun();
   const value=tr()[paused?1:0];
   text.textContent=value;
   icon.textContent=paused?'▶':'Ⅱ';
   toggle.setAttribute('aria-label',value);
   toggle.setAttribute('aria-pressed',String(userPaused));
 }
 function stop(hide=true){
   ++token;
   clearTimeout(timer);timer=0;
   for(const scene of sources){
     if(scene.tagName==='VIDEO')scene.pause();
     if(hide)scene.classList.remove('is-visible');
   }
   if(hide){selected=0;reel.dataset.scene='0';stage.classList.remove('is-playing')}
   label();
 }
 function countdown(ms){clearTimeout(timer);timer=setTimeout(next,ms)}
 function activate(index){
   if(!canRun())return;
   const scene=sources.find(s=>Number(s.dataset.reelScene)===index);
   if(!scene)return countdown(4200);
   const id=++token;
   const reveal=()=>{
     if(id!==token||!canRun())return false;
     for(const s of sources)s.classList.toggle('is-visible',s===scene);
     selected=index;reel.dataset.scene=String(index);
     stage.classList.add('is-playing');label();
     countdown(index===2?4600:5600);
     return true;
   };
   const fail=()=>{
     if(id!==token)return;
     if(scene.tagName==='VIDEO')scene.pause();
     selected=index; // Skip unavailable media instead of retrying indefinitely.
     countdown(650);
   };
   if(scene.tagName==='VIDEO'){
     scene.defaultMuted=true;
     scene.muted=true;
     scene.playbackRate=.9;
     if(!scene.src){
       scene.src=scene.dataset.reelVideo;
       scene.load();
     }
     const play=()=>{
       const p=scene.play();
       if(p&&typeof p.then==='function')p.then(reveal).catch(fail);
       else reveal();
     };
     if(scene.readyState>=2){play();return}
     const pending=setTimeout(()=>{
       scene.removeEventListener('canplay',ready);
       fail();
     },3900);
     const ready=()=>{
       clearTimeout(pending);scene.removeEventListener('canplay',ready);
       if(id!==token)return;
       play();
     };
     scene.addEventListener('canplay',ready,{once:true});
     scene.addEventListener('error',()=>{
       clearTimeout(pending);scene.removeEventListener('canplay',ready);fail();
     },{once:true});
   }else{
     const photo=scene.querySelector('img[data-reel-photo]');
     if(!photo)return fail();
     const ready=()=>photo.naturalWidth?reveal():fail();
     if(!photo.dataset.reelRequested){
       photo.dataset.reelRequested='1';
       photo.onload=ready;
       photo.onerror=fail;
       photo.src=photo.dataset.reelPhoto;
     }else if(photo.complete)ready();
     else{photo.addEventListener('load',ready,{once:true});photo.addEventListener('error',fail,{once:true})}
   }
 }
 function next(){
   if(!canRun())return;
   let index=selected>=4?0:selected+1;
   if(index===0){
     ++token;
     for(const s of sources){s.classList.remove('is-visible');if(s.tagName==='VIDEO')s.pause()}
     selected=0;reel.dataset.scene='0';
     countdown(5100);
   }else activate(index);
 }
 function start(){
   if(!canRun()){stop();return}
   if(!hasStarted){hasStarted=true;stage.classList.add('is-playing');countdown(3700)}
   else if(!timer)countdown(900);
   label();
 }
 toggle.addEventListener('click',()=>{
   userPaused=!userPaused;
   if(userPaused)stop(false);
   else start();
   label();
 });
 credits?.addEventListener('toggle',()=>{if(credits.open)stop(false);else if(canRun())start()});
 document.addEventListener('visibilitychange',()=>{
   if(document.hidden)stop(false);else if(canRun())start();
 });
 window.addEventListener('offline',()=>stop());
 window.addEventListener('online',()=>start());
 mq.addEventListener?.('change',()=>{if(isConstrained())stop();else start()});
 connection?.addEventListener?.('change',()=>{if(isConstrained())stop();else start()});
 new MutationObserver(()=>{if(isConstrained())stop();else start()})
   .observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 document.querySelectorAll('[data-lang-select]').forEach(s=>s.addEventListener('change',()=>requestAnimationFrame(label)));
 if('IntersectionObserver' in window){
   new IntersectionObserver(entries=>{
     seen=entries[0]?.isIntersecting??false;
     if(seen)start();else stop(false);
   },{threshold:.12}).observe(stage);
 }else{seen=true;start()}
 label();
})();
