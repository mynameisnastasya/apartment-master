import fs from 'node:fs';
import assert from 'node:assert/strict';
import geometry from '../src/data/geometry.json' with {type:'json'};
import {layouts} from '../src/data/layout-variations.js';
import {colliders,findRoute,insidePolygon} from '../src/interaction/collision.js';
import {openingLeaf,operatorPoint} from '../src/interaction/appliances.js';

const corners = o => {
  const a=(o.rotation||0)*Math.PI/180,c=Math.cos(a),s=Math.sin(a),cx=o.x+o.width/2,cy=o.y+o.depth/2;
  return [[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>[cx+x*o.width/2*c-y*o.depth/2*s,cy+x*o.width/2*s+y*o.depth/2*c]);
};
const overlap = (a,b) => {
  if(Math.min((a.elevation||0)+a.height,(b.elevation||0)+b.height)-Math.max(a.elevation||0,b.elevation||0)<=.5)return false;
  const pa=corners(a),pb=corners(b);
  for(const polygon of [pa,pb])for(let i=0;i<4;i++){
    const q=polygon[(i+1)%4],axis=[q[1]-polygon[i][1],polygon[i][0]-q[0]],norm=Math.hypot(...axis);
    const project=points=>points.map(p=>(p[0]*axis[0]+p[1]*axis[1])/norm);
    const aa=project(pa),bb=project(pb);
    if(Math.min(Math.max(...aa),Math.max(...bb))-Math.max(Math.min(...aa),Math.min(...bb))<=.5)return false;
  }
  return true;
};

assert.deepEqual(layouts.map(l=>l.id),['D','E','F','G','H']);
const base=layouts[0],results=[];
for(const layout of layouts){
  assert.deepEqual(layout.partitions,base.partitions,`${layout.id}: partitions changed`);
  assert.deepEqual(layout.doors,base.doors,`${layout.id}: doors changed`);
  for(const id of ['bath-tub','wc','washer','basin','hob','sink','dishwasher','fridge'])
    assert.deepEqual(layout.furniture.find(o=>o.id===id),base.furniture.find(o=>o.id===id),`${layout.id}: fixed appliance ${id} moved`);
  const sofa=layout.furniture.find(o=>o.id==='sofa');
  const gap=sofa.y+sofa.depth/2-sofa.width/2-2040;
  assert.equal(layout.clearances.find(c=>c.id==='kitchen-entry').value,gap);
  assert.ok(gap>=914,`${layout.id}: kitchen passage narrower than target`);
  const collisions=[];
  for(let i=0;i<layout.furniture.length;i++){
    const a=layout.furniture[i];
    for(const b of [...layout.furniture.slice(i+1),...geometry.walls,...layout.partitions])if(overlap(a,b))collisions.push([a.id,b.id]);
    for(const [x,y] of corners(a))assert.ok(insidePolygon(x+(a.x+a.width/2-x)*1e-5,y+(a.y+a.depth/2-y)*1e-5,geometry.floor),`${layout.id}: ${a.id} outside shell`);
  }
  assert.deepEqual(collisions,[],`${layout.id}: intersecting furniture or walls`);
  const obstacles=colliders(geometry,layout),routes=[];
  for(const [a,b] of layout.routePairs){
    const result=findRoute(layout.routes[a],layout.routes[b],geometry,obstacles,{radius:250});
    assert.ok(result.ok&&result.endpointSnapMm.every(n=>n<=150),`${layout.id}: blocked ${a} → ${b} or moved endpoint`);
    routes.push({from:a,to:b,lengthMm:result.lengthMm,snapMm:result.endpointSnapMm});
  }
  for(const [target,closed] of [['adult',['door-child','door-bath']],['alice',['door-adult','door-bath']],['bathroom',['door-adult','door-child']]]){
    const blocked=obstacles.filter(o=>!closed.includes(o.id));
    for(const id of closed){const door=layout.doors.find(o=>o.id===id);blocked.push({x:door.x,y:door.y,width:door.width,depth:120});}
    assert.ok(findRoute(layout.routes.entry,layout.routes[target],geometry,blocked,{radius:250}).ok,`${layout.id}: independent access to ${target} blocked`);
  }
  const applianceAccess=[];
  for(const o of layout.furniture){
    const leaf=openingLeaf(o);if(!leaf)continue;
    const hits=[...geometry.walls,...layout.partitions,...layout.furniture.filter(x=>x.id!==o.id)].filter(x=>overlap(x,leaf));
    assert.deepEqual(hits.map(x=>x.id),[],`${layout.id}: opening ${o.id} hits obstacle`);
    const p=operatorPoint(o),path=findRoute(layout.routes.entry,p,geometry,[...obstacles,leaf],{radius:250});
    assert.ok(path.ok,`${layout.id}: ${o.id} unreachable while open`);
    applianceAccess.push(o.id);
  }
  results.push({id:layout.id,furniture:layout.furniture.length,routeCount:routes.length,routes,applianceAccess,collisions});
}
fs.writeFileSync('variants-qa-results.json',JSON.stringify({scope:'Five D-based layouts; rotated solids, shell, 500 mm avatar routes, opened appliance leaves. Conceptual, subject to survey.',results},null,2));
console.log('Five layouts validated:',results.map(r=>`${r.id}: ${r.routeCount} routes`).join(', '));
