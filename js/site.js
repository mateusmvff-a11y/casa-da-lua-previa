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

const state = {page:'home', ready:[], pageHooks:{}};

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
  el.classList.add('open'); el.setAttribute('aria-hidden','false');
  document.body.classList.add('no-scroll');
}
function closeOverlays(){
  $$('.overlay.open').forEach(el=>{el.classList.remove('open');el.setAttribute('aria-hidden','true')});
  document.body.classList.remove('no-scroll');
}
function headerH(){ return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 76; }
function scrollToId(id){
  const el = document.getElementById(id); if(!el) return;
  if(CDL.lenis) CDL.lenis.scrollTo(el,{offset:-headerH(),duration:1.4,easing:t=>1-Math.pow(1-t,4)});
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
}
function goPage(page, opts={}){
  if(!document.querySelector(`.page[data-page="${page}"]`)) page = 'home';
  const prev = state.page;
  state.page = page;
  $$('.page').forEach(p=>p.classList.toggle('active',p.dataset.page===page));
  $$('.nav-link').forEach(n=>n.classList.toggle('active',n.dataset.pageTarget===page));
  history.replaceState(null,'',`#${page}`);
  closeOverlays();
  updateBookingDock();
  (state.pageHooks[page]||[]).forEach(fn=>fn());
  document.dispatchEvent(new CustomEvent('cdl:page',{detail:{page,prev}}));
  if(!opts.keepScroll) scrollTop(opts.instant);
}

/* API pública para os scripts das páginas e das sobreposições */
const CDL = window.CDL = {
  $, $$, ASSETS, SUITES, PROGRAM_DATA, DOCK, state, ready, onPage,
  showToast, openOverlay, closeOverlays, scrollToId, scrollTop, goPage, updateBookingDock, lenis:null,
  openSuite:null, openAtlas:null, openJourney:null, openCompare:null /* preenchidos por overlays.js */
};
Object.defineProperty(CDL,'currentPage',{get:()=>state.page});

/* Delegação dos botões globais — funciona mesmo que a página não tenha todos os elementos */
document.addEventListener('click',e=>{
  const t = e.target;
  const pageLink = t.closest('[data-page-target]');
  if(pageLink){ e.preventDefault(); goPage(pageLink.dataset.pageTarget); return; }
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
    else goPage('reservar');
    return;
  }
  if(t.classList && t.classList.contains('overlay')) closeOverlays();
});
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeOverlays(); });
document.addEventListener('submit',e=>{
  if(e.target.closest('.interest-form,.proposal-form')){ e.preventDefault(); showToast('Formulário demonstrativo. A integração será definida.'); }
});
window.addEventListener('hashchange',()=>{
  const p = location.hash.replace('#','');
  if(p && p!==state.page) goPage(p,{instant:true});
});

document.addEventListener('DOMContentLoaded',()=>{
  state.ready.forEach(fn=>fn());
  const hash = location.hash.replace('#','');
  if(hash) goPage(hash,{instant:true}); else updateBookingDock();
});
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
    night:{img:A.night||'assets/img/v16-night.webp',alt:'Casa da Lua acesa à noite',kicker:'Noite',title:'A casa acende e ganha outro silêncio.',text:'Fogo, cinema, bilhar e mesa entram como possibilidades para ficar mais um pouco.'}
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

  /* ---- Atlas em miniatura: pinos chamam CDL.selectHomeAtlas (overlays.js) ---- */
  $$('.atlas-home-card .map-pin').forEach(b=>b.addEventListener('click',()=>{
    const place = b.dataset.place;
    if(typeof CDL.selectHomeAtlas==='function'){ CDL.selectHomeAtlas(place); return; }
    /* reserva: se overlays.js ainda não carregou, atualiza só o cartão */
    $$('.atlas-home-card .map-pin').forEach(p=>p.classList.toggle('active',p===b));
    setText('homeAtlasTitle',place);
    const d = CDL.ATLAS_PLACES && CDL.ATLAS_PLACES[place];
    if(d && d.text) setText('homeAtlasText',d.text);
  }));

  /* ---- Experiência Tidelli: dias (CDL.PROGRAM_DATA); quinta = imagem do Figma ---- */
  const EXP_IMG = {quinta:'assets/img/3c03d3.webp'};
  function setHomeExperienceDay(day){
    const P = CDL.PROGRAM_DATA||{}; const d = P[day]; if(!d) return;
    $$('#homeExperienceDays button').forEach(b=>b.classList.toggle('active',b.dataset.expDay===day));
    setText('homeExpKicker',d.eyebrow);
    setText('homeExpTitle',np(d.title));
    setText('homeExpText',np(d.text));
    const mo = document.getElementById('homeExpMoments');
    if(mo) mo.innerHTML = d.schedule.map(r=>`<span>${r[0]}</span>`).join('');
    const img = document.getElementById('homeProgramImage');
    if(img) img.src = EXP_IMG[day] || A[d.asset] || img.src;
  }
  $$('#homeExperienceDays button').forEach(b=>b.addEventListener('click',()=>setHomeExperienceDay(b.dataset.expDay)));
});


/* Página A Casa — pinos do Atlas em miniatura (V16: selectHomeAtlas) */
CDL.ready(()=>{
  const root = document.getElementById('page-casa');
  if(!root) return;
  const pins = [...root.querySelectorAll('.atlas-teaser .map-pin')];
  const title = root.querySelector('#casaAtlasTitle');
  const text = root.querySelector('#casaAtlasText');
  if(!pins.length) return;
  pins.forEach(btn=>{
    btn.addEventListener('click',()=>{
      const place = btn.dataset.place;
      if(typeof CDL.selectHomeAtlas === 'function') CDL.selectHomeAtlas(place);
      pins.forEach(p=>p.classList.toggle('active', p===btn));
      const data = CDL.ATLAS_PLACES && CDL.ATLAS_PLACES[place];
      if(title && place) title.textContent = place;
      if(text && data && data.text) text.textContent = data.text;
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
    afternoon:{img:'assets/img/v16-pool.webp',alt:'Piscina da Casa da Lua no fim de tarde',time:'17h40',eyebrow:'A volta',title:'Água, spa e um ritmo mais lento',
      text:'Piscina, jacuzzi, sauna, massagem e jardim recebem quem volta da Chapada sem pedir outro deslocamento.',tags:['piscina','hidro','spa','descanso']},
    night:{img:'assets/img/v16-night.webp',alt:'Casa da Lua à noite',time:'21h',eyebrow:'A casa acende',title:'Fogo, mesa, cinema e conversa',
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
    if(img) img.src = day === 'quinta' ? FIGMA_QUINTA.img : (A[d.asset] || img.src);
    if(eb) eb.textContent = d.eyebrow;
    if(ti){ if(day === 'quinta') ti.innerHTML = FIGMA_QUINTA.title; else ti.textContent = noDot(d.title); }
    if(tx) tx.textContent = d.text;
    if(sc) sc.innerHTML = d.schedule.map(r => `<div class="schedule-item"><span>${esc(r[0])}</span><p>${esc(noDot(r[1]))}</p></div>`).join('');
  }
  days.forEach(b => b.addEventListener('click', () => setDay(b.dataset.programDay)));
});


/* Eventos e Imersões: configurador de formato (dados e diagramas do V16) */
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

  function objectsHTML(layout){
    if(layout==='wedding') return `
      <div class="floor-zone" style="left:19%;top:24%;width:30%;height:16%;border-radius:999px">Cerimônia</div>
      <div class="floor-zone" style="left:16%;top:48%;width:13%;height:13%;border-radius:50%">Mesa</div>
      <div class="floor-zone" style="left:32%;top:48%;width:13%;height:13%;border-radius:50%">Mesa</div>
      <div class="floor-zone" style="left:48%;top:48%;width:13%;height:13%;border-radius:50%">Mesa</div>`;
    if(layout==='work') return `
      <div class="floor-zone" style="left:17%;top:25%;width:38%;height:10%">Tela / conteúdo</div>
      <div class="floor-zone" style="left:16%;top:43%;width:18%;height:12%">Grupo</div>
      <div class="floor-zone" style="left:38%;top:43%;width:18%;height:12%">Grupo</div>
      <div class="floor-zone" style="left:23%;top:62%;width:27%;height:12%">Roda</div>`;
    if(layout==='circle') return `
      <div class="floor-zone" style="left:20%;top:23%;width:34%;height:34%;border-radius:50%">Prática / roda</div>
      <div class="floor-zone" style="left:18%;top:64%;width:18%;height:10%">Apoio</div>
      <div class="floor-zone" style="left:40%;top:64%;width:18%;height:10%">Mesa</div>`;
    return `
      <div class="floor-zone" style="left:16%;top:22%;width:38%;height:18%">Mesa principal</div>
      <div class="floor-zone" style="left:16%;top:48%;width:18%;height:14%">Convivência</div>
      <div class="floor-zone" style="left:38%;top:48%;width:18%;height:14%">Bar</div>`;
  }

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
    set('eventObjects',objectsHTML(d.layout));
    const eo = document.getElementById('eventObjects'); if(eo) eo.classList.toggle('solid',d.layout!=='wedding');
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
  const fmt = v => v ? v.split('-').reverse().join('/') : 'data a definir';
  const totalGuests = () => Number($('#reserveAdults').value||0) + Number($('#reserveChildren').value||0);

  function setStep(n){
    $$('.reserve-step').forEach(s=>s.classList.toggle('hidden',Number(s.dataset.step)!==n));
    $$('.step-dot').forEach((d,i)=>d.classList.toggle('active',i<n));
    $('#reserveSideTitle').textContent = SIDE[n-1][0];
    $('#reserveSideText').textContent = SIDE[n-1][1];
    if(n===3) renderSuggestions();
    if(n===4) renderSummary();
    const card = $('.form-card');
    if(card && card.getBoundingClientRect().top < 70) card.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function renderSuggestions(){
    const total = totalGuests();
    const box = $('#reserveSuggestions');
    if(total>4){
      box.innerHTML = `<article class="suggestion"><strong>Combinação de suítes</strong><p>Para ${total} hóspedes, a equipe precisa combinar duas ou mais categorias.</p></article>`;
      return;
    }
    const score = s=>{
      let n = 0;
      prefs.forEach(p=>{ if(s.tags.includes(p) || (p==='hidro' && (s.tags.includes('hidro')||s.tags.includes('ofurô')))) n += 3; });
      return n - Math.abs(s.guests-total);
    };
    const top = SUITES.filter(s=>s.guests>=Math.min(total,4)).sort((a,b)=>score(b)-score(a)).slice(0,3);
    box.innerHTML = top.map(s=>`<button type="button" class="suggestion reserve-suite-choice" data-suite="${s.id}"><strong>${s.name}</strong><p>${s.area} · até ${s.guests} hóspedes</p></button>`).join('');
  }

  function renderSummary(){
    const sel = $('.reserve-suite-choice.active');
    const suite = sel ? SUITES.find(s=>s.id===sel.dataset.suite) : null;
    $('#reserveSummary').innerHTML = `<h3>Resumo</h3><p><strong>${fmt($('#reserveArrival').value)}</strong> a <strong>${fmt($('#reserveDeparture').value)}</strong><br>${totalGuests()} hóspedes${suite?`<br>Preferência: ${suite.name}`:''}</p>`;
  }

  $$('.reserve-next').forEach(b=>b.addEventListener('click',()=>setStep(Number(b.dataset.nextStep))));
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
  $('#openBookingEngine').addEventListener('click',()=>CDL.showToast('Conectar ao motor oficial após auditoria técnica.'));
  $('#openWhatsApp').addEventListener('click',()=>CDL.showToast('Conectar ao WhatsApp ou Otélia com o contexto da viagem.'));
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

/* ---------- Atlas: dados (V16 1808). Posições x/y em % da planta (assets/img/350edc.webp),
   reposicionadas sobre o que a foto mostra; seguem ilustrativas, a validar com a planta. ---------- */
const ATLAS_PLACES = CDL.ATLAS_PLACES = {
  'Chegada e estacionamento':{asset:'hero',text:'É por aqui que a experiência começa, com acesso próprio e uma leitura mais clara da chegada à propriedade.',group:'chegada',moments:['manha','tarde','noite'],company:['familia','amigos','pet','grupo'],programs:['tidelli','eventos'],x:70,y:11,page:'casa',cta:'Entender a chegada',tags:['acesso','estacionamento']},
  'Casa principal':{asset:'night',text:'Núcleo original da propriedade, ligado à memória da casa e a parte da hospedagem.',group:'convivencia',moments:['manha','tarde','noite'],company:['familia','amigos','pet','grupo'],programs:['tidelli','eventos'],x:22,y:89,page:'casa',cta:'Conhecer A Casa',tags:['origem','convivência']},
  'Restaurante e café':{asset:'breakfast',text:'É onde a manhã começa e onde a mesa costuma reunir hóspedes, famílias e grupos.',group:'convivencia',moments:['manha','tarde','noite'],company:['familia','amigos','grupo'],programs:['tidelli','eventos'],x:40,y:74,page:'viver',cta:'Ver a vida da casa',tags:['café','mesa']},
  'Piscina e área de descanso':{asset:'pool',text:'A planta identifica a piscina como um dos centros da propriedade. A posição exata do spa e da massagem ainda precisa ser confirmada.',group:'bem-estar',moments:['tarde'],company:['familia','amigos'],programs:['tidelli'],x:24,y:30,page:'viver',cta:'Viver o fim de tarde',tags:['piscina','descanso']},
  'Área de eventos':{asset:'events',text:'Salão e área de apoio para casamentos, imersões, retiros e celebrações.',group:'eventos',moments:['manha','tarde','noite'],company:['grupo'],programs:['eventos'],x:86,y:24,page:'eventos',cta:'Ver eventos',tags:['salão','encontros']},
  'Círculo do fogo':{asset:'fire',text:'Na época de seca, o círculo reúne conversa, vinho e céu aberto.',group:'convivencia',moments:['noite'],company:['familia','amigos','grupo'],programs:['tidelli','eventos'],x:88,y:80,page:'viver',cta:'Viver a noite',tags:['fogo','convivência']},
  'Suítes da ala lateral':{asset:'suite',text:'O rascunho da planta indica um conjunto lateral com quartos, uma suíte e o espaço da sinuca.',group:'hospedagem',moments:['manha','tarde','noite'],company:['familia','amigos'],programs:['tidelli','eventos'],x:6,y:66,page:'suites',cta:'Ver suítes',tags:['ala lateral','quartos']},
  'Bloco de suítes 6 a 10':{asset:'suite',text:'Bloco identificado na planta como o conjunto das suítes 6 a 10.',group:'hospedagem',moments:['manha','tarde','noite'],company:['familia','amigos','grupo'],programs:['tidelli','eventos'],x:56,y:90,page:'suites',cta:'Ver suítes',tags:['suítes','bloco']},
  'Faixa verde central':{asset:'outdoor',text:'Área aberta que costura pousada, restaurante, suítes, círculo e eventos.',group:'convivencia',moments:['manha','tarde','noite'],company:['familia','amigos','pet','grupo'],programs:['tidelli','eventos'],x:62,y:48,page:'casa',cta:'Explorar a propriedade',tags:['jardim','circulação']},
  'Área complementar':{asset:'outdoor',text:'Trecho livre à direita da propriedade, útil para apoiar fluxos de eventos ou novas leituras do espaço.',group:'eventos',moments:['manha','tarde'],company:['grupo'],programs:['eventos'],x:80,y:58,page:'eventos',cta:'Entender usos',tags:['apoio','área livre']}
};

const LENS_OPTIONS = {
  lugar:[['all','Todos'],['hospedagem','Hospedagem'],['bem-estar','Bem-estar'],['convivencia','Convivência'],['eventos','Eventos'],['chegada','Chegada']],
  momento:[['manha','7h30'],['tarde','17h40'],['noite','21h']],
  companhia:[['familia','Família'],['amigos','Amigos'],['pet','Pet'],['grupo','Grupo']],
  programa:[['tidelli','Experiência Tidelli'],['eventos','Eventos e imersões']]
};
let atlasLens = 'lugar', atlasOption = 'all', atlasPlace = 'Casa principal';

/* Home e A Casa: pino de miniatura -> título/texto (nulo-seguro) */
CDL.selectHomeAtlas = function(place){
  const d = ATLAS_PLACES[place] || ATLAS_PLACES['Casa principal'];
  $$('.atlas-home-card .map-pin,.atlas-teaser .map-pin').forEach(b=>b.classList.toggle('active',b.dataset.place===place));
  const t = $('#homeAtlasTitle'), x = $('#homeAtlasText');
  if(t) t.textContent = place;
  if(x) x.textContent = d.text;
};

function atlasMatches(d){
  if(atlasLens==='lugar') return atlasOption==='all' || d.group===atlasOption;
  if(atlasLens==='momento') return d.moments.includes(atlasOption);
  if(atlasLens==='companhia') return d.company.includes(atlasOption);
  if(atlasLens==='programa') return d.programs.includes(atlasOption);
  return true;
}
function renderAtlasOptions(){
  const wrap = $('#atlasOptions'); if(!wrap) return;
  wrap.innerHTML = (LENS_OPTIONS[atlasLens]||[]).map(o=>`<button type="button" class="${o[0]===atlasOption?'active':''}" data-atlas-option="${o[0]}">${o[1]}</button>`).join('');
}
function renderAtlas(){
  const visible = Object.entries(ATLAS_PLACES).filter(([,d])=>atlasMatches(d));
  if(visible.length && !visible.some(([n])=>n===atlasPlace)) atlasPlace = visible[0][0];
  const list = $('#atlasList'), pins = $('#atlasPins');
  if(list) list.innerHTML = visible.map(([n],i)=>`<button type="button" class="${n===atlasPlace?'active':''}" data-atlas-place="${n}"><i>${i+1}</i>${n}</button>`).join('');
  if(pins) pins.innerHTML = visible.map(([n,d],i)=>`<button type="button" class="map-pin ${n===atlasPlace?'active':''}" data-atlas-place="${n}" style="left:${d.x}%;top:${d.y}%" aria-label="${n}">${i+1}</button>`).join('');
  renderAtlasOptions();
  if(visible.length) selectAtlas(atlasPlace,false);
  else {
    const t = $('#atlasDetailTitle'); if(t) t.textContent = 'Nenhum ponto nesta leitura';
  }
}
function centerPin(){
  const canvas = $('#atlasCanvas'), pin = $('#atlasPins .map-pin.active');
  if(!canvas || !pin || canvas.scrollWidth<=canvas.clientWidth+2) return;
  canvas.scrollTo({left:pin.offsetLeft-canvas.clientWidth/2,behavior:'smooth'});
}
function selectAtlas(place,rerender=true){
  const d = ATLAS_PLACES[place] || ATLAS_PLACES['Casa principal'];
  atlasPlace = place;
  $$('#atlasOverlay [data-atlas-place]').forEach(b=>b.classList.toggle('active',b.dataset.atlasPlace===place));
  const set = (id,v)=>{ const e=document.getElementById(id); if(e) e.textContent=v; };
  set('atlasDetailTitle',place); set('atlasDetailText',d.text);
  const img = $('#atlasDetailImage'); if(img){ img.src = IMG(d.asset); img.alt = place; }
  const tags = $('#atlasDetailTags'); if(tags) tags.innerHTML = d.tags.map(t=>`<span>${t}</span>`).join('');
  const cta = $('#atlasDetailCTA'); if(cta){ cta.textContent = d.cta; cta.dataset.pageTarget = d.page; }
  if(rerender) renderAtlas(); else centerPin();
}
function setAtlasLens(lens){
  atlasLens = lens;
  atlasOption = (LENS_OPTIONS[lens]||[['all','Todos']])[0][0];
  $$('#atlasOverlay [data-atlas-lens]').forEach(b=>b.classList.toggle('active',b.dataset.atlasLens===lens));
  renderAtlas();
}
CDL.openAtlas = function(){
  renderAtlas();
  CDL.openOverlay('atlasOverlay');
  const c = $('#atlasOverlay .close-overlay'); if(c) c.focus({preventScroll:true});
  requestAnimationFrame(centerPin);
};

/* ---------- Percurso "Entrar na Casa" (V16 1811 e 2096) ---------- */
const JOURNEY_SCENES = [
  {id:'arrival',asset:'hero',kicker:'Chegada',title:'A casa aparece entre jardim e luz.',text:'O percurso começa pela chegada e abre duas escolhas: seguir para o jardim ou ir direto às suítes.',choices:[['Seguir pelo jardim','garden'],['Conhecer as suítes','suites']]},
  {id:'garden',asset:'outdoor',kicker:'Jardim',title:'O lado de fora funciona como sala.',text:'Caminhos, sombra e lugares de permanência conectam a casa, a piscina e os recantos.',choices:[['Ir para a piscina','pool'],['Abrir o Atlas','atlas']]},
  {id:'pool',asset:'pool',kicker:'Fim de tarde',title:'A água recebe quem volta.',text:'Piscina e jacuzzi entram no momento em que o corpo muda de ritmo depois da Chapada.',choices:[['Seguir para o bem-estar','wellness'],['Ver suítes próximas','suites']]},
  {id:'wellness',asset:'wellness',kicker:'Bem-estar',title:'Spa, sauna e massagem prolongam a volta.',text:'Spa, sauna e massagem prolongam a volta e ajudam o corpo a mudar de ritmo depois da Chapada.',choices:[['Chegar à noite','night'],['Planejar a estadia','reserve']]},
  {id:'night',asset:'fire',kicker:'Noite',title:'Fogo, mesa e céu encerram o percurso.',text:'Daqui, a pessoa pode seguir para a reserva ou voltar a explorar a casa.',choices:[['Reservar','reserve'],['Voltar ao Atlas','atlas']]}
];
function renderJourney(id){
  const sc = JOURNEY_SCENES.find(s=>s.id===id) || JOURNEY_SCENES[0];
  const img = $('#journeyImage'); if(img){ img.src = IMG(sc.asset); img.alt = sc.kicker; }
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
/* Fotos provisórias do Figma por categoria (Suites: 9efed9 / bef858 / a58fed) */
const SUITE_IMG = {standard:'assets/img/9efed9.webp','luxo-superior':'assets/img/a58fed.webp'};
CDL.openSuite = function(id){
  const s = CDL.SUITES.find(x=>x.id===id);
  if(!s) return;
  const set = (i,v)=>{ const e=document.getElementById(i); if(e) e.textContent=v; };
  set('suiteModalTitle',s.name);
  set('suiteModalUnits',`${s.units} ${s.units===1?'unidade':'unidades'} · ${s.area}`);
  set('suiteModalIntro',`${s.beds}. ${s.location}. ${s.outdoor}.`);
  const img = $('#suiteModalImage'); if(img){ img.src = SUITE_IMG[s.id] || 'assets/img/bef858.webp'; img.alt = `Suíte ${s.name}`; }
  const meta = $('#suiteModalMeta');
  if(meta) meta.innerHTML = [['Capacidade',`Até ${s.guests} hóspedes`],['Acesso',s.access],['Vista',s.view],['Área externa',s.outdoor]].map(x=>`<div class="meta-item"><small>${x[0]}</small><strong>${x[1]}</strong></div>`).join('');
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
    ['Capacidade',...list.map(s=>`Até ${s.guests}`)],
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
  const list = $('#atlasList'), pins = $('#atlasPins'), opts = $('#atlasOptions');
  if(list) list.addEventListener('click',onPlace);
  if(pins) pins.addEventListener('click',onPlace);
  if(opts) opts.addEventListener('click',e=>{ const b=e.target.closest('[data-atlas-option]'); if(b){ atlasOption=b.dataset.atlasOption; renderAtlas(); } });
  $$('#atlasOverlay [data-atlas-lens]').forEach(b=>b.addEventListener('click',()=>setAtlasLens(b.dataset.atlasLens)));

  /* menu mobile: marca a página atual (o clique que abre o menu é tratado pelo core.js) */
  const mb = document.getElementById('mobileMenuBtn');
  if(mb) mb.addEventListener('click',()=>{
    $$('#mobileNavOverlay [data-page-target]').forEach(b=>b.classList.toggle('active',b.dataset.pageTarget===CDL.currentPage));
  });
});
})();


/* =========================================================
   Casa da Lua — motion.js
   Movimento calmo e editorial (GSAP + ScrollTrigger + SplitText + Lenis).
   O HTML só marca o que anima:
     data-anim="hero"    seção de abertura: imagem desce do zoom, texto entra em sequência
     data-anim="title"   títulos entram por linhas (máscara)
     data-anim="reveal"  blocos sobem e aparecem; no pai, data-stagger escalona os filhos
     data-anim="image"   moldura de imagem abre por máscara e a foto assenta (zoom leve)
     data-parallax="-8"  imagem/fundo desliza com a rolagem (% da altura)
   Cada página cria os seus gatilhos ao abrir e os desfaz ao sair (gsap.context).
   ========================================================= */
(function(){
'use strict';
const root = document.documentElement;
const fail = () => { root.classList.remove('motion-on'); };
if(!window.CDL) return;
const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || reduz){ fail(); return; }
const CDL = window.CDL;
gsap.registerPlugin(ScrollTrigger);
if(typeof SplitText !== 'undefined') gsap.registerPlugin(SplitText);
const hasSplit = typeof SplitText !== 'undefined';
gsap.defaults({ease:'power3.out'});

/* ---------- Rolagem suave (Lenis) ---------- */
let lenis = null;
if(typeof Lenis !== 'undefined' && !window.matchMedia('(pointer:coarse)').matches){
  lenis = new Lenis({lerp:.1,wheelMultiplier:.95});
  CDL.lenis = lenis;
  lenis.on('scroll',ScrollTrigger.update);
  gsap.ticker.add(t=>lenis.raf(t*1000));
  gsap.ticker.lagSmoothing(0);
  /* O Lenis guarda a altura da página: remede quando o ScrollTrigger recalcula,
     quando o corpo muda de tamanho (troca de página, abas) e quando tudo carrega. */
  ScrollTrigger.addEventListener('refresh',()=>lenis.resize());
  if('ResizeObserver' in window) new ResizeObserver(()=>lenis.resize()).observe(document.body);
  window.addEventListener('load',()=>{ lenis.resize(); ScrollTrigger.refresh(); });
  /* sobreposições rolam por dentro: o Lenis não interfere */
  document.querySelectorAll('.overlay,.modal,.drawer').forEach(el=>el.setAttribute('data-lenis-prevent',''));
  new MutationObserver(()=>{ document.body.classList.contains('no-scroll') ? lenis.stop() : lenis.start(); })
    .observe(document.body,{attributes:true,attributeFilter:['class']});
}

/* ---------- Animações por página ---------- */
const contexts = {};     // page -> gsap.Context
const splits = {};       // page -> [SplitText]

function build(pageEl){
  const page = pageEl.dataset.page;
  kill(page);
  const ctx = gsap.context(()=>{},pageEl);
  contexts[page] = ctx;
  ctx.add(()=>{
    const sp = splits[page] = [];

    /* HERO: entra ao abrir a página (não espera rolagem) */
    pageEl.querySelectorAll('[data-anim="hero"]').forEach(hero=>{
      const bg = hero.querySelector('img, .section-bg, .hero-bg');
      if(bg){
        gsap.fromTo(bg,{scale:1.14},{scale:1,duration:2.6,ease:'power2.out'});
        gsap.to(bg,{yPercent:10,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true}});
      }
      const inner = [...hero.querySelectorAll('[data-anim="title"],[data-anim="reveal"]')];
      inner.forEach((el,i)=>{
        if(el.dataset.anim === 'title') titleIn(el,{delay:.25,hero:true},sp,ctx);
        else gsap.fromTo(el,{autoAlpha:0,y:26},{autoAlpha:1,y:0,duration:1.1,delay:.55+i*.1});
      });
    });

    /* TÍTULOS (fora do hero) */
    pageEl.querySelectorAll('[data-anim="title"]').forEach(el=>{
      if(el.closest('[data-anim="hero"]')) return;
      titleIn(el,{},sp,ctx);
    });

    /* REVEAL (com escalonamento por pai) */
    const seen = new Set();
    pageEl.querySelectorAll('[data-anim="reveal"]').forEach(el=>{
      if(el.closest('[data-anim="hero"]') || seen.has(el)) return;
      const parent = el.parentElement;
      let group = [el], delayStep = 0;
      if(parent && parent.hasAttribute('data-stagger')){
        group = [...parent.children].filter(c=>c.dataset.anim === 'reveal');
        delayStep = .1;
      }
      group.forEach(g=>seen.add(g));
      group.forEach((g,i)=>{
        gsap.fromTo(g,{autoAlpha:0,y:30},{autoAlpha:1,y:0,duration:1.05,delay:i*delayStep,
          scrollTrigger:{trigger:parent && delayStep ? parent : g,start:'top 88%',toggleActions:'play none none none'}});
      });
    });

    /* IMAGENS: máscara abre + foto assenta */
    pageEl.querySelectorAll('[data-anim="image"]').forEach(box=>{
      const img = box.querySelector('img');
      const tl = gsap.timeline({scrollTrigger:{trigger:box,start:'top 88%',toggleActions:'play none none none'}});
      tl.fromTo(box,{autoAlpha:0,clipPath:'inset(9% 5% 9% 5% round 26px)'},{autoAlpha:1,clipPath:'inset(0% 0% 0% 0% round 0px)',duration:1.5,ease:'power3.inOut'});
      if(img) tl.fromTo(img,{scale:1.2},{scale:1,duration:1.9,ease:'power2.out'},0);
    });

    /* PARALLAX */
    pageEl.querySelectorAll('[data-parallax]').forEach(el=>{
      const v = parseFloat(el.dataset.parallax) || 0; if(!v) return;
      const box = el.parentElement || el;
      gsap.fromTo(el,{yPercent:-v,scale:1.14},{yPercent:v,scale:1.14,ease:'none',
        scrollTrigger:{trigger:box,start:'top bottom',end:'bottom top',scrub:true}});
    });
  });
}

function titleIn(el,opts,sp,ctx){
  const run = ()=>{ if(contexts[el.closest('.page').dataset.page] !== ctx) return; ctx.add(()=>{
    el.style.visibility = 'visible';
    if(!hasSplit){ gsap.fromTo(el,{autoAlpha:0,y:30},{autoAlpha:1,y:0,duration:1.1,delay:opts.delay||0,
      scrollTrigger:opts.hero?undefined:{trigger:el,start:'top 88%',toggleActions:'play none none none'}}); return; }
    const s = SplitText.create(el,{type:'lines',linesClass:'split-line',mask:'lines'});
    gsap.from(s.lines,{yPercent:115,duration:1.25,stagger:.09,ease:'power4.out',delay:opts.delay||0,
      scrollTrigger:opts.hero?undefined:{trigger:el,start:'top 88%',toggleActions:'play none none none'}});
    sp.push(s);
  }); };
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
  /* espera o frame em que a página já está visível para medir */
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    build(pageEl);
    ScrollTrigger.refresh();
  }));
}

document.addEventListener('cdl:page',e=>activate(e.detail.page));
/* ao mudar a LARGURA, as linhas dos títulos mudam: refaz a página atual (com atraso) */
let lastW = window.innerWidth, rz;
window.addEventListener('resize',()=>{ clearTimeout(rz); rz = setTimeout(()=>{ if(window.innerWidth !== lastW){ lastW = window.innerWidth; activate(CDL.currentPage); } },450); });
/* primeira carga: o core chama goPage (hash) ou updateBookingDock; garanta a página ativa */
window.addEventListener('DOMContentLoaded',()=>{ setTimeout(()=>{ if(!contexts[CDL.currentPage]) activate(CDL.currentPage); },60); });

/* Abas/filtros mudam a altura: remede depois que o navegador pintou */
document.addEventListener('click',e=>{
  if(e.target.closest('.suite-filter,.chip-button,[data-viver-moment],.program-day,[data-event-type],.time-tab,.profile-card,[data-chapada-filter]'))
    setTimeout(()=>ScrollTrigger.refresh(),420);
});

/* Cabeçalho ganha sombra fina depois do topo */
const header = document.querySelector('.site-header');
if(header){ const marca=()=>header.classList.toggle('is-scrolled',window.scrollY>80); window.addEventListener('scroll',marca,{passive:true}); marca(); }
})();
