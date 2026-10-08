/* Eventos e Imersões: configurador de formato (dados e diagramas do V16) */
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

  function objectsHTML(layout){
    if(layout==='wedding') return `
      <div class="floor-zone" style="left:19%;top:24%;width:30%;height:16%;border-radius:999px">Cerimônia</div>
      <div class="floor-zone" style="left:16%;top:48%;width:13%;height:13%;border-radius:50%">Mesa</div>
      <div class="floor-zone" style="left:32%;top:48%;width:13%;height:13%;border-radius:50%">Mesa</div>
      <div class="floor-zone" style="left:48%;top:48%;width:13%;height:13%;border-radius:50%">Mesa</div>`;
    if(layout==='work') return `
      <div class="floor-zone" style="left:17%;top:25%;width:38%;height:10%">Tela / conteúdo</div>
      <div class="floor-zone" style="left:16%;top:43%;width:18%;height:12%">Grupo</div>
      <div class="floor-zone" style="left:38%;top:43%;width:18%;height:12%">Grupo</div>
      <div class="floor-zone" style="left:23%;top:62%;width:27%;height:12%">Roda</div>`;
    if(layout==='circle') return `
      <div class="floor-zone" style="left:20%;top:23%;width:34%;height:34%;border-radius:50%">Prática / roda</div>
      <div class="floor-zone" style="left:18%;top:64%;width:18%;height:10%">Apoio</div>
      <div class="floor-zone" style="left:40%;top:64%;width:18%;height:10%">Mesa</div>`;
    return `
      <div class="floor-zone" style="left:16%;top:22%;width:38%;height:18%">Mesa principal</div>
      <div class="floor-zone" style="left:16%;top:48%;width:18%;height:14%">Convivência</div>
      <div class="floor-zone" style="left:38%;top:48%;width:18%;height:14%">Bar</div>`;
  }

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
    set('eventObjects',objectsHTML(d.layout));
    const eo = document.getElementById('eventObjects'); if(eo) eo.classList.toggle('solid',d.layout!=='wedding');
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
