// Amostra o transform/opacity de um elemento ao abrir uma página (para achar tremulação: valores que sobem e descem).
// uso: node tools/amostra-transform.mjs <url> <pagina> "<seletor>" [duracaoMs=3000] [passoMs=100] [largura=1440]
import { spawn } from 'node:child_process';
const [,, url, page, sel, DUR='3000', STEP='100', W='1440'] = process.argv;
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe'; const port=9400+Math.floor(Math.random()*400);
const p=spawn(chrome,['--headless=new','--disable-gpu','--no-first-run',`--user-data-dir=${(process.env.TEMP||'.')}/cdl-am-${port}`,`--remote-debugging-port=${port}`,`--window-size=${W},900`,'about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); let target;
for(let i=0;i<60;i++){await sleep(300);try{const l=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();target=l.find(t=>t.type==='page');if(target)break;}catch{}}
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pend=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id);}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
const ev=async js=>(await send('Runtime.evaluate',{expression:js,returnByValue:true,awaitPromise:true})).result?.result?.value;
await send('Page.enable');await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride',{width:+W,height:900,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url});await sleep(4500);await ev('document.fonts.ready.then(()=>1)');
await ev(`CDL.goPage('home',{instant:true})`); await sleep(600);
// instala o amostrador antes de abrir a página (o CDL.goPage dispara a animação)
await ev(`window.__am=[];(()=>{const t0=performance.now();const iv=setInterval(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return;const cs=getComputedStyle(e);window.__am.push([Math.round(performance.now()-t0),cs.transform,cs.opacity,cs.visibility]);if(performance.now()-t0>${+DUR})clearInterval(iv);},${+STEP});})();CDL.goPage(${JSON.stringify(page)});1`);
await sleep(+DUR+1500);
const rows = await ev('window.__am');
let prev=null;
for(const [t,tr,op,vis] of rows){
  let s='—', ty='—';
  const m=tr.match(/matrix\(([^)]+)\)/); if(m){const v=m[1].split(',').map(Number); s=v[0].toFixed(3); ty=v[5].toFixed(1);}
  console.log(String(t).padStart(5)+'ms  scale '+s+'  ty '+ty+'  opac '+op+'  '+vis);
}
ws.close();p.kill();
