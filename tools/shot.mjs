// Tira print da página inteira com o Chrome (sem abrir janela) e corta em fatias.
// uso: node tools/shot.mjs <url> <saida-prefixo> [largura=1920] [escala=0.5] [fatia=1200] [js-antes-do-print]
// Ex.: node tools/shot.mjs http://localhost:5173/_prev/home/index.html#home _shots/home 1920 0.5
//  -> _shots/home_0.png, _shots/home_1.png ... (mesma escala 0.5 das referências do Figma em _figma/slices)
import { spawn, execFileSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path';
const [,, url, pref, W='1920', S='0.5', SL='1200', pre=''] = process.argv;
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 9400 + Math.floor(Math.random()*400);
const prof = (process.env.TEMP||'.') + '/cdl-prof-' + port;
fs.mkdirSync(path.dirname(pref),{recursive:true});
const p = spawn(chrome,['--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run','--force-device-scale-factor=1',`--user-data-dir=${prof}`,`--remote-debugging-port=${port}`,`--window-size=${W},1000`,'about:blank'],{stdio:'ignore'});
const sleep = ms => new Promise(r=>setTimeout(r,ms));
let target; for(let i=0;i<60;i++){ await sleep(300); try{ const l=await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); target=l.find(t=>t.type==='page'); if(target)break; }catch{} }
const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise(r=>ws.onopen=r);
let id=0; const pend=new Map(); const logs=[];
ws.onmessage=e=>{ const m=JSON.parse(e.data); if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id);} else if(m.method==='Runtime.consoleAPICalled'&&['error','warning'].includes(m.params.type)) logs.push(m.params.type+': '+m.params.args.map(a=>a.value||a.description).join(' ')); else if(m.method==='Runtime.exceptionThrown') logs.push('EXC: '+(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text)); };
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
const ev=async js=>(await send('Runtime.evaluate',{expression:js,returnByValue:true,awaitPromise:true})).result?.result?.value;
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride',{width:+W,height:1000,deviceScaleFactor:1,mobile:+W<700});
await send('Page.navigate',{url}); await sleep(4500);
await ev(`document.fonts&&document.fonts.ready.then(()=>1)`);
if(pre){ await ev(pre); await sleep(900); }
// rola a página toda para disparar animações/lazy e volta ao topo
const H0 = await ev('document.documentElement.scrollHeight');
for(let y=0;y<H0;y+=600){ await ev(`window.scrollTo(0,${y})`); await sleep(60); }
await ev('window.scrollTo(0,0)'); await sleep(+(process.env.SHOT_WAIT||2600));
const H = await ev('Math.max(document.documentElement.scrollHeight,document.body.scrollHeight)');
const r = await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:+W,height:H,scale:+S}});
const full = pref+'_full.png'; fs.writeFileSync(full,Buffer.from(r.result.data,'base64'));
const fonts = await ev(`[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family+' '+f.weight).join(' | ')`);
ws.close(); p.kill();
const hs = Math.round(H*+S); const n = Math.ceil(hs/+SL);
for(let i=0;i<n;i++) execFileSync('ffmpeg',['-loglevel','error','-y','-i',full,'-vf',`crop=iw:min(${SL}\\,ih-${i*+SL}):0:${i*+SL}`,`${pref}_${i}.png`]);
console.log(`altura ${H}px -> ${n} fatias ${pref}_0..${n-1}.png | fontes carregadas: ${fonts||'(nenhuma!)'}`);
if(logs.length) console.log('CONSOLE:\n'+[...new Set(logs)].slice(0,15).join('\n'));
