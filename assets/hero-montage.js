/* Sudanese people-centered hero montage.
   Three archival videos only. Documentary credits remain on footage-credits.html.
   Still imagery is an accessibility/offline fallback, never an intentional scene. */
(()=>{
 'use strict';
 const stage=document.querySelector('.sirai-cinematic-hero');
 const reel=stage?.querySelector('[data-sirai-hero-reel]');
 if(!reel)return;
 const videos=[...reel.querySelectorAll('video[data-reel-video]')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
 let active=-1, timer=0, generation=0, visible=true, waiting=false;
 const blocked=()=>reduced.matches||
   document.documentElement.classList.contains('sirai-low-data')||
   connection?.saveData===true||
   ['slow-2g','2g'].includes(connection?.effectiveType)||
   !navigator.onLine||document.hidden||!visible;
 const clear=()=>{
   generation++;clearTimeout(timer);timer=0;waiting=false;
   for(const v of videos){v.pause();v.classList.remove('is-visible')}
   active=-1;reel.dataset.scene='0';stage.classList.remove('is-playing');
 };
 // Do not start a new download or autoplay when hidden, offline or reduced-motion.
 const advance=()=>{
   if(blocked()){clear();return}
   const next=(active+1)%videos.length;
   const v=videos[next];
   if(!v)return;
   const id=++generation;
   waiting=true;
   const fail=()=>{if(id!==generation)return;
     waiting=false;v.pause();v.dataset.failed='1';
     // Skip this clip for this session. Leave the last successful video behind
     // the overlay until a replacement is ready, rather than showing black.
     const available=videos.some(item=>item.dataset.failed!=='1');
     if(!available){clear();return}
     active=next;timer=setTimeout(advance,450);
   };
   if(v.dataset.failed==='1'){active=next;timer=setTimeout(advance,10);return}
   const ready=()=>{
     if(id!==generation||blocked())return;
     v.defaultMuted=true;v.muted=true;v.playbackRate=.92;
     const start=Number(v.dataset.reelStart||0);
     const play=()=>{
       if(id!==generation||blocked())return;
       const promise=v.play();
       Promise.resolve(promise).then(()=>{
         if(id!==generation||blocked()){v.pause();return}
         waiting=false;
         v.classList.add('is-visible');
         for(const other of videos){if(other!==v)other.classList.remove('is-visible')}
         active=next;reel.dataset.scene=String(next+1);
         stage.classList.add('is-playing');
         // Allow the fade to finish before stopping the outgoing footage.
         setTimeout(()=>{if(id===generation)for(const other of videos)if(other!==v)other.pause()},1450);
         timer=setTimeout(advance,6400);
       }).catch(fail);
     };
     if(start>0&&!v.dataset.seeked && Number.isFinite(v.duration)&&v.duration>start+2){
       v.dataset.seeked='1';
       v.addEventListener('seeked',play,{once:true});
       try{v.currentTime=start}catch(_){play()}
     }else play();
   };
   if(!v.getAttribute('src')){v.src=v.dataset.reelVideo;v.load()}
   if(v.readyState>=2){ready();return}
   const watchdog=setTimeout(()=>{v.removeEventListener('canplay',onReady);fail()},9500);
   const onReady=()=>{clearTimeout(watchdog);v.removeEventListener('canplay',onReady);ready()};
   v.addEventListener('canplay',onReady,{once:true});
   v.addEventListener('error',()=>{clearTimeout(watchdog);v.removeEventListener('canplay',onReady);fail()},{once:true});
 };
 const sync=()=>{
   if(blocked()){clear();return}
   if(active<0&&!waiting)advance();
 };
 document.addEventListener('visibilitychange',sync);
 window.addEventListener('online',sync);
 window.addEventListener('offline',sync);
 reduced.addEventListener?.('change',sync);
 connection?.addEventListener?.('change',sync);
 new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 if('IntersectionObserver' in window){
   new IntersectionObserver(entries=>{visible=!!entries[0]?.isIntersecting;sync()},{threshold:.12}).observe(stage);
 }
 sync();
})();
