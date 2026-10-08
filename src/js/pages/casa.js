/* Página A Casa — pinos do Atlas em miniatura (V16: selectHomeAtlas) */
CDL.ready(()=>{
  const root = document.getElementById('page-casa');
  if(!root) return;
  const pins = [...root.querySelectorAll('.atlas-teaser .map-pin')];
  const title = root.querySelector('#casaAtlasTitle');
  const text = root.querySelector('#casaAtlasText');
  if(!pins.length) return;
  pins.forEach(btn=>{
    btn.addEventListener('click',()=>{
      const place = btn.dataset.place;
      if(typeof CDL.selectHomeAtlas === 'function') CDL.selectHomeAtlas(place);
      pins.forEach(p=>p.classList.toggle('active', p===btn));
      const data = CDL.ATLAS_PLACES && CDL.ATLAS_PLACES[place];
      if(title && place) title.textContent = place;
      if(text && data && data.text) text.textContent = data.text;
    });
  });
});
