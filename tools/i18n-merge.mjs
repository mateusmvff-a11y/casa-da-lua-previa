// Junta as traduções (src/i18n/en-html-*.txt, en-js.txt) com os textos originais e grava src/i18n/en.json { "texto em pt": "texto em en" }.
// Formato das linhas: "<índice>|<inglês>"  (índice = posição em pt-html.json / pt-js.txt; "=" = igual ao português)
//                     "+<português>|<inglês>"  (par avulso, para trechos que não estão nas listas)
// uso: node tools/i18n-merge.mjs
import fs from 'node:fs'; import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')),'..');
const R = f => fs.readFileSync(path.join(root,f),'utf8');
const ptHtml = JSON.parse(R('src/i18n/pt-html.json'));
const ptJs = R('src/i18n/pt-js.txt').split('\n').map(l=>l.replace(/^\S+:\d+ /,''));
const dict = {}; const conflitos = []; let n = 0;
const put = (pt, en, onde) => {
  if(en === '=' ) return;
  /* o espaço no começo/fim do texto original (ex.: "Chegada: ") vale também no inglês: o editor corta espaços do fim das linhas */
  en = (pt.match(/^\s*/)[0]) + en.trim() + (pt.match(/\s*$/)[0]);
  if(dict[pt] !== undefined && dict[pt] !== en) conflitos.push(`${onde}: "${pt.slice(0,50)}" -> "${en.slice(0,40)}" x "${dict[pt].slice(0,40)}"`);
  else { dict[pt] = en; n++; }
};
const lerArq = (f, lista) => R(f).split('\n').filter(Boolean).forEach(l=>{
  const i = l.indexOf('|'); const a = l.slice(0,i), en = l.slice(i+1);
  if(a.startsWith('+')) return put(a.slice(1), en, f);
  const idx = Number(a); const pt = lista[idx];
  if(pt === undefined) throw new Error(f+': índice sem texto '+a);
  put(pt, en, f+'#'+a);
});
for(const f of ['a','b','c','d']) lerArq(`src/i18n/en-html-${f}.txt`, ptHtml);
lerArq('src/i18n/en-js.txt', ptJs);
/* itens do HTML sem tradução (e que não são "=") */
const faltam = ptHtml.filter(t=>dict[t] === undefined && !/^[×]$/.test(t));
fs.writeFileSync(path.join(root,'src/i18n/en.json'), JSON.stringify(dict,null,1));
console.log('entradas:', Object.keys(dict).length, '| conflitos:', conflitos.length);
conflitos.forEach(c=>console.log('  CONFLITO', c));
console.log('textos do HTML sem entrada (iguais ao português ou esquecidos):', faltam.length);
faltam.slice(0,80).forEach(t=>console.log('   -', t.slice(0,90)));
