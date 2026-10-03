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

assert.deepEqual(layouts.map(l=>l.id),['D','E','F','G','H','I']);
const base=layouts[0],results=[];
assert.equal(new Set(layouts.map(l=>JSON.stringify(l.partitions))).size,6,'Each option must have genuinely different walls');
for(const layout of layouts){
  assert.deepEqual(layout.rooms.filter(r=>r.id!=='dressing').map(r=>r.id),base.rooms.map(r=>r.id));
  assert.equal(layout.doors.length,layout.id==='I'?4:3);
  if(layout.id==='I'){
    assert.deepEqual(layout.rooms.find(r=>r.id==='adult'),base.rooms.find(r=>r.id==='adult'));
    assert.deepEqual(layout.furniture.find(r=>r.id==='adult-bed'),base.furniture.find(r=>r.id==='adult-bed'));
    const room=layout.rooms.find(r=>r.id==='dressing');assert.equal(room.area,2.61);
    for(const item of layout.furniture.filter(o=>o.room==='dressing'&&o.collidable!==false))for(const [x,y] of corners(item))assert.ok(insidePolygon(x+(5530-x)*1e-5,y+(3870-y)*1e-5,room.polygon),'Storage must stay inside dressing room');
    const closed=colliders(geometry,layout,{doorsOpen:false});
    assert.ok(findRoute(layout.routes.entry,layout.routes.kitchen,geometry,closed).ok,'Closed dressing door must not block public circulation');
  }
  for(const id of ['hob','sink','dishwasher','fridge'])
    assert.deepEqual(layout.furniture.find(o=>o.id===id),base.furniture.find(o=>o.id===id),`${layout.id}: kitchen connection moved`);
  const sofa=layout.furniture.find(o=>o.id==='sofa');
  const bathSouth=layout.partitions.find(o=>o.id==='d-bath-south-left');
  const part=id=>layout.partitions.find(o=>o.id===id);
  const entrance=id=>layout.doors.find(o=>o.id===id);
  assert.equal(part('d-adult-north').x+part('d-adult-north').width,entrance('door-adult').x);
  assert.equal(entrance('door-adult').x+850,part('d-adult-divider').x);
  assert.equal(part('d-child-door-lintel').x+850,part('d-child-north-right').x);
  assert.equal(part('d-child-north-right').y,entrance('door-child').y);
  assert.equal(bathSouth.x+bathSouth.width,entrance('door-bath').x);
  assert.equal(entrance('door-bath').x+850,part('d-bath-south-right').x);
  assert.equal(part('d-bath-south-right').x+part('d-bath-south-right').width,part('d-bath-east').x+120);
  assert.equal(bathSouth.y,entrance('door-bath').y);
  for(const id of ['bath-tub','wc','washer','basin']){
    const fixture=layout.furniture.find(o=>o.id===id);
    assert.ok(fixture.x>=2440&&fixture.x+fixture.width<=part('d-bath-east').x&&fixture.y>=0&&fixture.y+fixture.depth<=bathSouth.y,`${layout.id}: ${id} outside bathroom`);
  }
  const gap=sofa.y+sofa.depth/2-sofa.width/2-(bathSouth.y+bathSouth.depth);
  assert.equal(layout.clearances.find(c=>c.id==='kitchen-entry').value,gap);
  assert.ok(gap>=914,`${layout.id}: kitchen passage narrower than target`);
  assert.ok(layout.clearances.find(c=>c.id==='entry-aisle').value>=914,`${layout.id}: entry passage narrower than target`);
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
  for(const door of layout.doors.filter(o=>o.hinge)){
    const hits=new Set();
    for(let i=0;i<=90;i++){
      const angle=(door.arcStart+(door.arcEnd-door.arcStart)*i/90)*Math.PI/180;
      const end=[door.hinge[0]+Math.cos(angle)*door.width,door.hinge[1]+Math.sin(angle)*door.width];
      const leaf={x:(door.hinge[0]+end[0])/2-door.width/2,y:(door.hinge[1]+end[1])/2-10,width:door.width,depth:20,height:2100,rotation:angle*180/Math.PI};
      for(const item of layout.furniture)if(overlap(leaf,item))hits.add(item.id);
    }
    assert.deepEqual([...hits],[],`${layout.id}: swing of ${door.id} hits furniture`);
  }
  const wallChanges=layout.partitions.filter(w=>JSON.stringify(w)!==JSON.stringify(base.partitions.find(b=>b.id===w.id))).map(w=>w.id);
  assert.ok(layout.id==='D'||wallChanges.length>0,`${layout.id}: no architectural changes`);
  results.push({id:layout.id,rooms:layout.rooms.filter(r=>r.area).map(r=>({id:r.id,area:r.area})),wallChanges,furniture:layout.furniture.length,routeCount:routes.length,routes,applianceAccess,collisions});
}
fs.writeFileSync('variants-qa-results.json',JSON.stringify({scope:'Six D-based architectural options; shifted partitions and doors, rotated solids, shell, 500 mm avatar routes, independent room access, swing and appliance leaves. Conceptual, subject to survey.',results},null,2));
console.log('Six layouts validated:',results.map(r=>`${r.id}: ${r.routeCount} routes`).join(', '));
