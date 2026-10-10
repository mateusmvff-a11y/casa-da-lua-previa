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
