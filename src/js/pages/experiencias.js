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
