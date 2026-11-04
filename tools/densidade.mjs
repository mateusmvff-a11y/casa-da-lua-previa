// Auditoria de nitidez: em cada página, quantos pixels reais da imagem/vídeo chegam a cada pixel CSS da tela.
// < 1 = imagem esticada (borrada mesmo em tela comum); < 2 = abaixo do ideal para tela retina.
// uso: node tools/densidade.mjs [largura=1920] [altura=1000]
import { spawn } from 'node:child_process';
const W = +(process.argv[2]||1920), H = +(process.argv[3]||1000);
const PAGES = ['home','casa','suites','viver','experiencias','eventos','chapada','reservar'];
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe'; const port=9400+Math.floor(Math.random()*400);
const p=spawn(chrome,['--headless=new','--disable-gpu','--no-first-run',`--user-data-dir=${(process.env.TEMP||'.')}/cdl-dn-${port}`,`--remote-debugging-port=${port}`,`--window-size=${W},${H}`,'about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); let target;
for(let i=0;i<60;i++){await sleep(300);try{const l=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();target=l.find(t=>t.type==='page');if(target)break;}catch{}}
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pend=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id);}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
const ev=async js=>{const r=await send('Runtime.evaluate',{expression:js,returnByValue:true,awaitPromise:true});return r.result?.result?.value;};
await send('Page.enable');await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride',{width:W,height:H,deviceScaleFactor:1,mobile:false});
const JS = `(async()=>{
  const pg=document.querySelector('.page.active'); const out=[];
  const nat=src=>new Promise(r=>{const i=new Image();i.onload=()=>r([i.naturalWidth,i.naturalHeight]);i.onerror=()=>r(null);i.src=src;});
  for(const im of pg.querySelectorAll('img')){
    const r=im.getBoundingClientRect(); if(r.width<120||r.height<80) continue;
    if(!im.naturalWidth){ await new Promise(res=>{im.addEventListener('load',res,{once:true});setTimeout(res,4000);}); }
    const nw=im.naturalWidth,nh=im.naturalHeight; if(!nw) continue;
    const cs=getComputedStyle(im); let vw=nw,vh=nh;
    const ovb=(im.getAttribute('style')||'').match(/object-view-box:\s*xywh\(([^)]+)\)/); if(ovb){const n=ovb[1].trim().split(/\s+/).map(parseFloat);vw=n[2];vh=n[3];}
    let k; if(cs.objectFit==='cover') k=Math.max(r.width/vw,r.height/vh); else if(cs.objectFit==='contain') k=Math.min(r.width/vw,r.height/vh); else k=Math.max(r.width/vw,r.height/vh);
    out.push({t:'img',src:(im.currentSrc||im.src).split('/').pop(),css:Math.round(r.width)+'x'+Math.round(r.height),dens:+(1/k).toFixed(2)});
  }
  for(const v of pg.querySelectorAll('video')){const r=v.getBoundingClientRect(); if(r.width<120) continue; if(!v.videoWidth) await new Promise(res=>{v.addEventListener('loadedmetadata',res,{once:true});setTimeout(res,4000);}); if(!v.videoWidth) continue; const k=Math.max(r.width/v.videoWidth,r.height/v.videoHeight); out.push({t:'video',src:(v.currentSrc||'').split('/').pop(),css:Math.round(r.width)+'x'+Math.round(r.height),dens:+(1/k).toFixed(2)});}
  for(const el of pg.querySelectorAll('*')){
    const bi=getComputedStyle(el).backgroundImage; if(!bi||!bi.startsWith('url(')) continue;
    const r=el.getBoundingClientRect(); if(r.width<200||r.height<120) continue;
    const src=bi.slice(5,-2); const n=await nat(src); if(!n) continue;
    const bs=getComputedStyle(el).backgroundSize; let k;
    if(bs==='cover') k=Math.max(r.width/n[0],r.height/n[1]); else if(bs==='contain') k=Math.min(r.width/n[0],r.height/n[1]);
    else { const a=bs.split(' ')[0]; if(a.endsWith('%')) k=r.width*parseFloat(a)/100/n[0]; else if(a.endsWith('px')) k=parseFloat(a)/n[0]; else k=Math.max(r.width/n[0],r.height/n[1]); }
    const op=parseFloat(getComputedStyle(el).opacity); 
    out.push({t:'bg',src:src.split('/').pop(),css:Math.round(r.width)+'x'+Math.round(r.height),dens:+(1/k).toFixed(2),op});
  }
  return out;
})()`;
for(const pg of PAGES){
  await send('Page.navigate',{url:`http://localhost:5173/index.html?sem-movimento#${pg}`}); await sleep(3000);
  const h = await ev('document.documentElement.scrollHeight');
  for(let y=0;y<h;y+=H){ await ev(`window.scrollTo(0,${y})`); await sleep(120); }   // força o carregamento preguiçoso
  await sleep(1200);
  const res = await ev(JS) || [];
  const seen=new Set();
  for(const r of res.sort((a,b)=>a.dens-b.dens)){
    const key=r.src+r.css; if(seen.has(key)) continue; seen.add(key);
    const flag = r.dens<1 ? 'ESTICADA' : (r.dens<1.5 ? 'fraca   ' : 'ok      ');
    if(r.dens<1.5) console.log(`${pg.padEnd(12)} ${flag} ${String(r.dens).padEnd(5)} ${r.t.padEnd(5)} ${r.src.padEnd(34)} em ${r.css}${r.op!==undefined&&r.op<1?' (opac '+r.op+')':''}`);
  }
}
ws.close(); p.kill();
