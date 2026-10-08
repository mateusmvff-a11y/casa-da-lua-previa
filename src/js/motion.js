/* =========================================================
   Casa da Lua — motion.js
   Movimento calmo e editorial (GSAP + ScrollTrigger + SplitText + Lenis).
   O HTML só marca o que anima:
     data-anim="hero"    seção de abertura: imagem desce do zoom, texto entra em sequência
     data-anim="title"   títulos entram por linhas (máscara)
     data-anim="reveal"  blocos sobem e aparecem; no pai, data-stagger escalona os filhos
     data-anim="image"   moldura de imagem abre por máscara e a foto assenta (zoom leve)
     data-parallax="-8"  imagem/fundo desliza com a rolagem (% da altura)
   Cada página cria os seus gatilhos ao abrir e os desfaz ao sair (gsap.context).
   ========================================================= */
(function(){
'use strict';
const root = document.documentElement;
const fail = () => { root.classList.remove('motion-on'); };
if(!window.CDL) return;
if(location.search.indexOf('sem-movimento') >= 0){ root.classList.remove('motion-on'); return; }   /* ?sem-movimento: desliga as animações (testes e acessibilidade) */
const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || reduz){ fail(); return; }
const CDL = window.CDL;
gsap.registerPlugin(ScrollTrigger);
if(typeof SplitText !== 'undefined') gsap.registerPlugin(SplitText);
const hasSplit = typeof SplitText !== 'undefined';
gsap.defaults({ease:'power3.out'});

/* ---------- Rolagem suave (Lenis) ---------- */
let lenis = null;
if(typeof Lenis !== 'undefined' && !window.matchMedia('(pointer:coarse)').matches){
  lenis = new Lenis({lerp:.1,wheelMultiplier:.95});
  CDL.lenis = lenis;
  lenis.on('scroll',ScrollTrigger.update);
  gsap.ticker.add(t=>lenis.raf(t*1000));
  gsap.ticker.lagSmoothing(0);
  /* O Lenis guarda a altura da página: remede quando o ScrollTrigger recalcula,
     quando o corpo muda de tamanho (troca de página, abas) e quando tudo carrega. */
  ScrollTrigger.addEventListener('refresh',()=>lenis.resize());
  if('ResizeObserver' in window) new ResizeObserver(()=>lenis.resize()).observe(document.body);
  window.addEventListener('load',()=>{ lenis.resize(); ScrollTrigger.refresh(); });
  /* sobreposições rolam por dentro: o Lenis não interfere */
  document.querySelectorAll('.overlay,.modal,.drawer').forEach(el=>el.setAttribute('data-lenis-prevent',''));
  new MutationObserver(()=>{ document.body.classList.contains('no-scroll') ? lenis.stop() : lenis.start(); })
    .observe(document.body,{attributes:true,attributeFilter:['class']});
}

/* ---------- Animações por página ---------- */
const contexts = {};     // page -> gsap.Context
const splits = {};       // page -> [SplitText]

function build(pageEl){
  const page = pageEl.dataset.page;
  kill(page);
  const ctx = gsap.context(()=>{},pageEl);
  contexts[page] = ctx;
  ctx.add(()=>{
    const sp = splits[page] = [];

    /* HERO: entra ao abrir a página (não espera rolagem) */
    pageEl.querySelectorAll('[data-anim="hero"]').forEach(hero=>{
      const bg = hero.querySelector('img, .section-bg, .hero-bg');
      if(bg){
        gsap.fromTo(bg,{scale:1.14},{scale:1,duration:2.6,ease:'power2.out'});
        gsap.to(bg,{yPercent:10,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true}});
      }
      const inner = [...hero.querySelectorAll('[data-anim="title"],[data-anim="reveal"]')];
      inner.forEach((el,i)=>{
        if(el.dataset.anim === 'title') titleIn(el,{delay:.25,hero:true},sp,ctx);
        else gsap.fromTo(el,{autoAlpha:0,y:26},{autoAlpha:1,y:0,duration:1.1,delay:.55+i*.1});
      });
    });

    /* TÍTULOS (fora do hero) */
    pageEl.querySelectorAll('[data-anim="title"]').forEach(el=>{
      if(el.closest('[data-anim="hero"]')) return;
      titleIn(el,{},sp,ctx);
    });

    /* REVEAL (com escalonamento por pai) */
    const seen = new Set();
    pageEl.querySelectorAll('[data-anim="reveal"]').forEach(el=>{
      if(el.closest('[data-anim="hero"]') || seen.has(el)) return;
      const parent = el.parentElement;
      let group = [el], delayStep = 0;
      if(parent && parent.hasAttribute('data-stagger')){
        group = [...parent.children].filter(c=>c.dataset.anim === 'reveal');
        delayStep = .1;
      }
      group.forEach(g=>seen.add(g));
      group.forEach((g,i)=>{
        gsap.fromTo(g,{autoAlpha:0,y:30},{autoAlpha:1,y:0,duration:1.05,delay:i*delayStep,
          scrollTrigger:{trigger:parent && delayStep ? parent : g,start:'top 88%',toggleActions:'play none none none'}});
      });
    });

    /* IMAGENS: máscara abre + foto assenta */
    pageEl.querySelectorAll('[data-anim="image"]').forEach(box=>{
      const img = box.querySelector('img');
      const tl = gsap.timeline({scrollTrigger:{trigger:box,start:'top 88%',toggleActions:'play none none none'}});
      tl.fromTo(box,{autoAlpha:0,clipPath:'inset(9% 5% 9% 5% round 26px)'},{autoAlpha:1,clipPath:'inset(0% 0% 0% 0% round 0px)',duration:1.5,ease:'power3.inOut'});
      if(img) tl.fromTo(img,{scale:1.2},{scale:1,duration:1.9,ease:'power2.out'},0);
    });

    /* PARALLAX */
    pageEl.querySelectorAll('[data-parallax]').forEach(el=>{
      const v = parseFloat(el.dataset.parallax) || 0; if(!v) return;
      const box = el.parentElement || el;
      gsap.fromTo(el,{yPercent:-v,scale:1.14},{yPercent:v,scale:1.14,ease:'none',
        scrollTrigger:{trigger:box,start:'top bottom',end:'bottom top',scrub:true}});
    });
  });
}

function titleIn(el,opts,sp,ctx){
  const run = ()=>{ if(contexts[el.closest('.page').dataset.page] !== ctx) return; ctx.add(()=>{
    el.style.visibility = 'visible';
    if(!hasSplit){ gsap.fromTo(el,{autoAlpha:0,y:30},{autoAlpha:1,y:0,duration:1.1,delay:opts.delay||0,
      scrollTrigger:opts.hero?undefined:{trigger:el,start:'top 88%',toggleActions:'play none none none'}}); return; }
    const s = SplitText.create(el,{type:'lines',linesClass:'split-line',mask:'lines'});
    gsap.from(s.lines,{yPercent:115,duration:1.25,stagger:.09,ease:'power4.out',delay:opts.delay||0,
      scrollTrigger:opts.hero?undefined:{trigger:el,start:'top 88%',toggleActions:'play none none none'}});
    sp.push(s);
  }); };
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
  /* espera o frame em que a página já está visível para medir */
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    build(pageEl);
    ScrollTrigger.refresh();
  }));
}

document.addEventListener('cdl:page',e=>activate(e.detail.page));
/* ao mudar a LARGURA, as linhas dos títulos mudam: refaz a página atual (com atraso) */
let lastW = window.innerWidth, rz;
window.addEventListener('resize',()=>{ clearTimeout(rz); rz = setTimeout(()=>{ if(window.innerWidth !== lastW){ lastW = window.innerWidth; activate(CDL.currentPage); } },450); });
/* primeira carga: o core chama goPage (hash) ou updateBookingDock; garanta a página ativa */
window.addEventListener('DOMContentLoaded',()=>{ setTimeout(()=>{ if(!contexts[CDL.currentPage]) activate(CDL.currentPage); },60); });

/* Abas/filtros mudam a altura: remede depois que o navegador pintou */
document.addEventListener('click',e=>{
  if(e.target.closest('.suite-filter,.chip-button,[data-viver-moment],.program-day,[data-event-type],.time-tab,.profile-card,[data-chapada-filter]'))
    setTimeout(()=>ScrollTrigger.refresh(),420);
});

/* Cabeçalho ganha sombra fina depois do topo */
const header = document.querySelector('.site-header');
if(header){ const marca=()=>header.classList.toggle('is-scrolled',window.scrollY>80); window.addEventListener('scroll',marca,{passive:true}); marca(); }
})();
