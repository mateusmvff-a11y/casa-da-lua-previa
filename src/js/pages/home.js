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
