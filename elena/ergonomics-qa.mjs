import assert from 'node:assert/strict';
import {variants,walls,outline} from './data.js';
import {ergonomicStudy,refinedIds} from './ergonomics.js';
const wr=w=>({x:Math.min(w.a[0],w.b[0])-w.t/2,y:Math.min(w.a[1],w.b[1])-w.t/2,w:Math.abs(w.a[0]-w.b[0])+w.t,d:Math.abs(w.a[1]-w.b[1])+w.t,id:w.id});
const hits=(a,b)=>a.x+a.w>b.x+1e-6&&b.x+b.w>a.x+1e-6&&a.y+a.d>b.y+1e-6&&b.y+b.d>a.y+1e-6;
const inside=(x,y)=>{let yes=false;for(let i=0,j=outline.length-1;i<outline.length;j=i++){const a=outline[i],b=outline[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])yes=!yes}return yes};
for(const id of refinedIds){const v=variants.find(v=>v.id===id),study=ergonomicStudy(v),ww=[...walls,...v.parts].map(wr);for(const z of study.zones){assert(z.w>0&&z.d>0);for(const [x,y]of [[z.x,z.y],[z.x+z.w,z.y],[z.x,z.y+z.d],[z.x+z.w,z.y+z.d]])assert(inside(x,y),`${id} ${z.id} outside floor`);for(const obstacle of [...ww,...v.furniture.filter(f=>!z.ignore.includes(f.id))])assert(!hits(z,obstacle),`${id} ${z.id} blocked by ${obstacle.id}`);}
 for(const name of ['bed-north','bed-south'])assert(study.zones.find(z=>z.id===name).d>=.6-1e-6,`${id} ${name} under 60 cm`);
 assert(study.zones.find(z=>z.id==='bed-foot').w>=.75,`${id} foot under 75 cm`);
 assert(study.zones.find(z=>z.id==='kitchen-aisle').w>=1.067,`${id} kitchen below one-cook target`);
 // Additional route check: 60 cm test body. The original bathroom bottleneck is deliberately excluded,
 // explicitly disclosed on the page, and remains checked at 50 cm in qa.mjs.
 const nx=252,ny=388,step=.025,r=.3,obs=[...ww,...v.furniture],valid=new Uint8Array(nx*ny),seen=new Uint8Array(nx*ny);
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const x=i*step,y=j*step,b={x:x-r,y:y-r,w:2*r,d:2*r};if(![[b.x,b.y],[b.x+b.w,b.y],[b.x,b.y+b.d],[b.x+b.w,b.y+b.d]].every(([a,c])=>inside(a,c)))continue;if(!obs.some(o=>hits(b,o)))valid[j*nx+i]=1;}
 const start=128*nx+234;assert(valid[start],`${id} 60cm entry blocked`);const q=[start];seen[start]=1;for(let n=0;n<q.length;n++){const a=q[n];for(const b of [a-1,a+1,a-nx,a+nx])if(b>=0&&b<valid.length&&valid[b]&&!seen[b]){seen[b]=1;q.push(b)}}
 const reach=(x,y,t=.2)=>q.some(i=>Math.hypot(i%nx*step-x,Math.floor(i/nx)*step-y)<=t);
 const bed=v.furniture.find(f=>f.id==='bed');const targets=[['bed north',1.5,bed.y-.32],['bed south',1.5,bed.y+bed.d+.32],['kitchen',4.9,5.5],['balcony',1.5,8.15]];
 for(const z of study.zones.filter(z=>z.id.endsWith('-use')||z.id.startsWith('dining-'))){const ignore=new Set(z.ignore);if(ignore.size)continue;targets.push([z.id,z.x+z.w/2,z.y+z.d/2])}
 for(const [name,x,y]of targets)assert(reach(x,y),`${id} 60cm route to ${name} blocked`);
 console.log(`PASS ${id}: empty use/opening zones, both bed approaches ≥60 cm, bed foot ≥75 cm, kitchen ≥106.7 cm, connected 60 cm routes.`);
}
assert.equal(ergonomicStudy(variants[0]),null);
