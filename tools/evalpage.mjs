// uso: node tools/evalpage.mjs <url> "<js que retorna valor>"  (Chrome headless; espera as fontes)
import { spawn } from 'node:child_process'; import fs from 'node:fs';
const [,, url, js, W='1920'] = process.argv;
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe'; const port=9400+Math.floor(Math.random()*400);
const p=spawn(chrome,['--headless=new','--disable-gpu','--no-first-run',`--user-data-dir=${(process.env.TEMP||'.')}/cdl-ev-${port}`,`--remote-debugging-port=${port}`,`--window-size=${W},1000`,'about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); let target;
for(let i=0;i<60;i++){await sleep(300);try{const l=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();target=l.find(t=>t.type==='page');if(target)break;}catch{}}
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pend=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id);}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
await send('Page.enable');await send('Runtime.enable');await send('Page.navigate',{url});await sleep(4000);
const r=await send('Runtime.evaluate',{expression:js,returnByValue:true,awaitPromise:true});
console.log(JSON.stringify(r.result?.result?.value??r.result,null,1));ws.close();p.kill();
