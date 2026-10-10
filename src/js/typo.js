/* =========================================================
   Casa da Lua — typo.js
   Sem viúvas: títulos nunca terminam com uma palavra sozinha na última linha (as 2 últimas palavras ficam juntas
   e o CSS equilibra as linhas) e textos corridos terminam com pelo menos 3 palavras na última linha.
   Funciona por espaço inseparável (nbsp) entre as últimas palavras; roda ao abrir cada página e
   quando o texto muda (abas, filtros, sobreposições). Não altera o conteúdo lido (nbsp conta como espaço).
   ========================================================= */
(function(){
'use strict';
if(!window.CDL) return;
const NBSP = ' ';
const TITLE = 'h1,h2,h3,h4,.title,.display,.subtitle';
const BODY  = 'p,li,.lead,.small,figcaption,blockquote,.kicker';
const SEL   = TITLE + ',' + BODY;
const SKIP  = 'script,style,button,.btn,.ghost-btn,.chip,.tag-row,input,textarea,select,label,table,th,td,.curtain,[data-nowidow]';
const isSpace = c => c === ' ' || c === '\n' || c === '\t' || c === '\r';

function textNodes(el){
  const out = [];
  const w = document.createTreeWalker(el,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement && n.parentElement.closest('script,style') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT});
  let t; while((t = w.nextNode())) if(t.nodeValue.trim()) out.push(t);
  const brs = el.querySelectorAll('br');
  if(brs.length){ const last = brs[brs.length-1]; return out.filter(n=>last.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING); }  // só o trecho depois da última quebra
  return out;
}
function fix(el){
  if(!el || el.nodeType !== 1 || el.closest(SKIP)) return;
  if(el.__wd === el.textContent) return;
  const isTitle = el.matches(TITLE);
  const nodes = textNodes(el); if(!nodes.length){ el.__wd = el.textContent; return; }
  const words = nodes.map(n=>n.nodeValue).join(' ').trim().split(/\s+/).length;
  const n = isTitle ? 1 : 2;                       // espaços a prender: título = 2 palavras juntas; texto = 3
  if(words < (isTitle ? 3 : 5)){ el.__wd = el.textContent; return; }
  let left = n;
  for(let i = nodes.length-1; i >= 0 && left > 0; i--){
    let s = nodes[i].nodeValue; let end = s.length;
    if(i === nodes.length-1) while(end > 0 && /\s/.test(s[end-1])) end--;   // espaços do fim do texto não contam
    let k = end;
    while(k > 0 && left > 0){ k--; if(isSpace(s[k])){ s = s.slice(0,k) + NBSP + s.slice(k+1); left--; } }
    nodes[i].nodeValue = s;
  }
  el.__wd = el.textContent;
}
function run(root){ (root || document).querySelectorAll(SEL).forEach(fix); }
window.CDL.widow = fix; window.CDL.widowAll = run;

window.CDL.ready(()=>{
  run(document);
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
