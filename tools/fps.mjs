// Mede a fluidez da rolagem: node tools/fps.mjs <pagina> [url] [css-extra] [js-extra]
// Rola com a roda do mouse (eventos reais) do topo ao fim e registra o tempo de cada quadro.
import { spawn } from 'node:child_process';
const [,, pg='home', url='http://localhost:5173/index.html', cssExtra='', jsExtra=''] = process.argv;
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe'; const port=9400+Math.floor(Math.random()*400);
const p=spawn(chrome,['--headless=new','--no-first-run','--hide-scrollbars','--enable-gpu-rasterization','--ignore-gpu-blocklist',`--user-data-dir=${(process.env.TEMP||'.')}/cdl-fps-${port}`,`--remote-debugging-port=${port}`,'--window-size=1440,900','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); let target;
for(let i=0;i<60;i++){await sleep(300);try{const l=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();target=l.find(t=>t.type==='page');if(target)break;}catch{}}
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pend=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id);}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
const ev=async js=>(await send('Runtime.evaluate',{expression:js,returnByValue:true,awaitPromise:true})).result?.result?.value;
await send('Page.enable');await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url:url+'#'+pg});await sleep(5000);await ev('document.fonts.ready.then(()=>1)');
if(cssExtra) await ev(`(()=>{const s=document.createElement('style');s.textContent=${JSON.stringify(cssExtra)};document.head.appendChild(s)})()`);
if(jsExtra) await ev(jsExtra);
await sleep(1500);
await ev(`window.__f=[];window.__go=true;(()=>{let l=performance.now();const t=n=>{if(!window.__go)return;window.__f.push([n-l,Math.round(scrollY)]);l=n;requestAnimationFrame(t)};requestAnimationFrame(t)})()`);
const H=await ev('document.documentElement.scrollHeight');
let y=0;
for(let i=0;i<Math.ceil((H-900)/100);i++){ await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:700,y:450,deltaX:0,deltaY:100}); await sleep(16); }
await sleep(1500);
const f=await ev('window.__go=false;window.__f');
const d=f.map(x=>x[0]).filter(x=>x<500).sort((a,b)=>a-b);
const q=a=>d[Math.min(d.length-1,Math.floor(d.length*a))];
const lentos=f.filter(x=>x[0]>34&&x[0]<500);
console.log(`${pg}: altura ${H} · quadros ${d.length} · mediana ${q(.5).toFixed(1)}ms · p95 ${q(.95).toFixed(1)}ms · p99 ${q(.99).toFixed(1)}ms · máx ${d[d.length-1].toFixed(0)}ms · >34ms: ${lentos.length} (${(100*lentos.length/d.length).toFixed(1)}%)`);
const spots={};lentos.forEach(x=>{const k=Math.round(x[1]/400)*400;spots[k]=(spots[k]||0)+1});
console.log('  onde (scrollY: nº de quadros lentos):',JSON.stringify(spots));
ws.close();p.kill();
