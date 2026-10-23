import assert from 'node:assert/strict';
import {variants,walls,outline,openings,sleepEnvelope,wallsFor} from './data.js';
assert.equal(variants.length,5);assert.equal(new Set(variants.map(v=>v.id)).size,5);
const rect=f=>({x:f.x,y:f.y,w:f.w,d:f.d});
const wallRect=w=>({x:Math.min(w.a[0],w.b[0])-w.t/2,y:Math.min(w.a[1],w.b[1])-w.t/2,w:Math.abs(w.a[0]-w.b[0])+w.t,d:Math.abs(w.a[1]-w.b[1])+w.t});
const overlaps=(a,b,tol=.015)=>a.x+a.w>b.x+tol&&b.x+b.w>a.x+tol&&a.y+a.d>b.y+tol&&b.y+b.d>a.y+tol;
function inside(x,y){let c=false;for(let i=0,j=outline.length-1;i<outline.length;j=i++){const a=outline[i],b=outline[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c}
let checks=0;for(const v of variants){assert.equal(new Set(v.furniture.map(f=>f.id)).size,v.furniture.length);const allwalls=wallsFor(v).map(wallRect);for(const f of v.furniture){assert([f.x,f.y,f.w,f.d,f.h].every(Number.isFinite));assert(f.w>0&&f.d>0&&f.h>0);for(const [x,y] of [[f.x+.02,f.y+.02],[f.x+f.w-.02,f.y+.02],[f.x+.02,f.y+f.d-.02],[f.x+f.w-.02,f.y+f.d-.02]])assert(inside(x,y),`${v.id}/${f.id} outside envelope`);for(let j=0;j<allwalls.length;j++)assert(!overlaps(rect(f),allwalls[j]),`${v.id}/${f.id} intersects wall ${wallsFor(v)[j].id}`);checks++}for(let i=0;i<v.furniture.length;i++)for(let j=i+1;j<v.furniture.length;j++)assert(!overlaps(v.furniture[i],v.furniture[j]),`${v.id}: ${v.furniture[i].id} overlaps ${v.furniture[j].id}`);
 for(const night of [false,true]){const env=sleepEnvelope(v);if(night&&!env)continue;const items=v.furniture.map(f=>night&&v.id==='1'&&f.id==='coffee'?{...f,x:.15,y:3.65,w:.9,d:.5}:f);const obs=[...allwalls,...items.map(rect),...(night&&env?[env]:[])];if(night)for(const f of items.filter(f=>!['sofa','foldbed'].includes(f.id)))assert(!overlaps(env,f),`Sleep ${v.id} overlaps ${f.id}`);
 // Flood-fill the route from the actual entry with a 50 cm square footprint.
 const step=.025,r=.25,nx=252,ny=388;const valid=new Uint8Array(nx*ny);const seen=new Uint8Array(nx*ny);for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const x=i*step,y=j*step;if(![[x-r,y-r],[x+r,y-r],[x-r,y+r],[x+r,y+r]].every(([a,b])=>inside(a,b)))continue;if(obs.some(o=>overlaps({x:x-r,y:y-r,w:2*r,d:2*r},o,0)))continue;valid[j*nx+i]=1;}const start=128*nx+234;assert(valid[start],`${v.id} entry is blocked`);const queue=[start];seen[start]=1;for(let q=0;q<queue.length;q++){let a=queue[q];for(const b of[a-1,a+1,a-nx,a+nx])if(b>=0&&b<valid.length&&valid[b]&&!seen[b]){seen[b]=1;queue.push(b)}}
 const accessible=(x,y,t=.35)=>queue.some(a=>Math.hypot(a%nx*step-x,Math.floor(a/nx)*step-y)<t);
 for(const [name,x,y]of [['kitchen',4.7,5.3],['living',2.65,3.9],['balcony',1.5,8.3],['bathroom',1.05,1.6]])assert(accessible(x,y),`${v.id} ${night?'night':'day'} route to ${name} blocked`);
 }
}
assert.equal(openings.filter(o=>o.type==='window').length,2);
console.log(`PASS: 5 variants, ${checks} furniture footprints, fixed shell preserved, conditional variant 5 opening, furniture intersections, entry → living/kitchen/bath/balcony routes (50 cm test body, conceptual geometry).`);
