// Confere que o site em inglês se comporta igual ao português: node tools/i18n-teste.mjs [base=http://localhost:5173]
// Roda as mesmas ações nas duas versões e compara o resultado (contagens, links, janelas) + checa idioma, seletor PT/EN e erros de JS.
import { spawn } from 'node:child_process';
const base = process.argv[2] || 'http://localhost:5173';
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function sessao(url){
  const port=9400+Math.floor(Math.random()*400);
  const p=spawn(chrome,['--headless=new','--disable-gpu','--no-first-run',`--user-data-dir=${(process.env.TEMP||'.')}/cdl-i18t-${port}`,`--remote-debugging-port=${port}`,'--window-size=1440,900','about:blank'],{stdio:'ignore'});
  let target; for(let i=0;i<60;i++){await sleep(300);try{const l=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();target=l.find(t=>t.type==='page');if(target)break;}catch{}}
  const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pend=new Map(); const erros=[];
  ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id);}else if(m.method==='Runtime.exceptionThrown'){erros.push(m.params.exceptionDetails.exception?.description?.split('\n')[0]||m.params.exceptionDetails.text);}};
  const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
  const ev=async js=>(await send('Runtime.evaluate',{expression:js,returnByValue:true,awaitPromise:true})).result?.result?.value;
  await send('Page.enable');await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url});await sleep(4500);await ev('document.fonts.ready.then(()=>1)');
  return {ev,erros,fim:()=>{ws.close();p.kill();}};
}
const ACOES = String.raw`(async()=>{ try{
  const sl=ms=>new Promise(r=>setTimeout(r,ms)); const R={};
  const vis=sel=>[...document.querySelectorAll(sel)].filter(e=>!e.classList.contains('hidden-by-filter')&&e.getBoundingClientRect().height>0).length;
  CDL.goPage('suites',{instant:true}); await sl(500);
  R.filtrosSuites=[]; for(const b of document.querySelectorAll('#page-suites .suite-filter')){ b.click(); await sl(120); R.filtrosSuites.push(vis('#page-suites .suite-card')); }
  document.querySelector('#page-suites .suite-filter').click();
  CDL.goPage('chapada',{instant:true}); await sl(500);
  R.filtrosChapada=[]; for(const b of document.querySelectorAll('#page-chapada [data-chapada-filter]')){ b.click(); await sl(120); R.filtrosChapada.push(vis('#page-chapada .chapada-card')); }
  document.querySelector('#page-chapada [data-chapada-filter]').click();
  R.atlasItens=0; CDL.openAtlas(); await sl(500); R.atlasItens=document.querySelectorAll('#atlasList button').length; R.atlasPinos=document.querySelectorAll('#atlasPins .map-pin').length; R.atlasNomes=[...document.querySelectorAll('#atlasList button')].map(b=>b.textContent.trim()); CDL.closeOverlays(); await sl(500);
  CDL.openSuite('presidencial'); await sl(500); R.modalSuite=[document.getElementById('suiteModalTitle').textContent, document.getElementById('suiteModalUnits').textContent, document.querySelectorAll('#suiteModalFeatures li').length]; CDL.closeOverlays(); await sl(500);
  CDL.goPage('suites',{instant:true}); await sl(300);
  document.querySelectorAll('#page-suites .compare-check').forEach((c,i)=>{ if(i<3) c.click(); }); document.getElementById('openCompare').click(); await sl(600);
  R.comparar=document.querySelectorAll('#compareOverlay table tr').length; CDL.closeOverlays(); await sl(400);
  const tabs=[];
  CDL.goPage('home',{instant:true}); await sl(400);
  const t0=document.getElementById('homeTimeTitle').textContent; document.querySelector('[data-time=night]').click(); await sl(200); tabs.push(t0!==document.getElementById('homeTimeTitle').textContent);
  document.querySelector('[data-profile=amigos]').click(); await sl(200); tabs.push(document.getElementById('profileTitle').textContent.length>5);
  CDL.goPage('experiencias',{instant:true}); await sl(400);
  const p0=document.getElementById('programTitle').textContent; document.querySelector('[data-program-day=sexta]').click(); await sl(200); tabs.push(p0!==document.getElementById('programTitle').textContent);
  CDL.goPage('viver',{instant:true}); await sl(400);
  const v0=document.getElementById('viverMomentTitle').textContent; document.querySelector('[data-viver-moment=night]').click(); await sl(200); tabs.push(v0!==document.getElementById('viverMomentTitle').textContent);
  CDL.goPage('eventos',{instant:true}); await sl(400);
  const e0=document.getElementById('eventTitle').textContent; document.querySelector('[data-event-type=retiro]').click(); await sl(200); tabs.push(e0!==document.getElementById('eventTitle').textContent);
  R.abas=tabs;
  CDL.goPage('reservar',{instant:true}); await sl(400);
  const s=(id,v)=>{const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}))};
  s('reserveArrival','2026-11-20'); s('reserveDeparture','2026-11-23'); s('reserveAdults','2'); s('reserveChildren','1'); s('reserveCode','CASA10');
  for(let i=0;i<3;i++) document.querySelector('.reserve-step:not(.hidden) .reserve-next').click();
  const u=new URL(document.getElementById('openOmnibees').href); R.omnibees=[u.searchParams.get('CheckIn'),u.searchParams.get('CheckOut'),u.searchParams.get('ad'),u.searchParams.get('ch'),u.searchParams.get('Code'),u.searchParams.get('lang')];
  R.whatsapp=new URL(document.getElementById('openWhatsApp').href).searchParams.get('text');
  R.resumo=document.getElementById('reserveSummary').innerText.replace(/\s+/g,' ');
  R.idioma=[document.documentElement.lang, document.querySelector('[data-lang-switch]').textContent, document.querySelector('[data-lang-switch]').getAttribute('href')];
  location.hash='casa'; R.hashOk=true;
  return R }catch(e){ return {erro:String(e&&e.stack||e)} } })()`;
const pt = await sessao(base+'/index.html?sem-movimento'); const R_PT = await pt.ev(ACOES); const err_pt = pt.erros; pt.fim();
const en = await sessao(base+'/en/index.html?sem-movimento'); const R_EN = await en.ev(ACOES); if(R_EN.erro) console.log('ERRO EN:',R_EN.erro); if(R_PT.erro) console.log('ERRO PT:',R_PT.erro); const err_en = en.erros; en.fim();
let falhas = 0; const ok = (nome, cond, det='') => { console.log((cond?'OK    ':'FALHA ')+nome+(det?'  -> '+det:'')); if(!cond) falhas++; };
ok('português: <html lang> pt e botão leva a en/', R_PT.idioma[0].startsWith('pt') && R_PT.idioma[1]==='EN' && R_PT.idioma[2]==='en/', JSON.stringify(R_PT.idioma));
ok('inglês: <html lang> en e botão PT leva a ../', R_EN.idioma[0]==='en' && R_EN.idioma[1]==='PT' && R_EN.idioma[2]==='../', JSON.stringify(R_EN.idioma));
ok('filtros das suítes dão as mesmas contagens', JSON.stringify(R_PT.filtrosSuites)===JSON.stringify(R_EN.filtrosSuites), JSON.stringify(R_PT.filtrosSuites)+' x '+JSON.stringify(R_EN.filtrosSuites));
ok('filtros da Chapada dão as mesmas contagens', JSON.stringify(R_PT.filtrosChapada)===JSON.stringify(R_EN.filtrosChapada), JSON.stringify(R_PT.filtrosChapada)+' x '+JSON.stringify(R_EN.filtrosChapada));
ok('Atlas: 9 itens e 9 pinos nas duas versões', R_EN.atlasItens===9 && R_EN.atlasPinos===9 && R_PT.atlasItens===9, R_EN.atlasNomes.join(' | '));
ok('janela da suíte abre com título, unidades e itens', R_EN.modalSuite[0]==='Presidential' && /unit/.test(R_EN.modalSuite[1]) && R_EN.modalSuite[2]===R_PT.modalSuite[2], JSON.stringify(R_EN.modalSuite));
ok('comparar suítes abre com a mesma tabela', R_EN.comparar===R_PT.comparar && R_EN.comparar>3, R_EN.comparar+' x '+R_PT.comparar);
ok('abas (horário, perfil, programação, momentos, formato) trocam o texto', R_EN.abas.every(Boolean) && R_PT.abas.every(Boolean), JSON.stringify(R_EN.abas));
ok('Omnibees: mesmas datas/hóspedes/código e lang=en-US só no inglês', JSON.stringify(R_EN.omnibees.slice(0,5))===JSON.stringify(R_PT.omnibees.slice(0,5)) && R_EN.omnibees[5]==='en-US' && R_PT.omnibees[5]===null, JSON.stringify(R_EN.omnibees));
ok('WhatsApp em inglês com datas e hóspedes', /^Hello/.test(R_EN.whatsapp) && /Arrival: Nov 20, 2026/.test(R_EN.whatsapp) && /2 adults · 1 child/.test(R_EN.whatsapp) && /CASA10/.test(R_EN.whatsapp), R_EN.whatsapp.replace(/\n/g,' / '));
ok('resumo da reserva em inglês', /Nov 20, 2026 to Nov 23, 2026/.test(R_EN.resumo) && /guests/.test(R_EN.resumo), R_EN.resumo);
ok('sem erros de JavaScript (pt e en)', err_pt.length===0 && err_en.length===0, [...err_pt,...err_en].join(' | '));
console.log(falhas ? `\n${falhas} falha(s)` : '\ntudo igual nas duas versões');
