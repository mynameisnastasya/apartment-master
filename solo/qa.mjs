import assert from 'node:assert/strict';
import {outline,rooms,walls,furniture,zones,openings,slidingPanels,furnitureFootprints} from './data.js';
const hit=(a,b)=>a.x+a.w>b.x+1e-5&&b.x+b.w>a.x+1e-5&&a.y+a.d>b.y+1e-5&&b.y+b.d>a.y+1e-5;
const wallBox=w=>({id:w.id,x:Math.min(w.a[0],w.b[0])-w.t/2,y:Math.min(w.a[1],w.b[1])-w.t/2,w:Math.abs(w.a[0]-w.b[0])+w.t,d:Math.abs(w.a[1]-w.b[1])+w.t});
const ww=walls.map(wallBox),solids=furniture.flatMap(furnitureFootprints);
function inside(x,y){let yes=false;for(let i=0,j=outline.length-1;i<outline.length;j=i++){const a=outline[i],b=outline[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])yes=!yes}return yes}
for(const f of solids){assert(f.w>0&&f.d>0);for(const [x,y] of [[f.x,f.y],[f.x+f.w,f.y],[f.x,f.y+f.d],[f.x+f.w,f.y+f.d]])assert(inside(x,y),f.id+' outside floor');for(const w of ww)assert(!hit(f,w),f.id+' intersects wall '+w.id);}
for(let i=0;i<solids.length;i++)for(let j=i+1;j<solids.length;j++)assert(solids[i].id===solids[j].id||!hit(solids[i],solids[j]),solids[i].id+' intersects '+solids[j].id);
for(const z of zones){for(const o of [...ww,...solids.filter(f=>!z.ignore.includes(f.id))])assert(!hit(z,o),z.id+' blocked by '+o.id);}
for(const o of openings.filter(o=>o.hinge))for(let i=0;i<=60;i++)for(let r=.025;r<=o.radius;r+=.01){const a=o.start+(o.end-o.start)*i/60,p={x:o.hinge[0]+Math.cos(a)*r-.006,y:o.hinge[1]+Math.sin(a)*r-.006,w:.012,d:.012};for(const f of solids)assert(!hit(p,f),o.id+' moving leaf hits '+f.id);}
const panel=slidingPanels()[0];for(let i=0;i<=50;i++){const p={...panel,x:panel.x+.8*i/50};for(const o of [...ww,...solids])assert(!hit(p,o),'Dressing door hits '+o.id);}
assert(!openings.find(o=>o.id==='kdoor').hinge,'User confirmed: kitchen has no door');
assert.equal(openings.find(o=>o.id==='kdoor').type,'passage');
const kitchen=furniture.find(f=>f.id==='kitchen');assert(Math.abs(kitchen.modules.reduce((a,b)=>a+b.width,0)-kitchen.d)<1e-6);assert(kitchen.modules.find(m=>m.id==='prep').width>=.6);assert.equal(furniture.filter(f=>f.type==='wardrobe').length,1);
const washer=furniture.find(f=>f.id==='laundry');assert(washer.washer.d+washer.rearGap<=washer.d);assert(washer.washer.h+.08<=washer.sink.bottom);
const getZone=id=>zones.find(z=>z.id===id);assert(!hit(getZone('washer-open'),getZone('washer-load')));
// Connected routes with a 60 cm square, doors operated individually. Grid is 2 cm.
const step=.02,x0=-.3,y0=0,nx=425,ny=350,r=.3,obstacles=[...ww,...solids,...slidingPanels()];
function traverse(extra=[]){const valid=new Uint8Array(nx*ny),seen=new Uint8Array(nx*ny),obs=[...obstacles,...extra];
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const x=x0+i*step,y=y0+j*step,b={x:x-r,y:y-r,w:2*r,d:2*r};if(![[b.x,b.y],[b.x+b.w,b.y],[b.x,b.y+b.d],[b.x+b.w,b.y+b.d]].every(p=>inside(...p)))continue;if(!obs.some(o=>hit(b,o)))valid[j*nx+i]=1;}
 const index=(x,y)=>Math.round((y-y0)/step)*nx+Math.round((x-x0)/step),start=index(3.0,5.25);assert(valid[start],'entry start blocked');const q=[start];seen[start]=1;for(let n=0;n<q.length;n++){const a=q[n],i=a%nx,j=Math.floor(a/nx);for(const [ii,jj] of [[i-1,j],[i+1,j],[i,j-1],[i,j+1]]){const b=jj*nx+ii;if(ii>=0&&ii<nx&&jj>=0&&jj<ny&&valid[b]&&!seen[b]){seen[b]=1;q.push(b)}}}
 return(x,y,t=.12)=>q.some(i=>Math.hypot(x0+i%nx*step-x,y0+Math.floor(i/nx)*step-y)<=t);
}
const reach=traverse();for(const [name,x,y] of [['living',4.12,3.55],['window beside chaise',4.22,.82],['kitchen',1.05,1.8],['WC',.9,3.5],['shower',1,4.45],['bed north',6.6,2.23],['bed south',6.6,4.74],['dressing',6.45,5.67],['balcony',6.4,.56]])assert(reach(x,y),'Route blocked: '+name);
const dressing=furniture.find(f=>f.id==='dressing');
assert(Math.abs(dressing.bays.reduce((s,b)=>s+b.width,0)-dressing.w)<1e-6);assert.equal(dressing.bays.filter(b=>b.kind==='drawers').length,1);
assert(Math.abs(dressing.y-5.25-1)<1e-6,'Wardrobe aisle should be 100 cm');
assert(dressing.y-5.25-dressing.drawerTravel>=.65-1e-6,'Insufficient space before open drawers');
assert(traverse([getZone('dress-drawer-open')])(6.95,5.58),'Cannot reach open wardrobe drawer');
const fridge=furniture.find(f=>f.id==='fridge'),sofa=furniture.find(f=>f.id==='sofa');
assert.equal(fridge.x,kitchen.x,'Fridge must finish the kitchen row');assert(fridge.y>=kitchen.y+kitchen.d);assert.equal(fridge.front,'east');
assert(!furniture.some(f=>f.type==='desk'||f.id==='deskchair'),'No unrequested workspace');assert.equal(sofa.type,'sectional');assert(4.73-sofa.x-sofa.w>=.88-1e-6);
assert(traverse([getZone('fridge-open')])(1.03,1.8),'Cannot load open fridge');assert(reach(1.08,.42),'Cannot approach dining chair');
for(const [key,zone] of [['dishwasher','dish-open'],['prep','oven-open']]){const m=kitchen.modules.find(x=>x.id===key),z=getZone(zone);assert(Math.abs(z.y-(kitchen.y+kitchen.d-m.offset-m.width))<1e-6);}
const loaded=traverse([getZone('washer-open')]);assert(loaded(.99,4.32),'Cannot stand to load open washer');
console.log(`PASS: ${furniture.length} furniture objects, ${zones.length} use/opening zones, door sweeps, wardrobe sliding leaf, L-sofa window route, open-fridge access, 60 cm routes to all rooms, washer loading with open hatch. Geometry is conceptual, not surveyed.`);
