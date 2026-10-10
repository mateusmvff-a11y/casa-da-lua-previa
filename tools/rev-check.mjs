// Roda a checagem das revisões do cliente: node tools/rev-check.mjs [id ...] [--url <url>] [--w 1440]
// Lê tools/rev/<id>.json: [{"bloco","item","expr"}]; cada expr (JS que retorna true) roda no site completo depois de abrir a página <id> (instantâneo), com ?sem-movimento.
import { spawn } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')),'..');
const argv = process.argv.slice(2);
const opt = k => { const i = argv.indexOf('--'+k); return i>=0 ? argv[i+1] : null; };
const base = opt('url') || 'http://localhost:5173/index.html?sem-movimento'; const W = +(opt('w')||1440);
const PAGES = ['home','casa','suites','viver','experiencias','eventos','chapada','reservar'];
let ids = argv.filter((a,i)=>!a.startsWith('--') && !(i>0 && argv[i-1].startsWith('--')));
if(!ids.length) ids = fs.readdirSync(path.join(root,'tools/rev')).filter(f=>f.endsWith('.json')).map(f=>f.replace('.json',''));
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
let totalOk = 0, totalAll = 0;
for(const id of ids){
  const f = path.join(root,'tools/rev',id+'.json'); if(!fs.existsSync(f)){ console.log('sem arquivo',f); continue; }
  const items = JSON.parse(fs.readFileSync(f,'utf8'));
  const port=9400+Math.floor(Math.random()*400);
  const p=spawn(chrome,['--headless=new','--disable-gpu','--no-first-run',`--user-data-dir=${(process.env.TEMP||'.')}/cdl-rv-${port}`,`--remote-debugging-port=${port}`,`--window-size=${W},900`,'about:blank'],{stdio:'ignore'});
  const sleep=ms=>new Promise(r=>setTimeout(r,ms)); let target;
  for(let i=0;i<60;i++){await sleep(300);try{const l=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();target=l.find(t=>t.type==='page');if(target)break;}catch{}}
  const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let n=0;const pend=new Map();
  ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id);}};
  const send=(method,params={})=>new Promise(r=>{const i=++n;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
  const ev=async js=>{const r=await send('Runtime.evaluate',{expression:js,returnByValue:true,awaitPromise:true});return r.result?.exceptionDetails ? 'ERRO: '+(r.result.exceptionDetails.exception?.description||r.result.exceptionDetails.text) : r.result?.result?.value;};
  await send('Page.enable');await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:W,height:900,deviceScaleFactor:1,mobile:W<700});
  let ok = 0;
  console.log(`\n=== ${id} (${items.length} itens, ${W}px) ===`);
  for(const it of items){
    // página nova a cada item: o estado de um não contamina o outro
    await send('Page.navigate',{url:base+'#'+(PAGES.includes(id)?id:'home')}); await sleep(2800); await ev('document.fonts.ready.then(()=>1)');
    if(PAGES.includes(id)){ await ev(`CDL.goPage('${id}',{instant:true})`); }
    await sleep(900);
    const v = await ev(it.expr);
    const pass = v === true; if(pass) ok++;
    console.log((pass?'OK    ':'FALHA ')+`[${it.bloco}] ${it.item}`+(pass?'':`  -> ${JSON.stringify(v)}`));
  }
  console.log(`${ok}/${items.length} ok em ${id}`); totalOk += ok; totalAll += items.length;
  ws.close(); p.kill();
}
console.log(`\nTOTAL: ${totalOk}/${totalAll}`);
process.exit(totalOk === totalAll ? 0 : 1);
