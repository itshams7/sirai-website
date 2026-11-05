/* SIRAI offline image fallbacks: preserve text meaning when remote photographs fail. */
(()=>{'use strict';const photos=[...document.querySelectorAll('img[src^="https://images.unsplash.com/"]')];if(!photos.length)return;
const fallback=img=>{
 if(img.dataset.siraiFallback==='used')return;
 const parent=img.closest('.ps-resource-home-mark,.ps-hero,.tq-resource-home-icon,.tq-hero,.ws-resource-visual,.ws-hero,.hero');
 let file='assets/watershare-resource-art.svg';
 if(parent?.matches('.ps-resource-home-mark,.ps-hero'))file='assets/projectstarter-resource-art.svg';
 if(parent?.matches('.tq-resource-home-icon,.tq-hero'))file='assets/taqawise-resource-art.svg';
 img.dataset.siraiFallback='used';img.src=file;img.alt=({en:'Decorative SIRAI illustration shown when external photography is unavailable.',ar:'رسم توضيحي من SIRAI يظهر عند تعذر تحميل الصورة.',fr:'Illustration SIRAI affichée lorsque la photo externe est indisponible.',de:'SIRAI-Grafik, falls das externe Foto nicht geladen werden kann.'})[document.documentElement.lang]||'SIRAI illustration';
};
photos.forEach(img=>{img.addEventListener('error',()=>fallback(img),{once:true});if(!navigator.onLine&&!img.complete)fallback(img)});
window.addEventListener('offline',()=>photos.forEach(img=>{if(!img.complete||img.naturalWidth===0)fallback(img)}));
})();
