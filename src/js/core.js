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
const shortDate = iso => iso ? iso.split('-').reverse().slice(0,2).join('/') : '';
function bookingRooms(b){ const total = (Number(b.adults)||0) + (Number(b.children)||0); return Math.max(1, Math.ceil(total/4)); }
function omnibeesUrl(b){
  b = b || booking;
  const q = new URLSearchParams(); q.set('q',OMNIBEES.hotel);
  if(b.arrival) q.set('CheckIn',ddMMyyyy(b.arrival));
  if(b.departure) q.set('CheckOut',ddMMyyyy(b.departure));
  if(b.code) q.set('Code',String(b.code).trim());
  q.set('NRooms',String(bookingRooms(b))); q.set('ad',String(b.adults||1)); q.set('ch',String(b.children||0));
  return OMNIBEES.results + '?' + q.toString();
}
function whatsappUrl(text){ return 'https://api.whatsapp.com/send?phone=' + CONTACT.whatsapp + (text ? '&text=' + encodeURIComponent(text) : ''); }
function bookingGuestsLabel(b){
  const a = Number(b.adults)||0, ch = Number(b.children)||0;
  return a + (a===1?' adulto':' adultos') + (ch ? ' · ' + ch + (ch===1?' criança':' crianças') : '');
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
  CONTACT, OMNIBEES, booking, omnibeesUrl, whatsappUrl, bookingGuestsLabel, shortDate,
  showToast, openOverlay, closeOverlays, scrollToId, scrollTop, goPage, updateBookingDock, lenis:null,
  openSuite:null, openAtlas:null, openJourney:null, openCompare:null /* preenchidos por overlays.js */
};
Object.defineProperty(CDL,'currentPage',{get:()=>state.page});

/* Delegação dos botões globais — funciona mesmo que a página não tenha todos os elementos */
document.addEventListener('click',e=>{
  const t = e.target;
  const pageLink = t.closest('[data-page-target]');
  if(pageLink){ e.preventDefault(); goPage(pageLink.dataset.pageTarget,{anchor:pageLink.dataset.anchor}); return; }
  if(t.closest('.close-overlay')){ closeOverlays(); return; }
  const scroll = t.closest('[data-scroll-to]');
  if(scroll){ scrollToId(scroll.dataset.scrollTo); return; }
  if(t.closest('.atlas-open')){ CDL.openAtlas ? CDL.openAtlas() : openOverlay('atlasOverlay'); return; }
  if(t.closest('.journey-open')){ CDL.openJourney ? CDL.openJourney() : openOverlay('journeyOverlay'); return; }
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
  if(p && p!==state.page) goPage(p,{instant:true});
});

document.addEventListener('DOMContentLoaded',()=>{
  state.ready.forEach(fn=>fn());
  const hash = location.hash.replace('#','');
  if(hash) goPage(hash,{instant:true}); else goPage('home',{instant:true,force:true});
  state.started = true;
});
})();
