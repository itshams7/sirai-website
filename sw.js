/* SIRAI pre-launch offline shell. No personal plans or submitted feedback are cached. */
const VERSION='sirai-offline-v2-20261104';
const ROOT=new URL('./',self.registration.scope).pathname;
const ASSETS=[
 'index.html','water-toolkit.html','projectstarter.html','taqawise.html','feedback.html',
 'manifest.webmanifest','assets/favicon.svg','assets/styles.css',
 'assets/app.js','assets/offline-share.js','assets/offline-share.css',
 'assets/feedback.css','assets/feedback.js',
 'assets/ws-locales.js','assets/ws-ar.js','assets/ws-fr.js','assets/ws-de.js','assets/watershare.js',
 'assets/projectstarter.css','assets/projectstarter-locales.js','assets/projectstarter-ar.js','assets/projectstarter-fr.js','assets/projectstarter-de.js','assets/projectstarter.js',
 'assets/taqawise.css','assets/taqawise-locales.js','assets/taqawise-ar.js','assets/taqawise-fr.js','assets/taqawise-de.js','assets/taqawise.js'
];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(VERSION);
 const results=await Promise.allSettled(ASSETS.map(async p=>{
  const request=new Request(new URL(p,self.registration.scope),{cache:'reload'});
  const response=await fetch(request);
  if(!response.ok)throw Error(p+': '+response.status);
  await cache.put(request,response);
 }));
 if(results.some(r=>r.status==='rejected'))throw Error('Offline package incomplete; existing version retained');
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 await Promise.all((await caches.keys()).filter(k=>k.startsWith('sirai-offline-')&&k!==VERSION).map(k=>caches.delete(k)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(ROOT))return;
 if(req.mode==='navigate'){
  event.respondWith((async()=>{
   const cache=await caches.open(VERSION);
   try{const response=await fetch(req);if(response.ok)await cache.put(new Request(url.origin+url.pathname),response.clone());return response}
   catch(e){return await cache.match(new Request(url.origin+url.pathname))||Response.error()}
  })());return;
 }
 event.respondWith((async()=>{
  const cache=await caches.open(VERSION);
  const normalized=new Request(url.origin+url.pathname);
  return await cache.match(normalized)||await fetch(req);
 })());
});
