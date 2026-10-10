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
  'Chegada e estacionamento':{asset:'assets/img/rev-atlas-chegada.webp',text:'É por aqui que a experiência começa, com acesso próprio e uma leitura mais clara da chegada à propriedade.',x:70,y:6},
  'Casa principal':{asset:'assets/img/rev-atlas-casa-principal.webp',text:'Núcleo original da propriedade, ligado à memória da casa e a parte da hospedagem.',x:47,y:90},
  'Restaurante e café':{asset:'assets/img/rev-atlas-restaurante.webp',text:'É onde a manhã começa e onde a mesa costuma reunir hóspedes, famílias e grupos.',x:14,y:90},
  'Piscina e área de descanso':{asset:'assets/img/rev-atlas-piscina.webp',text:'A piscina é um dos centros da propriedade, com a área de descanso ao redor.',x:30,y:27},
  'Área de eventos':{asset:'assets/img/rev-atlas-eventos.webp',text:'Salão e área de apoio para casamentos, imersões, retiros e celebrações.',x:88,y:27},
  'Círculo do fogo':{asset:'assets/img/v16-fire.webp',text:'Na época de seca, o círculo reúne conversa, vinho e céu aberto.',x:91,y:80},
  'Suítes da ala lateral':{asset:'assets/img/rev-atlas-ala-lateral.webp',text:'Conjunto lateral com quartos, uma suíte e o espaço da sinuca.',x:6,y:62},
  'Bloco de suítes 6 a 10':{asset:'assets/img/rev-atlas-suites-6-10.webp',text:'Bloco que reúne as suítes 6 a 10.',x:62,y:88},
  'Faixa verde central':{asset:'assets/img/rev-atlas-faixa-verde.webp',text:'Área aberta que costura pousada, restaurante, suítes, círculo e eventos.',x:64,y:45}
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
