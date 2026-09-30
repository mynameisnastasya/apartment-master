import {build} from 'esbuild';
import fs from 'node:fs';
import {marked} from 'marked';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
async function bundle(entry){
 const result=await build({entryPoints:[path.join(dir,entry)],bundle:true,minify:true,format:'iife',write:false,target:['es2022'],legalComments:'inline'});
 return result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
}
const modelJs=await bundle('src/main.js');
const modelCss=fs.readFileSync(path.join(dir,'src/styles/app.css'),'utf8');
const modelTemplate=fs.readFileSync(path.join(dir,'index.template.html'),'utf8');
fs.writeFileSync(path.join(dir,'model.html'),modelTemplate.replace('/*STYLE*/',modelCss).replace('/*SCRIPT*/',()=>modelJs));
const projectJs=await bundle('src/project/app.js');
const projectCss=fs.readFileSync(path.join(dir,'src/project/app.css'),'utf8');
const projectTemplate=fs.readFileSync(path.join(dir,'project.template.html'),'utf8');
fs.writeFileSync(path.join(dir,'variants.html'),projectTemplate.replace('/*PROJECT_STYLE*/',projectCss).replace('/*PROJECT_SCRIPT*/',()=>projectJs));
console.log('Built design album index.html ('+Math.round(fs.statSync(path.join(dir,'variants.html')).size/1024)+' KB) and preserved Three.js model.html ('+Math.round(fs.statSync(path.join(dir,'model.html')).size/1024)+' KB)');
const design=marked.parse(fs.readFileSync(path.join(dir,'docs/quiet-geology.md'),'utf8'));
fs.writeFileSync(path.join(dir,'design.html'),`<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Лиза · Тихая геология</title><style>body{margin:0;background:#eee9df;color:#373c35;font:16px/1.75 system-ui,sans-serif}header{padding:22px 6vw;border-bottom:1px solid #bfb8a9;display:flex;justify-content:space-between;gap:18px}main{max-width:1100px;margin:auto;padding:48px 6vw}h1,h2,h3{font-family:Georgia,serif;font-weight:400;line-height:1.2}h1{font-size:clamp(38px,5vw,68px);margin:12px 0 32px}h2{font-size:32px;margin-top:65px}h3{font-size:24px;margin-top:35px}a{color:#52634c;text-underline-offset:4px}table{border-collapse:collapse;display:block;overflow:auto;font-size:13px;line-height:1.65}th,td{padding:16px;text-align:left;border-bottom:1px solid #cac3b5;min-width:160px;vertical-align:top}th{background:#dfd8c8}li{margin:9px 0}p{max-width:880px}strong{color:#403e32}@media(max-width:600px){main{padding:25px 5vw}header{font-size:12px}h2{font-size:27px}table{font-size:12px}}</style><header><span>ЛЕСНАЯ ПОЛЯНА / ДИЗАЙН</span><a href="model.html?style=linen">Открыть интерактивную квартиру ↗</a></header><main>${design}</main></html>`);

await import('./client-site.mjs');
