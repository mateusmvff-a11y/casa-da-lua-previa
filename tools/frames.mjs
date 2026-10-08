// Captura uma sequência de quadros depois de executar um JS: node tools/frames.mjs <url> "<js>" <n> <intervaloMs> <saida-prefixo> [largura=1440] [altura=900] [esperaInicial=4500]
import { spawn, execFileSync } from 'node:child_process'; import fs from 'node:fs';
const [,, url, js, N='6', IV='200', out, W='1440', H='900', W0='4500'] = process.argv;
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe'; const port=9400+Math.floor(Math.random()*400);
const p=spawn(chrome,['--headless=new','--no-first-run','--hide-scrollbars','--enable-gpu-rasterization',`--user-data-dir=${(process.env.TEMP||'.')}/cdl-fr-${port}`,`--remote-debugging-port=${port}`,`--window-size=${W},${H}`,'about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); let target;
for(let i=0;i<60;i++){await sleep(300);try{const l=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();target=l.find(t=>t.type==='page');if(target)break;}catch{}}
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pend=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id);}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
await send('Page.enable');await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride',{width:+W,height:+H,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url});await sleep(+W0);
if(js) await send('Runtime.evaluate',{expression:js});
const files=[];
for(let i=0;i<+N;i++){ const s=await send('Page.captureScreenshot',{format:'jpeg',quality:70}); const f=`${out}_${i}.jpg`; fs.writeFileSync(f,Buffer.from(s.result.data,'base64')); files.push(f); await sleep(+IV); }
ws.close();p.kill();
// grade 3 colunas
const cols=3, rows=Math.ceil(files.length/cols);
const inputs=files.flatMap(f=>['-i',f]);
const filter=files.map((_,i)=>`[${i}]scale=640:-1[s${i}]`).join(';')+';'+files.map((_,i)=>`[s${i}]`).join('')+`xstack=inputs=${files.length}:layout=`+files.map((_,i)=>`${(i%cols)*640}_${Math.floor(i/cols)*360}`).join('|');
execFileSync('ffmpeg',['-loglevel','error','-y',...inputs,'-filter_complex',filter,`${out}_grade.jpg`]);
console.log('ok',`${out}_grade.jpg`);
