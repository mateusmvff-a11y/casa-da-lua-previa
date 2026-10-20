/* =========================================================
   Casa da Lua — core.js
   Núcleo do site (portado do HTML de arquitetura V16):
   rotas por hash, sobreposições, aviso, barra de reserva,
   dados das suítes e delegação dos botões globais.
   Cada página registra o seu próprio código com CDL.ready(fn).
   ========================================================= */
(function(){
'use strict';

const $  = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

/* Imagens de apoio dos estados que o Figma não mostra (vieram do HTML V16).
   As imagens que aparecem no Figma ficam direto no HTML de cada página. */
const ASSETS = {
  hero:'assets/img/v16-hero.webp', pool:'assets/img/v16-pool.webp', aerial:'assets/img/v16-aerial.webp',
  suite:'assets/img/v16-suite.webp', outdoor:'assets/img/v16-outdoor.webp', events:'assets/img/v16-events.webp',
  chapada:'assets/img/v16-chapada.webp', breakfast:'assets/img/v16-breakfast.webp', night:'assets/img/v16-night.webp',
  dinner:'assets/img/v16-dinner.webp', wellness:'assets/img/v16-wellness.webp', fire:'assets/img/v16-fire.webp'
};

/* As 8 categorias (15 suítes) — dados do HTML V16 */
const SUITES = [
  {id:'standard',name:'Standard',units:2,area:'22 m²',guests:2,beds:'1 cama queen size',location:'Área externa, térreo',access:'Sem escadas relevantes',view:'Sem vista definida',outdoor:'Varanda com rede e mesa para duas pessoas',features:['Chuveiro com cromoterapia','TV Smart 32” com SKY','Frigobar','Ar-condicionado','Wi-Fi','Água da casa'],tags:['térreo','2 hóspedes','varanda']},
  {id:'luxo',name:'Luxo',units:3,area:'30 m²',guests:3,beds:'1 cama queen size + 1 cama de solteiro',location:'Casa principal, 1º andar',access:'Dois lances de escada',view:'Sem vista definida',outdoor:'Sem varanda',features:['Chuveiro com cromoterapia','TV Smart 32” com SKY','Frigobar','Ar-condicionado','Wi-Fi','Água da casa'],tags:['3 hóspedes','casa principal']},
  {id:'luxo-superior',name:'Luxo Superior',units:5,area:'22 m²',guests:2,beds:'1 cama queen size',location:'Área externa',access:'Escada de cinco degraus',view:'Jardim ou piscina',outdoor:'Varanda com balanço ou chaise e mesa para duas pessoas',features:['Chuveiro com cromoterapia','TV Smart 43” com SKY','Chaleira com chás','Frigobar','Ar-condicionado','Wi-Fi'],tags:['2 hóspedes','vista','varanda']},
  {id:'premium',name:'Premium',units:1,area:'30 m²',guests:3,beds:'1 cama queen size',location:'Área externa, 1º andar',access:'Dois lances de escada',view:'Sem vista definida',outdoor:'Varanda com rede e mesa para duas pessoas',features:['Sala de estar','Chuveiro com cromoterapia','TV Smart 43” com SKY','Chaleira com chás','Frigobar','Ar-condicionado'],tags:['3 hóspedes','sala','varanda']},
  {id:'premium-hidro',name:'Premium Hidro',units:1,area:'28 m²',guests:3,beds:'1 cama queen size',location:'Área externa, térreo',access:'Térreo',view:'Sem vista definida',outdoor:'Varanda com rede e mesa para duas pessoas',features:['Hidromassagem simples','Sala de estar','Roupão','TV Smart 43” com SKY','Cafeteira','Amenities diferenciados'],tags:['3 hóspedes','térreo','hidro','sala']},
  {id:'premium-ofuro',name:'Premium Ofurô',units:1,area:'28 m²',guests:2,beds:'1 cama king size',location:'Casa principal, cobertura',access:'Quatro lances de escada',view:'Vista da cobertura',outdoor:'Varanda na cobertura com ofurô e mesa para duas pessoas',features:['Ofurô','Roupão','TV Smart 49” com SKY','Cafeteira','Amenities diferenciados','Chuveiro com cromoterapia'],tags:['2 hóspedes','ofurô','vista']},
  {id:'master',name:'Master',units:1,area:'28 m²',guests:4,beds:'1 cama king size + 2 camas de solteiro',location:'Área externa',access:'Escada de cinco degraus',view:'Jardim',outdoor:'Varanda com balanço e mesa para até quatro pessoas',features:['Hidromassagem dupla','Roupão','TV Smart 49” com SKY','Cafeteira','Amenities diferenciados','Chuveiro com cromoterapia'],tags:['4 hóspedes','hidro','jardim','família']},
  {id:'presidencial',name:'Presidencial',units:1,area:'63 m²',guests:4,beds:'1 cama king size + 2 camas de solteiro, em dois quartos',location:'Casa principal, 1º andar',access:'Dois lances de escada',view:'Mezanino com vista panorâmica para o jardim',outdoor:'Varanda com balanço ou chaise e mesa para até quatro pessoas',features:['Dois quartos','Mezanino','Hidromassagem dupla','Sauna','Roupão','TV Smart 49” com SKY'],tags:['4 hóspedes','2 quartos','hidro','sauna','família']}
];

/* Barra de reserva por página (V16 updateBookingDock). Páginas podem estender CDL.dock. */
const DOCK = {
  _default:{title:'Planeje a estadia',text:'Datas, hóspedes e categorias',action:'Consultar',dates:'Datas',guests:'Hóspedes'},
  eventos:{title:'Planejando um encontro?',text:'Formato, período e número de pessoas',action:'Solicitar proposta',dates:'Formato',guests:'Pessoas'},
  experiencias:{title:'Quer receber as próximas datas?',text:'A Experiência Tidelli abre em edições',action:'Quero receber',dates:'Próximas datas',guests:'Contato'}
};

/* Programação da Experiência Tidelli (usada na Home e na página Experiências) — HTML V16 */
const PROGRAM_DATA = {
  quinta:{asset:'outdoor',eyebrow:'Chegada e boas-vindas',title:'Do universo Tidelli à Casa da Lua.',text:'Chegada, deslocamento para Alto Paraíso, check-in e um jantar para abrir a experiência em grupo.',schedule:[['chegada','Recepção e início do percurso.'],['tarde','Deslocamento e check-in na Casa da Lua.'],['noite','Jantar de boas-vindas.']]},
  sexta:{asset:'chapada',eyebrow:'Natureza e conexão',title:'O dia sai da casa e volta para o fogo.',text:'Yoga, café da manhã, natureza, almoço especial, retorno à pousada, jantar e convivência.',schedule:[['manhã','Yoga, café e saída para a natureza.'],['dia','Cachoeira e almoço especial ao ar livre.'],['noite','Retorno, jantar e fogueira.']]},
  sabado:{asset:'wellness',eyebrow:'Bem-estar e contemplação',title:'Um dia com mais espaço entre uma coisa e outra.',text:'Yoga, café, sauna, massoterapia, hidromassagem, almoço junto à piscina e pôr do sol.',schedule:[['manhã','Yoga, café e bem-estar.'],['tarde','Almoço à beira da piscina e descanso.'],['fim de tarde','Pôr do sol em Alto Paraíso.']]},
  domingo:{asset:'breakfast',eyebrow:'Despedida',title:'Café, check-out e volta para casa.',text:'A manhã encerra a experiência com café da manhã e organização do retorno.',schedule:[['manhã','Café da manhã.'],['saída','Check-out.'],['retorno','Deslocamento para Brasília.']]}
};

/* Contatos e canais da pousada — copiados do site oficial (casadaluapousada.com.br) em 20/10/2026 */
const CONTACT = {
  whatsapp:'5562998329198', whatsappLabel:'+55 (62) 99832-9198',
  phone:'5562999089605', phoneLabel:'+55 (62) 99908-9605',
  email:'contato@casadaluapousada.com.br',
  instagram:'https://www.instagram.com/casadaluapousada.oficial',
  facebook:'https://www.facebook.com/casadaluapousada',
  maps:'https://goo.gl/maps/GvnS4RvAsLX63L2u5',
  address:'Rua do Segredo, 278 · Alto Paraíso de Goiás · CEP 73770-000'
};
/* Motor de reservas (Omnibees, hotel 10264): é o mesmo contrato da barra do site oficial —
   hotelresults?q=10264&CheckIn=ddMMyyyy&CheckOut=ddMMyyyy&Code=<promo>&NRooms=<quartos>&ad=<adultos>&ch=<crianças> */
const OMNIBEES = {hotel:'10264', results:'https://book.omnibees.com/hotelresults', page:'https://book.omnibees.com/hotel/10264&lang=pt-BR'};
const booking = {arrival:'', departure:'', adults:2, children:0, code:''};
const ddMMyyyy = iso => iso ? iso.split('-').reverse().join('') : '';
/* idioma da página (<html lang>): o site em inglês é gerado pelo build em /en/ com o mesmo código */
const LANG = (document.documentElement.getAttribute('lang') || 'pt').slice(0,2);
/* texto que só se conhece em tempo de execução (plurais, datas, mensagens): CDL.t('chave {n}',{n:3}); em português devolve a própria chave */
const t = (k, v) => {
  let s = (window.CDL_I18N && window.CDL_I18N[k]) || k;
  if(v) for(const x in v) s = s.split('{'+x+'}').join(v[x]);
  return s;
};
const fmtDate = iso => {
  if(!iso) return '';
  if(LANG === 'en') return new Date(iso+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  return iso.split('-').reverse().join('/');
};
const shortDate = iso => {
  if(!iso) return '';
  if(LANG === 'en') return new Date(iso+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'});
  return iso.split('-').reverse().slice(0,2).join('/');
};
function bookingRooms(b){ const total = (Number(b.adults)||0) + (Number(b.children)||0); return Math.max(1, Math.ceil(total/4)); }
function omnibeesUrl(b){
  b = b || booking;
  const q = new URLSearchParams(); q.set('q',OMNIBEES.hotel);
  if(b.arrival) q.set('CheckIn',ddMMyyyy(b.arrival));
  if(b.departure) q.set('CheckOut',ddMMyyyy(b.departure));
  if(b.code) q.set('Code',String(b.code).trim());
  q.set('NRooms',String(bookingRooms(b))); q.set('ad',String(b.adults||1)); q.set('ch',String(b.children||0));
  if(LANG === 'en') q.set('lang','en-US');      /* o motor abre em inglês quando a pessoa reserva pela versão em inglês */
  return OMNIBEES.results + '?' + q.toString();
}
function whatsappUrl(text){ return 'https://api.whatsapp.com/send?phone=' + CONTACT.whatsapp + (text ? '&text=' + encodeURIComponent(text) : ''); }
function bookingGuestsLabel(b){
  const a = Number(b.adults)||0, ch = Number(b.children)||0;
  return a + t(a===1?' adulto':' adultos') + (ch ? ' · ' + ch + t(ch===1?' criança':' crianças') : '');
}

const state = {page:'home', ready:[], pageHooks:{}, started:false, busy:false};

function ready(fn){ state.ready.push(fn); }
function onPage(page, fn){ (state.pageHooks[page] ||= []).push(fn); }

function showToast(message){
  const toast = $('#toast'); if(!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=>toast.classList.remove('show'),2200);
}
function openOverlay(id){
  const el = document.getElementById(id); if(!el) return;
  el.classList.remove('closing');
  el.classList.add('open'); el.setAttribute('aria-hidden','false');
  document.body.classList.add('no-scroll');
  document.dispatchEvent(new CustomEvent('cdl:overlay',{detail:{id,el,open:true}}));
}
function closeOverlays(){
  /* motion.js define CDL.overlayOut(el,done) para animar a saída; sem ele, fecha direto */
  $$('.overlay.open').forEach(el=>{
    if(el.classList.contains('closing')) return;
    const done = ()=>{ el.classList.remove('open','closing'); el.setAttribute('aria-hidden','true'); };
    if(CDL.overlayOut){ el.classList.add('closing'); CDL.overlayOut(el,done); } else done();
  });
  document.body.classList.remove('no-scroll');
}
function headerH(){ return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 76; }
function scrollToId(id){
  const el = document.getElementById(id); if(!el) return;
  if(CDL.lenis) CDL.lenis.scrollTo(el,{offset:-headerH(),duration:1.7,easing:t=>t===1?1:1-Math.pow(2,-10*t)});
  else window.scrollTo({top:el.getBoundingClientRect().top+window.scrollY-headerH(),behavior:'smooth'});
}
function scrollTop(instant){
  if(CDL.lenis) CDL.lenis.scrollTo(0,{immediate:!!instant,duration:1.1});
  else window.scrollTo({top:0,behavior:instant?'auto':'smooth'});
}
function updateBookingDock(){
  const dock = $('#bookingDock'); if(!dock) return;
  if(state.page==='reservar'){ dock.classList.add('hidden'); return; }
  dock.classList.remove('hidden');
  const d = DOCK[state.page] || DOCK._default;
  const set = (id,v)=>{ const e=document.getElementById(id); if(e) e.textContent = v; };
  set('dockTitle',d.title); set('dockText',d.text); set('dockAction',d.action);
  set('dockDates',d.dates||DOCK._default.dates); set('dockGuests',d.guests||DOCK._default.guests);
  /* datas e hóspedes já informados na página Reservar seguem para a barra e, dali, para o Omnibees */
  if(d===DOCK._default && booking.arrival && booking.departure){
    set('dockTitle','Sua estadia'); set('dockText','Datas e hóspedes já informados');
    set('dockDates',shortDate(booking.arrival)+' → '+shortDate(booking.departure)); set('dockGuests',bookingGuestsLabel(booking));
    set('dockAction','Ver disponibilidade');
  }
}
function goPage(page, opts={}){
  if(!document.querySelector(`.page[data-page="${page}"]`)) page = 'home';
  if(state.busy) return;
  /* mesma página: só volta ao topo (com suavidade) */
  if(page === state.page && state.started && !opts.force){ closeOverlays(); if(opts.anchor) scrollToId(opts.anchor); else scrollTop(false); return; }
  /* motion.js define CDL.transition(page, executa): cortina entre páginas */
  if(CDL.transition && state.started && !opts.instant){
    state.busy = true;
    CDL.transition(page, ()=>{ switchPage(page,opts); }, ()=>{ state.busy = false; });
    return;
  }
  switchPage(page,opts);
}
function switchPage(page, opts={}){
  const prev = state.page;
  state.started = true;
  state.page = page;
  $$('.page').forEach(p=>p.classList.toggle('active',p.dataset.page===page));
  $$('.nav-link').forEach(n=>n.classList.toggle('active',n.dataset.pageTarget===page));
  history.replaceState(null,'',`#${page}`);
  closeOverlays();
  updateBookingDock();
  (state.pageHooks[page]||[]).forEach(fn=>fn());
  document.dispatchEvent(new CustomEvent('cdl:page',{detail:{page,prev}}));
  if(opts.anchor){
    /* abre a página já no bloco pedido (data-anchor="id"): salto imediato, com o mesmo recuo do cabeçalho */
    const el = document.getElementById(opts.anchor);
    if(el){
      const y = el.getBoundingClientRect().top + window.scrollY - headerH();
      if(CDL.lenis) CDL.lenis.scrollTo(Math.max(0,y),{immediate:true,force:true}); else window.scrollTo(0,Math.max(0,y));
      return;
    }
  }
  if(!opts.keepScroll) scrollTop(opts.instant || !!CDL.transition);
}

/* API pública para os scripts das páginas e das sobreposições */
const CDL = window.CDL = {
  $, $$, ASSETS, SUITES, PROGRAM_DATA, DOCK, state, ready, onPage,
  CONTACT, OMNIBEES, booking, omnibeesUrl, whatsappUrl, bookingGuestsLabel, shortDate, fmtDate, t, LANG,
  showToast, openOverlay, closeOverlays, scrollToId, scrollTop, goPage, updateBookingDock, lenis:null,
  openSuite:null, openAtlas:null, openJourney:null, openCompare:null /* preenchidos por overlays.js */
};
Object.defineProperty(CDL,'currentPage',{get:()=>state.page});

/* Delegação dos botões globais — funciona mesmo que a página não tenha todos os elementos */
document.addEventListener('click',e=>{
  const t = e.target;
  const ls = t.closest('[data-lang-switch]');
  if(ls){ e.preventDefault(); location.href = ls.getAttribute('href') + location.hash; return; }   /* troca de idioma mantendo a seção em que a pessoa está */
  const pageLink = t.closest('[data-page-target]');
  if(pageLink){ e.preventDefault(); goPage(pageLink.dataset.pageTarget,{anchor:pageLink.dataset.anchor}); return; }
  if(t.closest('.close-overlay')){ closeOverlays(); return; }
  const scroll = t.closest('[data-scroll-to]');
  if(scroll){ scrollToId(scroll.dataset.scrollTo); return; }
  if(t.closest('.atlas-open')){ CDL.openAtlas ? CDL.openAtlas() : openOverlay('atlasOverlay'); return; }
  if(t.closest('.journey-open')){ CDL.openJourney ? CDL.openJourney() : openOverlay('journeyOverlay'); return; }
  if(t.closest('.privacy-open')){ openOverlay('privacyOverlay'); return; }
  if(t.closest('.interest-open')){ openOverlay('interestOverlay'); return; }
  if(t.closest('.proposal-open')){ goPage('eventos'); setTimeout(()=>scrollToId('eventFormats'),350); return; }
  const suiteBtn = t.closest('.suite-detail-btn');
  if(suiteBtn){ CDL.openSuite && CDL.openSuite(suiteBtn.dataset.suite); return; }
  if(t.closest('#mobileMenuBtn')){ openOverlay('mobileNavOverlay'); return; }
  if(t.closest('#dockAction')){
    if(state.page==='eventos') scrollToId('eventFormats');
    else if(state.page==='experiencias') openOverlay('interestOverlay');
    else if(booking.arrival && booking.departure) window.open(omnibeesUrl(),'_blank','noopener');
    else goPage('reservar');
    return;
  }
  if(t.classList && t.classList.contains('overlay')) closeOverlays();
});
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeOverlays(); });
/* Não há servidor de formulários: o pedido vai para o WhatsApp da pousada com tudo o que a pessoa preencheu */
document.addEventListener('submit',e=>{
  const form = e.target.closest('.interest-form,.proposal-form'); if(!form) return;
  e.preventDefault();
  const rows = [...form.querySelectorAll('.field')].map(f=>{
    const lab = f.querySelector('label'), inp = f.querySelector('input,select,textarea');
    return lab && inp && String(inp.value||'').trim() ? [lab.textContent.trim(), String(inp.value).trim()] : null;
  }).filter(Boolean);
  const isProposal = form.classList.contains('proposal-form');
  const contact = rows.find(r=>/contato|whatsapp/i.test(r[0]));
  if(!isProposal && !contact){ showToast('Informe um contato para receber as datas.'); return; }
  if(isProposal && !rows.length){ showToast('Conte um pouco sobre o encontro para enviarmos o pedido.'); return; }
  const head = isProposal ? 'Olá, gostaria de solicitar uma proposta para um evento na Casa da Lua.' : 'Olá, gostaria de receber as próximas datas da Experiência Tidelli.';
  const text = head + '\n' + rows.map(r=>r[0]+': '+r[1]).join('\n');
  window.open(whatsappUrl(text),'_blank','noopener');
  showToast('Abrindo o WhatsApp da pousada com os seus dados.');
  closeOverlays();
});
window.addEventListener('hashchange',()=>{
  const p = location.hash.replace('#','');
  if(p==='privacidade'){ openOverlay('privacyOverlay'); return; }
  if(p && p!==state.page) goPage(p,{instant:true});
});

document.addEventListener('DOMContentLoaded',()=>{
  state.ready.forEach(fn=>fn());
  const hash = location.hash.replace('#','');
  if(hash==='privacidade'){ goPage('home',{instant:true,force:true}); state.started = true; openOverlay('privacyOverlay'); return; }
  if(hash) goPage(hash,{instant:true}); else goPage('home',{instant:true,force:true});
  state.started = true;
});
})();


/* =========================================================
   Casa da Lua — typo.js
   Sem viúvas: títulos nunca terminam com uma palavra sozinha na última linha (as 2 últimas palavras ficam juntas
   e o CSS equilibra as linhas) e textos corridos terminam com pelo menos 3 palavras na última linha.
   Funciona por espaço inseparável (nbsp) entre as últimas palavras; roda ao abrir cada página, ao redimensionar
   e quando o texto muda (abas, filtros, sobreposições). Não altera o conteúdo lido (nbsp conta como espaço).
   Revisão 20/10: textos corridos de até 6 linhas NÃO recebem nbsp quando o navegador equilibra as linhas
   (text-wrap:balance): o nbsp atrapalhava o equilíbrio e deixava linhas de tamanhos muito diferentes.
   Só os textos mais longos (7+ linhas, que o navegador não equilibra) usam a regra das 3 últimas palavras.
   ========================================================= */
(function(){
'use strict';
if(!window.CDL) return;
const NBSP = String.fromCharCode(160);   // espaço inseparável (U+00A0)
const TITLE = 'h1,h2,h3,h4,.title,.display,.subtitle';
const BODY  = 'p,li,.lead,.small,figcaption,blockquote,.kicker';
const SEL   = TITLE + ',' + BODY;
const SKIP  = 'script,style,button,.btn,.ghost-btn,.chip,.tag-row,input,textarea,select,label,table,th,td,.curtain,[data-nowidow]';
const isSpace = c => c === ' ' || c === '\n' || c === '\t' || c === '\r';
const CAN_BALANCE = !!(window.CSS && CSS.supports && CSS.supports('text-wrap','balance'));

function textNodes(el){
  const out = [];
  const w = document.createTreeWalker(el,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement && n.parentElement.closest('script,style') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT});
  let t; while((t = w.nextNode())) if(t.nodeValue.trim()) out.push(t);
  const brs = el.querySelectorAll('br');
  if(brs.length){ const last = brs[brs.length-1]; return out.filter(n=>last.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING); }  // só o trecho depois da última quebra
  return out;
}
/* quantas linhas o texto ocupa agora (0 = escondido) */
function lineCount(el){
  const r = el.getBoundingClientRect(); if(!r.height) return 0;
  const cs = getComputedStyle(el); const lh = parseFloat(cs.lineHeight) || (parseFloat(cs.fontSize) * 1.4);
  return Math.round((r.height - (parseFloat(cs.paddingTop)||0) - (parseFloat(cs.paddingBottom)||0)) / lh);
}
/* desfaz o que esta função prendeu (só os espaços que ela trocou; nbsp escrito no HTML fica) */
function unbind(el){
  if(!el.__bound) return;
  el.__bound.forEach(b=>{ const s = b.node.nodeValue; if(s[b.idx] === NBSP) b.node.nodeValue = s.slice(0,b.idx) + b.orig + s.slice(b.idx+1); });
  el.__bound = null;
}
/* larguras de cada linha do texto (para medir o equilíbrio) */
function lineWidths(el){
  const w = document.createTreeWalker(el,NodeFilter.SHOW_TEXT); let t; const L = [];
  while((t = w.nextNode())){
    const re = /\S+/g; let m;
    while((m = re.exec(t.nodeValue))){
      const r = document.createRange(); r.setStart(t,m.index); r.setEnd(t,m.index+m[0].length);
      for(const b of r.getClientRects()){
        if(!b.width) continue;
        const ln = L.find(x=>Math.abs(x.y-b.top) < 10);
        if(ln){ ln.l = Math.min(ln.l,b.left); ln.r = Math.max(ln.r,b.right); } else L.push({y:b.top,l:b.left,r:b.right});
      }
    }
  }
  return L.map(x=>x.r-x.l);
}
/* o equilíbrio nativo (text-wrap:balance) às vezes deixa uma linha bem menor que a outra: se a razão
   menor/maior ficar abaixo de .8, procura a MENOR largura que mantém o mesmo número de linhas (max-width)
   e fica com ela só se melhorar de verdade */
const refined = new Set();
function refine(el){
  const cs = getComputedStyle(el); if(/center|right|end/.test(cs.textAlign)) return;
  const w0 = lineWidths(el); if(w0.length < 2 || w0.length > 6) return;
  const q0 = Math.min(...w0) / Math.max(...w0); if(q0 >= .8) return;
  const full = el.getBoundingClientRect().width, n = w0.length;
  const prevMW = el.style.maxWidth, prevTW = el.style.textWrap;
  el.style.textWrap = 'wrap';
  let lo = Math.floor(full * .45), hi = Math.ceil(full);
  while(hi - lo > 2){ const mid = (lo + hi) >> 1; el.style.maxWidth = mid + 'px'; if(lineWidths(el).length <= n) hi = mid; else lo = mid; }
  el.style.maxWidth = hi + 'px';
  const w1 = lineWidths(el); const q1 = w1.length === n ? Math.min(...w1) / Math.max(...w1) : 0;
  if(q1 > q0 + .02) refined.add(el); else { el.style.maxWidth = prevMW; el.style.textWrap = prevTW; }
}
function resetRefined(){ refined.forEach(e=>{ e.style.maxWidth = ''; e.style.textWrap = ''; e.__wd = null; }); refined.clear(); }

/* palavras com hífen que não podem quebrar no meio ("check-/in"): ganham um <span class=nb> (white-space:nowrap) */
const NOBREAK = /(check-in|check-out)/gi;
function noBreak(el){
  if(!NOBREAK.test(el.textContent)){ NOBREAK.lastIndex = 0; return; }
  NOBREAK.lastIndex = 0;
  const w = document.createTreeWalker(el,NodeFilter.SHOW_TEXT); const list = []; let t;
  while((t = w.nextNode())) if(!t.parentElement.closest('.nb') && /check-(in|out)/i.test(t.nodeValue)) list.push(t);
  list.forEach(node=>{
    const m = node.nodeValue.match(/check-(in|out)/i); if(!m) return;
    const r = document.createRange(); r.setStart(node,m.index); r.setEnd(node,m.index+m[0].length);
    const s = document.createElement('span'); s.className = 'nb'; r.surroundContents(s);
  });
}
function fix(el){
  if(!el || el.nodeType !== 1 || el.closest(SKIP)) return;
  if(!el.__nbDone || el.__nbDone !== el.textContent){ noBreak(el); el.__nbDone = el.textContent; }
  const isTitle = el.matches(TITLE);
  const w = el.clientWidth;
  if(el.__wd === el.textContent && el.__wdw === w) return;
  const mark = ()=>{ el.__wd = el.textContent; el.__wdw = w; };
  /* texto corrido que o navegador equilibra (até 6 linhas): sem nbsp */
  if(!isTitle && CAN_BALANCE){
    const n = lineCount(el);
    if(n === 0) return;                           // escondido (outra página): roda de novo quando abrir
    if(n <= 6){ unbind(el); mark(); refine(el); if(refined.has(el)) el.__wdw = el.clientWidth; return; }
  }
  if(el.__bound){ mark(); return; }               // já preso e continua longo
  const nodes = textNodes(el); if(!nodes.length){ mark(); return; }
  const words = nodes.map(n=>n.nodeValue).join(' ').trim().split(/\s+/).length;
  const n = isTitle ? 1 : 2;                       // espaços a prender: título = 2 palavras juntas; texto = 3
  if(words < (isTitle ? 3 : 5)){ mark(); return; }
  let left = n; const bound = [];
  for(let i = nodes.length-1; i >= 0 && left > 0; i--){
    let s = nodes[i].nodeValue; let end = s.length;
    if(i === nodes.length-1) while(end > 0 && /\s/.test(s[end-1])) end--;   // espaços do fim do texto não contam
    let k = end;
    while(k > 0 && left > 0){ k--; if(isSpace(s[k])){ bound.push({node:nodes[i],idx:k,orig:s[k] === NBSP ? ' ' : s[k]}); s = s.slice(0,k) + NBSP + s.slice(k+1); left--; } }
    nodes[i].nodeValue = s;
  }
  el.__bound = bound;
  mark();
}
function run(root){ (root || document).querySelectorAll(SEL).forEach(fix); }
window.CDL.widow = fix; window.CDL.widowAll = run;

window.CDL.ready(()=>{
  run(document);
  let rzt; window.addEventListener('resize',()=>{ clearTimeout(rzt); rzt = setTimeout(()=>{ resetRefined(); run(document.querySelector('.page.active')); },250); });
  let pend = new Set(), tm = null;
  const flush = ()=>{ tm = null; const s = pend; pend = new Set(); s.forEach(e=>{ if(e.isConnected) fix(e); }); };
  const mo = new MutationObserver(ms=>{
    ms.forEach(m=>{
      const add = e=>{ const b = e.closest ? e.closest(SEL) : null; if(b) pend.add(b); };
      if(m.type === 'characterData' && m.target.parentElement) add(m.target.parentElement);
      m.addedNodes.forEach(nd=>{ if(nd.nodeType === 1){ if(nd.matches && nd.matches(SEL)) pend.add(nd); if(nd.querySelectorAll) nd.querySelectorAll(SEL).forEach(x=>pend.add(x)); add(nd); } else if(nd.parentElement) add(nd.parentElement); });
    });
    if(!tm) tm = setTimeout(flush,60);
  });
  mo.observe(document.body,{childList:true,subtree:true,characterData:true});
});
document.addEventListener('cdl:page',()=>window.CDL.widowAll(document.querySelector('.page.active')));
})();


/* =========================================================
   Casa da Lua — Home
   Perfis, horário do dia, Atlas em miniatura e programa da
   Experiência Tidelli. Dados do HTML V16 (textos do Figma onde
   o Figma mostra o estado padrão).
   Botões globais (suites, atlas, jornada, interesse, proposta)
   são tratados pela delegação do core.js.
   ========================================================= */
CDL.ready(()=>{
  const root = document.getElementById('page-home');
  if(!root) return;
  const $  = (s,r=root)=>r.querySelector(s);
  const $$ = (s,r=root)=>[...r.querySelectorAll(s)];
  const A  = (CDL.ASSETS)||{};
  /* o Figma não usa ponto final em títulos e textos: tira o ponto dos textos do V16 */
  const np = s=>String(s).replace(/\.$/,'');
  const setText = (id,v)=>{ const e=document.getElementById(id); if(e) e.textContent=v; };

  /* ---- Perfis de viagem (V16 PROFILES) ---- */
  const PROFILES = {
    familia:{title:'Uma estadia em que a casa inteira participa',text:'Comece pelas suítes Master, Presidencial ou Luxo e veja como elas se relacionam com piscina, café e jardim',cta:'Ver opções',page:'suites'},
    amigos:{title:'Espaço para ficar junto sem perder privacidade',text:'As categorias para três ou quatro pessoas, o jardim, o bilhar e a noite na casa ajudam a organizar a viagem em grupo',cta:'Ver suítes',page:'suites'},
    pet:{title:'O lado de fora ganha ainda mais importância',text:'Jardim, caminhos e suítes externas ajudam a organizar a estadia. A equipe confirma a categoria e as condições mais adequadas para cada pet',cta:'Planejar estadia',page:'reservar'},
    encontro:{title:'Hospedagem, áreas externas e salão na mesma propriedade',text:'Casamentos, celebrações, retiros e imersões seguem um caminho próprio de proposta',cta:'Ver eventos',page:'eventos'}
  };
  function setProfile(key){
    const d = PROFILES[key]; if(!d) return;
    $$('.profile-card').forEach(b=>{
      const on = b.dataset.profile===key;
      b.classList.toggle('active',on); b.setAttribute('aria-selected',on?'true':'false');
    });
    setText('profileTitle',d.title);
    setText('profileText',d.text);
    const cta = document.getElementById('profileCTA');
    if(cta){ cta.textContent=d.cta; cta.dataset.pageTarget=d.page; }
  }
  $$('.profile-card').forEach(b=>b.addEventListener('click',()=>setProfile(b.dataset.profile)));

  /* ---- A casa muda com o dia (V16 TIME_DATA; manhã = imagem do Figma) ---- */
  const TIME = {
    morning:{img:'assets/img/5f9ce3.webp',alt:'Café da manhã na Casa da Lua',kicker:'Manhã',title:'Café no jardim',text:'A mesa é parte da casa. O café da manhã está incluído e é servido das 7h30 às 10h30'},
    afternoon:{img:A.pool||'assets/img/v16-pool.webp',alt:'Piscina da Casa da Lua no fim da tarde',kicker:'Fim de tarde',title:'A volta da Chapada desacelera na água.',text:'Piscina, jacuzzi, spa e massagem prolongam o dia sem pedir outro deslocamento.'},
    night:{img:'assets/img/rev-home-21h.webp',alt:'Casa da Lua acesa à noite',kicker:'Noite',title:'A casa acende e ganha outro silêncio.',text:'Fogo, cinema, bilhar e mesa entram como possibilidades para ficar mais um pouco.'}
  };
  function setHomeTime(key){
    const d = TIME[key]; if(!d) return;
    $$('.time-tab').forEach(b=>{
      const on = b.dataset.time===key;
      b.classList.toggle('active',on); b.setAttribute('aria-selected',on?'true':'false');
    });
    const img = document.getElementById('homeTimeImage');
    if(img){ img.src=d.img; img.alt=d.alt; }
    setText('homeTimeKicker',d.kicker);
    setText('homeTimeTitle',np(d.title));
    setText('homeTimeText',np(d.text));
  }
  $$('.time-tab').forEach(b=>b.addEventListener('click',()=>setHomeTime(b.dataset.time)));

  /* ---- Atlas em miniatura: 9 pinos (posições no HTML, em % da imagem do mapa).
     Textos locais (não dependem de CDL.ATLAS_PLACES); o pino ainda chama CDL.selectHomeAtlas para o destaque ---- */
  /* nomes e textos vêm de CDL.ATLAS_PLACES (a mesma fonte do A Casa e da janela do Atlas) */
  $$('.atlas-home-card .map-pin').forEach(b=>b.addEventListener('click',()=>{
    const place = b.dataset.place;
    if(typeof CDL.selectHomeAtlas==='function') CDL.selectHomeAtlas(place);
    $$('.atlas-home-card .map-pin').forEach(p=>p.classList.toggle('active',p===b));
    const d = (CDL.ATLAS_PLACES||{})[place];
    setText('homeAtlasTitle',place);
    setText('homeAtlasText',d ? np(d.text) : '');
  }));

  /* ---- Experiência Tidelli: a foto fica fixa; os botões de dia trocam só o texto ---- */
  function setHomeExperienceDay(day){
    const P = CDL.PROGRAM_DATA||{}; const d = P[day]; if(!d) return;
    $$('#homeExperienceDays button').forEach(b=>b.classList.toggle('active',b.dataset.expDay===day));
    setText('homeExpText',np(d.text));
  }
  $$('#homeExperienceDays button').forEach(b=>b.addEventListener('click',()=>setHomeExperienceDay(b.dataset.expDay)));
});

/* Atalhos da Home: destaca o capítulo visível (V16 linhas 2297-2304) */
CDL.ready(()=>{
  const root = document.getElementById('page-home'); if(!root || !('IntersectionObserver' in window)) return;
  const buttons = [...root.querySelectorAll('[data-home-anchor]')];
  if(!buttons.length) return;
  const io = new IntersectionObserver(entries=>{
    const v = entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!v) return;
    buttons.forEach(b=>b.classList.toggle('active',b.dataset.homeAnchor===v.target.id));
  },{rootMargin:'-38% 0px -48% 0px',threshold:[0,.15,.4]});
  root.querySelectorAll('.home-chapter').forEach(s=>io.observe(s));
});

/* Barra de atalhos: transparente no meio dos blocos; só aparece quando uma fronteira entre dois blocos
   passa pela zona da barra (±90 px). Só opacity/visibility (sem custo de GPU), 1 leitura por quadro. */
CDL.ready(()=>{
  const root = document.getElementById('page-home'); if(!root) return;
  const nav = root.querySelector('.home-chapter-nav'); if(!nav) return;
  const heads = [...root.querySelectorAll('.home-chapter,.home-practical')];   /* topo de cada bloco = fronteira com o anterior */
  const ZONE = 90;
  let ticking = false;
  function update(){
    ticking = false;
    if(!root.classList.contains('active')) return;
    const barY = nav.getBoundingClientRect().top;          /* centro da barra (ela sobe 50% da altura) */
    let on = false;
    for(const s of heads){ if(Math.abs(s.getBoundingClientRect().top - barY) <= ZONE){ on = true; break; } }
    nav.classList.toggle('is-on', on);
  }
  function req(){ if(!ticking){ ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', req, {passive:true});
  window.addEventListener('resize', req);
  CDL.onPage('home', ()=>setTimeout(req,50));
  req();
});


/* Página A Casa — pinos do Atlas em miniatura (9 ambientes; texto próprio, sem depender dos 10 itens de CDL.ATLAS_PLACES) */
CDL.ready(()=>{
  const root = document.getElementById('page-casa');
  if(!root) return;
  const pins = [...root.querySelectorAll('.atlas-teaser .map-pin')];
  const title = root.querySelector('#casaAtlasTitle');
  const text = root.querySelector('#casaAtlasText');
  if(!pins.length) return;
  /* nomes e textos vêm de CDL.ATLAS_PLACES (a mesma fonte da Home e da janela do Atlas) */
  pins.forEach(btn=>{
    btn.addEventListener('click',()=>{
      const place = btn.dataset.place;
      if(typeof CDL.selectHomeAtlas === 'function') CDL.selectHomeAtlas(place);
      pins.forEach(p=>p.classList.toggle('active', p===btn));
      const d = (CDL.ATLAS_PLACES||{})[place];
      if(title && place) title.textContent = place;
      if(text && d) text.textContent = d.text;
    });
  });
});


/* Página Suítes — filtros, seleção para comparar e barra de comparação (lógica do HTML V16) */
CDL.ready(()=>{
  const $  = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
  const root = $('#page-suites');
  if(!root) return;

  const SUITES = CDL.SUITES || [];
  const selected = new Set();   /* ids das categorias marcadas (máx. 3) */
  const MAX = 3;

  function suiteMatches(s, filter){
    if(filter==='all') return true;
    if(!s) return true;
    if(filter==='2 hóspedes') return s.guests<=2;
    if(filter==='3 hóspedes') return s.guests===3;
    if(filter==='4 hóspedes') return s.guests>=4;
    return (s.tags||[]).includes(filter);
  }

  function filterSuites(filter){
    $$('.suite-filter[data-suite-filter]',root).forEach(b=>b.classList.toggle('active',b.dataset.suiteFilter===filter));
    let count = 0;
    $$('.suite-card',root).forEach(card=>{
      const s = SUITES.find(x=>x.id===card.dataset.suiteId);
      const show = suiteMatches(s,filter);
      card.classList.toggle('hidden-by-filter',!show);
      if(show) count++;
    });
    const c = $('#suiteCount'); if(c) c.textContent = count;
    const l = $('#suiteCountLabel'); if(l) l.textContent = count===1 ? 'categoria visível' : 'categorias visíveis';
  }

  function updateCompareDock(){
    const n = selected.size;
    const count = $('#compareCount'); if(count) count.textContent = n;
    const label = $('#compareLabel'); if(label) label.textContent = n===1 ? 'suíte selecionada' : 'suítes selecionadas';
    const dock = $('#compareDock'); if(dock) dock.classList.toggle('show',n>0);
    const open = $('#openCompare'); if(open) open.disabled = n<2;
  }

  function openCompare(){
    if(selected.size<2){ CDL.showToast('Selecione pelo menos duas categorias.'); return; }
    if(typeof CDL.openCompare==='function') CDL.openCompare([...selected]);
    else CDL.showToast('A comparação está sendo preparada.');
  }

  $$('.suite-filter[data-suite-filter]',root).forEach(b=>b.addEventListener('click',()=>filterSuites(b.dataset.suiteFilter)));

  $$('.compare-check',root).forEach(c=>c.addEventListener('change',()=>{
    if(c.checked){
      if(selected.size>=MAX){ c.checked = false; CDL.showToast('Compare até três categorias.'); return; }
      selected.add(c.value);
    }else selected.delete(c.value);
    updateCompareDock();
  }));

  const open1 = $('#openCompare'); if(open1) open1.addEventListener('click',openCompare);
  const open2 = $('#openCompareFromSection'); if(open2) open2.addEventListener('click',openCompare);

  updateCompareDock();
});


/* Casa da Lua — Viver a Casa: abas de momentos (setViverMoment do V16) */
CDL.ready(()=>{
  const $ = CDL.$;
  const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
  const MOMENTS = {
    morning:{img:'assets/img/3402e0.webp',alt:'Mesa do café da manhã da Casa da Lua',time:'7h30',eyebrow:'O dia começa',title:'Café servido, jardim acordando',
      text:'O café da manhã está incluído e é servido das 7h30 às 10h30. É quando o dia ganha direção sem precisar começar com pressa.',tags:['café','jardim','preparação']},
    afternoon:{img:'assets/img/rev-viver-17h40.webp',alt:'Casa da Lua no fim de tarde',time:'17h40',eyebrow:'A volta',title:'Água, spa e um ritmo mais lento',
      text:'Piscina, jacuzzi, sauna, massagem e jardim recebem quem volta da Chapada sem pedir outro deslocamento.',tags:['piscina','hidro','spa','descanso']},
    night:{img:'assets/img/rev-viver-21h.webp',alt:'Casa da Lua às 21h',time:'21h',eyebrow:'A casa acende',title:'Fogo, mesa, cinema e conversa',
      text:'A noite abre possibilidades de convivência e também de silêncio. Nada precisa parecer uma programação obrigatória.',tags:['fogo','cinema','bilhar','mesa']}
  };
  const tabs = $$('#page-viver .moment-tabs button[data-viver-moment]');
  const set = (id,v)=>{ const e=document.getElementById(id); if(e) e.textContent=v; };
  function setViverMoment(key){
    const d = MOMENTS[key]; if(!d) return;
    tabs.forEach(b=>{ const on=b.dataset.viverMoment===key; b.classList.toggle('active',on); b.setAttribute('aria-selected',on?'true':'false'); });
    const img = document.getElementById('viverMomentImage');
    if(img){ img.src=d.img; img.alt=d.alt; }
    set('viverMomentTime',d.time); set('viverMomentEyebrow',d.eyebrow);
    set('viverMomentTitle',d.title); set('viverMomentText',d.text);
    const tags = document.getElementById('viverMomentTags');
    if(tags) tags.innerHTML = d.tags.map(t=>`<span class="chip">${t}</span>`).join('');
  }
  tabs.forEach(b=>b.addEventListener('click',()=>setViverMoment(b.dataset.viverMoment)));
  /* pré-carrega as imagens dos outros horários para a troca não piscar */
  Object.values(MOMENTS).forEach(d=>{ const i=new Image(); i.src=d.img; });
});


/* Página Experiências — abas de dia da programação (V16: setProgramDay) */
CDL.ready(()=>{
  const root = document.getElementById('page-experiencias');
  if(!root) return;
  const days = [...root.querySelectorAll('.program-day[data-program-day]')];
  if(!days.length) return;
  const data = CDL.PROGRAM_DATA || {};
  const A = CDL.ASSETS || {};
  const $ = id => document.getElementById(id);
  /* Estado padrão (quinta) = Figma: imagem fabcc9 e título com trechos em negrito */
  const FIGMA_QUINTA = {
    img: 'assets/img/fabcc9.webp',
    title: 'Do universo <strong>Tidelli</strong> <br>à <strong>Casa da Lua</strong>'
  };
  /* foto de cada dia (quinta = Figma; sexta = foto nova do cliente; sábado e domingo = V16) */
  const DAY_IMG = { quinta:'assets/img/fabcc9.webp', sexta:'assets/img/rev-exp-natureza.webp' };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const noDot = s => String(s).replace(/\.\s*$/, '');   /* o Figma mostra títulos e horários sem ponto final */

  function setDay(day){
    const d = data[day]; if(!d) return;
    days.forEach(b => {
      const on = b.dataset.programDay === day;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    const img = $('programImage'), eb = $('programEyebrow'), ti = $('programTitle'), tx = $('programText'), sc = $('programSchedule');
    if(img) img.src = DAY_IMG[day] || A[d.asset] || img.src;
    if(eb) eb.textContent = d.eyebrow;
    if(ti){ if(day === 'quinta') ti.innerHTML = FIGMA_QUINTA.title; else ti.textContent = noDot(d.title); }
    if(tx) tx.textContent = d.text;
    if(sc) sc.innerHTML = d.schedule.map(r => `<div class="schedule-item"><span>${esc(r[0])}</span><p>${esc(noDot(r[1]))}</p></div>`).join('');
  }
  days.forEach(b => b.addEventListener('click', () => setDay(b.dataset.programDay)));
});

/* Carrossel do bloco "Experiências anteriores".
   SLIDES é a lista única de fotos: para trocar as fotos, edite só este array.
   O 1º slide já está no HTML (3c880f); os demais são criados aqui.
   (As fotos do carrossel ainda precisam ser enviadas pelo cliente: por ora são fotos de Experiência já no projeto.) */
CDL.ready(()=>{
  const SLIDES = [
    { src:'assets/img/3c880f.webp', alt:'Salão coberto de palha com hóspedes reunidos, em uma edição anterior da experiência' },
    { src:'assets/img/fabcc9.webp', alt:'Mesas e luzes do jantar de boas-vindas da Experiência Tidelli' },
    { src:'assets/img/rev-exp-natureza.webp', alt:'Dia de natureza da Experiência Tidelli' },
    { src:'assets/img/v16-wellness.webp', alt:'Bem-estar na Casa da Lua' },
    { src:'assets/img/v16-breakfast.webp', alt:'Café da manhã de despedida da Experiência Tidelli' }
  ];
  const root = document.getElementById('page-experiencias');
  const box = root && root.querySelector('.exp-carousel');
  const wrap = document.getElementById('expSlides');
  if(!box || !wrap) return;
  wrap.innerHTML = '';
  SLIDES.forEach((sl,i)=>{
    const im = document.createElement('img');
    im.className = 'exp-slide' + (i===0 ? ' is-active' : '');
    im.src = sl.src; im.alt = sl.alt; im.decoding = 'async';
    if(i>0) im.loading = 'lazy';
    wrap.appendChild(im);
  });
  const imgs = [...wrap.children];
  let cur = 0, timer = null, held = false;
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function go(n){
    cur = (n + imgs.length) % imgs.length;
    imgs.forEach((im,i)=>im.classList.toggle('is-active', i===cur));
  }
  function stop(){ clearInterval(timer); timer = null; }
  function start(){
    stop();
    if(reduce || held) return;
    timer = setInterval(()=>{ if(root.classList.contains('active') && !document.hidden) go(cur+1); }, 5000);
  }
  box.querySelector('.prev').addEventListener('click',()=>{ go(cur-1); start(); });
  box.querySelector('.next').addEventListener('click',()=>{ go(cur+1); start(); });
  box.addEventListener('mouseenter',()=>{ held = true; stop(); });
  box.addEventListener('mouseleave',()=>{ held = false; start(); });
  box.addEventListener('focusin',()=>{ held = true; stop(); });
  box.addEventListener('focusout',()=>{ held = false; start(); });
  start();
});


/* Eventos e Imersões: configurador de formato (dados do V16; o diagrama da esquerda saiu a pedido do cliente, 20/10) */
CDL.ready(()=>{
  const root = document.getElementById('page-eventos'); if(!root) return;
  const qa = (s)=>Array.from(root.querySelectorAll(s));

  const EVENT_DATA = {
    casamento:{eyebrow:'Casamento',title:'Cerimônia, jantar e festa <br class="dbr-s"><strong>no mesmo lugar</strong>',text:'O jardim pode receber a cerimônia e a convivência; o salão e a área coberta apoiam a recepção e o plano para chuva; as suítes mantêm parte do grupo por perto',features:[['Momentos','cerimônia + recepção'],['Espaços','jardim + salão + toldo'],['Hospedagem','15 suítes']],layout:'wedding'},
    imersao:{eyebrow:'Imersão empresarial',title:'Conteúdo, pausas e convivência <br class="dbr-s"><strong>no mesmo percurso</strong>',text:'O encontro pode alternar conteúdo, grupos de trabalho, refeições e áreas externas sem separar a programação da hospedagem',features:[['Ritmo','conteúdo + pausas'],['Configuração','roda, auditório ou mesas'],['Hospedagem','grupo na propriedade']],layout:'work'},
    retiro:{eyebrow:'Retiro',title:'Prática, silêncio e <br class="dbr-s"><strong>momentos compartilhados</strong>',text:'Salão, jardim e áreas de bem-estar podem receber práticas, conversas, refeições e pausas com a hospedagem por perto',features:[['Ritmo','práticas + refeições'],['Espaços','salão + jardim'],['Bem-estar','spa, sauna e hidro']],layout:'circle'},
    celebracao:{eyebrow:'Celebração',title:'Uma ocasião especial <br class="dbr-s"><strong>com a casa ao redor</strong>',text:'Almoços, aniversários e encontros privados podem ocupar mesa, salão e jardim em escalas diferentes',features:[['Momento','almoço, jantar ou coquetel'],['Espaços','mesa + jardim + salão'],['Hospedagem','opcional']],layout:'party'}
  };
  const TIPO = {casamento:'Casamento',imersao:'Imersão empresarial',retiro:'Retiro',celebracao:'Celebração'};

  let current = 'casamento';
  function setEventType(type){
    const d = EVENT_DATA[type]; if(!d) return;
    current = type;
    qa('.event-selector button').forEach(b=>b.classList.toggle('active',b.dataset.eventType===type));
    const set = (id,html)=>{ const e=document.getElementById(id); if(e) e.innerHTML=html; };
    set('eventEyebrow',d.eyebrow);
    set('eventTitle',d.title);
    set('eventText',d.text);
    set('eventFeatures',d.features.map(f=>`<li><span>${f[0]}</span><span>${f[1]}</span></li>`).join(''));
  }
  qa('.event-selector button[data-event-type]').forEach(b=>b.addEventListener('click',()=>setEventType(b.dataset.eventType)));
  setEventType('casamento');

  // "Pedir proposta para este formato": o core rola ao formulário (data-scroll-to); aqui já deixa o tipo escolhido
  const ask = document.getElementById('eventAsk');
  if(ask) ask.addEventListener('click',()=>{
    const sel = document.getElementById('evTipo');
    if(sel && TIPO[current]) sel.value = TIPO[current];
  });
});


/* A Chapada — filtros da curadoria (arquitetura V16: filterChapada) */
CDL.ready(()=>{
  const root = document.getElementById('page-chapada');
  if(!root) return;
  const buttons = [...root.querySelectorAll('.chapada-filter button[data-chapada-filter]')];
  const cards = [...root.querySelectorAll('.chapada-card')];

  function filterChapada(filter){
    buttons.forEach(b=>{
      const on = b.dataset.chapadaFilter === filter;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    cards.forEach(card=>{
      const tags = (card.dataset.tags || '').split(' ');
      card.classList.toggle('hidden-by-filter', !(filter === 'all' || tags.includes(filter)));
    });
  }

  buttons.forEach(b=>b.addEventListener('click', ()=>filterChapada(b.dataset.chapadaFilter)));
  filterChapada('all');
});

/* Bloco final: a moldura da foto tem a mesma altura da coluna de texto e proporção 4:5
   (largura = 0,8 x altura). O CSS não consegue transferir a altura esticada para a largura. */
CDL.ready(()=>{
  const root = document.getElementById('page-chapada');
  if(!root) return;
  const col = root.querySelector('.chapada-return .split>div:first-child');
  const frame = root.querySelector('.chapada-return-frame');
  if(!col || !frame) return;
  const sync = ()=>{
    if(innerWidth <= 1180){ frame.style.width = ''; return; }
    const h = col.offsetHeight;
    if(h > 0) frame.style.width = Math.round(h * 0.8) + 'px';
  };
  sync();
  if('ResizeObserver' in window) new ResizeObserver(sync).observe(col);
  addEventListener('resize', sync);
  CDL.onPage('chapada', ()=>requestAnimationFrame(sync));
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(sync);
});


/* Reservar — lógica do fluxo em 4 etapas (portada do HTML V16, linhas 2106-2149 e 2343-2355) */
CDL.ready(()=>{
  const root = document.getElementById('page-reservar');
  if(!root) return;
  const $  = (s,r=root)=>r.querySelector(s);
  const $$ = (s,r=root)=>[...r.querySelectorAll(s)];
  const SUITES = CDL.SUITES;
  const prefs = new Set();

  const SIDE = [
    ['Datas e hóspedes','Informe o período e a ocupação. As preferências entram depois e são opcionais.'],
    ['Prioridades','Escolha apenas o que ajuda a ordenar as categorias.'],
    ['Categorias indicadas','A sugestão considera capacidade e preferências, não disponibilidade.'],
    ['Motor oficial','Revise o resumo e siga para a disponibilidade ou atendimento.']
  ];
  const fmt = v => v ? CDL.fmtDate(v) : CDL.t('data a definir');
  const totalGuests = () => Number($('#reserveAdults').value||0) + Number($('#reserveChildren').value||0);

  /* o que a pessoa digita vira CDL.booking: o mesmo objeto monta o link do Omnibees, a mensagem do WhatsApp e a barra de reserva */
  const B = CDL.booking;
  function syncBooking(){
    B.arrival = $('#reserveArrival').value; B.departure = $('#reserveDeparture').value;
    B.adults = Number($('#reserveAdults').value||1); B.children = Number($('#reserveChildren').value||0);
    B.code = ($('#reserveCode').value||'').trim();
    refreshLinks();
    if(CDL.state.page==='reservar') return;
    CDL.updateBookingDock();
  }
  function whatsappText(){
    const sel = $('.reserve-suite-choice.active'); const suite = sel ? SUITES.find(s=>s.id===sel.dataset.suite) : null;
    const lines = ['Olá, gostaria de fazer uma reserva!'];
    if(B.arrival && B.departure) lines.push('Chegada: '+fmt(B.arrival)+' · Saída: '+fmt(B.departure));
    lines.push('Hóspedes: '+CDL.bookingGuestsLabel(B));
    if(suite) lines.push('Preferência de suíte: '+suite.name);
    if(prefs.size) lines.push('Prioridades: '+[...prefs].join(', '));
    if(B.code) lines.push('Código promocional: '+B.code);
    return lines.join('\n');
  }
  function refreshLinks(){
    const o = $('#openOmnibees'), w = $('#openWhatsApp');
    if(o) o.href = CDL.omnibeesUrl(B);
    if(w) w.href = CDL.whatsappUrl(whatsappText());
  }
  function setStep(n){
    $$('.reserve-step').forEach(s=>s.classList.toggle('hidden',Number(s.dataset.step)!==n));
    $$('.step-dot').forEach((d,i)=>d.classList.toggle('active',i<n));
    $('#reserveSideTitle').textContent = SIDE[n-1][0];
    $('#reserveSideText').textContent = SIDE[n-1][1];
    if(n===3) renderSuggestions();
    if(n===4){ syncBooking(); renderSummary(); }
    const card = $('.form-card');
    if(card && card.getBoundingClientRect().top < 70) card.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function renderSuggestions(){
    const total = totalGuests();
    const box = $('#reserveSuggestions');
    if(total>4){
      box.innerHTML = `<article class="suggestion"><strong>${CDL.t('Combinação de suítes')}</strong><p>${CDL.t('Para {n} hóspedes, a equipe precisa combinar duas ou mais categorias.',{n:total})}</p></article>`;
      return;
    }
    const score = s=>{
      let n = 0;
      prefs.forEach(p=>{ if(s.tags.includes(p) || (p==='hidro' && (s.tags.includes('hidro')||s.tags.includes('ofurô')))) n += 3; });
      return n - Math.abs(s.guests-total);
    };
    const top = SUITES.filter(s=>s.guests>=Math.min(total,4)).sort((a,b)=>score(b)-score(a)).slice(0,3);
    box.innerHTML = top.map(s=>`<button type="button" class="suggestion reserve-suite-choice" data-suite="${s.id}"><strong>${s.name}</strong><p>${s.area} · ${CDL.t('até {n} hóspedes',{n:s.guests})}</p></button>`).join('');
  }

  function renderSummary(){
    const sel = $('.reserve-suite-choice.active');
    const suite = sel ? SUITES.find(s=>s.id===sel.dataset.suite) : null;
    $('#reserveSummary').innerHTML = `<h3>${CDL.t('Resumo')}</h3><p><strong>${fmt($('#reserveArrival').value)}</strong>${CDL.t(' a ')}<strong>${fmt($('#reserveDeparture').value)}</strong><br>${totalGuests()} ${CDL.t('hóspedes')}${suite?`<br>${CDL.t('Preferência: ')}${suite.name}`:''}</p>`;
  }

  $$('.reserve-next').forEach(b=>b.addEventListener('click',()=>{
    /* etapa 1: o Omnibees precisa das datas; sem elas a pessoa teria de digitar de novo lá */
    if(b.dataset.nextStep==='2' && (!$('#reserveArrival').value || !$('#reserveDeparture').value)){
      CDL.showToast('Informe a data de chegada e a de saída para continuar.');
      ($('#reserveArrival').value ? $('#reserveDeparture') : $('#reserveArrival')).focus();
      return;
    }
    setStep(Number(b.dataset.nextStep));
  }));
  $$('.reserve-prev').forEach(b=>b.addEventListener('click',()=>setStep(Number(b.dataset.prevStep))));
  $$('.choice').forEach(b=>b.addEventListener('click',()=>{
    b.classList.toggle('active');
    const p = b.dataset.reservePref;
    if(b.classList.contains('active')) prefs.add(p); else prefs.delete(p);
  }));
  $('#reserveSuggestions').addEventListener('click',e=>{
    const b = e.target.closest('.reserve-suite-choice'); if(!b) return;
    $$('.reserve-suite-choice').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
  });
  ['#reserveArrival','#reserveDeparture','#reserveAdults','#reserveChildren','#reserveCode'].forEach(s=>{ $(s).addEventListener('change',syncBooking); $(s).addEventListener('input',syncBooking); });
  $('#reserveSuggestions').addEventListener('click',()=>setTimeout(refreshLinks,0));
  $$('.choice').forEach(b=>b.addEventListener('click',()=>setTimeout(refreshLinks,0)));
  /* ao sair de Reservar, a barra de reserva passa a mostrar as datas e os hóspedes informados */
  document.addEventListener('cdl:page',e=>{ if(e.detail.prev==='reservar') syncBooking(); });
  syncBooking();
  $('#reserveForm').addEventListener('submit',e=>e.preventDefault()); /* Enter num campo não recarrega a página */

  /* datas coerentes: chegada a partir de hoje, saída depois da chegada */
  const arr = $('#reserveArrival'), dep = $('#reserveDeparture');
  const iso = d => new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);
  arr.min = iso(new Date());
  arr.addEventListener('change',()=>{
    if(!arr.value) return;
    const next = new Date(arr.value+'T12:00:00'); next.setDate(next.getDate()+1);
    dep.min = iso(next);
    if(dep.value && dep.value<=arr.value) dep.value = '';
  });
});


/* =========================================================
   Casa da Lua — overlays.js
   Sobreposições (menu mobile, percurso "Entrar na Casa", Atlas Vivo,
   detalhe da suíte, comparador, próximas datas) — lógica do HTML V16.
   API pública: CDL.ATLAS_PLACES, CDL.selectHomeAtlas(place), CDL.openAtlas(),
   CDL.openJourney(), CDL.openSuite(id), CDL.openCompare(ids).
   As funções e os dados são definidos já na carga (as páginas podem chamar
   CDL.selectHomeAtlas no próprio CDL.ready); a ligação com o DOM fica em CDL.ready.
   ========================================================= */
(function(){
'use strict';
const $  = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const IMG = k => CDL.ASSETS[k];

/* ---------- Atlas: dados. x/y em % do mapa (assets/img/rev-home-atlas.webp); asset = foto do ambiente.
   Os mesmos números valem na Home e em A Casa. Revisão do cliente 09/10: 9 espaços, sem lentes/opções/etiquetas. ---------- */
const ATLAS_PLACES = CDL.ATLAS_PLACES = {
  'Entrada':{asset:'assets/img/rev-atlas-chegada.webp',text:'É por aqui que a experiência começa, com acesso próprio e uma leitura mais clara da chegada à propriedade.',x:70,y:6},
  'Recepção / Restaurante':{asset:'assets/img/rev-atlas-restaurante.webp',text:'É onde a chegada acontece, a manhã começa e a mesa costuma reunir hóspedes, famílias e grupos.',x:47,y:90},
  'Casa principal':{asset:'assets/img/rev-atlas-casa-principal.webp',text:'Núcleo original da propriedade, ligado à memória da casa e a parte da hospedagem.',x:14,y:90},
  'Piscina':{asset:'assets/img/rev-atlas-piscina.webp',text:'A piscina é um dos centros da propriedade, com a área de descanso ao redor.',x:30,y:27},
  'Espaço de eventos':{asset:'assets/img/rev-atlas-eventos.webp',text:'Salão e área de apoio para casamentos, imersões, retiros e celebrações.',x:88,y:27},
  'Círculo do fogo / Fogueira':{asset:'assets/img/v16-fire.webp',text:'Na época de seca, o círculo reúne conversa, vinho e céu aberto.',x:91,y:80},
  'Bar piscina':{asset:'assets/img/v16-pool.webp',text:'Um ponto de apoio junto à água para o fim de tarde, depois da Chapada.',x:6,y:62},
  'Jardim':{asset:'assets/img/rev-atlas-faixa-verde.webp',text:'O lado de fora funciona como sala, caminho e lugar de permanência.',x:62,y:88},
  'Fogueira':{asset:'assets/img/gen-viver-fogo.webp',text:'Na época de seca, a fogueira reúne vinho, conversa e céu estrelado.',x:64,y:45}
};
const imgOf = p => (p && p.indexOf('/')>-1) ? p : IMG(p);
let atlasPlace = 'Casa principal';

/* Home e A Casa: pino de miniatura -> título/texto (nulo-seguro) */
CDL.selectHomeAtlas = function(place){
  const d = ATLAS_PLACES[place] || ATLAS_PLACES['Casa principal'];
  $$('.atlas-home-card .map-pin,.atlas-teaser .map-pin').forEach(b=>b.classList.toggle('active',b.dataset.place===place));
  const t = $('#homeAtlasTitle'), x = $('#homeAtlasText');
  if(t) t.textContent = place;
  if(x) x.textContent = d.text;
};

function renderAtlas(){
  const entries = Object.entries(ATLAS_PLACES);
  const list = $('#atlasList'), pins = $('#atlasPins');
  if(list) list.innerHTML = entries.map(([n],i)=>`<button type="button" class="${n===atlasPlace?'active':''}" data-atlas-place="${n}"><i>${i+1}</i>${n}</button>`).join('');
  if(pins) pins.innerHTML = entries.map(([n,d],i)=>`<button type="button" class="map-pin ${n===atlasPlace?'active':''}" data-atlas-place="${n}" style="left:${d.x}%;top:${d.y}%" aria-label="${n}">${i+1}</button>`).join('');
  selectAtlas(atlasPlace);
}
function selectAtlas(place){
  const d = ATLAS_PLACES[place] || ATLAS_PLACES['Casa principal'];
  atlasPlace = ATLAS_PLACES[place] ? place : 'Casa principal';
  $$('#atlasOverlay [data-atlas-place]').forEach(b=>b.classList.toggle('active',b.dataset.atlasPlace===atlasPlace));
  const set = (id,v)=>{ const e=document.getElementById(id); if(e) e.textContent=v; };
  set('atlasDetailTitle',atlasPlace); set('atlasDetailText',d.text);
  const img = $('#atlasDetailImage'); if(img){ img.src = imgOf(d.asset); img.alt = atlasPlace; }
}
CDL.openAtlas = function(place){
  atlasPlace = (typeof place==='string' && ATLAS_PLACES[place]) ? place : 'Casa principal';
  renderAtlas();
  CDL.openOverlay('atlasOverlay');
  const c = $('#atlasOverlay .close-overlay'); if(c) c.focus({preventScroll:true});
};

/* ---------- Percurso "Entrar na Casa" (V16 1811 e 2096) ---------- */
const JOURNEY_SCENES = [
  {id:'arrival',asset:'assets/img/rev-jornada-1-chegada.webp',kicker:'Chegada',title:'A casa aparece entre jardim e luz.',text:'O percurso começa pela chegada e abre duas escolhas: seguir para o jardim ou ir direto às suítes.',choices:[['Seguir pelo jardim','garden'],['Conhecer as suítes','suites']]},
  {id:'garden',asset:'assets/img/rev-jornada-2-jardim.webp',kicker:'Jardim',title:'O lado de fora funciona como sala.',text:'Caminhos, sombra e lugares de permanência conectam a casa, a piscina e os recantos.',choices:[['Ir para a piscina','pool'],['Abrir o Atlas','atlas']]},
  {id:'pool',asset:'assets/img/rev-jornada-3-piscina.webp',kicker:'Fim de tarde',title:'A água recebe quem volta.',text:'Piscina e jacuzzi entram no momento em que o corpo muda de ritmo depois da Chapada.',choices:[['Seguir para o bem-estar','wellness'],['Ver suítes próximas','suites']]},
  {id:'wellness',asset:'wellness',kicker:'Bem-estar',title:'Spa, sauna e massagem prolongam a volta.',text:'Spa, sauna e massagem prolongam a volta e ajudam o corpo a mudar de ritmo depois da Chapada.',choices:[['Chegar à noite','night'],['Planejar a estadia','reserve']]},
  {id:'night',asset:'assets/img/rev-jornada-5-noite.webp',kicker:'Noite',title:'Fogo, mesa e céu encerram o percurso.',text:'Daqui, a pessoa pode seguir para a reserva ou voltar a explorar a casa.',choices:[['Reservar','reserve'],['Voltar ao Atlas','atlas']]}
];
function renderJourney(id){
  const sc = JOURNEY_SCENES.find(s=>s.id===id) || JOURNEY_SCENES[0];
  const img = $('#journeyImage'); if(img){ img.src = imgOf(sc.asset); img.alt = sc.kicker; }
  const set = (i,v)=>{ const e=document.getElementById(i); if(e) e.textContent=v; };
  set('journeyKicker',sc.kicker); set('journeyTitle',sc.title); set('journeyText',sc.text);
  const ch = $('#journeyChoices');
  if(ch) ch.innerHTML = sc.choices.map(c=>`<button type="button" data-journey-target="${c[1]}"><span>${c[0]}</span><i aria-hidden="true">→</i></button>`).join('');
}
CDL.JOURNEY_SCENES = JOURNEY_SCENES;
CDL.openJourney = function(){
  renderJourney('arrival');
  CDL.openOverlay('journeyOverlay');
  const c = $('#journeyOverlay .close-overlay'); if(c) c.focus({preventScroll:true});
};

/* ---------- Detalhe da suíte (V16 2049) ---------- */
/* Fotos das 8 categorias (enviadas pelo cliente em 20/10) */
const SUITE_IMG = Object.fromEntries(['standard','luxo','luxo-superior','premium','premium-hidro','premium-ofuro','master','presidencial'].map(id=>[id,'assets/img/suite-'+id+'.webp']));
CDL.openSuite = function(id){
  const s = CDL.SUITES.find(x=>x.id===id);
  if(!s) return;
  const set = (i,v)=>{ const e=document.getElementById(i); if(e) e.textContent=v; };
  set('suiteModalTitle',s.name);
  set('suiteModalUnits',`${s.units} ${CDL.t(s.units===1?'unidade':'unidades')} · ${s.area}`);
  set('suiteModalIntro',`${s.beds}. ${s.location}. ${s.outdoor}.`);
  const img = $('#suiteModalImage'); if(img){ img.src = SUITE_IMG[s.id] || 'assets/img/suite-standard.webp'; img.alt = CDL.t('Suíte {name}',{name:s.name}); }
  const meta = $('#suiteModalMeta');
  if(meta) meta.innerHTML = [['Capacidade',CDL.t('Até {n} hóspedes',{n:s.guests})],['Acesso',s.access],['Vista',s.view],['Área externa',s.outdoor]].map(x=>`<div class="meta-item"><small>${x[0]}</small><strong>${x[1]}</strong></div>`).join('');
  const feats = $('#suiteModalFeatures'); if(feats) feats.innerHTML = s.features.map(f=>`<li>${f}</li>`).join('');
  const modal = $('#suiteOverlay .modal'); if(modal) modal.scrollTop = 0;
  CDL.openOverlay('suiteOverlay');
};

/* ---------- Comparador (V16 2069) ---------- */
CDL.openCompare = function(ids){
  const list = (ids||[]).map(id=>CDL.SUITES.find(s=>s.id===id)).filter(Boolean);
  if(list.length<2){ CDL.showToast('Selecione pelo menos duas categorias.'); return; }
  const rows = [
    ['Categoria',...list.map(s=>s.name)],
    ['Área',...list.map(s=>s.area)],
    ['Capacidade',...list.map(s=>CDL.t('Até {n}',{n:s.guests}))],
    ['Camas',...list.map(s=>s.beds)],
    ['Localização',...list.map(s=>s.location)],
    ['Acesso',...list.map(s=>s.access)],
    ['Vista',...list.map(s=>s.view)],
    ['Diferenciais',...list.map(s=>s.features.slice(0,3).join(', '))]
  ];
  const table = $('#compareTable');
  if(table) table.innerHTML = rows.map((row,i)=>`<tr>${row.map((c,j)=>(i===0||j===0)?`<th scope="${i===0?'col':'row'}">${c}</th>`:`<td>${c}</td>`).join('')}</tr>`).join('');
  const modal = $('#compareOverlay .modal'); if(modal) modal.scrollTop = 0;
  CDL.openOverlay('compareOverlay');
};

/* ---------- Ligação com o DOM ---------- */
CDL.ready(()=>{
  renderJourney('arrival');
  renderAtlas();

  const ch = $('#journeyChoices');
  if(ch) ch.addEventListener('click',e=>{
    const b = e.target.closest('[data-journey-target]'); if(!b) return;
    const t = b.dataset.journeyTarget;
    if(t==='atlas'){ CDL.closeOverlays(); CDL.openAtlas(); }
    else if(t==='suites') CDL.goPage('suites');
    else if(t==='reserve') CDL.goPage('reservar');
    else renderJourney(t);
  });

  const onPlace = e=>{ const b = e.target.closest('[data-atlas-place]'); if(b) selectAtlas(b.dataset.atlasPlace); };
  const list = $('#atlasList'), pins = $('#atlasPins');
  if(list) list.addEventListener('click',onPlace);
  if(pins) pins.addEventListener('click',onPlace);

  /* menu mobile: marca a página atual (o clique que abre o menu é tratado pelo core.js) */
  const mb = document.getElementById('mobileMenuBtn');
  if(mb) mb.addEventListener('click',()=>{
    $$('#mobileNavOverlay [data-page-target]').forEach(b=>b.classList.toggle('active',b.dataset.pageTarget===CDL.currentPage));
  });
});
})();


/* =========================================================
   Casa da Lua — shadows.js
   As sombras/texturas de fundo (.section-bg.baked) ganham movimento: um vídeo curto em loop
   (WebM com transparência, assets/video/sh-<ref>.webm) toca por cima da imagem estática e só
   enquanto a seção está perto da tela. A opacidade (--op) é a mesma da textura.
   Onde o vídeo não serve (Safari: sem alfa em WebM; celular/toque; economia de dados) a sombra recebe um balanço
   leve por CSS (classe .sh-drift: translate/scale/rotate, só enquanto a seção está perto da tela).
   Fica estática apenas com "reduzir movimento" ligado no sistema.
   Para trocar por um vídeo de sombra de verdade: node tools/shadow-video.mjs --from clipe.mp4 --ref <ref>
   ========================================================= */
(function(){
'use strict';
if(!window.CDL) return;
if(location.search.indexOf('sem-movimento') >= 0) return;
const ua = navigator.userAgent;
const safari = /^((?!chrome|chromium|android|crios|fxios|edg).)*safari/i.test(ua);
const coarse = window.matchMedia('(pointer:coarse)').matches;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const save = navigator.connection && navigator.connection.saveData;
if(reduce) return;
const hasIO = 'IntersectionObserver' in window;
const useDrift = safari || coarse || save || !hasIO;

const refOf = el => {
  const st = el.getAttribute('style') || '';
  let m = st.match(/img\/([0-9a-f]{6})-m\.webp/);
  if(!m){ const i = el.querySelector('img'); if(i) m = (i.getAttribute('src') || '').match(/img\/([0-9a-f]{6})-m\.webp/); }
  return m && m[1];
};
function build(el){
  const ref = refOf(el); if(!ref) return;
  const v = document.createElement('video');
  v.className = 'sh-video'; v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto';
  v.setAttribute('aria-hidden','true'); v.tabIndex = -1; v.disablePictureInPicture = true;
  const img = el.querySelector('img');
  if(img && img.getAttribute('style')) v.setAttribute('style',img.getAttribute('style'));   // mesmo recorte (object-view-box)
  v.addEventListener('loadeddata',()=>{ el.classList.add('has-video'); const p = v.play(); if(p) p.catch(()=>{}); },{once:true});
  v.src = 'assets/video/sh-' + ref + '.webm';
  el.appendChild(v); el.__sv = v;
}
window.CDL.ready(()=>{
  if(useDrift){
    const els = [...document.querySelectorAll('.section-bg.baked')];
    els.forEach(el=>el.classList.add('sh-drift'));
    if(hasIO){
      const dio = new IntersectionObserver(es=>es.forEach(en=>en.target.classList.toggle('sh-on',en.isIntersecting)),{rootMargin:'300px 0px'});
      els.forEach(el=>dio.observe(el));
    } else els.forEach(el=>el.classList.add('sh-on'));
    return;
  }
  const io = new IntersectionObserver(es=>es.forEach(en=>{
    const el = en.target, v = el.__sv;
    if(en.isIntersecting){ if(!v) build(el); else { const p = v.play(); if(p) p.catch(()=>{}); } }
    else if(v) v.pause();
  }),{rootMargin:'420px 0px'});
  document.querySelectorAll('.section-bg.baked').forEach(el=>{ if(refOf(el)) io.observe(el); });
});
})();


/* =========================================================
   Casa da Lua — motion.js  (v2)
   Movimento calmo e editorial: GSAP + ScrollTrigger + SplitText + Lenis.
   O HTML marca o que anima; o que não foi marcado recebe um padrão (autoMark).
     data-anim="hero"    abertura: foto/vídeo assenta do zoom, texto entra em sequência, ao rolar o conteúdo se afasta
     data-anim="title"   títulos entram por linhas (máscara + leve rotação)
     data-anim="reveal"  blocos sobem e aparecem; no pai, data-stagger escalona os filhos
     data-anim="image"   moldura abre por máscara e a foto assenta; data-parallax="-8" desliza com a rolagem
   Além disso: cortina entre páginas, entrada/saída das sobreposições, troca de conteúdo das abas e filtros,
   barra de progresso, cabeçalho que recolhe ao descer, vídeos que pausam fora da tela.
   Cada página cria os seus gatilhos ao abrir e os desfaz ao sair (gsap.context).
   ?sem-movimento desliga tudo (testes, acessibilidade).
   ========================================================= */
(function(){
'use strict';
const root = document.documentElement;
const fail = () => { root.classList.remove('motion-on'); };
if(!window.CDL) return;
if(location.search.indexOf('sem-movimento') >= 0){ fail(); return; }
const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || reduz){ fail(); return; }
const CDL = window.CDL;
gsap.registerPlugin(ScrollTrigger);
const hasSplit = typeof SplitText !== 'undefined';
if(hasSplit) gsap.registerPlugin(SplitText);
gsap.defaults({ease:'power3.out'});
const desktop = () => window.matchMedia('(min-width:1025px)').matches;

/* ---------- Rolagem suave (Lenis) ---------- */
let lenis = null;
if(typeof Lenis !== 'undefined' && !window.matchMedia('(pointer:coarse)').matches){
  lenis = new Lenis({lerp:.09,wheelMultiplier:.95,smoothWheel:true});
  CDL.lenis = lenis;
  lenis.on('scroll',ScrollTrigger.update);
  gsap.ticker.add(t=>lenis.raf(t*1000));
  gsap.ticker.lagSmoothing(0);
  /* o Lenis guarda a altura: remede quando o ScrollTrigger recalcula, o corpo muda e tudo carrega */
  ScrollTrigger.addEventListener('refresh',()=>lenis.resize());
  if('ResizeObserver' in window) new ResizeObserver(()=>lenis.resize()).observe(document.body);
  window.addEventListener('load',()=>{ lenis.resize(); ScrollTrigger.refresh(); });
  document.querySelectorAll('.overlay,.modal,.drawer').forEach(el=>el.setAttribute('data-lenis-prevent',''));
  new MutationObserver(()=>{ document.body.classList.contains('no-scroll') ? lenis.stop() : lenis.start(); })
    .observe(document.body,{attributes:true,attributeFilter:['class']});
}

/* ---------- Barra de progresso + cabeçalho que recolhe ---------- */
const bar = document.createElement('div'); bar.className = 'scroll-progress'; bar.setAttribute('aria-hidden','true');
document.body.appendChild(bar);
const setBar = gsap.quickSetter(bar,'scaleX');
const header = document.querySelector('.site-header');
let lastY = window.scrollY, hidden = false;
function onScroll(){
  const y = window.scrollY, max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  setBar(Math.min(1, y / max));
  if(header){
    header.classList.toggle('is-scrolled', y > 80);
    const d = y - lastY;
    if(y > 320 && d > 8 && !hidden && !document.body.classList.contains('no-scroll')){ hidden = true; gsap.to(header,{yPercent:-105,duration:.6,ease:'power3.out',overwrite:true}); }
    else if((d < -8 || y < 200) && hidden){ hidden = false; gsap.to(header,{yPercent:0,duration:.6,ease:'power3.out',overwrite:true}); }
  }
  lastY = y;
}
window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
function showHeader(){ if(header && hidden){ hidden = false; gsap.to(header,{yPercent:0,duration:.4,overwrite:true}); } }

/* ---------- Animações por página ---------- */
const contexts = {};     // page -> gsap.Context
const splits = {};       // page -> [SplitText]
const S = {delay:0};     // atraso extra (a cortina ainda está subindo)

/* O que o HTML não marcou recebe o padrão da casa (sem aninhar: filho de algo já marcado fica quieto) */
function autoMark(pageEl){
  const mark = (el,t) => { if(!el.hasAttribute('data-anim') && !(el.parentElement && el.parentElement.closest('[data-anim]'))) el.setAttribute('data-anim',t); };
  pageEl.querySelectorAll('.section h1,.section h2').forEach(el=>mark(el,'title'));
  pageEl.querySelectorAll('.section .eyebrow,.section .lead,.section-head > .small,.section-head > p,.stat-row,.hero-actions,.practical-item,.year-stack article,.timeline article,.story-mini-list span').forEach(el=>mark(el,'reveal'));
  pageEl.querySelectorAll('.card,.suite-card,.chapada-card,.space-card,.story-card,.feature-panel,.reserve-steps,.form-card,.event-copy,.program-stage,.moment-hero,.atlas-teaser,.atlas-home-card,.profile-panel').forEach(el=>mark(el,'reveal'));
  /* irmãos marcados viram uma fileira escalonada */
  pageEl.querySelectorAll('[data-anim="reveal"]').forEach(el=>{
    const p = el.parentElement; if(!p || p.hasAttribute('data-stagger')) return;
    const n = [...p.children].filter(c=>c.getAttribute('data-anim') === 'reveal').length;
    if(n >= 2) p.setAttribute('data-stagger','');
  });
}

const heroBgOf = hero => hero.querySelector('.hero-video, img, .section-bg, .hero-bg');

function build(pageEl){
  const page = pageEl.dataset.page;
  kill(page);
  const ctx = gsap.context(()=>{},pageEl);
  contexts[page] = ctx;
  autoMark(pageEl);
  const D = S.delay; S.delay = 0;
  ctx.add(()=>{
    const sp = splits[page] = [];

    /* HERO: entra ao abrir; ao rolar, o conteúdo se afasta devagar */
    pageEl.querySelectorAll('[data-anim="hero"]').forEach(hero=>{
      const bg = heroBgOf(hero);
      if(bg){
        bg.setAttribute('data-hero-bg','');   // o parallax genérico (abaixo) pula este elemento: dois gsap brigando pela mesma foto era a tremulação ao abrir
        gsap.fromTo(bg,{scale:1.12},{scale:1.02,duration:2.2,delay:D,ease:'power2.out'});
        if(desktop()) gsap.to(bg,{yPercent:9,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true}});
      }
      const copy = hero.querySelector('.hero-copy');
      if(copy) gsap.to(copy,{yPercent:-6,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true}});   // só desliza: a cor/opacidade do texto nunca muda
      /* o texto do hero entra todo junto, depois que as fontes carregam: o título vem primeiro e o resto acompanha.
         (Antes só o título esperava as fontes e chegava depois dos outros textos.) */
      const inner = [...hero.querySelectorAll('[data-anim="title"],[data-anim="reveal"]')];
      fontsGate().then(()=>{
        if(contexts[page] !== ctx) return;
        ctx.add(()=>{
          let n = 0;
          inner.forEach(el=>{
            if(el.dataset.anim === 'title') titleIn(el,{delay:.1+D,hero:true},sp,ctx);
            else { gsap.fromTo(el,{autoAlpha:0,y:30},{autoAlpha:1,y:0,duration:.95,delay:D+(n === 0 ? .05 : .42+(n-1)*.11),clearProps:'transform'}); n++; }
          });
        });
      });
    });

    /* TÍTULOS */
    pageEl.querySelectorAll('[data-anim="title"]').forEach(el=>{
      if(el.closest('[data-anim="hero"]')) return;
      titleIn(el,{},sp,ctx);
    });

    /* REVEAL com escalonamento por pai */
    const seen = new Set();
    pageEl.querySelectorAll('[data-anim="reveal"]').forEach(el=>{
      if(el.closest('[data-anim="hero"]') || seen.has(el)) return;
      const parent = el.parentElement;
      let group = [el], step = 0;
      if(parent && parent.hasAttribute('data-stagger')){
        group = [...parent.children].filter(c=>c.dataset.anim === 'reveal');
        step = .09;
      }
      group.forEach(g=>seen.add(g));
      const card = el.matches('.card,.suite-card,.chapada-card,.space-card,.story-card,.feature-panel,.practical-item');
      gsap.fromTo(group,{autoAlpha:0,y:card?46:32,scale:card?.985:1},{autoAlpha:1,y:0,scale:1,duration:.9,stagger:step,clearProps:'transform',
        scrollTrigger:{trigger:parent && step ? parent : group[0],start:'top 88%',toggleActions:'play none none none'}});
    });

    /* IMAGENS: máscara abre + foto assenta */
    pageEl.querySelectorAll('[data-anim="image"]').forEach(box=>{
      const img = box.querySelector('img');
      const tl = gsap.timeline({scrollTrigger:{trigger:box,start:'top 88%',toggleActions:'play none none none'}});
      tl.fromTo(box,{autoAlpha:0,clipPath:'inset(10% 6% 10% 6% round 28px)'},{autoAlpha:1,clipPath:'inset(0% 0% 0% 0% round 0px)',duration:1.6,ease:'expo.inOut',clearProps:'clipPath'});
      if(img && !img.hasAttribute('data-parallax')) tl.fromTo(img,{scale:1.22},{scale:1,duration:2,ease:'power2.out',clearProps:'transform'},0);
    });

    /* PARALLAX (só em tela grande: no celular economiza o aparelho) */
    if(desktop()){
      pageEl.querySelectorAll('[data-parallax],.section-bg').forEach(el=>{
        if(el.hasAttribute('data-hero-bg')) return;
        const isBg = el.classList.contains('section-bg');
        const v = el.hasAttribute('data-parallax') ? (parseFloat(el.dataset.parallax) || 0) : 5;
        if(!v) return;
        const box = isBg ? el.parentElement : (el.parentElement || el);
        const sc = isBg ? 1.08 : 1.14;
        gsap.fromTo(el,{yPercent:-v,scale:sc},{yPercent:v,scale:sc,ease:'none',
          scrollTrigger:{trigger:box,start:'top bottom',end:'bottom top',scrub:true}});
      });
    }
  });
}

/* espera as fontes (no máximo 1 s) para o texto entrar já com a fonte certa */
function fontsGate(){
  return (document.fonts && document.fonts.ready) ? Promise.race([document.fonts.ready, new Promise(r=>setTimeout(r,1000))]) : Promise.resolve();
}
function titleIn(el,opts,sp,ctx){
  const run = ()=>{
    if(contexts[el.closest('.page').dataset.page] !== ctx) return;
    ctx.add(()=>{
      el.style.visibility = 'visible';
      const trig = opts.hero ? undefined : {trigger:el,start:'top 88%',toggleActions:'play none none none'};
      if(!hasSplit){ gsap.fromTo(el,{autoAlpha:0,y:34},{autoAlpha:1,y:0,duration:1.2,delay:opts.delay||0,scrollTrigger:trig}); return; }
      const s = SplitText.create(el,{type:'lines',linesClass:'split-line',mask:'lines'});
      gsap.fromTo(s.lines,{yPercent:118,rotate:3,transformOrigin:'0% 100%'},{yPercent:0,rotate:0,duration:1.05,stagger:.07,ease:'power4.out',delay:opts.delay||0,scrollTrigger:trig});
      sp.push(s);
    });
  };
  (document.fonts && document.fonts.ready) ? document.fonts.ready.then(run) : run();
}

function kill(page){
  if(splits[page]){ splits[page].forEach(s=>{ try{s.revert()}catch(e){} }); splits[page] = []; }
  if(contexts[page]){ contexts[page].revert(); contexts[page] = null; }
}

function activate(page){
  Object.keys(contexts).forEach(p=>{ if(p !== page) kill(p); });
  const pageEl = document.querySelector(`.page[data-page="${page}"]`);
  if(!pageEl) return;
  /* a foto/vídeo do hero já nasce no zoom inicial, antes do primeiro quadro da página: sem o salto de 1,00 para 1,12 que parecia tremulação */
  pageEl.querySelectorAll('[data-anim="hero"]').forEach(h=>{ const b = heroBgOf(h); if(b) gsap.set(b,{scale:1.12}); });
  requestAnimationFrame(()=>requestAnimationFrame(()=>{ build(pageEl); ScrollTrigger.refresh(); }));
}
document.addEventListener('cdl:page',e=>activate(e.detail.page));
window.addEventListener('DOMContentLoaded',()=>{ setTimeout(()=>{ if(!contexts[CDL.currentPage]) activate(CDL.currentPage); },60); });
/* ao mudar a LARGURA as linhas dos títulos mudam: refaz a página atual */
let lastW = window.innerWidth, rz;
window.addEventListener('resize',()=>{ clearTimeout(rz); rz = setTimeout(()=>{ if(window.innerWidth !== lastW){ lastW = window.innerWidth; activate(CDL.currentPage); } },450); });

/* ---------- Cortina entre páginas (símbolo girando) ---------- */
const curtain = document.createElement('div');
curtain.className = 'curtain'; curtain.setAttribute('aria-hidden','true');
curtain.innerHTML = '<img class="curtain-sym" src="assets/img/simbolo.svg" alt="" width="132" height="132">';
document.body.appendChild(curtain);
const cSym = curtain.querySelector('img');
gsap.set(curtain,{yPercent:100,display:'none'});
let spin = null;
/* decodifica as primeiras imagens da página de destino enquanto a cortina cobre a tela (a troca não engasga) */
function preDecode(page){
  const el = document.querySelector('.page[data-page="'+page+'"]'); if(!el) return Promise.resolve();
  const imgs = [...el.querySelectorAll('img')].filter(i=>!i.closest('.overlay')).slice(0,6);
  return Promise.race([Promise.all(imgs.map(i=>i.decode ? i.decode().catch(()=>{}) : 0)), new Promise(r=>setTimeout(r,650))]);
}
CDL.transition = (page, swap, end) => {
  showHeader();
  CDL.closeOverlays();
  curtain.style.display = 'flex';
  if(spin) spin.kill();
  spin = gsap.fromTo(cSym,{rotation:0},{rotation:360,duration:1.3,ease:'none',repeat:-1});
  const dec = preDecode(page);
  const tl = gsap.timeline({defaults:{ease:'expo.inOut'},onComplete:()=>{ curtain.style.display = 'none'; if(spin){ spin.kill(); spin = null; } end(); }});
  tl.fromTo(curtain,{yPercent:100},{yPercent:0,duration:.6})
    .fromTo(cSym,{autoAlpha:0,scale:.7},{autoAlpha:1,scale:1,duration:.45,ease:'power3.out'},.2);
  tl.addPause('>',()=>{ dec.then(()=>tl.resume()); });
  tl.add(()=>{ S.delay = .3; swap(); window.scrollTo(0,0); if(lenis) lenis.scrollTo(0,{immediate:true,force:true}); })
    .to(cSym,{autoAlpha:0,scale:.85,duration:.3,ease:'power2.in'},'>+.05')
    .to(curtain,{yPercent:-100,duration:.7},'<+.05');
};

/* ---------- Sobreposições: entrada e saída ---------- */
const panelOf = el => el.querySelector(':scope > .modal, :scope > .journey-shell, :scope > .atlas-overlay-shell') || el.firstElementChild;
function overlayIn(el){
  const panel = panelOf(el), items = [...el.querySelectorAll('.ov-anim')];
  const imgs = [...el.querySelectorAll('.journey-media img,.suite-modal-media img,.atlas-canvas img,.atlas-stage img')];
  gsap.killTweensOf([el,panel,...items,...imgs]);
  const tl = gsap.timeline();
  tl.fromTo(el,{autoAlpha:0},{autoAlpha:1,duration:.55,ease:'power2.out'},0)
    .fromTo(panel,{y:64,scale:.955,autoAlpha:0},{y:0,scale:1,autoAlpha:1,duration:.85,ease:'expo.out',clearProps:'transform'},.05)
    .fromTo(items,{y:28,autoAlpha:0},{y:0,autoAlpha:1,duration:.8,stagger:.045,ease:'power3.out',clearProps:'transform'},.22);
  if(imgs.length) tl.fromTo(imgs,{scale:1.16},{scale:1,duration:1.8,ease:'power2.out',clearProps:'transform'},.05);
  const pins = [...el.querySelectorAll('.map-pin')];
  if(pins.length) tl.fromTo(pins,{scale:0,autoAlpha:0},{scale:1,autoAlpha:1,duration:.7,ease:'back.out(2.2)',stagger:.035,clearProps:'transform'},.75);
}
CDL.overlayOut = (el,done) => {
  const panel = panelOf(el);
  gsap.killTweensOf([el,panel]);
  gsap.timeline({onComplete:()=>{ done(); gsap.set([el,panel,...el.querySelectorAll('.ov-anim,.map-pin')],{clearProps:'opacity,visibility,transform'}); }})
    .to(panel,{y:28,scale:.985,autoAlpha:0,duration:.42,ease:'power2.in'},0)
    .to(el,{autoAlpha:0,duration:.42,ease:'power1.inOut'},.06);
};
document.addEventListener('cdl:overlay',e=>{ if(e.detail.open){ showHeader(); overlayIn(e.detail.el); } });

/* ---------- Troca de conteúdo (abas, perfis, filtros) ---------- */
const q = (s,r=document) => [...r.querySelectorAll(s)];
const textIn = els => { if(els.length) gsap.fromTo(els,{autoAlpha:0,y:20},{autoAlpha:1,y:0,duration:.8,stagger:.06,ease:'power3.out',overwrite:true,clearProps:'transform'}); };
const imageIn = el => { if(el) gsap.fromTo(el,{autoAlpha:0},{autoAlpha:1,duration:1.1,ease:'power2.out',overwrite:true}); };
function textCards(cards){ if(cards.length) gsap.fromTo(cards,{autoAlpha:0,y:34},{autoAlpha:1,y:0,duration:.9,stagger:.06,ease:'power3.out',overwrite:true,clearProps:'transform'}); }
document.addEventListener('click',e=>{
  const t = e.target; let f = null;
  if(t.closest('.time-tab')) f = ()=>{ imageIn(document.getElementById('homeTimeImage')); textIn(q('.time-scene-copy > *')); };
  else if(t.closest('.moment-tabs button')) f = ()=>{ imageIn(document.getElementById('viverMomentImage')); textIn(q('.moment-copy > *')); };
  else if(t.closest('.program-day')) f = ()=>{ imageIn(document.getElementById('programImage')); textIn(q('.program-stage-copy > *')); };
  else if(t.closest('#homeExperienceDays button')) f = ()=>{ imageIn(document.getElementById('homeProgramImage')); textIn(q('#page-home .experience-panel .feature-body > *:not(.chip-row):not(.hero-actions)')); };
  else if(t.closest('.profile-card')) f = ()=>textIn(q('.profile-result > *'));
  else if(t.closest('.event-selector button')) f = ()=>{ textIn(q('.event-copy > *')); };
  else if(t.closest('#journeyChoices button')) f = ()=>{ imageIn(document.getElementById('journeyImage')); textIn(q('#journeyOverlay .journey-copy .ov-anim, #journeyChoices button')); };
  else if(t.closest('[data-atlas-place],.atlas-lenses button,#atlasOptions button')) f = ()=>{ imageIn(document.getElementById('atlasDetailImage')); textIn(q('.atlas-detail > *:not(.detail-image)')); };
  else if(t.closest('.suite-filter[data-suite-filter]')) f = ()=>{ textCards(q('#page-suites .suite-card:not(.hidden-by-filter)')); };
  else if(t.closest('[data-chapada-filter]')) f = ()=>{ textCards(q('#page-chapada .chapada-card:not(.hidden-by-filter)')); };
  if(f) requestAnimationFrame(()=>{ f(); setTimeout(()=>ScrollTrigger.refresh(),450); });
});

/* ---------- Vídeos de fundo: só tocam quando aparecem ---------- */
if('IntersectionObserver' in window){
  const io = new IntersectionObserver(es=>es.forEach(en=>{ const v = en.target; if(en.isIntersecting){ const p = v.play(); if(p) p.catch(()=>{}); } else v.pause(); }),{threshold:.05});
  q('video[autoplay]').forEach(v=>io.observe(v));
}
})();
