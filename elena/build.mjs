import {build} from 'esbuild';
await build({entryPoints:['elena/app.js'],outfile:'elena/app.bundle.js',bundle:true,minify:true,format:'iife',target:'es2022',legalComments:'inline'});
console.log('Built Elena: self-contained Three.js viewer, no CDN dependencies.');
