// Confere viúvas em todas as páginas: node tools/antiviuva.mjs [url] [larguras=1920,1440,1024,390]
// Títulos: última linha com 1 palavra = falha. Textos corridos: última linha com menos de 3 palavras = falha (só se o texto tem 2+ linhas).
import { spawn } from 'node:child_process';
const url = process.argv[2] || 'http://localhost:5173/index.html?sem-movimento'; const widths = (process.argv[3]||'1920,1440,1024,390').split(',').map(Number);
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe'; const port=9400+Math.floor(Math.random()*400);
const p=spawn(chrome,['--headless=new','--disable-gpu','--no-first-run',`--user-data-dir=${(process.env.TEMP||'.')}/cdl-av-${port}`,`--remote-debugging-port=${port}`,'--window-size=1440,900','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); let target;
for(let i=0;i<60;i++){await sleep(300);try{const l=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();target=l.find(t=>t.type==='page');if(target)break;}catch{}}
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pend=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id);}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
const ev=async js=>(await send('Runtime.evaluate',{expression:js,returnByValue:true,awaitPromise:true})).result?.result?.value;
await send('Page.enable');await send('Runtime.enable');
const CHECK = `(()=>{
 const TITLE='h1,h2,h3,h4,.title,.display,.subtitle', BODY='p,li,.lead,.small';
 const bad=[]; let total=0;
 const els=[...document.querySelectorAll('.page.active '+TITLE.split(',').join(',.page.active ')+',.page.active '+BODY.split(',').join(',.page.active '))];
 const seen=new Set();
 for(const el of els){ if(seen.has(el)) continue; seen.add(el);
   if(el.closest('button,.btn,.ghost-btn,.chip,.tag-row,label,th,td,[hidden]')) continue;
   const cs=getComputedStyle(el); if(cs.display==='none'||cs.visibility==='hidden') continue;
   const r0=el.getBoundingClientRect(); if(r0.width===0||r0.height===0) continue;
   // palavras e suas linhas
   const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT); const words=[]; let t;
   while((t=w.nextNode())){ const s=t.nodeValue; const re=/[^\\s\\u00a0]+(?:\\u00a0[^\\s\\u00a0]+)*/g; let m; // palavras unidas por nbsp contam como um bloco, mas cada palavra tem a sua linha
     const re2=/\\S+/g; while((m=re2.exec(s))){ const rg=document.createRange(); rg.setStart(t,m.index); rg.setEnd(t,m.index+m[0].length); const rc=rg.getClientRects(); if(rc.length) words.push(Math.round(rc[rc.length-1].top)); } }
   if(words.length<(el.matches(TITLE)?3:5)) continue;
   const lines=[...new Set(words)].sort((a,b)=>a-b); if(lines.length<2) continue;
   total++;
   const last=words.filter(y=>Math.abs(y-lines[lines.length-1])<4).length;
   const isTitle=el.matches(TITLE);
   if((isTitle&&last<2)||(!isTitle&&last<3)) bad.push((isTitle?'[título] ':'[texto] ')+last+' palavra(s) na última linha: "'+el.textContent.trim().replace(/\\s+/g,' ').slice(0,70)+'…"');
 }
 return {total,bad};
})()`;
let falhas = 0;
for(const W of widths){
  await send('Emulation.setDeviceMetricsOverride',{width:W,height:900,deviceScaleFactor:1,mobile:W<700});
  await send('Page.navigate',{url:url+'#home'});await sleep(4500);await ev('document.fonts.ready.then(()=>1)');
  for(const pg of ['home','casa','suites','viver','experiencias','eventos','chapada','reservar']){
    await ev(`CDL.goPage('${pg}',{instant:true})`); await sleep(900);
    const r = await ev(CHECK);
    console.log(`${W}px ${pg}: ${r.total} blocos com 2+ linhas, ${r.bad.length} com viúva`);
    r.bad.forEach(b=>console.log('   '+b)); falhas += r.bad.length;
  }
}
console.log(falhas ? `\nTOTAL: ${falhas} ocorrências` : '\nTOTAL: nenhuma viúva');
ws.close();p.kill();
