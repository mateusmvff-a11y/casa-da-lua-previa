// Confere o site renderizado contra o Figma: textos (conteúdo, fonte, tamanho, cor, posição) e imagens (arquivo e posição).
// uso: node tools/verifica.mjs <pagina> [url]     (pagina: home casa suites viver experiencias eventos chapada)
//   sem url: usa http://localhost:5173/_prev/<pagina>/index.html#<pagina>  (rode antes: node build.mjs --only=<pagina>)
import { spawn } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')),'..');
const FR = {home:'8288:733',casa:'8288:1080',suites:'8288:1326',viver:'8288:1714',experiencias:'8288:1929',eventos:'8288:2148',chapada:'8288:2408'};
const page = process.argv[2]; if(!FR[page]){ console.log('pagina?',Object.keys(FR).join(' ')); process.exit(1); }
const url = process.argv[3] || `http://localhost:5173/_prev/${page}/index.html#${page}`;
const W = 1920;
const nodes = JSON.parse(fs.readFileSync(path.join(root,'_figma/nodes.json'),'utf8')).nodes;
const doc = nodes[FR[page]].document; const o = doc.absoluteBoundingBox;
const hex = c => '#'+[c.r,c.g,c.b].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('');
const normT = s => s.replace(/[\n\u2028]/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
const fT = [], fI = [];
(function walk(n, hidden){
  if(n.visible === false) return;
  const b = n.absoluteBoundingBox;
  if(n.type === 'TEXT' && b){
    const f = (n.fills||[]).find(x=>x.type==='SOLID' && x.visible!==false);
    fT.push({t:normT(n.characters), fam:n.style.fontFamily, w:n.style.fontWeight, size:n.style.fontSize, color:f?hex(f.color):null, op:f?(f.opacity??1)*(f.color.a??1):1,
      x:b.x-o.x, y:b.y-o.y, wd:b.width, h:b.height, lh:n.style.lineHeightPx, name:n.characters.slice(0,40).replace(/\n/g,'⏎')});
  }
  for(const f of (n.fills||[])) if(f.type==='IMAGE' && f.visible!==false && b)
    fI.push({ref:f.imageRef.slice(0,6), x:b.x-o.x, y:b.y-o.y, wd:b.width, h:b.height, name:n.name, op:f.opacity??1});
  (n.children||[]).forEach(c=>walk(c));
})(doc);

const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe'; const port=9400+Math.floor(Math.random()*400);
const p=spawn(chrome,['--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run',`--user-data-dir=${(process.env.TEMP||'.')}/cdl-vf-${port}`,`--remote-debugging-port=${port}`,`--window-size=${W},1000`,'about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); let target;
for(let i=0;i<60;i++){await sleep(300);try{const l=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();target=l.find(t=>t.type==='page');if(target)break;}catch{}}
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pend=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id);}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
await send('Page.enable');await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride',{width:W,height:1000,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url});await sleep(4500);
const EXTRACT = `(async()=>{
 const vis=(el)=>{ let r=el.getBoundingClientRect(); let L=r.left,T=r.top,R=r.right,B=r.bottom; for(let p=el.parentElement;p&&p!==document.body;p=p.parentElement){ const c=getComputedStyle(p); if(c.overflow!=='visible'||c.overflowX!=='visible'||c.overflowY!=='visible'||c.clipPath!=='none'){ const q=p.getBoundingClientRect(); L=Math.max(L,q.left);T=Math.max(T,q.top);R=Math.min(R,q.right);B=Math.min(B,q.bottom);} } return {left:L,top:T,width:Math.max(0,R-L),height:Math.max(0,B-T)}; };
 await document.fonts.ready; window.scrollTo(0,0);
 const norm=s=>s.replace(/\\s+/g,' ').trim().toLowerCase();
 const T=[]; const I=[];
 const scope=[...document.querySelectorAll('.site-header, .page.active, .site-footer')];
 const all=scope.flatMap(s=>[s,...s.querySelectorAll('*')]);
 for(const el of all){
   if(['SCRIPT','STYLE','svg','path'].includes(el.tagName)) continue;
   const cs=getComputedStyle(el);
   // imagens
   if(el.tagName==='IMG'){ const r=vis(el); if(r.width>0) I.push({src:el.currentSrc||el.src, x:r.left+scrollX, y:r.top+scrollY, wd:r.width, h:r.height, vis:cs.visibility!=='hidden'&&cs.display!=='none'}); }
   const bg=cs.backgroundImage; if(bg&&bg!=='none'&&bg.includes('url(')){ const r=vis(el); I.push({src:bg, x:r.left+scrollX, y:r.top+scrollY, wd:r.width, h:r.height, vis:cs.visibility!=='hidden'&&cs.display!=='none'}); }
   for(const pe of ['::before','::after']){ const ps=getComputedStyle(el,pe); const b2=ps.backgroundImage; if(b2&&b2!=='none'&&b2.includes('url(')){ const r=el.getBoundingClientRect(); I.push({src:b2, x:r.left+scrollX, y:r.top+scrollY, wd:r.width, h:r.height, vis:true, pseudo:pe}); } }
   // textos (elemento mais interno com aquele texto)
   const t=norm(el.textContent||''); if(!t) continue;
   if(el.closest('.booking-dock')) continue;
   let inner=true; for(const c of el.children){ if(norm(c.textContent||'')===t){inner=false;break;} }
   if(!inner) continue;
   if(cs.display==='none'||cs.visibility==='hidden') continue;
   const rg=document.createRange(); rg.selectNodeContents(el); const b=rg.getBoundingClientRect();
   if(b.width===0&&b.height===0) continue;
   T.push({t, size:parseFloat(cs.fontSize), w:cs.fontWeight, fam:cs.fontFamily.split(',')[0].replace(/"/g,''), color:cs.color, x:b.left+scrollX, y:b.top+scrollY, wd:b.width, h:b.height, lh:parseFloat(cs.lineHeight)||0, tag:el.tagName.toLowerCase()+(el.className&&typeof el.className==='string'?'.'+el.className.split(' ')[0]:'')});
 }
 return {T,I,H:Math.max(document.documentElement.scrollHeight,document.body.scrollHeight)};
})()`;
const r=await send('Runtime.evaluate',{expression:EXTRACT,returnByValue:true,awaitPromise:true});
ws.close();p.kill();
const D=r.result?.result?.value; if(!D){ console.log('falha ao extrair',JSON.stringify(r.result).slice(0,300)); process.exit(1); }

const rgb = s => (s.match(/[\d.]+/g)||[]).slice(0,3).map(Number);
const hex2 = h => [1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const issues=[]; let ok=0, miss=[];
const used=new Set();
for(const f of fT){
  if(!f.t) continue;
  const cands=D.T.map((x,i)=>({x,i})).filter(c=>c.x.t===f.t && !used.has(c.i));
  if(!cands.length){ miss.push(f); continue; }
  cands.sort((a,b)=>Math.abs(a.x.y-f.y)-Math.abs(b.x.y-f.y)); const m=cands[0]; used.add(m.i); const x=m.x;
  const d=[];
  const expFam = f.fam==='Mortise' ? 'mortise' : (f.fam==='Inter' ? 'inter' : 'forma-djr-display');
  if(!x.fam.toLowerCase().includes(expFam) && f.fam!=='Iowan Old Style') d.push(`fonte ${x.fam} (Figma ${f.fam})`);
  if(Math.abs(x.size-f.size)>0.6) d.push(`tamanho ${x.size} (Figma ${f.size})`);
  const fw = (f.fam==='Mortise'||f.fam==='Inter') ? f.w : (f.w===400 ? 500 : f.w); if(fw && Math.abs(Number(x.w)-fw)>0) d.push(`peso ${x.w} (Figma ${fw})`);
  if(f.color){ const a=rgb(x.color), b=hex2(f.color); if(a.length===3 && Math.max(...a.map((v,i)=>Math.abs(v-b[i])))>30 && f.op>=.95) d.push(`cor ${x.color} (Figma ${f.color})`); }
  const dx=x.x-f.x, dy=x.y-f.y;
  if(Math.abs(dy)>10) d.push(`y ${dy>0?'+':''}${Math.round(dy)}`);
  if(Math.abs(dx)>10 && f.wd<1200) d.push(`x ${dx>0?'+':''}${Math.round(dx)}`);
  const lines=(h,l)=>Math.round(h/(l||1)); if(f.lh && x.lh && Math.abs(lines(x.h,x.lh)-lines(f.h,f.lh))>=1) d.push(`linhas ${lines(x.h,x.lh)} (Figma ${lines(f.h,f.lh)})`);
  if(d.length) issues.push(`  "${f.name}" ${d.join(' · ')}`); else ok++;
}
console.log(`\n=== ${page} === ${fT.length} textos no Figma · ${ok} conferem · ${issues.length} com diferença · ${miss.length} não encontrados · altura ${Math.round(D.H)} (Figma ${Math.round(o.height)})`);
if(issues.length){ console.log('\nDIFERENÇAS DE TEXTO:'); console.log(issues.slice(0,70).join('\n')); if(issues.length>70) console.log(`  ... +${issues.length-70}`); }
if(miss.length){ console.log('\nTEXTOS DO FIGMA NÃO ENCONTRADOS NO SITE:'); console.log(miss.slice(0,40).map(m=>`  "${m.name}" (${m.fam} ${m.w}/${m.size}) y=${Math.round(m.y)}`).join('\n')); if(miss.length>40) console.log(`  ... +${miss.length-40}`); }

// imagens
const refCount={}, found={}; const imgIssues=[];
for(const f of fI){ refCount[f.ref]=(refCount[f.ref]||0)+1; }
for(const f of fI){
  const c=D.I.filter(i=>i.src.includes(f.ref));
  if(!c.length){ imgIssues.push(`  FALTA ${f.ref} (${f.name}) em x=${Math.round(f.x)} y=${Math.round(f.y)} ${Math.round(f.wd)}x${Math.round(f.h)}`); continue; }
  c.sort((a,b)=>(Math.abs(a.y-f.y)+Math.abs(a.x-f.x))-(Math.abs(b.y-f.y)+Math.abs(b.x-f.x))); const m=c[0];
  const d=[]; if(Math.abs(m.y-f.y)>40) d.push(`y ${Math.round(m.y-f.y)}`); if(Math.abs(m.x-f.x)>40) d.push(`x ${Math.round(m.x-f.x)}`);
  if(Math.abs(m.wd-f.wd)>Math.max(40,f.wd*.08)) d.push(`larg ${Math.round(m.wd)} (Figma ${Math.round(f.wd)})`); if(Math.abs(m.h-f.h)>Math.max(40,f.h*.08)) d.push(`alt ${Math.round(m.h)} (Figma ${Math.round(f.h)})`);
  if(!m.vis) d.push('escondida');
  if(d.length) imgIssues.push(`  ${f.ref} (${f.name}) ${d.join(' · ')}`); else found[f.ref]=(found[f.ref]||0)+1;
}
console.log(`\nIMAGENS: ${fI.length} posições no Figma · ${Object.keys(refCount).length} arquivos distintos · ${Object.keys(found).length} conferem em posição`);
if(imgIssues.length) console.log(imgIssues.join('\n'));
