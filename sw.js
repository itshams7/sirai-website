/* SIRAI pre-launch offline shell. Does not cache personal drafts or feedback submissions. */
const VERSION='sirai-offline-v42-about-relocation-20261107';
const ROOT=new URL('./',self.registration.scope).pathname;
const ASSETS=[
 'index.html','cooking-energy.html','footage-credits.html','explorer.html','about.html','privacy.html','terms.html','water-toolkit.html','projectstarter.html','taqawise.html','feedback.html','transparency.html','start-here.html','resources.html','faq.html','updates.html','get-involved.html','practical-guide.html','issues.html',
 'manifest.webmanifest','assets/favicon.svg','assets/watershare-resource-art.svg','assets/projectstarter-resource-art.svg','assets/taqawise-resource-art.svg','assets/styles.css','assets/premium-palette.css','assets/site-motion.css','assets/site-motion.js','assets/editorial-cinematic.css','assets/founder-editorial.css','assets/founder-editorial.js','assets/focus-refined.css','assets/focus-refined.js','assets/goal-2028.css','assets/objectives.css','assets/footer-refined.css','assets/cooking-energy.css','assets/cooking-energy.js','assets/hero-montage.css','assets/hero-montage.js',
 'assets/state-displacement.js','assets/explorer.js','assets/explorer.css','assets/visual-polish.css','assets/explorer-entry.css','assets/sudan-overview.svg','assets/sudan-states.geojson','assets/policies.css','assets/policies.js','assets/app.js','assets/offline-share.js','assets/offline-share.css','assets/data-mode.js','assets/data-mode.css','assets/launch-quality.css','assets/launch-quality.js','assets/transparency.js','assets/phase2.css','assets/phase2.js','assets/phase2-guide.js','assets/community-hub.css','assets/community-hub.js','assets/sirai-math.js','assets/practical.css','assets/practical.js','assets/practical-guide.js','assets/issues.js','assets/resource-pack.js','assets/offline-images.js',
 'assets/feedback.css','assets/feedback.js',
 'assets/ws-locales.js','assets/ws-ar.js','assets/ws-fr.js','assets/ws-de.js','assets/watershare.js',
 'assets/projectstarter.css','assets/projectstarter-locales.js','assets/projectstarter-ar.js','assets/projectstarter-fr.js','assets/projectstarter-de.js','assets/projectstarter.js',
 'assets/taqawise.css','assets/taqawise-locales.js','assets/taqawise-ar.js','assets/taqawise-fr.js','assets/taqawise-de.js','assets/taqawise.js',
 'downloads/water-worksheet-en.csv','downloads/water-worksheet-ar.csv','downloads/project-budget-en.csv','downloads/project-budget-ar.csv','downloads/energy-inventory-en.csv','downloads/energy-inventory-ar.csv'
];
const localRequest=url=>new Request(url.origin+url.pathname);
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(VERSION);
 try{
  await Promise.all(ASSETS.map(async name=>{
   const request=new Request(new URL(name,self.registration.scope),{cache:'reload'});
   const response=await fetch(request);
   if(!response.ok||response.type==='opaque')throw Error('Offline asset unavailable: '+name);
   await cache.put(request,response);
  }));
  await self.skipWaiting();
 }catch(error){
  await caches.delete(VERSION);
  throw error;
 }
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 await Promise.all((await caches.keys()).filter(k=>k.startsWith('sirai-offline-')&&k!==VERSION).map(k=>caches.delete(k)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(ROOT))return;
 const cacheKey= url.pathname===ROOT ? new Request(new URL('index.html',self.registration.scope)):localRequest(url);
 if(request.mode==='navigate'){
  event.respondWith((async()=>{
   const cache=await caches.open(VERSION);
   const controller=new AbortController();
   const timeout=setTimeout(()=>controller.abort(),4500);
   try{
    const response=await fetch(request,{signal:controller.signal});
    if(response.ok&&response.type==='basic')await cache.put(cacheKey,response.clone());
    return response;
   }catch(error){
    return await cache.match(cacheKey)||Response.error();
   }finally{clearTimeout(timeout)}
  })());
  return;
 }
 event.respondWith((async()=>{
  const cache=await caches.open(VERSION);
  // Check the network first for scripts and styles, with an offline fallback.
  if(/\.(js|css)$/.test(url.pathname)){
   try{
    const fresh=await fetch(request);
    if(fresh.ok&&fresh.type==='basic')await cache.put(cacheKey,fresh.clone());
    return fresh;
   }catch(error){return await cache.match(cacheKey)||Response.error()}
  }
  const cached=await cache.match(cacheKey);
  return cached||fetch(request);
 })());
});
