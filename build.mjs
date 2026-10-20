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
function mapeiaPesos(css){
  return css.replace(/([^{}]+)\{([^{}]*)\}/g,(all,sel,body)=>{
    const serif = /var\(--serif\)|font-family:\s*"?mortise/.test(body);
    const inter = /var\(--inter\)|font-family:\s*"?inter/i.test(body);
    if(inter){ return /font-weight/.test(body) ? all : sel+'{'+body+';font-weight:400}'; }   /* Inter: peso 400 de verdade (o 500 do corpo é só da Forma) */
    if(serif){ return /font-weight/.test(body) ? all : sel+'{'+body+';font-weight:400}'; }   /* Mortise: nunca herda o 500 do corpo */
    if(!/font-weight:\s*400/.test(body) || /\bh[1-6]\b/.test(sel)) return all;              /* títulos h1-h6 são Mortise */
    return sel+'{'+body.replace(/font-weight:\s*400/,'font-weight:500')+'}';
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
