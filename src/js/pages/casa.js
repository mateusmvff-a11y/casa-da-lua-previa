/* Página A Casa — pinos do Atlas em miniatura (9 ambientes; texto próprio, sem depender dos 10 itens de CDL.ATLAS_PLACES) */
CDL.ready(()=>{
  const root = document.getElementById('page-casa');
  if(!root) return;
  const pins = [...root.querySelectorAll('.atlas-teaser .map-pin')];
  const title = root.querySelector('#casaAtlasTitle');
  const text = root.querySelector('#casaAtlasText');
  if(!pins.length) return;
  const TEXTS = {
    'Chegada e estacionamento':'É por aqui que a experiência começa, com acesso próprio e uma leitura mais clara da chegada à propriedade.',
    'Casa principal':'Núcleo original da propriedade, ligado à memória da casa e a parte da hospedagem.',
    'Restaurante e café':'É onde a manhã começa e onde a mesa costuma reunir hóspedes, famílias e grupos.',
    'Piscina e área de descanso':'A piscina é um dos centros da propriedade, com a área de descanso ao redor.',
    'Área de eventos':'Salão e área de apoio para casamentos, imersões, retiros e celebrações.',
    'Círculo do fogo':'Na época de seca, o círculo reúne conversa, vinho e céu aberto.',
    'Suítes da ala lateral':'Conjunto lateral com quartos, uma suíte e o espaço da sinuca.',
    'Bloco de suítes 6 a 10':'Bloco que reúne as suítes 6 a 10.',
    'Faixa verde central':'Área aberta que costura pousada, restaurante, suítes, círculo e eventos.'
  };
  pins.forEach(btn=>{
    btn.addEventListener('click',()=>{
      const place = btn.dataset.place;
      if(typeof CDL.selectHomeAtlas === 'function') CDL.selectHomeAtlas(place);
      pins.forEach(p=>p.classList.toggle('active', p===btn));
      if(title && place) title.textContent = place;
      if(text && TEXTS[place]) text.textContent = TEXTS[place];
    });
  });
});
