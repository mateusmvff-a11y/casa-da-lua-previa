// recorte em alta resolução de um elemento: node tools/recorte.mjs <url> "<seletor>" <saida.png> [escala=2] [largura=1920]
import { spawn } from 'node:child_process'; import fs from 'node:fs';
const [,, url, sel, out, S='2', W='1920'] = process.argv;
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe'; const port=9400+Math.floor(Math.random()*400);
const p=spawn(chrome,['--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run',`--user-data-dir=${(process.env.TEMP||'.')}/cdl-rc-${port}`,`--remote-debugging-port=${port}`,`--window-size=${W},1000`,'about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); let target;
for(let i=0;i<60;i++){await sleep(300);try{const l=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();target=l.find(t=>t.type==='page');if(target)break;}catch{}}
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pend=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id);}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
const ev=async js=>(await send('Runtime.evaluate',{expression:js,returnByValue:true,awaitPromise:true})).result?.result?.value;
await send('Page.enable');await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride',{width:+W,height:1000,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url});await sleep(4500);await ev('document.fonts.ready.then(()=>1)');
const H0=await ev('document.documentElement.scrollHeight');for(let y=0;y<H0;y+=600){await ev(`window.scrollTo(0,${y})`);await sleep(60);}await ev('window.scrollTo(0,0)');await sleep(2600);
const r=await ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});const g=document.createRange();g.selectNodeContents(e);const b=g.getBoundingClientRect();return {x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height}})()`);
const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:Math.max(0,r.x-4),y:Math.max(0,r.y-4),width:r.w+8,height:r.h+8,scale:+S}});
fs.writeFileSync(out,Buffer.from(shot.result.data,'base64'));console.log(JSON.stringify(r));ws.close();p.kill();
