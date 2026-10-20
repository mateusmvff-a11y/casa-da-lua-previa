// Caça restos de português no site em inglês: node tools/i18n-audit.mjs [url=http://localhost:5173/en/index.html?sem-movimento] [largura=1440]
// Abre cada página, aciona abas/filtros/janelas e lista todo texto (e alt/aria-label/placeholder/title) que ainda parece português:
//   PT-IGUAL = texto idêntico a uma chave do dicionário que tem tradução (ficou sem trocar); o resto = letras acentuadas fora dos nomes próprios.
import { spawn } from 'node:child_process'; import fs from 'node:fs';
const url = process.argv[2] || 'http://localhost:5173/en/index.html?sem-movimento'; const W = process.argv[3] || '1440';
const dict = JSON.parse(fs.readFileSync(new URL('../src/i18n/en.json', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'),'utf8'));
const PTKEYS = Object.keys(dict).filter(k=>dict[k].trim()!==k.trim() && k.trim().length>2).map(k=>k.replace(/\s+/g,' ').trim());
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe'; const port=9400+Math.floor(Math.random()*400);
const p=spawn(chrome,['--headless=new','--disable-gpu','--no-first-run',`--user-data-dir=${(process.env.TEMP||'.')}/cdl-i18n-${port}`,`--remote-debugging-port=${port}`,`--window-size=${W},900`,'about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); let target;
for(let i=0;i<60;i++){await sleep(300);try{const l=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();target=l.find(t=>t.type==='page');if(target)break;}catch{}}
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pend=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id);}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
const ev=async js=>(await send('Runtime.evaluate',{expression:js,returnByValue:true,awaitPromise:true})).result?.result?.value;
await send('Page.enable');await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride',{width:+W,height:900,deviceScaleFactor:1,mobile:+W<700});
await send('Page.navigate',{url});await sleep(4500);await ev('document.fonts.ready.then(()=>1)');
await ev('window.__PT='+JSON.stringify(PTKEYS));
const COLETA = String.raw`(()=>{
  const out=new Set(); const PT=new Set(window.__PT||[]);
  const BRAND=/Alto Paraíso|Goiás|Casa da Lua|Tati Mandelli|Poço da Vovó|Almécegas|Cânions|Carybé|Veadeiros|Brasília|Cristais|São (Jorge|Bento|Miguel)|Restaurante [Nn]a Mata|Santo Cerrado|Vale da Lua|Loquinhas|ofurô|Ofurô|Rua do Segredo|Experiência Tidelli|contato@|Saltos|Carrossel|Corredeiras|Cariocas|Cerrado|Pousada|pousada|Paraíso/;
  const check=(t,where,el)=>{
    t=(t||'').replace(/\s+/g,' ').trim(); if(!t||t.length<2) return;
    const s=t.replace(BRAND,'');
    const ctx=el?(el.tagName.toLowerCase()+(el.className&&typeof el.className==='string'?'.'+el.className.split(' ')[0]:'')):'';
    if(PT.has(t)) out.add('PT-IGUAL '+where+' ['+ctx+']: '+t.slice(0,140));
    else if(/[áàâãéêíóôõúüç]/.test(s)) out.add(where+' ['+ctx+']: '+t.slice(0,140));
    else if(/\b(para|com|uma|você|seu|sua|seus|suas|mais|como|dos|das|nos|nas|sem|também|quando|onde|que|não|já|às|fica|ficam|pelo|pela|muito|todo|toda|depois|antes|dia|casa)\b/i.test(s.replace(/Casa da Lua|Casa Da Lua/g,''))) out.add('PALAVRA-PT '+where+' ['+ctx+']: '+t.slice(0,140));
  };
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let n;
  while((n=w.nextNode())){ const el=n.parentElement; if(!el||el.closest('script,style,noscript')) continue; check(n.nodeValue,'texto',el); }
  document.querySelectorAll('[alt],[aria-label],[placeholder],[title]').forEach(e=>['alt','aria-label','placeholder','title'].forEach(a=>{ const v=e.getAttribute(a); if(v) check(v,a,e); }));
  return [...out];
})()`;
const PAGES=['home','casa','suites','viver','experiencias','eventos','chapada','reservar'];
const all=new Map();
const merge=(arr,onde)=>arr.forEach(t=>{ if(!all.has(t)) all.set(t,onde); });
await ev("CDL.goPage('home',{instant:true})"); await sleep(800);
merge(await ev(COLETA),'inicial');
const ACOES = String.raw`(async()=>{
  const sl=ms=>new Promise(r=>setTimeout(r,ms)); const click=e=>{try{e.click()}catch(_){}};
  const sels=['.time-tab','.profile-card','.program-day','#homeExperienceDays button','.moment-tabs button','.event-selector button','.suite-filter','[data-chapada-filter]','.atlas-home-card .map-pin','.atlas-teaser .map-pin'];
  for(const s of sels){ for(const e of document.querySelectorAll(s)){ click(e); await sl(60); } }
  return true})()`;
for(const pg of PAGES){ await ev(`CDL.goPage('${pg}',{instant:true})`); await sleep(500); await ev(ACOES); await sleep(300); merge(await ev(COLETA),'aba em '+pg); }
for(const js of ["CDL.openAtlas()","CDL.openJourney()","CDL.openSuite('master')","CDL.openSuite('premium-ofuro')","document.querySelector('.interest-open').click()","document.querySelector('.privacy-open').click()","document.getElementById('mobileMenuBtn')&&document.getElementById('mobileMenuBtn').click()"]){
  await ev('CDL.closeOverlays()'); await sleep(300); await ev(js); await sleep(700); merge(await ev(COLETA),'janela '+js.slice(0,30));
  if(js.includes('Atlas')) for(let i=1;i<=9;i++){ await ev(`document.querySelectorAll('#atlasList button')[${i-1}]&&document.querySelectorAll('#atlasList button')[${i-1}].click()`); await sleep(150); merge(await ev(COLETA),'atlas '+i); }
  if(js.includes('Journey')) for(const tgt of ['garden','pool','wellness','night']){ await ev(`(()=>{const b=document.querySelector('[data-journey-target="${tgt}"]');b&&b.click()})()`); await sleep(200); merge(await ev(COLETA),'jornada '+tgt); }
}
await ev('CDL.closeOverlays()');
await ev("CDL.goPage('suites',{instant:true})"); await sleep(500);
await ev("(()=>{document.querySelectorAll('.compare-check').forEach((c,i)=>{if(i<3)c.click()});document.getElementById('openCompare').click()})()"); await sleep(800); merge(await ev(COLETA),'comparar'); await ev('CDL.closeOverlays()');
await ev("CDL.goPage('reservar',{instant:true})"); await sleep(500);
await ev("(()=>{const s=(id,v)=>{const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}))};s('reserveArrival','2026-11-20');s('reserveDeparture','2026-11-23');s('reserveChildren','1');document.querySelector('.reserve-step:not(.hidden) .reserve-next').click()})()"); await sleep(400); merge(await ev(COLETA),'reservar 2');
await ev("document.querySelectorAll('.choice').forEach(c=>c.click());document.querySelector('.reserve-step:not(.hidden) .reserve-next').click()"); await sleep(400); merge(await ev(COLETA),'reservar 3');
await ev("(()=>{const b=document.querySelector('.reserve-suite-choice');if(b)b.click();document.querySelector('.reserve-step:not(.hidden) .reserve-next').click()})()"); await sleep(400); merge(await ev(COLETA),'reservar 4');
const dock = await ev("CDL.goPage('home',{instant:true});new Promise(r=>setTimeout(()=>r([document.getElementById('dockTitle').textContent,document.getElementById('dockText').textContent,document.getElementById('dockDates').textContent,document.getElementById('dockGuests').textContent,document.getElementById('dockAction').textContent,CDL.omnibeesUrl(),decodeURIComponent(document.getElementById('openWhatsApp').href)]),600))");
console.log('barra de reserva / links:', JSON.stringify(dock,null,1));
console.log('\n=== restos de português: '+all.size+' ===');
[...all.entries()].forEach(([t,o])=>console.log(`[${o}] ${t}`));
ws.close();p.kill();
