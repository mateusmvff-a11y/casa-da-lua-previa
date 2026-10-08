// print do que se vê na janela (para sobreposições): node tools/viewport.mjs <url> <saida.png> <largura> <altura> "<js antes>" [mobile 0|1]
import { spawn } from 'node:child_process'; import fs from 'node:fs';
const [,, url, out, W='1440', H='900', pre='', mob='0'] = process.argv;
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe'; const port=9400+Math.floor(Math.random()*400);
const p=spawn(chrome,['--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run',`--user-data-dir=${(process.env.TEMP||'.')}/cdl-vp-${port}`,`--remote-debugging-port=${port}`,`--window-size=${W},${H}`,'about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); let target;
for(let i=0;i<60;i++){await sleep(300);try{const l=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();target=l.find(t=>t.type==='page');if(target)break;}catch{}}
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pend=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id);}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
const ev=async js=>(await send('Runtime.evaluate',{expression:js,returnByValue:true,awaitPromise:true})).result?.result?.value;
await send('Page.enable');await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride',{width:+W,height:+H,deviceScaleFactor:mob==='1'?2:1,mobile:mob==='1'});
await send('Page.navigate',{url});await sleep(4500);await ev('document.fonts.ready.then(()=>1)');
if(pre){await ev(pre);await sleep(1800);}
const s=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(out,Buffer.from(s.result.data,'base64'));ws.close();p.kill();console.log('ok',out);
