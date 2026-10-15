import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {products,byId,safeProductUrl} from '../src/shop/catalog.js';
import {placements,partitions,footprint,geometry} from '../src/shop/layout.js';
import {createProduct} from '../src/shop/scene.js';
// Canvas texture creation is stubbed only for geometry checks; no rendering claim.
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},strokeRect(){}})})};
assert.equal(products.length,16);assert.equal(placements.length,13);
for(const p of products){assert.ok(safeProductUrl(p.url),p.id+' URL');assert.ok(p.sku&&p.evidence&&p.accuracy);if(p.image)assert.ok(fs.existsSync('assets/shop/'+p.image));}
for(const bad of ['javascript:alert(1)','https://www.ozon.ru.evil.test/product/1','http://lemanapro.ru/'])assert.equal(safeProductUrl(bad),null);
for(const p of products.filter(p=>p.category==='furniture')){const object=createProduct(p),box=new T.Box3().setFromObject(object),size=box.getSize(new T.Vector3());const expected=[p.dimensions[0]/1000,p.dimensions[2]/1000,(p.dimensions[1]??10)/1000];[size.x,size.y,size.z].forEach((v,i)=>assert.ok(Number.isFinite(v)&&Math.abs(v-expected[i])<1e-5,p.id+' model envelope'));object.traverse(o=>{if(o.isMesh)assert.equal(o.userData.product,p.id);});}
const overlap=(a,b)=>Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)>0.001&&Math.min(a.y+a.d,b.y+b.d)-Math.max(a.y,b.y)>0.001;
const solid=placements.map(p=>({...footprint(p,byId[p.product]),id:p.id}));
for(const f of solid){for(const [x,y,w,d] of partitions)assert.ok(!overlap(f,{x,y,w,d}),f.id+' intersects partition');assert.ok(f.x>=0&&f.y>=0&&f.x+f.w<=6.4&&f.y+f.d<=8.3,f.id+' outside shell');if(f.y+f.d>7.44)assert.ok(f.x+f.w<=3.175,f.id+' outside south edge');if(f.y+f.d>6.85)assert.ok(f.x+f.w<=3.175||f.x>=3.425,f.id+' intersects pier');}
for(let i=0;i<solid.length;i++)for(let j=i+1;j<solid.length;j++){const pair=[solid[i].id,solid[j].id].sort().join('|');if(pair==='child-chair|child-desk')continue;assert.ok(!overlap(solid[i],solid[j]),pair+' collision');}
for(const w of geometry.windows)assert.ok([w.x,w.y,w.width,w.depth??40].every(Number.isFinite));
const html=fs.readFileSync('shop.html','utf8');assert.ok(!html.includes('/*SCRIPT*/'));assert.ok(html.includes('data:image/jpeg;base64,'));assert.ok(html.includes('Клик по предмету'));assert.ok(!/<script[^>]+src=/.test(html));
console.log('PASS: 16 sourced products, 13 placements, exact model envelopes, finite windows, no wall/pier/furniture collisions (desk chair may tuck under desk), safe URLs and self-contained build. Browser rendering and click UI are not covered by this test.');
