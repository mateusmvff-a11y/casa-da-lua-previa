// Troca a paleta (verde vivo + contraste alto) por "musgo e linho" (tom sobre tom, mais calma). Uma vez só; guarda o mapa em docs.
import fs from 'node:fs'; import path from 'node:path';
const HEX = {
  '#0d4237':'#2f4338', '#264f47':'#3b5246', '#0b2725':'#1c2a24', '#0a352c':'#27382f', '#072921':'#1d2c25', '#2c4a43':'#3a5045', '#061c1a':'#1b2620',
  '#51844e':'#4a6152', '#497c4b':'#6d8372', '#b9d3b4':'#c4d0c0',
  '#133b33':'#26332c',
  '#526b64':'#55645a', '#5a7069':'#55645a', '#587069':'#55645a', '#5d716a':'#55645a', '#5e726b':'#5f6e65',
  '#60736d':'#5f6e65', '#60746e':'#5f6e65', '#64756f':'#5f6e65', '#65766f':'#5f6e65', '#667a72':'#5f6e65', '#687a73':'#5f6e65', '#697b74':'#5f6e65', '#5f736c':'#5f6e65',
  '#728079':'#7a8880', '#8a9893':'#98a39c',
  '#f5ead2':'#efeadf', '#d8ccb7':'#d9d3c4', '#e7d4ae':'#e2dccb', '#fbf7ef':'#f7f5ef', '#e2dcd0':'#ece8dd', '#d6c8af':'#d2cbb9', '#fffdf8':'#fbfaf5'
};
const RGB = {'19,59,51':'38,51,44','245,234,210':'239,234,223','226,220,208':'236,232,221','6,28,26':'27,38,32','81,132,78':'74,97,82','18,47,41':'38,51,44','13,66,55':'47,67,56','7,31,28':'27,38,32','6,27,25':'27,38,32','255,253,248':'251,250,245'};
const files = [];
const walk = d => fs.readdirSync(d,{withFileTypes:true}).forEach(e=>{ const p = path.join(d,e.name); if(e.isDirectory()) walk(p); else if(/\.(css|html|js)$/.test(e.name)) files.push(p); });
['src/css','src/partials','src/js'].forEach(walk);
let n = 0;
for(const f of files){
  let t = fs.readFileSync(f,'utf8'); const o = t;
  t = t.replace(/#[0-9a-fA-F]{6}\b/g, m => HEX[m.toLowerCase()] || m);
  for(const [k,v] of Object.entries(RGB)){
    const [a,b,c] = k.split(','); const re = new RegExp('rgba?\\(\\s*'+a+'\\s*,\\s*'+b+'\\s*,\\s*'+c+'\\b','g');
    t = t.replace(re, m => m.replace(new RegExp(a+'\\s*,\\s*'+b+'\\s*,\\s*'+c), v));
  }
  if(t !== o){ fs.writeFileSync(f,t); n++; }
}
console.log('arquivos alterados:', n);
