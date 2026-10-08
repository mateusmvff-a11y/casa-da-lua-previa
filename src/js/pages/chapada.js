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
