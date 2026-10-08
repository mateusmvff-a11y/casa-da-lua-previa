// acha qual tipo de animação gera o erro 'pin': desliga grupos via querystring
import { spawn } from 'node:child_process';
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
async function run(js){ const port=9400+Math.floor(Math.random()*400);
 const p=spawn(chrome,['--headless=new','--disable-gpu','--no-first-run',`--user-data-dir=${(process.env.TEMP||'.')}/cdl-bs-${port}`,`--remote-debugging-port=${port}`,'--window-size=1440,900','about:blank'],{stdio:'ignore'});
 const sleep=ms=>new Promise(r=>setTimeout(r,ms)); let target;
 for(let i=0;i<60;i++){await sleep(300);try{const l=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();target=l.find(t=>t.type==='page');if(target)break;}catch{}}
 const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pend=new Map();let errs=0;
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id);}else if(m.method==='Runtime.exceptionThrown')errs++;};
 const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
 await send('Page.enable');await send('Runtime.enable');
 await send('Page.addScriptToEvaluateOnNewDocument',{source:js});
 await send('Page.navigate',{url:'http://localhost:5173/index.html'});await sleep(4500);
 ws.close();p.kill();return errs; }
const casos={
 'nada':'',
 'sem hero':"document.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('[data-anim=hero]').forEach(e=>e.removeAttribute('data-anim')))",
 'sem parallax':"document.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('[data-parallax]').forEach(e=>e.removeAttribute('data-parallax')))",
 'sem title':"document.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('[data-anim=title]').forEach(e=>e.removeAttribute('data-anim')))",
 'sem reveal':"document.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('[data-anim=reveal]').forEach(e=>e.removeAttribute('data-anim')))",
 'sem image':"document.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('[data-anim=image]').forEach(e=>e.removeAttribute('data-anim')))",
 'sem lenis':"window.Lenis=undefined"
};
for(const [k,v] of Object.entries(casos)) console.log(k.padEnd(14), 'erros:', await run(v));
