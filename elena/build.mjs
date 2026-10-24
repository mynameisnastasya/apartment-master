import {build} from 'esbuild';
import {readFileSync,writeFileSync} from 'node:fs';
await build({entryPoints:['elena/app.js'],outfile:'elena/app.bundle.js',bundle:true,minify:true,format:'iife',target:'es2022',legalComments:'inline'});
// Normalize shader indentation in bundled dependencies for reproducible, whitespace-clean output.
writeFileSync('elena/app.bundle.js',readFileSync('elena/app.bundle.js','utf8').replace(/^[\t ]+/gm,spaces=>spaces.replace(/ +(?=\t)/g,'')));
console.log('Built Elena: self-contained Three.js viewer, no CDN dependencies.');
