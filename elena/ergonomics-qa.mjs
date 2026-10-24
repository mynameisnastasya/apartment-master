import assert from 'node:assert/strict';
import {variants,walls,outline,wallsFor,slidingPanels,storagePlan} from './data.js';
import {ergonomicStudy,refinedIds} from './ergonomics.js';
const wr=w=>({x:Math.min(w.a[0],w.b[0])-w.t/2,y:Math.min(w.a[1],w.b[1])-w.t/2,w:Math.abs(w.a[0]-w.b[0])+w.t,d:Math.abs(w.a[1]-w.b[1])+w.t,id:w.id});
const hits=(a,b)=>a.x+a.w>b.x+1e-6&&b.x+b.w>a.x+1e-6&&a.y+a.d>b.y+1e-6&&b.y+b.d>a.y+1e-6;
const inside=(x,y)=>{let yes=false;for(let i=0,j=outline.length-1;i<outline.length;j=i++){const a=outline[i],b=outline[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])yes=!yes}return yes};
for(const id of refinedIds){const v=variants.find(v=>v.id===id),study=ergonomicStudy(v),ww=wallsFor(v).map(wr);for(const z of study.zones){assert(z.w>0&&z.d>0);for(const [x,y]of [[z.x,z.y],[z.x+z.w,z.y],[z.x,z.y+z.d],[z.x+z.w,z.y+z.d]])assert(inside(x,y),`${id} ${z.id} outside floor`);for(const obstacle of [...ww,...v.furniture.filter(f=>!z.ignore.includes(f.id))])assert(!hits(z,obstacle),`${id} ${z.id} blocked by ${obstacle.id}`);}
 for(const zone of study.zones.slice(0,2))assert((id==='5'?zone.w:zone.d)>=.6-1e-6,`${id} ${zone.id} under 60 cm`);
 const foot=study.zones.find(z=>z.id==='bed-foot');assert((id==='5'?foot.d:foot.w)>=(id==='5'?.65:.75),`${id} foot clearance`);
 assert(study.zones.find(z=>z.id==='kitchen-aisle').w>=.98-1e-6,`${id} kitchen below declared compact 98 cm`);
 // Sample the actual inward entrance leaf arc, including intermediate angles.
 // The former shoe cabinet intruded into the first centimetres of this sweep.
 for(let angle=0;angle<=Math.PI/2;angle+=Math.PI/180){for(let radius=0;radius<=.9;radius+=.01){
  const x=6.17-Math.sin(angle)*radius,y=2.75+Math.cos(angle)*radius;
  for(const f of v.furniture)assert(!(x>f.x&&x<f.x+f.w&&y>f.y&&y<f.y+f.d),`${id} entrance leaf hits ${f.id}`);
 }}
 // Room and kitchen hinged leaves are also tested at intermediate angles.
 const hinged=[{x:4.15,y:4.59,r:.85},...(id==='5'?[]:[{x:2.25,y:2.6,r:.83}])];
 for(const door of hinged)for(let angle=0;angle<=Math.PI/2;angle+=Math.PI/180)for(let radius=0;radius<=door.r;radius+=.01){
  const x=door.x+Math.cos(angle)*radius,y=door.y+Math.sin(angle)*radius;
  for(const f of v.furniture)assert(!(x>f.x&&x<f.x+f.w&&y>f.y&&y<f.y+f.d),`${id} room/kitchen leaf hits ${f.id}`);
 }
 const kitchen=v.furniture.find(f=>f.id==='kitchen'),modules=kitchen.modules;
 assert.deepEqual(modules.map(m=>m.id),['dishwasher','sink','prep','hob','drawers']);
 assert(Math.abs(modules.reduce((sum,m)=>sum+m.width,0)-kitchen.d)<1e-6);
 for(let i=1;i<modules.length;i++)assert(Math.abs(modules[i].offset-modules[i-1].offset-modules[i-1].width)<1e-6);
 assert(modules.find(m=>m.id==='prep').width>=.9-1e-6);
 assert.equal(v.furniture.find(f=>f.id==='fridge').front,'west');
 assert.equal(v.furniture.find(f=>f.id==='entryward').type,'coatniche');
 // The revision must actually remove bulk, not just repaint the original wardrobes.
 const storage=storagePlan(v);assert.equal(storage.tallCount,id==='3'?2:1);
 assert(!v.furniture.some(f=>f.type==='wardrobe'&&f.y>=4.4),'Tall wardrobe remains by bed');
 for(const f of v.furniture.filter(f=>f.type==='wardrobe'))assert(f.h<=2.4&&Math.min(f.w,f.d)>=.58);
 for(const f of v.furniture.filter(f=>f.type==='dresser')){
  assert(f.h<=.8);const open=study.zones.find(z=>z.id==='dresser-open'),use=study.zones.find(z=>z.id==='dresser-use');
  assert(!hits(open,use));assert(use.w>=.6);assert(open.w>=f.drawerTravel);
 }
 assert.equal(v.furniture.find(f=>f.id==='bed').storage,'lift');
 if(id!=='5')assert(study.zones.find(z=>z.id==='bed-foot').w>=1-1e-6);
 assert(kitchen.upper.width<=1.1&&kitchen.upper.depth<=.35);
 if(id==='4'){
  assert.equal(v.furniture.filter(f=>f.type==='desk').length,2);
  const a=v.furniture.find(f=>f.id==='balchair'),b=v.furniture.find(f=>f.id==='balchair2');assert(b.x-a.x-a.w>=.75);
  assert(!hits(study.zones.find(z=>z.id==='baldesk-use'),study.zones.find(z=>z.id==='baldesk2-use')));
 }
 // Daily dishwasher loading remains independent of both dining chairs.
 const load=study.zones.find(z=>z.id==='dishwasher-load'),door=study.zones.find(z=>z.id==='dishwasher-open');
 assert(!hits(load,door));assert.equal(v.furniture.filter(f=>f.type==='shelf').length,2);
 // Additional route check: 60 cm test body. The original bathroom bottleneck is deliberately excluded,
 // explicitly disclosed on the page, and remains checked at 50 cm in qa.mjs.
 const nx=252,ny=388,step=.025,r=.3,obs=[...ww,...v.furniture,...slidingPanels(v)],valid=new Uint8Array(nx*ny),seen=new Uint8Array(nx*ny);
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const x=i*step,y=j*step,b={x:x-r,y:y-r,w:2*r,d:2*r};if(![[b.x,b.y],[b.x+b.w,b.y],[b.x,b.y+b.d],[b.x+b.w,b.y+b.d]].every(([a,c])=>inside(a,c)))continue;if(!obs.some(o=>hits(b,o)))valid[j*nx+i]=1;}
 if(id==='5'){const passageStep=.025;for(let x=2.65+.3;x<=4.45-.3;x+=passageStep)assert(valid[Math.round(5.925/step)*nx+Math.round(x/step)],'5 direct kitchen-living route blocked');}
 const start=128*nx+234;assert(valid[start],`${id} 60cm entry blocked`);const q=[start];seen[start]=1;for(let n=0;n<q.length;n++){const a=q[n];for(const b of [a-1,a+1,a-nx,a+nx])if(b>=0&&b<valid.length&&valid[b]&&!seen[b]){seen[b]=1;q.push(b)}}
 const reach=(x,y,t=.2)=>q.some(i=>Math.hypot(i%nx*step-x,Math.floor(i/nx)*step-y)<=t);
 const bed=v.furniture.find(f=>f.id==='bed');const targets=id==='5'?[['bed left',.4,4.4],['bed right',2.85,4.4],['kitchen',4.9,5.5],['balcony',1.5,8.15]]:[['bed north',1.5,bed.y-.32],['bed south',1.5,bed.y+bed.d+.32],['kitchen',4.9,5.5],['balcony',1.5,8.15]];
 for(const z of study.zones.filter(z=>z.id.endsWith('-use')||z.id.startsWith('dining-'))){const ignore=new Set(z.ignore);if(ignore.size)continue;targets.push([z.id,z.x+z.w/2,z.y+z.d/2])}
 for(const [name,x,y]of targets)assert(reach(x,y),`${id} 60cm route to ${name} blocked`);
 console.log(`PASS ${id}: empty use/opening zones, both bed approaches ≥60 cm, bed foot ≥65/75 cm, compact kitchen ≥98 cm, connected 60 cm routes.`);
}
assert.equal(refinedIds.length,5);
