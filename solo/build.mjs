import {build} from 'esbuild';
import {readFileSync,writeFileSync} from 'node:fs';
await build({entryPoints:['solo/app.js'],outfile:'solo/app.bundle.js',bundle:true,minify:true,format:'iife',target:'es2022',legalComments:'inline'});
writeFileSync('solo/app.bundle.js',readFileSync('solo/app.bundle.js','utf8').replace(/^[\t ]+/gm,s=>s.replace(/ +(?=\t)/g,'')));
console.log('Built independent solo apartment page.');
