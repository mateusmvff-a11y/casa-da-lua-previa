import { spawn } from 'node:child_process';
const url = process.argv[2]||'http://localhost:5173/index.html'; const pages=(process.argv[3]||'home,casa,suites,viver,experiencias,eventos,chapada,reservar').split(',');
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe'; const port=9400+Math.floor(Math.random()*400);
const p=spawn(chrome,['--headless=new','--disable-gpu','--no-first-run',`--user-data-dir=${(process.env.TEMP||'.')}/cdl-er-${port}`,`--remote-debugging-port=${port}`,'--window-size=1440,900','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); let target;
for(let i=0;i<60;i++){await sleep(300);try{const l=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();target=l.find(t=>t.type==='page');if(target)break;}catch{}}
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pend=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id);}else if(m.method==='Runtime.exceptionThrown'){const d=m.params.exceptionDetails;console.log('EXC',d.exception?.description?.split('\n').slice(0,6).join('\n')||d.text,'\n   linha',d.lineNumber,'col',d.columnNumber,'url',d.url);}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
await send('Page.enable');await send('Runtime.enable');
await send('Page.navigate',{url});await sleep(4000);
for(const pg of pages){ console.log('-> página',pg); await send('Runtime.evaluate',{expression:`CDL.goPage('${pg}',{instant:true})`}); await sleep(1500); await send('Runtime.evaluate',{expression:`window.scrollTo(0,1500)`}); await sleep(800); }
ws.close();p.kill();
