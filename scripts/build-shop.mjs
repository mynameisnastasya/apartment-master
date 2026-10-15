import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const result=await build({entryPoints:[path.join(root,'src/shop/app.js')],bundle:true,minify:true,format:'iife',write:false,target:'es2022'});
const images={};for(const f of fs.readdirSync(path.join(root,'assets/shop')))if(f.endsWith('.jpg'))images[f]='data:image/jpeg;base64,'+fs.readFileSync(path.join(root,'assets/shop',f)).toString('base64');
const source=fs.readFileSync(path.join(root,'src/shop/template.html'),'utf8').replace('/*STYLE*/',()=>fs.readFileSync(path.join(root,'src/shop/style.css'),'utf8')).replace('/*REFERENCE*/',()=>fs.readFileSync(path.join(root,'docs/plan-2026-10-09/furniture-plan.svg'),'utf8')).replace('/*IMAGES*/',()=>JSON.stringify(images)).replace('/*SCRIPT*/',()=>result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script'));
fs.writeFileSync(path.join(root,'shop.html'),source);console.log('Built standalone shop.html: '+Math.round(Buffer.byteLength(source)/1024)+' KB');
