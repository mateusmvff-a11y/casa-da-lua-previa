/* =========================================================
   Casa da Lua — shadows.js
   As sombras/texturas de fundo (.section-bg.baked) ganham movimento: um vídeo curto em loop
   (WebM com transparência, assets/video/sh-<ref>.webm) toca por cima da imagem estática e só
   enquanto a seção está perto da tela. A opacidade (--op) é a mesma da textura.
   Fica estático em: Safari (sem alfa em WebM), celular/toque, "reduzir movimento" e economia de dados.
   Para trocar por um vídeo de sombra de verdade: node tools/shadow-video.mjs --from clipe.mp4 --ref <ref>
   ========================================================= */
(function(){
'use strict';
if(!window.CDL) return;
if(location.search.indexOf('sem-movimento') >= 0) return;
const ua = navigator.userAgent;
const safari = /^((?!chrome|chromium|android|crios|fxios|edg).)*safari/i.test(ua);
const coarse = window.matchMedia('(pointer:coarse)').matches;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const save = navigator.connection && navigator.connection.saveData;
if(safari || coarse || reduce || save || !('IntersectionObserver' in window)) return;

const refOf = el => {
  const st = el.getAttribute('style') || '';
  let m = st.match(/img\/([0-9a-f]{6})-m\.webp/);
  if(!m){ const i = el.querySelector('img'); if(i) m = (i.getAttribute('src') || '').match(/img\/([0-9a-f]{6})-m\.webp/); }
  return m && m[1];
};
function build(el){
  const ref = refOf(el); if(!ref) return;
  const v = document.createElement('video');
  v.className = 'sh-video'; v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto';
  v.setAttribute('aria-hidden','true'); v.tabIndex = -1; v.disablePictureInPicture = true;
  const img = el.querySelector('img');
  if(img && img.getAttribute('style')) v.setAttribute('style',img.getAttribute('style'));   // mesmo recorte (object-view-box)
  v.addEventListener('loadeddata',()=>{ el.classList.add('has-video'); const p = v.play(); if(p) p.catch(()=>{}); },{once:true});
  v.src = 'assets/video/sh-' + ref + '.webm';
  el.appendChild(v); el.__sv = v;
}
window.CDL.ready(()=>{
  const io = new IntersectionObserver(es=>es.forEach(en=>{
    const el = en.target, v = el.__sv;
    if(en.isIntersecting){ if(!v) build(el); else { const p = v.play(); if(p) p.catch(()=>{}); } }
    else if(v) v.pause();
  }),{rootMargin:'420px 0px'});
  document.querySelectorAll('.section-bg.baked').forEach(el=>{ if(refOf(el)) io.observe(el); });
});
})();
