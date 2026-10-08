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
