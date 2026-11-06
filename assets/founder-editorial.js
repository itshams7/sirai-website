/* Progressive founder intro reveal, no content hidden if JavaScript is unavailable. */
(() => {
 'use strict';
 const intro=document.querySelector('.sirai-founder-intro');
 if(!intro)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 if(reduced.matches || !('IntersectionObserver' in window)){
   intro.classList.add('sirai-intro-visible');
   return;
 }
 // site-motion.js establishes motion-ready. Class added before layout paint where possible.
 const observer=new IntersectionObserver(entries=>{
   for(const e of entries)if(e.isIntersecting){intro.classList.add('sirai-intro-visible');observer.unobserve(intro)}
 },{threshold:.12,rootMargin:'0px 0px -20px 0px'});
 observer.observe(intro);
 if(intro.getBoundingClientRect().top<innerHeight*.98)intro.classList.add('sirai-intro-visible');
 reduced.addEventListener?.('change',e=>{if(e.matches){observer.disconnect();intro.classList.add('sirai-intro-visible')}});
})();
