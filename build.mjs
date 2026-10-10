// Monta o site: partials -> index.html, css/site.css, js/site.js
// Uso: node build.mjs
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
