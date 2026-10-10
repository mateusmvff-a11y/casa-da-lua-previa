// reproduz: rola para baixo e volta ao topo com a roda do mouse, depois mede opacidade/posição do texto do hero
import { spawn } from 'node:child_process'; import fs from 'node:fs';
const url = process.argv[2] || 'http://localhost:5173/index.html#home'; const sel = process.argv[3] || '#page-home .hero-copy';
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe'; const port=9400+Math.floor(Math.random()*400);
const p=spawn(chrome,['--headless=new','--no-first-run','--hide-scrollbars',`--user-data-dir=${(process.env.TEMP||'.')}/cdl-sv-${port}`,`--remote-debugging-port=${port}`,'--window-size=1440,800','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); let target;
for(let i=0;i<60;i++){await sleep(300);try{const l=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();target=l.find(t=>t.type==='page');if(target)break;}catch{}}
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pend=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id);}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
const ev=async js=>(await send('Runtime.evaluate',{expression:js,returnByValue:true,awaitPromise:true})).result?.result?.value;
await send('Page.enable');await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:800,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url});await sleep(6500);
const med=`(()=>{const c=document.querySelector(${JSON.stringify(sel)});const cs=getComputedStyle(c);const kids=[...c.querySelectorAll('*')].slice(0,12).map(e=>[e.tagName+'.'+String(e.className).slice(0,18),getComputedStyle(e).opacity,getComputedStyle(e).visibility,e.style.transform||'']);return {y:Math.round(scrollY),copy:[cs.opacity,cs.visibility,c.style.transform,c.style.opacity],r:Math.round(c.getBoundingClientRect().top),kids}})()`;
const shot=async n=>{const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(n,Buffer.from(r.result.data,'base64'))};await shot('_shots/sv-0.png');
console.log('inicio',JSON.stringify(await ev(med)));
const samp=`(()=>{const c=document.querySelector(${JSON.stringify(sel)});return Math.round(scrollY)+':'+(+getComputedStyle(c).opacity).toFixed(2)})()`; const down=[],up=[];
for(let i=0;i<12;i++){ await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:700,y:400,deltaX:0,deltaY:100}); await sleep(260); down.push(await ev(samp)); }
console.log('descendo',down.join(' '));
await sleep(1500); console.log('desceu',JSON.stringify((await ev(med))).slice(0,260));
for(let i=0;i<14;i++){ await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:700,y:400,deltaX:0,deltaY:-100}); await sleep(260); up.push(await ev(samp)); }
console.log('subindo ',up.join(' '));
await sleep(2500); await shot('_shots/sv-1.png');
console.log('voltou',JSON.stringify(await ev(med)));
ws.close();p.kill();
