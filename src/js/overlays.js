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
  'Piscina e área de descanso':{asset:'pool',text:'A piscina é um dos centros da propriedade, com a área de descanso ao redor.',group:'bem-estar',moments:['tarde'],company:['familia','amigos'],programs:['tidelli'],x:24,y:30,page:'viver',cta:'Viver o fim de tarde',tags:['piscina','descanso']},
  'Área de eventos':{asset:'events',text:'Salão e área de apoio para casamentos, imersões, retiros e celebrações.',group:'eventos',moments:['manha','tarde','noite'],company:['grupo'],programs:['eventos'],x:86,y:24,page:'eventos',cta:'Ver eventos',tags:['salão','encontros']},
  'Círculo do fogo':{asset:'fire',text:'Na época de seca, o círculo reúne conversa, vinho e céu aberto.',group:'convivencia',moments:['noite'],company:['familia','amigos','grupo'],programs:['tidelli','eventos'],x:88,y:80,page:'viver',cta:'Viver a noite',tags:['fogo','convivência']},
  'Suítes da ala lateral':{asset:'suite',text:'Conjunto lateral com quartos, uma suíte e o espaço da sinuca.',group:'hospedagem',moments:['manha','tarde','noite'],company:['familia','amigos'],programs:['tidelli','eventos'],x:6,y:66,page:'suites',cta:'Ver suítes',tags:['ala lateral','quartos']},
  'Bloco de suítes 6 a 10':{asset:'suite',text:'Bloco que reúne as suítes 6 a 10.',group:'hospedagem',moments:['manha','tarde','noite'],company:['familia','amigos','grupo'],programs:['tidelli','eventos'],x:56,y:90,page:'suites',cta:'Ver suítes',tags:['suítes','bloco']},
  'Faixa verde central':{asset:'outdoor',text:'Área aberta que costura pousada, restaurante, suítes, círculo e eventos.',group:'convivencia',moments:['manha','tarde','noite'],company:['familia','amigos','pet','grupo'],programs:['tidelli','eventos'],x:62,y:48,page:'casa',cta:'Explorar a propriedade',tags:['jardim','circulação']},
  'Área complementar':{asset:'outdoor',text:'Trecho livre à direita da propriedade, que apoia o fluxo dos eventos.',group:'eventos',moments:['manha','tarde'],company:['grupo'],programs:['eventos'],x:80,y:58,page:'eventos',cta:'Entender usos',tags:['apoio','área livre']}
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
