/* Eventos e Imersões: configurador de formato (dados do V16; o diagrama da esquerda saiu a pedido do cliente, 20/10) */
CDL.ready(()=>{
  const root = document.getElementById('page-eventos'); if(!root) return;
  const qa = (s)=>Array.from(root.querySelectorAll(s));

  const EVENT_DATA = {
    casamento:{eyebrow:'Casamento',title:'Cerimônia, jantar e festa <br class="dbr-s"><strong>no mesmo lugar</strong>',text:'O jardim pode receber a cerimônia e a convivência; o salão e a área coberta apoiam a recepção e o plano para chuva; as suítes mantêm parte do grupo por perto',features:[['Momentos','cerimônia + recepção'],['Espaços','jardim + salão + toldo'],['Hospedagem','15 suítes']],layout:'wedding'},
    imersao:{eyebrow:'Imersão empresarial',title:'Conteúdo, pausas e convivência <br class="dbr-s"><strong>no mesmo percurso</strong>',text:'O encontro pode alternar conteúdo, grupos de trabalho, refeições e áreas externas sem separar a programação da hospedagem',features:[['Ritmo','conteúdo + pausas'],['Configuração','roda, auditório ou mesas'],['Hospedagem','grupo na propriedade']],layout:'work'},
    retiro:{eyebrow:'Retiro',title:'Prática, silêncio e <br class="dbr-s"><strong>momentos compartilhados</strong>',text:'Salão, jardim e áreas de bem-estar podem receber práticas, conversas, refeições e pausas com a hospedagem por perto',features:[['Ritmo','práticas + refeições'],['Espaços','salão + jardim'],['Bem-estar','spa, sauna e hidro']],layout:'circle'},
    celebracao:{eyebrow:'Celebração',title:'Uma ocasião especial <br class="dbr-s"><strong>com a casa ao redor</strong>',text:'Almoços, aniversários e encontros privados podem ocupar mesa, salão e jardim em escalas diferentes',features:[['Momento','almoço, jantar ou coquetel'],['Espaços','mesa + jardim + salão'],['Hospedagem','opcional']],layout:'party'}
  };
  const TIPO = {casamento:'Casamento',imersao:'Imersão empresarial',retiro:'Retiro',celebracao:'Celebração'};

  let current = 'casamento';
  function setEventType(type){
    const d = EVENT_DATA[type]; if(!d) return;
    current = type;
    qa('.event-selector button').forEach(b=>b.classList.toggle('active',b.dataset.eventType===type));
    const set = (id,html)=>{ const e=document.getElementById(id); if(e) e.innerHTML=html; };
    set('eventEyebrow',d.eyebrow);
    set('eventTitle',d.title);
    set('eventText',d.text);
    set('eventFeatures',d.features.map(f=>`<li><span>${f[0]}</span><span>${f[1]}</span></li>`).join(''));
  }
  qa('.event-selector button[data-event-type]').forEach(b=>b.addEventListener('click',()=>setEventType(b.dataset.eventType)));
  setEventType('casamento');

  // "Pedir proposta para este formato": o core rola ao formulário (data-scroll-to); aqui já deixa o tipo escolhido
  const ask = document.getElementById('eventAsk');
  if(ask) ask.addEventListener('click',()=>{
    const sel = document.getElementById('evTipo');
    if(sel && TIPO[current]) sel.value = TIPO[current];
  });
});
