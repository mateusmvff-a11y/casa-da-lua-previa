// Mede o equilíbrio das linhas dos textos: node tools/equilibrio.mjs [url] [larguras=1920,1440,1024,390] [limite=0.78] [paginas]
// Para cada texto com 2+ linhas: razão = linha mais curta / linha mais longa (todas as linhas, inclusive a última).
// Falha quando a razão fica abaixo do limite. Textos de 5+ linhas não são avaliados (balance do navegador não alcança).
import { spawn } from 'node:child_process';
const url = process.argv[2] || 'http://localhost:5173/index.html?sem-movimento';
const widths = (process.argv[3]||'1920,1440,1024,390').split(',').map(Number);
const LIM = parseFloat(process.argv[4]||'0.78');
const PAGES = (process.argv[5]||'home,casa,suites,viver,experiencias,eventos,chapada,reservar').split(',');
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe'; const port=9400+Math.floor(Math.random()*400);
const p=spawn(chrome,['--headless=new','--disable-gpu','--no-first-run',`--user-data-dir=${(process.env.TEMP||'.')}/cdl-eq-${port}`,`--remote-debugging-port=${port}`,'--window-size=1440,900','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); let target;
for(let i=0;i<60;i++){await sleep(300);try{const l=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();target=l.find(t=>t.type==='page');if(target)break;}catch{}}
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pend=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id);}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
const ev=async js=>(await send('Runtime.evaluate',{expression:js,returnByValue:true,awaitPromise:true})).result?.result?.value;
await send('Page.enable');await send('Runtime.enable');
const CHECK = (lim)=>`(()=>{
 const LIM=${lim};
 const SEL='.page.active p,.page.active .lead,.page.active .small,.page.active figcaption,.page.active [class*="lead"],.page.active [class*="-text"]';
 const bad=[]; let total=0; const seen=new Set();
 for(const el of document.querySelectorAll(SEL)){
   if(seen.has(el)) continue; seen.add(el);
   if(el.closest('button,.btn,.ghost-btn,.chip,.tag-row,label,th,td,[hidden],.overlay:not(.open),.curtain,.media-note')) continue;
   const cs=getComputedStyle(el); if(cs.display==='none'||cs.visibility==='hidden') continue;
   const r0=el.getBoundingClientRect(); if(r0.width===0||r0.height===0) continue;
   const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT); const words=[]; let t;
   while((t=w.nextNode())){ const s=t.nodeValue; const re=/\\S+/g; let m;
     while((m=re.exec(s))){ const rg=document.createRange(); rg.setStart(t,m.index); rg.setEnd(t,m.index+m[0].length); const rcs=rg.getClientRects(); for(const rc of rcs){ if(rc.width>0) words.push({y:Math.round(rc.top),l:rc.left,r:rc.right}); } } }
   if(words.length<4) continue;
   const lines={}; for(const wd of words){ const k=Object.keys(lines).find(y=>Math.abs(+y-wd.y)<10)??wd.y; (lines[k] ||= {l:1e9,r:-1e9,n:0}); lines[k].l=Math.min(lines[k].l,wd.l); lines[k].r=Math.max(lines[k].r,wd.r); lines[k].n++; }
   const L=Object.keys(lines).map(Number).sort((a,b)=>a-b).map(k=>lines[k]);
   if(L.length<2||L.length>4) continue;
   total++;
   const ws=L.map(x=>x.r-x.l); const ratio=Math.min(...ws)/Math.max(...ws);
   if(ratio<LIM) bad.push(ratio.toFixed(2)+' ['+L.map(x=>Math.round(x.r-x.l)+'px/'+x.n+'p').join(' | ')+'] '+(el.id?'#'+el.id+' ':'')+(el.className?'.'+String(el.className).split(' ')[0]+' ':'')+'"'+el.textContent.trim().replace(/\\s+/g,' ').slice(0,60)+'…"');
 }
 return {total,bad};
})()`;
let falhas = 0;
for(const W of widths){
  await send('Emulation.setDeviceMetricsOverride',{width:W,height:900,deviceScaleFactor:1,mobile:W<700});
  await send('Page.navigate',{url:url+'#home'});await sleep(4500);await ev('document.fonts.ready.then(()=>1)');
  for(const pg of PAGES){
    await ev(`CDL.goPage('${pg}',{instant:true})`); await sleep(900);
    const r = await ev(CHECK(LIM));
    console.log(`${W}px ${pg}: ${r.total} textos de 2-4 linhas, ${r.bad.length} desiguais`);
    r.bad.forEach(b=>console.log('   '+b)); falhas += r.bad.length;
  }
}
console.log(falhas ? `\nTOTAL: ${falhas} textos desiguais (limite ${LIM})` : `\nTOTAL: todos equilibrados (limite ${LIM})`);
ws.close();p.kill();
