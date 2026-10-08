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
    if(img) img.src = day === 'quinta' ? FIGMA_QUINTA.img : (A[d.asset] || img.src);
    if(eb) eb.textContent = d.eyebrow;
    if(ti){ if(day === 'quinta') ti.innerHTML = FIGMA_QUINTA.title; else ti.textContent = noDot(d.title); }
    if(tx) tx.textContent = d.text;
    if(sc) sc.innerHTML = d.schedule.map(r => `<div class="schedule-item"><span>${esc(r[0])}</span><p>${esc(noDot(r[1]))}</p></div>`).join('');
  }
  days.forEach(b => b.addEventListener('click', () => setDay(b.dataset.programDay)));
});
