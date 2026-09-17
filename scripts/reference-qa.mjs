import fs from 'node:fs';
import assert from 'node:assert/strict';
import {colliders,findRoute,canStand,moveWithCollision,insidePolygon} from '../src/interaction/collision.js';
import {openingLeaf} from '../src/interaction/appliances.js';
const g=JSON.parse(fs.readFileSync('src/data/geometry.json'));
const d=JSON.parse(fs.readFileSync('src/data/layout-reference.json'));
export function corners(o){const a=(o.rotation||0)*Math.PI/180,c=Math.cos(a),s=Math.sin(a),cx=o.x+o.width/2,cy=o.y+o.depth/2;return [[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>[cx+x*o.width/2*c-y*o.depth/2*s,cy+x*o.width/2*s+y*o.depth/2*c]);}
function overlap(a,b){if(Math.min((a.elevation||0)+a.height,(b.elevation||0)+b.height)-Math.max(a.elevation||0,b.elevation||0)<=.5)return false;const pa=corners(a),pb=corners(b);for(const p of [pa,pb])for(let i=0;i<4;i++){const q=p[(i+1)%4],axis=[q[1]-p[i][1],p[i][0]-q[0]],norm=Math.hypot(...axis);const project=ps=>ps.map(v=>(v[0]*axis[0]+v[1]*axis[1])/norm);const aa=project(pa),bb=project(pb);if(Math.min(Math.max(...aa),Math.max(...bb))-Math.max(Math.min(...aa),Math.min(...bb))<=.5)return false;}return true;}
const failures=[],obstacles=colliders(g,d),collisions=[];
for(let i=0;i<d.furniture.length;i++){
 const a=d.furniture[i];for(const b of [...d.furniture.slice(i+1),...g.walls,...d.partitions])if(overlap(a,b))collisions.push([a.id,b.id]);
 // Move boundary points 0.1 mm towards the centre before inside tests.
 for(const [x,y] of corners(a))if(!insidePolygon(x+(a.x+a.width/2-x)*1e-5,y+(a.y+a.depth/2-y)*1e-5,g.floor))failures.push(a.id+' outside shell');
}
if(collisions.length)failures.push('Furniture intersections');
const routes=d.routePairs.map(([a,b])=>{const r=findRoute(d.routes[a],d.routes[b],g,obstacles);if(!r.ok||r.endpointSnapMm.some(v=>v>150))failures.push(a+' → '+b+': blocked or moved endpoint');if(r.ok)for(let i=1;i<r.path.length;i++){const prev=r.path[i-1],next=r.path[i],m=moveWithCollision({x:prev[0],y:prev[1]},next[0]-prev[0],next[1]-prev[1],g,obstacles);if(Math.hypot(m.x-next[0],m.y-next[1])>1)failures.push('Route movement '+a+' → '+b);}return {from:a,to:b,...r};});
const independence=[];
for(const [target,closed] of [['adult',['door-child','door-bath']],['alice',['door-adult','door-bath']],['bathroom',['door-adult','door-child']]]){
 const obs=obstacles.filter(o=>!closed.includes(o.id));for(const id of closed){const door=d.doors.find(o=>o.id===id);obs.push({x:door.x,y:door.y,width:door.width,depth:120});}
 const r=findRoute(d.routes.entry,d.routes[target],g,obs);independence.push({target,closed,ok:r.ok});if(!r.ok)failures.push('Room is not independently accessible: '+target);
}
const openings=[];
for(const o of d.furniture){const leaf=openingLeaf(o);if(!leaf)continue;const hits=[...g.walls,...d.partitions,...d.furniture.filter(b=>b.id!==o.id)].filter(b=>overlap(leaf,b)).map(b=>b.id);openings.push({id:o.id,collisions:hits});if(hits.length)failures.push('Appliance opening '+o.id);}
const doorSweeps=[];
for(const door of d.doors.filter(o=>o.hinge)){
 const hits=new Set();for(let i=0;i<=90;i++){const a=(door.arcStart+(door.arcEnd-door.arcStart)*i/90)*Math.PI/180;const end=[door.hinge[0]+Math.cos(a)*door.width,door.hinge[1]+Math.sin(a)*door.width];const leaf={x:(door.hinge[0]+end[0])/2-door.width/2,y:(door.hinge[1]+end[1])/2-10,width:door.width,depth:20,height:2100,rotation:a*180/Math.PI};for(const item of d.furniture)if(overlap(leaf,item))hits.add(item.id);}
 doorSweeps.push({id:door.id,collisions:[...hits]});if(hits.size)failures.push('Door sweep '+door.id);
}
assert.equal(d.clearances.find(c=>c.id==='entry-aisle').value,d.furniture.find(o=>o.id==='hall-wardrobe').x-(d.partitions.find(o=>o.id==='d-bath-east').x+120));
const result={layout:d.id,scope:'Rotated solid furniture and walls; body diameter 500 mm; 75 mm route grid; independent room access; appliance leaves and furniture in door sweeps. Does not certify construction or comfort.',collisions,independence,openings,doorSweeps,routes,failures};
fs.writeFileSync('reference-qa-results.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({...result,routes:routes.map(({path,...r})=>r)},null,2));if(failures.length)process.exitCode=1;
