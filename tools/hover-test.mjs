// confere os efeitos de hover: node tools/hover-test.mjs   (usa ?sem-movimento; move o mouse sobre cada alvo e mede transform/sombra)
import { spawn } from 'node:child_process';
const url='http://localhost:5173/index.html?sem-movimento';
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe'; const port=9400+Math.floor(Math.random()*400);
const p=spawn(chrome,['--headless=new','--no-first-run','--hide-scrollbars',`--user-data-dir=${(process.env.TEMP||'.')}/cdl-hv-${port}`,`--remote-debugging-port=${port}`,'--window-size=1440,900','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); let target;
for(let i=0;i<60;i++){await sleep(300);try{const l=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();target=l.find(t=>t.type==='page');if(target)break;}catch{}}
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pend=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id);}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
const ev=async js=>(await send('Runtime.evaluate',{expression:js,returnByValue:true,awaitPromise:true})).result?.result?.value;
await send('Page.enable');await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url:url+'#home'});await sleep(4500);
const T=[ // [pagina, seletor do alvo, o que medir: 'self' | seletor do filho, propriedade]
 ['suites','#page-suites .suite-card','self','transform'],['suites','#page-suites .suite-card','.suite-card-media img','transform'],['suites','#page-suites .suite-card h3','self','transform'],
 ['chapada','#page-chapada .chapada-card','self','transform'],['chapada','#page-chapada .chapada-card','img','transform'],
 ['viver','#page-viver .space-card','self','transform'],['viver','#page-viver .space-card','img','transform'],
 ['casa','#page-casa .card','self','transform'],['casa','#page-casa .story-card','self','transform'],
 ['home','#page-home .suite-detail-btn','self','textUnderlineOffset'],['home','#page-home .btn','self','boxShadow'],
 ['home','#page-home .map-pin','self','scale'],['eventos','#page-eventos .grid-4 .card','self','transform'],
 ['home','.site-footer .footer-col button','self','transform'],['suites','#page-suites .suite-filter:not(.active)','self','transform']
];
let ok=0;
for(const [pg,sel,child,prop] of T){
  await ev(`CDL.goPage('${pg}',{instant:true})`); await sleep(500);
  const r=await ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;e.scrollIntoView({block:'center',behavior:'instant'});const b=e.getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+Math.min(b.height/2,80)}})()`);
  if(!r){ console.log('SEM ALVO',sel); continue; }
  const medida = (c)=>`(()=>{const e=document.querySelector(${JSON.stringify(sel)});const t=${c==='self'?'e':`e.querySelector(${JSON.stringify(c)})`};return t?getComputedStyle(t).${prop}:null})()`;
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:5,y:5}); await sleep(900);
  const antes=await ev(medida(child));
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:r.x,y:r.y}); await sleep(450);
  const r2=await ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});const b=e.getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2}})()`); await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:r2.x,y:r2.y}); await sleep(1100);
  const depois=await ev(medida(child)); if(process.env.DBG) console.log('   hover?',await ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});const t=document.elementFromPoint(${r.x},${r.y});return [e.matches(':hover'),t&&t.tagName+'.'+t.className, scrollY]})()`));
  const mudou = antes!==depois; if(mudou) ok++;
  console.log((mudou?'OK   ':'FALHA ')+`${pg} ${sel}${child==='self'?'':' > '+child} ${prop}: ${String(antes).slice(0,34)} -> ${String(depois).slice(0,34)}`);
}
console.log(`${ok}/${T.length} efeitos de hover respondem`);
ws.close();p.kill();
