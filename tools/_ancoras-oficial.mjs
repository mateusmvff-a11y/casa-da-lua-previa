import fs from 'node:fs';
const pages = ['index','a-pousada','galeria','experiencia','spa','suites','eventos','suite_suite-master','suite_suite-standard'];
const strip = s => s.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
for(const p of pages){
  const h = fs.readFileSync('_site-oficial/'+p+'.html','utf8').replace(/&amp;/g,'&');
  console.log('\n##### '+p+'  | barra de reserva (#book-now): '+(h.includes('id="book-now"')?'sim':'não'));
  const seen = new Set();
  for(const m of h.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)){
    const href = m[1]; if(!/omnibees|whatsapp|tel:|mailto|instagram|facebook|maps|youtu|asksuite|\/suite\/|politica|cookies|contato@/.test(href)) continue;
    const label = strip(m[2]).slice(0,60) || '(ícone/imagem)';
    const k = href+'|'+label; if(seen.has(k)) continue; seen.add(k);
    console.log('  ['+label+'] -> '+href.slice(0,150));
  }
}
