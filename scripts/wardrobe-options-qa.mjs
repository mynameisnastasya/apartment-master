import assert from 'node:assert/strict';
import geometry from '../src/data/geometry.json' with {type:'json'};
import {wardrobeOptions} from '../src/data/wardrobe-options.js';
import {colliders,findRoute,insidePolygon} from '../src/interaction/collision.js';
import {openingLeaf,operatorPoint} from '../src/interaction/appliances.js';
const vertices=o=>{const a=(o.rotation||0)*Math.PI/180,c=Math.cos(a),s=Math.sin(a),x=o.x+o.width/2,y=o.y+o.depth/2;return [[-1,-1],[1,-1],[1,1],[-1,1]].map(([i,j])=>[x+i*o.width/2*c-j*o.depth/2*s,y+i*o.width/2*s+j*o.depth/2*c]);};
function overlap(a,b){if(Math.min((a.elevation||0)+a.height,(b.elevation||0)+b.height)-Math.max(a.elevation||0,b.elevation||0)<=.5)return false;const A=vertices(a),B=vertices(b);for(const P of[A,B])for(let i=0;i<4;i++){const q=P[(i+1)%4],axis=[q[1]-P[i][1],P[i][0]-q[0]],projection=Q=>Q.map(p=>p[0]*axis[0]+p[1]*axis[1]);const u=projection(A),v=projection(B);if(Math.min(Math.max(...u),Math.max(...v))-Math.max(Math.min(...u),Math.min(...v))<=.5)return false;}return true;}
const results=[];
for(const l of wardrobeOptions){
 const shell=geometry.walls.find(w=>w.x===3175&&w.y===6850&&w.width===250);
 assert.ok(shell,`${l.id}: bearing pier missing`);
 const wardrobe=l.rooms.find(r=>r.id==='dressing');assert.ok(wardrobe.area>2,`${l.id}: undersized wardrobe`);
 const rack=l.furniture.find(o=>o.id==='dressing-rail');assert.ok(rack,`${l.id}: no real storage`);
 for(const v of vertices(rack))assert.ok(insidePolygon(v[0]+(wardrobe.x-v[0])*1e-5,v[1]+(wardrobe.y-v[1])*1e-5,wardrobe.polygon),`${l.id}: rack outside wardrobe`);
 const issues=[];
 for(let i=0;i<l.furniture.length;i++){
  const o=l.furniture[i];for(const b of [...l.furniture.slice(i+1),...geometry.walls,...l.partitions])if(overlap(o,b))issues.push(`${o.id}/${b.id}`);
  for(const [x,y] of vertices(o))assert.ok(insidePolygon(x+(o.x+o.width/2-x)*1e-5,y+(o.y+o.depth/2-y)*1e-5,geometry.floor),`${l.id}: ${o.id} outside shell`);
 }
 assert.deepEqual(issues,[],`${l.id}: physical intersections`);
 const obstacles=colliders(geometry,l),blocked=[];
 for(const [a,b] of l.routePairs){const p=findRoute(l.routes[a],l.routes[b],geometry,obstacles,{radius:250});if(!p.ok||p.endpointSnapMm.some(n=>n>150))blocked.push(`${a}→${b}: ${p.reason||p.endpointSnapMm.map(Math.round)}`);}
 assert.deepEqual(blocked,[],`${l.id}: walking routes for Ø500 mm body`);
 for(const door of l.doors.filter(d=>d.hinge)){
  const hits=new Set();for(let k=0;k<=90;k++){
   const a=(door.arcStart+(door.arcEnd-door.arcStart)*k/90)*Math.PI/180;
   const x=door.hinge[0]+Math.cos(a)*door.width,y=door.hinge[1]+Math.sin(a)*door.width;
   const leaf={x:(door.hinge[0]+x)/2-door.width/2,y:(door.hinge[1]+y)/2-10,width:door.width,depth:20,height:2100,rotation:a*180/Math.PI};
   for(const item of l.furniture)if(overlap(leaf,item))hits.add(item.id);
  }assert.deepEqual([...hits],[],`${l.id}: swing of ${door.id} hits furniture`);
 }
 const appliances=[];
 for(const o of l.furniture){const leaf=openingLeaf(o);if(!leaf)continue;const hits=[...l.furniture.filter(x=>x!==o),...geometry.walls,...l.partitions].filter(x=>overlap(x,leaf)).map(x=>x.id);assert.deepEqual(hits,[],`${l.id}: ${o.id} opening collisions`);const p=findRoute(l.routes.entry,operatorPoint(o),geometry,[...obstacles,leaf],{radius:250});assert.ok(p.ok,`${l.id}: ${o.id} operator cannot reach open appliance`);appliances.push(o.id);}
 results.push({variant:l.id,wardrobeAreaM2:wardrobe.area,adultAreaM2:l.rooms.find(r=>r.id==='adult').area,otherRoomAreaM2:l.rooms.find(r=>r.id==='alice').area,frontAisleMm:l.study.aisle,hangingRowMm:l.study.row,routes:l.routePairs.length,appliances});
}
console.log(JSON.stringify(results,null,2));
