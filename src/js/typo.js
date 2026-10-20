/* =========================================================
   Casa da Lua — typo.js
   Sem viúvas: títulos nunca terminam com uma palavra sozinha na última linha (as 2 últimas palavras ficam juntas
   e o CSS equilibra as linhas) e textos corridos terminam com pelo menos 3 palavras na última linha.
   Funciona por espaço inseparável (nbsp) entre as últimas palavras; roda ao abrir cada página, ao redimensionar
   e quando o texto muda (abas, filtros, sobreposições). Não altera o conteúdo lido (nbsp conta como espaço).
   Revisão 20/10: textos corridos de até 6 linhas NÃO recebem nbsp quando o navegador equilibra as linhas
   (text-wrap:balance): o nbsp atrapalhava o equilíbrio e deixava linhas de tamanhos muito diferentes.
   Só os textos mais longos (7+ linhas, que o navegador não equilibra) usam a regra das 3 últimas palavras.
   ========================================================= */
(function(){
'use strict';
if(!window.CDL) return;
const NBSP = String.fromCharCode(160);   // espaço inseparável (U+00A0)
const TITLE = 'h1,h2,h3,h4,.title,.display,.subtitle';
const BODY  = 'p,li,.lead,.small,figcaption,blockquote,.kicker';
const SEL   = TITLE + ',' + BODY;
const SKIP  = 'script,style,button,.btn,.ghost-btn,.chip,.tag-row,input,textarea,select,label,table,th,td,.curtain,[data-nowidow]';
const isSpace = c => c === ' ' || c === '\n' || c === '\t' || c === '\r';
const CAN_BALANCE = !!(window.CSS && CSS.supports && CSS.supports('text-wrap','balance'));

function textNodes(el){
  const out = [];
  const w = document.createTreeWalker(el,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement && n.parentElement.closest('script,style') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT});
  let t; while((t = w.nextNode())) if(t.nodeValue.trim()) out.push(t);
  const brs = el.querySelectorAll('br');
  if(brs.length){ const last = brs[brs.length-1]; return out.filter(n=>last.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING); }  // só o trecho depois da última quebra
  return out;
}
/* quantas linhas o texto ocupa agora (0 = escondido) */
function lineCount(el){
  const r = el.getBoundingClientRect(); if(!r.height) return 0;
  const cs = getComputedStyle(el); const lh = parseFloat(cs.lineHeight) || (parseFloat(cs.fontSize) * 1.4);
  return Math.round((r.height - (parseFloat(cs.paddingTop)||0) - (parseFloat(cs.paddingBottom)||0)) / lh);
}
/* desfaz o que esta função prendeu (só os espaços que ela trocou; nbsp escrito no HTML fica) */
function unbind(el){
  if(!el.__bound) return;
  el.__bound.forEach(b=>{ const s = b.node.nodeValue; if(s[b.idx] === NBSP) b.node.nodeValue = s.slice(0,b.idx) + b.orig + s.slice(b.idx+1); });
  el.__bound = null;
}
/* larguras de cada linha do texto (para medir o equilíbrio) */
function lineWidths(el){
  const w = document.createTreeWalker(el,NodeFilter.SHOW_TEXT); let t; const L = [];
  while((t = w.nextNode())){
    const re = /\S+/g; let m;
    while((m = re.exec(t.nodeValue))){
      const r = document.createRange(); r.setStart(t,m.index); r.setEnd(t,m.index+m[0].length);
      for(const b of r.getClientRects()){
        if(!b.width) continue;
        const ln = L.find(x=>Math.abs(x.y-b.top) < 10);
        if(ln){ ln.l = Math.min(ln.l,b.left); ln.r = Math.max(ln.r,b.right); } else L.push({y:b.top,l:b.left,r:b.right});
      }
    }
  }
  return L.map(x=>x.r-x.l);
}
/* o equilíbrio nativo (text-wrap:balance) às vezes deixa uma linha bem menor que a outra: se a razão
   menor/maior ficar abaixo de .8, procura a MENOR largura que mantém o mesmo número de linhas (max-width)
   e fica com ela só se melhorar de verdade */
const refined = new Set();
function refine(el){
  const cs = getComputedStyle(el); if(/center|right|end/.test(cs.textAlign)) return;
  const w0 = lineWidths(el); if(w0.length < 2 || w0.length > 6) return;
  const q0 = Math.min(...w0) / Math.max(...w0); if(q0 >= .8) return;
  const full = el.getBoundingClientRect().width, n = w0.length;
  const prevMW = el.style.maxWidth, prevTW = el.style.textWrap;
  el.style.textWrap = 'wrap';
  let lo = Math.floor(full * .45), hi = Math.ceil(full);
  while(hi - lo > 2){ const mid = (lo + hi) >> 1; el.style.maxWidth = mid + 'px'; if(lineWidths(el).length <= n) hi = mid; else lo = mid; }
  el.style.maxWidth = hi + 'px';
  const w1 = lineWidths(el); const q1 = w1.length === n ? Math.min(...w1) / Math.max(...w1) : 0;
  if(q1 > q0 + .02) refined.add(el); else { el.style.maxWidth = prevMW; el.style.textWrap = prevTW; }
}
function resetRefined(){ refined.forEach(e=>{ e.style.maxWidth = ''; e.style.textWrap = ''; e.__wd = null; }); refined.clear(); }

/* palavras com hífen que não podem quebrar no meio ("check-/in"): ganham um <span class=nb> (white-space:nowrap) */
const NOBREAK = /(check-in|check-out)/gi;
function noBreak(el){
  if(!NOBREAK.test(el.textContent)){ NOBREAK.lastIndex = 0; return; }
  NOBREAK.lastIndex = 0;
  const w = document.createTreeWalker(el,NodeFilter.SHOW_TEXT); const list = []; let t;
  while((t = w.nextNode())) if(!t.parentElement.closest('.nb') && /check-(in|out)/i.test(t.nodeValue)) list.push(t);
  list.forEach(node=>{
    const m = node.nodeValue.match(/check-(in|out)/i); if(!m) return;
    const r = document.createRange(); r.setStart(node,m.index); r.setEnd(node,m.index+m[0].length);
    const s = document.createElement('span'); s.className = 'nb'; r.surroundContents(s);
  });
}
function fix(el){
  if(!el || el.nodeType !== 1 || el.closest(SKIP)) return;
  if(!el.__nbDone || el.__nbDone !== el.textContent){ noBreak(el); el.__nbDone = el.textContent; }
  const isTitle = el.matches(TITLE);
  const w = el.clientWidth;
  if(el.__wd === el.textContent && el.__wdw === w) return;
  const mark = ()=>{ el.__wd = el.textContent; el.__wdw = w; };
  /* texto corrido que o navegador equilibra (até 6 linhas): sem nbsp */
  if(!isTitle && CAN_BALANCE){
    const n = lineCount(el);
    if(n === 0) return;                           // escondido (outra página): roda de novo quando abrir
    if(n <= 6){ unbind(el); mark(); refine(el); if(refined.has(el)) el.__wdw = el.clientWidth; return; }
  }
  if(el.__bound){ mark(); return; }               // já preso e continua longo
  const nodes = textNodes(el); if(!nodes.length){ mark(); return; }
  const words = nodes.map(n=>n.nodeValue).join(' ').trim().split(/\s+/).length;
  const n = isTitle ? 1 : 2;                       // espaços a prender: título = 2 palavras juntas; texto = 3
  if(words < (isTitle ? 3 : 5)){ mark(); return; }
  let left = n; const bound = [];
  for(let i = nodes.length-1; i >= 0 && left > 0; i--){
    let s = nodes[i].nodeValue; let end = s.length;
    if(i === nodes.length-1) while(end > 0 && /\s/.test(s[end-1])) end--;   // espaços do fim do texto não contam
    let k = end;
    while(k > 0 && left > 0){ k--; if(isSpace(s[k])){ bound.push({node:nodes[i],idx:k,orig:s[k] === NBSP ? ' ' : s[k]}); s = s.slice(0,k) + NBSP + s.slice(k+1); left--; } }
    nodes[i].nodeValue = s;
  }
  el.__bound = bound;
  mark();
}
function run(root){ (root || document).querySelectorAll(SEL).forEach(fix); }
window.CDL.widow = fix; window.CDL.widowAll = run;

window.CDL.ready(()=>{
  run(document);
  let rzt; window.addEventListener('resize',()=>{ clearTimeout(rzt); rzt = setTimeout(()=>{ resetRefined(); run(document.querySelector('.page.active')); },250); });
  let pend = new Set(), tm = null;
  const flush = ()=>{ tm = null; const s = pend; pend = new Set(); s.forEach(e=>{ if(e.isConnected) fix(e); }); };
  const mo = new MutationObserver(ms=>{
    ms.forEach(m=>{
      const add = e=>{ const b = e.closest ? e.closest(SEL) : null; if(b) pend.add(b); };
      if(m.type === 'characterData' && m.target.parentElement) add(m.target.parentElement);
      m.addedNodes.forEach(nd=>{ if(nd.nodeType === 1){ if(nd.matches && nd.matches(SEL)) pend.add(nd); if(nd.querySelectorAll) nd.querySelectorAll(SEL).forEach(x=>pend.add(x)); add(nd); } else if(nd.parentElement) add(nd.parentElement); });
    });
    if(!tm) tm = setTimeout(flush,60);
  });
  mo.observe(document.body,{childList:true,subtree:true,characterData:true});
});
document.addEventListener('cdl:page',()=>window.CDL.widowAll(document.querySelector('.page.active')));
})();
