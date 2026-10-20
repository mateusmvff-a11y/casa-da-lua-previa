/* =========================================================
   Casa da Lua — motion.js  (v2)
   Movimento calmo e editorial: GSAP + ScrollTrigger + SplitText + Lenis.
   O HTML marca o que anima; o que não foi marcado recebe um padrão (autoMark).
     data-anim="hero"    abertura: foto/vídeo assenta do zoom, texto entra em sequência, ao rolar o conteúdo se afasta
     data-anim="title"   títulos entram por linhas (máscara + leve rotação)
     data-anim="reveal"  blocos sobem e aparecem; no pai, data-stagger escalona os filhos
     data-anim="image"   moldura abre por máscara e a foto assenta; data-parallax="-8" desliza com a rolagem
   Além disso: cortina entre páginas, entrada/saída das sobreposições, troca de conteúdo das abas e filtros,
   barra de progresso, cabeçalho que recolhe ao descer, vídeos que pausam fora da tela.
   Cada página cria os seus gatilhos ao abrir e os desfaz ao sair (gsap.context).
   ?sem-movimento desliga tudo (testes, acessibilidade).
   ========================================================= */
(function(){
'use strict';
const root = document.documentElement;
const fail = () => { root.classList.remove('motion-on'); };
if(!window.CDL) return;
if(location.search.indexOf('sem-movimento') >= 0){ fail(); return; }
const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || reduz){ fail(); return; }
const CDL = window.CDL;
gsap.registerPlugin(ScrollTrigger);
const hasSplit = typeof SplitText !== 'undefined';
if(hasSplit) gsap.registerPlugin(SplitText);
gsap.defaults({ease:'power3.out'});
const desktop = () => window.matchMedia('(min-width:1025px)').matches;

/* ---------- Rolagem suave (Lenis) ---------- */
let lenis = null;
if(typeof Lenis !== 'undefined' && !window.matchMedia('(pointer:coarse)').matches){
  lenis = new Lenis({lerp:.09,wheelMultiplier:.95,smoothWheel:true});
  CDL.lenis = lenis;
  lenis.on('scroll',ScrollTrigger.update);
  gsap.ticker.add(t=>lenis.raf(t*1000));
  gsap.ticker.lagSmoothing(0);
  /* o Lenis guarda a altura: remede quando o ScrollTrigger recalcula, o corpo muda e tudo carrega */
  ScrollTrigger.addEventListener('refresh',()=>lenis.resize());
  if('ResizeObserver' in window) new ResizeObserver(()=>lenis.resize()).observe(document.body);
  window.addEventListener('load',()=>{ lenis.resize(); ScrollTrigger.refresh(); });
  document.querySelectorAll('.overlay,.modal,.drawer').forEach(el=>el.setAttribute('data-lenis-prevent',''));
  new MutationObserver(()=>{ document.body.classList.contains('no-scroll') ? lenis.stop() : lenis.start(); })
    .observe(document.body,{attributes:true,attributeFilter:['class']});
}

/* ---------- Barra de progresso + cabeçalho que recolhe ---------- */
const bar = document.createElement('div'); bar.className = 'scroll-progress'; bar.setAttribute('aria-hidden','true');
document.body.appendChild(bar);
const setBar = gsap.quickSetter(bar,'scaleX');
const header = document.querySelector('.site-header');
let lastY = window.scrollY, hidden = false;
function onScroll(){
  const y = window.scrollY, max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  setBar(Math.min(1, y / max));
  if(header){
    header.classList.toggle('is-scrolled', y > 80);
    const d = y - lastY;
    if(y > 320 && d > 8 && !hidden && !document.body.classList.contains('no-scroll')){ hidden = true; gsap.to(header,{yPercent:-105,duration:.6,ease:'power3.out',overwrite:true}); }
    else if((d < -8 || y < 200) && hidden){ hidden = false; gsap.to(header,{yPercent:0,duration:.6,ease:'power3.out',overwrite:true}); }
  }
  lastY = y;
}
window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
function showHeader(){ if(header && hidden){ hidden = false; gsap.to(header,{yPercent:0,duration:.4,overwrite:true}); } }

/* ---------- Animações por página ---------- */
const contexts = {};     // page -> gsap.Context
const splits = {};       // page -> [SplitText]
const S = {delay:0};     // atraso extra (a cortina ainda está subindo)

/* O que o HTML não marcou recebe o padrão da casa (sem aninhar: filho de algo já marcado fica quieto) */
function autoMark(pageEl){
  const mark = (el,t) => { if(!el.hasAttribute('data-anim') && !(el.parentElement && el.parentElement.closest('[data-anim]'))) el.setAttribute('data-anim',t); };
  pageEl.querySelectorAll('.section h1,.section h2').forEach(el=>mark(el,'title'));
  pageEl.querySelectorAll('.section .eyebrow,.section .lead,.section-head > .small,.section-head > p,.stat-row,.hero-actions,.practical-item,.year-stack article,.timeline article,.story-mini-list span').forEach(el=>mark(el,'reveal'));
  pageEl.querySelectorAll('.card,.suite-card,.chapada-card,.space-card,.story-card,.feature-panel,.reserve-steps,.form-card,.event-copy,.program-stage,.moment-hero,.atlas-teaser,.atlas-home-card,.profile-panel').forEach(el=>mark(el,'reveal'));
  /* irmãos marcados viram uma fileira escalonada */
  pageEl.querySelectorAll('[data-anim="reveal"]').forEach(el=>{
    const p = el.parentElement; if(!p || p.hasAttribute('data-stagger')) return;
    const n = [...p.children].filter(c=>c.getAttribute('data-anim') === 'reveal').length;
    if(n >= 2) p.setAttribute('data-stagger','');
  });
}

const heroBgOf = hero => hero.querySelector('.hero-video, img, .section-bg, .hero-bg');

function build(pageEl){
  const page = pageEl.dataset.page;
  kill(page);
  const ctx = gsap.context(()=>{},pageEl);
  contexts[page] = ctx;
  autoMark(pageEl);
  const D = S.delay; S.delay = 0;
  ctx.add(()=>{
    const sp = splits[page] = [];

    /* HERO: entra ao abrir; ao rolar, o conteúdo se afasta devagar */
    pageEl.querySelectorAll('[data-anim="hero"]').forEach(hero=>{
      const bg = heroBgOf(hero);
      if(bg){
        bg.setAttribute('data-hero-bg','');   // o parallax genérico (abaixo) pula este elemento: dois gsap brigando pela mesma foto era a tremulação ao abrir
        gsap.fromTo(bg,{scale:1.12},{scale:1.02,duration:2.2,delay:D,ease:'power2.out'});
        if(desktop()) gsap.to(bg,{yPercent:9,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true}});
      }
      const copy = hero.querySelector('.hero-copy');
      if(copy) gsap.to(copy,{yPercent:-6,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true}});   // só desliza: a cor/opacidade do texto nunca muda
      /* o texto do hero entra todo junto, depois que as fontes carregam: o título vem primeiro e o resto acompanha.
         (Antes só o título esperava as fontes e chegava depois dos outros textos.) */
      const inner = [...hero.querySelectorAll('[data-anim="title"],[data-anim="reveal"]')];
      fontsGate().then(()=>{
        if(contexts[page] !== ctx) return;
        ctx.add(()=>{
          let n = 0;
          inner.forEach(el=>{
            if(el.dataset.anim === 'title') titleIn(el,{delay:.1+D,hero:true},sp,ctx);
            else { gsap.fromTo(el,{autoAlpha:0,y:30},{autoAlpha:1,y:0,duration:.95,delay:D+(n === 0 ? .05 : .42+(n-1)*.11),clearProps:'transform'}); n++; }
          });
        });
      });
    });

    /* TÍTULOS */
    pageEl.querySelectorAll('[data-anim="title"]').forEach(el=>{
      if(el.closest('[data-anim="hero"]')) return;
      titleIn(el,{},sp,ctx);
    });

    /* REVEAL com escalonamento por pai */
    const seen = new Set();
    pageEl.querySelectorAll('[data-anim="reveal"]').forEach(el=>{
      if(el.closest('[data-anim="hero"]') || seen.has(el)) return;
      const parent = el.parentElement;
      let group = [el], step = 0;
      if(parent && parent.hasAttribute('data-stagger')){
        group = [...parent.children].filter(c=>c.dataset.anim === 'reveal');
        step = .09;
      }
      group.forEach(g=>seen.add(g));
      const card = el.matches('.card,.suite-card,.chapada-card,.space-card,.story-card,.feature-panel,.practical-item');
      gsap.fromTo(group,{autoAlpha:0,y:card?46:32,scale:card?.985:1},{autoAlpha:1,y:0,scale:1,duration:.9,stagger:step,clearProps:'transform',
        scrollTrigger:{trigger:parent && step ? parent : group[0],start:'top 88%',toggleActions:'play none none none'}});
    });

    /* IMAGENS: máscara abre + foto assenta */
    pageEl.querySelectorAll('[data-anim="image"]').forEach(box=>{
      const img = box.querySelector('img');
      const tl = gsap.timeline({scrollTrigger:{trigger:box,start:'top 88%',toggleActions:'play none none none'}});
      tl.fromTo(box,{autoAlpha:0,clipPath:'inset(10% 6% 10% 6% round 28px)'},{autoAlpha:1,clipPath:'inset(0% 0% 0% 0% round 0px)',duration:1.6,ease:'expo.inOut',clearProps:'clipPath'});
      if(img && !img.hasAttribute('data-parallax')) tl.fromTo(img,{scale:1.22},{scale:1,duration:2,ease:'power2.out',clearProps:'transform'},0);
    });

    /* PARALLAX (só em tela grande: no celular economiza o aparelho) */
    if(desktop()){
      pageEl.querySelectorAll('[data-parallax],.section-bg').forEach(el=>{
        if(el.hasAttribute('data-hero-bg')) return;
        const isBg = el.classList.contains('section-bg');
        const v = el.hasAttribute('data-parallax') ? (parseFloat(el.dataset.parallax) || 0) : 5;
        if(!v) return;
        const box = isBg ? el.parentElement : (el.parentElement || el);
        const sc = isBg ? 1.08 : 1.14;
        gsap.fromTo(el,{yPercent:-v,scale:sc},{yPercent:v,scale:sc,ease:'none',
          scrollTrigger:{trigger:box,start:'top bottom',end:'bottom top',scrub:true}});
      });
    }
  });
}

/* espera as fontes (no máximo 1 s) para o texto entrar já com a fonte certa */
function fontsGate(){
  return (document.fonts && document.fonts.ready) ? Promise.race([document.fonts.ready, new Promise(r=>setTimeout(r,1000))]) : Promise.resolve();
}
function titleIn(el,opts,sp,ctx){
  const run = ()=>{
    if(contexts[el.closest('.page').dataset.page] !== ctx) return;
    ctx.add(()=>{
      el.style.visibility = 'visible';
      const trig = opts.hero ? undefined : {trigger:el,start:'top 88%',toggleActions:'play none none none'};
      if(!hasSplit){ gsap.fromTo(el,{autoAlpha:0,y:34},{autoAlpha:1,y:0,duration:1.2,delay:opts.delay||0,scrollTrigger:trig}); return; }
      const s = SplitText.create(el,{type:'lines',linesClass:'split-line',mask:'lines'});
      gsap.fromTo(s.lines,{yPercent:118,rotate:3,transformOrigin:'0% 100%'},{yPercent:0,rotate:0,duration:1.05,stagger:.07,ease:'power4.out',delay:opts.delay||0,scrollTrigger:trig});
      sp.push(s);
    });
  };
  (document.fonts && document.fonts.ready) ? document.fonts.ready.then(run) : run();
}

function kill(page){
  if(splits[page]){ splits[page].forEach(s=>{ try{s.revert()}catch(e){} }); splits[page] = []; }
  if(contexts[page]){ contexts[page].revert(); contexts[page] = null; }
}

function activate(page){
  Object.keys(contexts).forEach(p=>{ if(p !== page) kill(p); });
  const pageEl = document.querySelector(`.page[data-page="${page}"]`);
  if(!pageEl) return;
  /* a foto/vídeo do hero já nasce no zoom inicial, antes do primeiro quadro da página: sem o salto de 1,00 para 1,12 que parecia tremulação */
  pageEl.querySelectorAll('[data-anim="hero"]').forEach(h=>{ const b = heroBgOf(h); if(b) gsap.set(b,{scale:1.12}); });
  requestAnimationFrame(()=>requestAnimationFrame(()=>{ build(pageEl); ScrollTrigger.refresh(); }));
}
document.addEventListener('cdl:page',e=>activate(e.detail.page));
window.addEventListener('DOMContentLoaded',()=>{ setTimeout(()=>{ if(!contexts[CDL.currentPage]) activate(CDL.currentPage); },60); });
/* ao mudar a LARGURA as linhas dos títulos mudam: refaz a página atual */
let lastW = window.innerWidth, rz;
window.addEventListener('resize',()=>{ clearTimeout(rz); rz = setTimeout(()=>{ if(window.innerWidth !== lastW){ lastW = window.innerWidth; activate(CDL.currentPage); } },450); });

/* ---------- Cortina entre páginas (símbolo girando) ---------- */
const curtain = document.createElement('div');
curtain.className = 'curtain'; curtain.setAttribute('aria-hidden','true');
curtain.innerHTML = '<img class="curtain-sym" src="assets/img/simbolo.svg" alt="" width="132" height="132">';
document.body.appendChild(curtain);
const cSym = curtain.querySelector('img');
gsap.set(curtain,{yPercent:100,display:'none'});
let spin = null;
/* decodifica as primeiras imagens da página de destino enquanto a cortina cobre a tela (a troca não engasga) */
function preDecode(page){
  const el = document.querySelector('.page[data-page="'+page+'"]'); if(!el) return Promise.resolve();
  const imgs = [...el.querySelectorAll('img')].filter(i=>!i.closest('.overlay')).slice(0,6);
  return Promise.race([Promise.all(imgs.map(i=>i.decode ? i.decode().catch(()=>{}) : 0)), new Promise(r=>setTimeout(r,650))]);
}
CDL.transition = (page, swap, end) => {
  showHeader();
  CDL.closeOverlays();
  curtain.style.display = 'flex';
  if(spin) spin.kill();
  spin = gsap.fromTo(cSym,{rotation:0},{rotation:360,duration:1.3,ease:'none',repeat:-1});
  const dec = preDecode(page);
  const tl = gsap.timeline({defaults:{ease:'expo.inOut'},onComplete:()=>{ curtain.style.display = 'none'; if(spin){ spin.kill(); spin = null; } end(); }});
  tl.fromTo(curtain,{yPercent:100},{yPercent:0,duration:.6})
    .fromTo(cSym,{autoAlpha:0,scale:.7},{autoAlpha:1,scale:1,duration:.45,ease:'power3.out'},.2);
  tl.addPause('>',()=>{ dec.then(()=>tl.resume()); });
  tl.add(()=>{ S.delay = .3; swap(); window.scrollTo(0,0); if(lenis) lenis.scrollTo(0,{immediate:true,force:true}); })
    .to(cSym,{autoAlpha:0,scale:.85,duration:.3,ease:'power2.in'},'>+.05')
    .to(curtain,{yPercent:-100,duration:.7},'<+.05');
};

/* ---------- Sobreposições: entrada e saída ---------- */
const panelOf = el => el.querySelector(':scope > .modal, :scope > .journey-shell, :scope > .atlas-overlay-shell') || el.firstElementChild;
function overlayIn(el){
  const panel = panelOf(el), items = [...el.querySelectorAll('.ov-anim')];
  const imgs = [...el.querySelectorAll('.journey-media img,.suite-modal-media img,.atlas-canvas img,.atlas-stage img')];
  gsap.killTweensOf([el,panel,...items,...imgs]);
  const tl = gsap.timeline();
  tl.fromTo(el,{autoAlpha:0},{autoAlpha:1,duration:.55,ease:'power2.out'},0)
    .fromTo(panel,{y:64,scale:.955,autoAlpha:0},{y:0,scale:1,autoAlpha:1,duration:.85,ease:'expo.out',clearProps:'transform'},.05)
    .fromTo(items,{y:28,autoAlpha:0},{y:0,autoAlpha:1,duration:.8,stagger:.045,ease:'power3.out',clearProps:'transform'},.22);
  if(imgs.length) tl.fromTo(imgs,{scale:1.16},{scale:1,duration:1.8,ease:'power2.out',clearProps:'transform'},.05);
  const pins = [...el.querySelectorAll('.map-pin')];
  if(pins.length) tl.fromTo(pins,{scale:0,autoAlpha:0},{scale:1,autoAlpha:1,duration:.7,ease:'back.out(2.2)',stagger:.035,clearProps:'transform'},.75);
}
CDL.overlayOut = (el,done) => {
  const panel = panelOf(el);
  gsap.killTweensOf([el,panel]);
  gsap.timeline({onComplete:()=>{ done(); gsap.set([el,panel,...el.querySelectorAll('.ov-anim,.map-pin')],{clearProps:'opacity,visibility,transform'}); }})
    .to(panel,{y:28,scale:.985,autoAlpha:0,duration:.42,ease:'power2.in'},0)
    .to(el,{autoAlpha:0,duration:.42,ease:'power1.inOut'},.06);
};
document.addEventListener('cdl:overlay',e=>{ if(e.detail.open){ showHeader(); overlayIn(e.detail.el); } });

/* ---------- Troca de conteúdo (abas, perfis, filtros) ---------- */
const q = (s,r=document) => [...r.querySelectorAll(s)];
const textIn = els => { if(els.length) gsap.fromTo(els,{autoAlpha:0,y:20},{autoAlpha:1,y:0,duration:.8,stagger:.06,ease:'power3.out',overwrite:true,clearProps:'transform'}); };
const imageIn = el => { if(el) gsap.fromTo(el,{autoAlpha:0},{autoAlpha:1,duration:1.1,ease:'power2.out',overwrite:true}); };
function textCards(cards){ if(cards.length) gsap.fromTo(cards,{autoAlpha:0,y:34},{autoAlpha:1,y:0,duration:.9,stagger:.06,ease:'power3.out',overwrite:true,clearProps:'transform'}); }
document.addEventListener('click',e=>{
  const t = e.target; let f = null;
  if(t.closest('.time-tab')) f = ()=>{ imageIn(document.getElementById('homeTimeImage')); textIn(q('.time-scene-copy > *')); };
  else if(t.closest('.moment-tabs button')) f = ()=>{ imageIn(document.getElementById('viverMomentImage')); textIn(q('.moment-copy > *')); };
  else if(t.closest('.program-day')) f = ()=>{ imageIn(document.getElementById('programImage')); textIn(q('.program-stage-copy > *')); };
  else if(t.closest('#homeExperienceDays button')) f = ()=>{ imageIn(document.getElementById('homeProgramImage')); textIn(q('#page-home .experience-panel .feature-body > *:not(.chip-row):not(.hero-actions)')); };
  else if(t.closest('.profile-card')) f = ()=>textIn(q('.profile-result > *'));
  else if(t.closest('.event-selector button')) f = ()=>{ textIn(q('.event-copy > *')); };
  else if(t.closest('#journeyChoices button')) f = ()=>{ imageIn(document.getElementById('journeyImage')); textIn(q('#journeyOverlay .journey-copy .ov-anim, #journeyChoices button')); };
  else if(t.closest('[data-atlas-place],.atlas-lenses button,#atlasOptions button')) f = ()=>{ imageIn(document.getElementById('atlasDetailImage')); textIn(q('.atlas-detail > *:not(.detail-image)')); };
  else if(t.closest('.suite-filter[data-suite-filter]')) f = ()=>{ textCards(q('#page-suites .suite-card:not(.hidden-by-filter)')); };
  else if(t.closest('[data-chapada-filter]')) f = ()=>{ textCards(q('#page-chapada .chapada-card:not(.hidden-by-filter)')); };
  if(f) requestAnimationFrame(()=>{ f(); setTimeout(()=>ScrollTrigger.refresh(),450); });
});

/* ---------- Vídeos de fundo: só tocam quando aparecem ---------- */
if('IntersectionObserver' in window){
  const io = new IntersectionObserver(es=>es.forEach(en=>{ const v = en.target; if(en.isIntersecting){ const p = v.play(); if(p) p.catch(()=>{}); } else v.pause(); }),{threshold:.05});
  q('video[autoplay]').forEach(v=>io.observe(v));
}
})();
