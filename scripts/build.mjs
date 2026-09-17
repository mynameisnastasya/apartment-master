import {build} from 'esbuild';
import fs from 'node:fs';
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
fs.writeFileSync(path.join(dir,'index.html'),projectTemplate.replace('/*PROJECT_STYLE*/',projectCss).replace('/*PROJECT_SCRIPT*/',()=>projectJs));
console.log('Built design album index.html ('+Math.round(fs.statSync(path.join(dir,'index.html')).size/1024)+' KB) and preserved Three.js model.html ('+Math.round(fs.statSync(path.join(dir,'model.html')).size/1024)+' KB)');