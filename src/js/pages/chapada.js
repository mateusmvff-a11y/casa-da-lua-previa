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
