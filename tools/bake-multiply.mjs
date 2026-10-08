// Troca texturas "multiply" por versões pré-calculadas (preto com transparência), sem mix-blend-mode (muito mais leve na rolagem).
// Multiplicar uma textura cinza T sobre um fundo B dá B*T; um preto com alpha (1-T) dá B*(1-(1-T)) = B*T: o mesmo resultado.
// uso: node tools/bake-multiply.mjs   (com o servidor local ligado; reescreve src/partials/pages/*.html e cria assets/img/<ref>-m.webp)
import { spawn, execFileSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')),'..');
execFileSync('node',['build.mjs'],{cwd:root});
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe'; const port=9400+Math.floor(Math.random()*400);
const p=spawn(chrome,['--headless=new','--disable-gpu','--no-first-run',`--user-data-dir=${(process.env.TEMP||'.')}/cdl-bk-${port}`,`--remote-debugging-port=${port}`,'--window-size=1440,900','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); let target;
for(let i=0;i<60;i++){await sleep(300);try{const l=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();target=l.find(t=>t.type==='page');if(target)break;}catch{}}
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pend=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id);}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
await send('Page.enable');await send('Runtime.enable');
await send('Page.navigate',{url:'http://localhost:5173/index.html?sem-movimento'});await sleep(4500);
const res=(await send('Runtime.evaluate',{returnByValue:true,expression:`(()=>{const out={};for(const pg of document.querySelectorAll('.page')){const id=pg.dataset.page;out[id]=[...pg.querySelectorAll('.section-bg')].map(el=>({m:getComputedStyle(el).mixBlendMode==='multiply'}));}return out})()`})).result.result.value;
ws.close();p.kill();
const refs=new Set();
for(const [pg,list] of Object.entries(res)){
  const f=path.join(root,`src/partials/pages/${pg}.html`); let h=fs.readFileSync(f,'utf8'); let i=-1;
  h=h.replace(/<div class="section-bg([^"]*)"([^>]*)>(\s*<img[^>]*>)?/g,(all,cls,rest,img)=>{
    i++; if(!res[pg][i]||!res[pg][i].m||/baked/.test(cls)) return all;
    let out=all.replace(/img\/([0-9a-f]{6})\.webp/g,(x,r)=>{refs.add(r);return `img/${r}-m.webp`;});
    return out.replace('class="section-bg','class="section-bg baked');
  });
  fs.writeFileSync(f,h);
}
for(const r of refs){
  const src=path.join(root,`assets/img/${r}.webp`), dst=path.join(root,`assets/img/${r}-m.webp`);
  const dim=execFileSync('ffprobe',['-v','error','-select_streams','v','-show_entries','stream=width,height','-of','csv=s=x:p=0',src]).toString().trim();
  execFileSync('ffmpeg',['-loglevel','error','-y','-i',src,'-f','lavfi','-i',`color=c=black:s=${dim}`,'-filter_complex','[0]format=gray,negate[a];[1][a]alphamerge','-frames:v','1','-c:v','libwebp','-quality','88',dst]);
  console.log('baked',r,dim,(fs.statSync(dst).size/1024).toFixed(0)+'KB');
}
console.log('texturas pré-calculadas:',[...refs].join(', '));
