/* SIRAI: accessible, lightweight scroll storytelling + editorial language polish. */
(() => {
  'use strict';
  const localeOverrides = {
    en: {
      ws: {eyebrow:'SIRAI / WATER PLANNING',endKicker:'WATERSHARE / COMMUNITY TOOL',endText:'Free educational planning tool, version 0.2. Not yet validated in a SIRAI field pilot.'},
      ps: {heroKicker:'SIRAI / COMMUNITY PLANNING',endText:'ProjectStarter is an educational planning tool. It cannot replace local collaboration, safeguarding, professional advice or consent.'},
      tq: {eyebrow:'SIRAI / ENERGY PLANNING',endKicker:'SIRAI / ENERGY PLANNING',sideLabel:'YOUR PLAN',endText:'TaqaWise is an early educational planning tool, free to use and not yet field validated by SIRAI.'}
    },
    ar: {
      ws: {eyebrow:'SIRAI / تخطيط المياه',endKicker:'WATERSHARE / أداة مجتمعية'},
      ps: {heroKicker:'SIRAI / التخطيط المجتمعي'},
      tq: {eyebrow:'SIRAI / تخطيط الطاقة',endKicker:'SIRAI / تخطيط الطاقة',sideLabel:'خطتك'}
    },
    fr: {
      ws: {eyebrow:'SIRAI / PLANIFICATION DE L’EAU',endKicker:'WATERSHARE / OUTIL COMMUNAUTAIRE'},
      ps: {heroKicker:'SIRAI / PLANIFICATION COMMUNAUTAIRE'},
      tq: {eyebrow:'SIRAI / PLANIFICATION ÉNERGÉTIQUE',endKicker:'SIRAI / PLANIFICATION ÉNERGÉTIQUE',sideLabel:'VOTRE PLAN'}
    },
    de: {
      ws: {eyebrow:'SIRAI / WASSERPLANUNG',endKicker:'WATERSHARE / GEMEINSCHAFTSTOOL'},
      ps: {heroKicker:'SIRAI / GEMEINSCHAFTSPLANUNG'},
      tq: {eyebrow:'SIRAI / ENERGIEPLANUNG',endKicker:'SIRAI / ENERGIEPLANUNG',sideLabel:'IHR PLAN'}
    }
  };
  for (const [language, set] of Object.entries(localeOverrides)) {
    if (window.WS_LOCALES?.[language]) Object.assign(window.WS_LOCALES[language], set.ws);
    if (window.PS_LOCALES?.[language]) Object.assign(window.PS_LOCALES[language], set.ps);
    if (window.TQ_LOCALES?.[language]) Object.assign(window.TQ_LOCALES[language], set.tq);
  }

  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const targets=[
    '.hero-grid > div','.hero-grid > figure',
    '.section-heading','.two-col > *','.pillars > *',
    '.feature-visual','.feature-copy','.ps-resource-home','.tq-resource-home',
    '.founder-visual','.founder-copy','.roadmap > *',
    '.quote-band blockquote','.quote-band small',
    '.ws-hero-grid > *','.ps-hero-grid > *','.tq-hero-grid > *','.sf-hero-inner > *',
    '.ws-page .section-heading','.ps-intro-grid > *','.tq-intro-grid > *',
    '.ws-planner-section > .container > *','.ps-workspace-heading',
    '.tq-head','.sf-layout > *','.ps-layout > *','.tq-layout > *',
    '.sf-heading','.sf-end .container > *','.ps-footer-callout .container > *',
    '.tq-end .container > *','.ws-end .container > *'
  ].join(',');
  const elements=[...new Set([...document.querySelectorAll(targets)])];
  if(reducedMotion.matches || !('IntersectionObserver' in window))return;
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      entry.target.classList.add('motion-visible');
      observer.unobserve(entry.target);
    }
  },{threshold:0.08,rootMargin:'0px 0px -28px 0px'});
  elements.forEach((el,index)=>{
    // Leave the initial hero visible immediately; no flash of hidden content.
    if(el.closest('.hero,.ws-hero,.ps-hero,.tq-hero,.sf-hero'))return;
    el.classList.add('motion-reveal');
    if(el.matches('.feature-visual,.founder-visual'))el.classList.add('motion-from-left');
    if(el.matches('.feature-copy,.founder-copy'))el.classList.add('motion-from-right');
    if(el.matches('.pillar,.panel,.phase'))el.style.setProperty('--reveal-delay', ((index%3)*85)+'ms');
    observer.observe(el);
  });
  // No hidden elements unless JS has initialized successfully.
  document.documentElement.classList.add('motion-ready');
  requestAnimationFrame(()=>{
    for(const el of elements){
      if(!el.classList.contains('motion-reveal'))continue;
      if(el.getBoundingClientRect().top < window.innerHeight*0.97)el.classList.add('motion-visible');
    }
  });
  reducedMotion.addEventListener?.('change',e=>{
    if(e.matches){observer.disconnect();document.documentElement.classList.remove('motion-ready');}
  });
})();
