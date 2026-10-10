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
  const ATLAS_TXT = {
    'Chegada e estacionamento':'É por aqui que a experiência começa, com acesso próprio e uma leitura mais clara da chegada à propriedade',
    'Casa principal':'Núcleo original da propriedade, ligado à memória da casa e a parte da hospedagem',
    'Restaurante e café':'É onde a manhã começa e onde a mesa costuma reunir hóspedes, famílias e grupos',
    'Piscina e área de descanso':'A piscina é um dos centros da propriedade, com a área de descanso ao redor',
    'Área de eventos':'Salão e área de apoio para casamentos, imersões, retiros e celebrações',
    'Círculo do fogo':'Na época de seca, o círculo reúne conversa, vinho e céu aberto',
    'Suítes da ala lateral':'Conjunto lateral com quartos, uma suíte e o espaço da sinuca',
    'Bloco de suítes 6 a 10':'Bloco que reúne as suítes 6 a 10',
    'Faixa verde central':'Área aberta que costura pousada, restaurante, suítes, círculo e eventos'
  };
  $$('.atlas-home-card .map-pin').forEach(b=>b.addEventListener('click',()=>{
    const place = b.dataset.place;
    if(typeof CDL.selectHomeAtlas==='function') CDL.selectHomeAtlas(place);
    $$('.atlas-home-card .map-pin').forEach(p=>p.classList.toggle('active',p===b));
    setText('homeAtlasTitle',place);
    setText('homeAtlasText',ATLAS_TXT[place]||'');
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
