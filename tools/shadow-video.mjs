// Gera os vídeos em loop das sombras/texturas de fundo (WebM VP9 com transparência: preto com alpha), um por textura.
// uso: node tools/shadow-video.mjs [ref ...]          -> a partir das texturas estáticas (balanço suave de folhas, loop perfeito de 6 s)
//      node tools/shadow-video.mjs --from <video.mp4> --ref <ref>   -> a partir de um vídeo de sombra de verdade (fundo branco, sombras escuras:
//         p.ex. um clipe do Envato): converte para o mesmo formato com transparência e ajusta o tamanho/duração.
// Saída: assets/video/sh-<ref>.webm (lidos por src/js/shadows.js; a mesma opacidade --op da textura continua valendo)
import { execFileSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')),'..');
const arg = k => { const i = process.argv.indexOf('--'+k); return i>0 ? process.argv[i+1] : null; };
fs.mkdirSync(path.join(root,'assets/video'),{recursive:true});
const dimOf = f => execFileSync('ffprobe',['-v','error','-select_streams','v','-show_entries','stream=width,height','-of','csv=s=x:p=0',f]).toString().trim().split('x').map(Number);
const W = 768, FPS = 20, DUR = 6;
const enc = ['-c:v','libvpx-vp9','-pix_fmt','yuva420p','-b:v','0','-crf','40','-row-mt','1','-cpu-used','4','-auto-alt-ref','0','-an'];

function fromImage(ref, i){
  const src = path.join(root,`assets/img/${ref}.webp`); const [w,h] = dimOf(src); const H = Math.round(W*h/w/2)*2;
  const ph = (i*0.9)%6.28;   // fase diferente por textura
  /* cada termo é (sin(wt+f) - sin(f)): no instante 0 e no fim do loop o deslocamento é zero, então o vídeo começa exatamente igual à textura estática */
  const t = (a, w, ax, d, p) => `${a}*(sin(${w}*PI*T/${DUR}+${ax}/${d}+${p.toFixed(2)})-sin(${ax}/${d}+${p.toFixed(2)}))`;
  const dx = t(24,2,'Y',95,ph)+'+'+t(10,4,'X',140,ph*1.7);   // balanço mais perceptível (revisão 20/10): ~2,4x o anterior
  const dy = t(18,2,'X',120,ph*0.6)+'+'+t(9,4,'Y',110,ph*2.3);
  const out = path.join(root,`assets/video/sh-${ref}.webm`);
  execFileSync('ffmpeg',['-loglevel','error','-y','-loop','1','-framerate',String(FPS),'-i',src,'-f','lavfi','-i',`color=c=black:s=${W}x${H}:r=${FPS}`,
    '-filter_complex',`[0]scale=${W}:${H},format=gray,gblur=sigma=1.4,geq=lum='lum(X+${dx},Y+${dy})'[w];[w]negate[a];[1][a]alphamerge`,
    '-t',String(DUR),...enc,out]);
  console.log('ok',ref,`${W}x${H}`,(fs.statSync(out).size/1024).toFixed(0)+'KB');
}
function fromVideo(file, ref){
  const out = path.join(root,`assets/video/sh-${ref}.webm`);
  const src = path.join(root,`assets/img/${ref}.webp`); const [w,h] = dimOf(src); const H = Math.round(W*h/w/2)*2;
  // sombra escura sobre fundo claro -> preto com alpha = 1 - luminância
  execFileSync('ffmpeg',['-loglevel','error','-y','-i',file,'-f','lavfi','-i',`color=c=black:s=${W}x${H}:r=${FPS}`,
    '-filter_complex',`[0]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},fps=${FPS},format=gray,negate[a];[1][a]alphamerge=shortest=1`,
    '-t','12',...enc,out]);
  console.log('ok (de vídeo)',ref,(fs.statSync(out).size/1024).toFixed(0)+'KB');
}
if(arg('from')) fromVideo(arg('from'), arg('ref'));
else {
  const refs = process.argv.slice(2).filter(a=>!a.startsWith('--')).length ? process.argv.slice(2) :
    fs.readdirSync(path.join(root,'assets/img')).filter(f=>/^[0-9a-f]{6}-m\.webp$/.test(f)).map(f=>f.slice(0,6));
  refs.forEach((r,i)=>fromImage(r,i));
}
