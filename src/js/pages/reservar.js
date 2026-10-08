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
  $('#openBookingEngine').addEventListener('click',()=>CDL.showToast('Em breve você poderá seguir direto para o motor oficial.'));
  $('#openWhatsApp').addEventListener('click',()=>CDL.showToast('Em breve você poderá falar com a equipe por aqui.'));
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
