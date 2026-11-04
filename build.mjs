// Monta o site: partials -> index.html, css/site.css, js/site.js  (+ versão em inglês: en/index.html, js/site.en.js)
// Uso: node build.mjs            (português + inglês)
//      node build.mjs --only=home  (prévia de uma página, só em português)
import fs from 'fs';
import path from 'path';
const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'));
const rd = f => fs.existsSync(path.join(root,f)) ? fs.readFileSync(path.join(root,f),'utf8') : '';
const ALL = ['home','casa','suites','viver','experiencias','eventos','chapada','reservar'];
const arg = k => (process.argv.find(a=>a.startsWith('--'+k+'=')) || '').split('=')[1];
const ONLY = arg('only');            // ex.: --only=home  -> prévia só dessa página
const PAGES = ONLY ? ONLY.split(',') : ALL;
const OUT = ONLY ? path.join(root,'_prev',ONLY.replace(/,/g,'+')) : root;
const MOTION = !ONLY || process.argv.includes('--motion');
const REL = ONLY ? '_prev/'+ONLY.replace(/,/g,'+')+'/' : '';

const CSS_LINK = '<link rel="stylesheet" href="css/site.css">';
const MOTION_HEAD = '<script>if(location.search.indexOf("sem-movimento")<0)document.documentElement.classList.add("motion-on");setTimeout(function(){document.documentElement.classList.remove("motion-on")},7000)</script>\n';
const MOTION_LIBS = [
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/SplitText.min.js',
  'https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js'
].map(u => `<script src="${u}"></script>\n`).join('');

const html = [
  rd('src/partials/head.html').replace(CSS_LINK, (MOTION ? MOTION_HEAD : '') + CSS_LINK),
  rd('src/partials/header.html'),
  ...PAGES.map(p => rd(`src/partials/pages/${p}.html`) || `<section class="page" id="page-${p}" data-page="${p}"><div class="section"><div class="max"><h1 class="title">${p} (em construção)</h1></div></div></section>\n`),
  rd('src/partials/footer.html'),
  rd('src/partials/overlays.html'),
  '<div class="toast" id="toast"></div>\n',
  (MOTION ? MOTION_LIBS : '') + '<script src="js/site.js"></script>\n</body>\n</html>\n'
].join('\n');
fs.mkdirSync(OUT,{recursive:true});
fs.writeFileSync(path.join(OUT,'index.html'), html);

/* Mapeamento de pesos da Forma DJR Display: o "Regular" (400) do Figma tem as mesmas larguras e a mesma tinta do Medium (500)
   do kit Adobe (medido contra o PNG de um texto do Figma: tinta 1,08x, largura igual com o espaçamento original).
   Por isso todo peso 400 da Forma vira 500. Mortise (var(--serif)) fica como está. */
/* Fontes (desde 03/11): títulos em Cormorant (leve, alto padrão); texto na Forma DJR Text.
   - Forma: desde 03/11 (rodada 5b) é a Forma DJR Text (kit cgs8xgs), mais leve no corpo; 400 = Regular, 600 vira 500 (Medium).
   - Cormorant: título grande (>= 34px ou sem tamanho) em Light 300; título pequeno em Regular 400; o que era negrito (700/800) vira Medium 500.
   - A Cormorant tem x-height menor que a Mortise: tamanhos e entrelinhas em px da serifa crescem 10% (KS). */
const KS = 1.1;
const escala = v => /calc|var\(/.test(v) ? v : v.replace(/(\d*\.?\d+)(px|vw|vh)/g,(m,n,u)=>(Math.round(+n*KS*100)/100)+u);
const maiorPx = v => { const m = [...v.matchAll(/(\d*\.?\d+)px/g)].map(x=>+x[1]); return m.length ? Math.max(...m) : null; };
const TITULO_STRONG = /(title|display|subtitle|\bh[1-4]\b|vv-h2|chapada-h1|vv-h1|suites-hero-title|exp-hero|feature-body h3|event-copy h3|program-stage-copy h3)/;
function mapeiaPesos(css){
  return css.replace(/([^{}]+)\{([^{}]*)\}/g,(all,sel,body)=>{
    const serif = /var\(--serif\)|font-family:\s*"?(mortise|cormorant)/.test(body);
    const inter = /var\(--inter\)|font-family:\s*"?inter/i.test(body);
    if(inter){ return /font-weight/.test(body) ? all : sel+'{'+body+';font-weight:400}'; }   /* Inter: peso 400 de verdade */
    if(serif){
      const fs_ = body.match(/font-size:\s*([^;]+)/); const px = fs_ ? maiorPx(fs_[1]) : null; const grande = px === null || px >= 34;
      let nb = body.replace(/(font-size|line-height):\s*([^;]+)/g,(m,p,v)=> /px|vw|vh/.test(v) ? p+':'+escala(v) : m);
      const w = nb.match(/font-weight:\s*(\d+|bold)/); const nw = w ? (w[1]==='bold' ? 700 : +w[1]) : null;
      /* negrito de título grande (ex.: hero inteiro em Bold) vira Regular 400; negrito de título pequeno vira Medium 500 */
      const para = (nw === null || nw === 400) ? (grande ? 300 : 400) : (nw >= 600 ? (grande ? 400 : 500) : 500);
      nb = w ? nb.replace(/font-weight:\s*(\d+|bold)/,'font-weight:'+para) : nb+';font-weight:'+para;
      return sel+'{'+nb+'}';
    }
    /* <strong> dentro de título: Medium (o negrito da Mortise era pesado demais) */
    if(/font-weight:\s*(700|bold|800)/.test(body) && sel.split(',').every(s=>/\b(strong|b)\s*$/.test(s.trim()) && TITULO_STRONG.test(s)))
      return sel+'{'+body.replace(/font-weight:\s*(700|bold|800)/,'font-weight:500')+'}';
    /* Forma DJR Text (desde 03/11, kit cgs8xgs: Regular 400, Medium 500, Bold 700): o 400 fica Regular (o cliente pediu texto mais leve);
       o 600 (antes Medium do kit Display) vira 500 para não cair no Bold */
    if(!/font-weight:\s*600/.test(body) || /\bh[1-6]\b/.test(sel)) return all;              /* títulos h1-h6 são serifa */
    return sel+'{'+body.replace(/font-weight:\s*600/,'font-weight:500')+'}';
  });
}
const css = mapeiaPesos([rd('src/css/base.css'), ...PAGES.map(p => rd(`src/css/pages/${p}.css`)), rd('src/css/overlays.css'), rd('src/css/fixes.css'), rd('src/css/hover.css'), MOTION ? rd('src/css/motion.css') : ''].join('\n\n'));
fs.mkdirSync(path.join(OUT,'css'),{recursive:true});
fs.writeFileSync(path.join(OUT,'css/site.css'), css);

const js = [rd('src/js/core.js'), rd('src/js/typo.js'), ...PAGES.map(p => rd(`src/js/pages/${p}.js`)), rd('src/js/overlays.js'), MOTION ? rd('src/js/shadows.js') : '', MOTION ? rd('src/js/motion.js') : ''].join('\n\n');
fs.mkdirSync(path.join(OUT,'js'),{recursive:true});
fs.writeFileSync(path.join(OUT,'js/site.js'), js);

console.log('ok  index.html', (html.length/1024).toFixed(0)+'KB', ' site.css', (css.length/1024).toFixed(0)+'KB', ' site.js', (js.length/1024).toFixed(0)+'KB');

/* ====================== Versão em inglês (/en/) ======================
   Os textos em português do HTML e das strings do JS são trocados pelo inglês de src/i18n/en.json (gerado por tools/i18n-merge.mjs).
   Só entra o que está no dicionário, palavra por palavra do original: nada de tradução automática no navegador. */
if(!ONLY && fs.existsSync(path.join(root,'src/i18n/en.json'))){
  const DICT = JSON.parse(rd('src/i18n/en.json'));
  const norm = s => s.replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
  const escH = s => s.replace(/&(?!#?\w+;)/g,'&amp;');
  const escA = s => escH(s).replace(/"/g,'&quot;');

  function trHTML(h){
    const hold = [];
    h = h.replace(/<(script|style)[\s\S]*?<\/\1>/g, m => { hold.push(m); return '\u0000'+(hold.length-1)+'\u0000'; });
    h = h.replace(/>([^<>]+)</g, (m,seg)=>{
      const en = DICT[norm(seg)]; if(en === undefined) return m;
      return '>' + seg.match(/^\s*/)[0] + escH(en) + seg.match(/\s*$/)[0] + '<';
    });
    /* só atributos de texto (e os dois valores que casam com as etiquetas dos filtros): ids como data-program-day="sexta" ficam como estão */
    const ATTR_OK = new Set(['alt','aria-label','placeholder','title','data-place','data-suite-filter','data-reserve-pref']);
    h = h.replace(/(\s)([\w:-]+)="([^"]*)"/g, (m,sp,a,v)=>{ if(!ATTR_OK.has(a)) return m; const en = DICT[norm(v)]; return en === undefined ? m : sp+a+'="'+escA(en)+'"'; });
    return h.replace(/\u0000(\d+)\u0000/g, (m,i)=>hold[+i]);
  }

  /* troca o conteúdo das strings do JS (aspas simples, duplas e crases), sem mexer em comentários, regex nem código */
  function trJS(src){
    const N = src.length; let i = 0, out = '';
    /* 'quinta', 'sexta' e 'domingo' também são ids (data-program-day / PROGRAM_DATA): nunca trocar */
    const NUNCA = new Set(['quinta','sexta','domingo','sabado']);
    const look = raw => NUNCA.has(raw) ? undefined : DICT[raw];
    const escQ = (s,q) => s.replace(/\\/g,'\\\\').replace(new RegExp(q,'g'),'\\'+q);
    const regexOk = () => { const m = out.match(/(\S)\s*$/); const c = m ? m[1] : ''; return !c || /[(,=:\[!&|?{};+\-*%<>~^]/.test(c) || /(return|typeof|case)\s*$/.test(out); };
    function str(q){
      let j = i+1, raw = '';
      while(j < N && src[j] !== q){ if(src[j] === '\\'){ raw += src.slice(j,j+2); j += 2; continue; } raw += src[j]; j++; }
      const en = look(raw); out += q + (en !== undefined ? escQ(en,q) : raw) + q; i = j+1;
    }
    function tpl(){
      out += '`'; i++; let buf = '';
      const flush = () => { const en = look(buf); out += en !== undefined ? en.replace(/\\/g,'\\\\').replace(/`/g,'\\`') : buf; buf = ''; };
      while(i < N && src[i] !== '`'){
        if(src[i] === '\\'){ buf += src.slice(i,i+2); i += 2; continue; }
        if(src[i] === '$' && src[i+1] === '{'){ flush(); out += '${'; i += 2; scan(true); out += '}'; i++; continue; }
        buf += src[i]; i++;
      }
      flush(); out += '`'; i++;
    }
    function scan(inExpr){
      let depth = 0;
      while(i < N){
        const c = src[i], d = src[i+1];
        if(c === '/' && d === '/'){ const j = src.indexOf('\n',i); const e = j < 0 ? N : j; out += src.slice(i,e); i = e; continue; }
        if(c === '/' && d === '*'){ const j = src.indexOf('*/',i+2); const e = j < 0 ? N : j+2; out += src.slice(i,e); i = e; continue; }
        if(c === "'" || c === '"'){ str(c); continue; }
        if(c === '`'){ tpl(); continue; }
        if(c === '/' && regexOk()){
          let j = i+1, cls = false;
          while(j < N){ const x = src[j]; if(x === '\\'){ j += 2; continue; } if(x === '[') cls = true; else if(x === ']') cls = false; else if(x === '/' && !cls) break; else if(x === '\n') break; j++; }
          j++; while(/[a-z]/.test(src[j] || '')) j++;
          out += src.slice(i,j); i = j; continue;
        }
        if(inExpr){ if(c === '{') depth++; else if(c === '}'){ if(depth === 0) return; depth--; } }
        out += c; i++;
      }
    }
    scan(false);
    return out;
  }

  const SWITCH_PT = '<a class="lang-switch" data-lang-switch href="en/" hreflang="en" lang="en" aria-label="Read this site in English">EN</a>';
  const SWITCH_EN = '<a class="lang-switch" data-lang-switch href="../" hreflang="pt-BR" lang="pt-BR" aria-label="Ler o site em português">PT</a>';
  const META_PT = 'content="Uma pousada com cara de casa em Alto Paraíso. Jardim, bem-estar, experiências, eventos e 15 suítes para viver a Chapada dos Veadeiros com outro ritmo."';
  const META_EN = 'content="An inn that feels like a home in Alto Paraíso, Brazil. Garden, wellness, experiences, events and 15 suites to live the Chapada dos Veadeiros at a different pace."';
  const upAssets = s => s.replace(/(?<!\.\.\/)\bassets\//g,'../assets/');

  let h = html.replace('<html lang="pt-BR">','<html lang="en">').replace(META_PT,META_EN).replace(SWITCH_PT,SWITCH_EN);
  h = trHTML(h).replace('href="css/site.css"','href="../css/site.css"').replace('src="js/site.js"','src="../js/site.en.js"');
  h = upAssets(h);
  fs.mkdirSync(path.join(root,'en'),{recursive:true});
  fs.writeFileSync(path.join(root,'en/index.html'), h);
  fs.writeFileSync(path.join(root,'js/site.en.js'), upAssets(trJS(js)));
  console.log('ok  en/index.html', (h.length/1024).toFixed(0)+'KB', ' site.en.js');
}
