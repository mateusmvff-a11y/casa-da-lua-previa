// Extrai os textos em português do site (HTML dos partials + strings dos JS) para traduzir.
// uso: node tools/i18n-extract.mjs [--json]   -> imprime contagem e (com --json) grava src/i18n/pt-unidades.json
import fs from 'node:fs'; import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')),'..');
const norm = s => s.replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
const ATTRS = ['alt','aria-label','placeholder','title','data-place','content','data-pt'];
const htmlFiles = ['head','header','footer','overlays'].map(f=>`src/partials/${f}.html`).concat(fs.readdirSync(path.join(root,'src/partials/pages')).map(f=>`src/partials/pages/${f}`));
const out = new Map(); // texto -> {onde:Set}
const add = (t, where) => { t = norm(t); if(!t || !/[A-Za-zÀ-ú]/.test(t)) return; if(!out.has(t)) out.set(t,new Set()); out.get(t).add(where); };
for(const f of htmlFiles){
  let h = fs.readFileSync(path.join(root,f),'utf8');
  h = h.replace(/<!--[\s\S]*?-->/g,'').replace(/<script[\s\S]*?<\/script>/g,'').replace(/<style[\s\S]*?<\/style>/g,'');
  for(const m of h.matchAll(/>([^<>]+)</g)) add(m[1], f);
  for(const m of h.matchAll(/\s(alt|aria-label|placeholder|title|data-place)="([^"]+)"/g)) add(m[2], f+' @'+m[1]);
  for(const m of h.matchAll(/<option[^>]*>([^<]+)<\/option>/g)) add(m[1], f+' option');
}
const jsFiles = ['src/js/core.js','src/js/overlays.js'].concat(fs.readdirSync(path.join(root,'src/js/pages')).map(f=>`src/js/pages/${f}`));
const js = new Map();
for(const f of jsFiles){
  const s = fs.readFileSync(path.join(root,f),'utf8').split('\n');
  s.forEach((line,i)=>{
    for(const m of line.matchAll(/(['"`])((?:\\.|(?!\1).)*)\1/g)){
      const t = m[2];
      if(t.length < 3 || /^[#.\[]|^[a-z0-9_-]+$|^https?:|^assets\/|^\/\/|=>|[{}]\s*$|^\w+:\w/.test(t) && !/[ À-ú]/.test(t)) continue;
      if(!/[A-Za-zÀ-ú]/.test(t)) continue;
      if(/^[a-z][a-zA-Z0-9-]*$/.test(t)) continue;          // identificadores simples
      if(/^[a-z-]+( [a-z-]+)*$/.test(t) && !/[À-ú]/.test(t)) continue;  // listas de classes
      if(/\b(querySelector|getElementById|classList)\b/.test(line) && !/ /.test(t)) continue;
      js.set(f+':'+(i+1)+' '+t,1);
    }
  });
}
console.log('HTML: '+out.size+' textos únicos');
console.log('JS candidatos: '+js.size);
if(process.argv.includes('--json')){
  fs.mkdirSync(path.join(root,'src/i18n'),{recursive:true});
  fs.writeFileSync(path.join(root,'src/i18n/pt-html.json'), JSON.stringify([...out.keys()],null,1));
  fs.writeFileSync(path.join(root,'src/i18n/pt-js.txt'), [...js.keys()].join('\n'));
  console.log('gravado src/i18n/');
}
