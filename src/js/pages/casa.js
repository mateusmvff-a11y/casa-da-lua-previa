/* Página A Casa — pinos do Atlas em miniatura (9 ambientes; texto próprio, sem depender dos 10 itens de CDL.ATLAS_PLACES) */
CDL.ready(()=>{
  const root = document.getElementById('page-casa');
  if(!root) return;
  const pins = [...root.querySelectorAll('.atlas-teaser .map-pin')];
  const title = root.querySelector('#casaAtlasTitle');
  const text = root.querySelector('#casaAtlasText');
  if(!pins.length) return;
  /* nomes e textos vêm de CDL.ATLAS_PLACES (a mesma fonte da Home e da janela do Atlas) */
  pins.forEach(btn=>{
    btn.addEventListener('click',()=>{
      const place = btn.dataset.place;
      if(typeof CDL.selectHomeAtlas === 'function') CDL.selectHomeAtlas(place);
      pins.forEach(p=>p.classList.toggle('active', p===btn));
      const d = (CDL.ATLAS_PLACES||{})[place];
      if(title && place) title.textContent = place;
      if(text && d) text.textContent = d.text;
    });
  });
});
