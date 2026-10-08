// Servidor estático local: node tools/serve.mjs  (porta 5173)
// Qualquer caminho que contenha /assets/ é servido de <raiz>/assets/ (para as prévias em _prev/<pagina>/).
import http from 'http'; import fs from 'fs'; import path from 'path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')),'..');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json','.mp4':'video/mp4','.woff2':'font/woff2'};
http.createServer((req,res)=>{
  let p = decodeURIComponent(req.url.split('?')[0]);
  const i = p.indexOf('/assets/'); if(i>0) p = p.slice(i);
  if(p.endsWith('/')) p += 'index.html';
  const f = path.join(root,p);
  if(!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()){ res.writeHead(404); return res.end('404'); }
  res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'});
  fs.createReadStream(f).pipe(res);
}).listen(5173,()=>console.log('http://localhost:5173/'));
