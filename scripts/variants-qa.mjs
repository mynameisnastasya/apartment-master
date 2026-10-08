import fs from 'node:fs';
import assert from 'node:assert/strict';
import geometry from '../src/data/geometry.json' with {type:'json'};
import {wardrobeOptions} from '../src/data/wardrobe-options.js';
import {layouts} from '../src/data/layout-variations.js';
import {colliders,findRoute,insidePolygon,canStand} from '../src/interaction/collision.js';
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

assert.deepEqual(layouts.map(l=>l.id),['D','E','F','G','H','I','J','K','L','M','N','O','W4','W6']);
const base=layouts[0],results=[];
const gallery=layouts.find(l=>l.id==='W4'),study=wardrobeOptions.find(l=>l.id==='W4');
for(const key of ['partitions','doors','furniture'])assert.deepEqual(gallery[key],study[key],'W4 3D must use the selected study geometry');
assert.equal(gallery.rooms.find(r=>r.id==='dressing').area,4.76);
assert.equal(gallery.partitions.find(w=>w.id==='d-child-diagonal').rotation,0);
assert.equal(gallery.partitions.find(w=>w.id==='d-child-north-right').y,gallery.partitions.find(w=>w.id==='suite-north').y);
assert.equal(gallery.furniture.find(o=>o.id==='sofa').rotation,0);
assert.equal(gallery.furniture.find(o=>o.id==='dining').wallMounted,true);
assert.equal(gallery.clearances.find(c=>c.id==='dressing-aisle').value,900);
assert.equal(new Set(layouts.map(l=>JSON.stringify(l.partitions))).size,12,'Each architectural option must have genuinely different walls');
for(const layout of layouts){
  assert.deepEqual(layout.rooms.filter(r=>!['dressing','childDressing'].includes(r.id)).map(r=>r.id),base.rooms.map(r=>r.id));
  assert.equal(layout.doors.length,3+layout.rooms.filter(r=>['dressing','childDressing'].includes(r.id)).length);
  if(layout.id==='L'){
    const bed=layout.furniture.find(f=>f.id==='adult-bed'),child=layout.furniture.find(f=>f.id==='alice-bed');
    assert.equal(bed.rotation,90,'L: adult pillows must face the right wall');
    assert.equal(child.rotation,90,'L: second bed must face the right wall');
    assert.equal(layout.rooms.find(r=>r.id==='alice').area,9.21,'L: do not present image estimate as modeled area');
    assert.equal(layout.rooms.find(r=>r.id==='alice').referenceArea,10.41);
    const dressing=layout.rooms.find(r=>r.id==='dressing');
    const bathSouth=layout.partitions.find(w=>w.id==='d-bath-south-left');
    const dressingNorth=layout.partitions.find(w=>w.id==='l-dressing-north-right');
    const actualNeck=dressingNorth.y-(bathSouth.y+bathSouth.depth);
    assert.equal(actualNeck,930,'L: corridor between bathroom and dressing must be widened to 930 mm');
    assert.ok(actualNeck>=914,'L: do not silently restore unsafe 680 mm neck');
    assert.equal(layout.clearances.find(c=>c.id==='hall-neck').value,actualNeck,'L: labeled neck width does not match geometry');
    assert.equal(dressing.area,2.57,'L: modeled dressing area after corridor widening');
    assert.equal(dressing.referenceArea,3.04,'L: retain reference image area separately');
    const area=dressing.polygon.reduce((sum,p,i)=>{const next=dressing.polygon[(i+1)%dressing.polygon.length];return sum+p[0]*next[1]-p[1]*next[0]},0)/2e6;
    assert.ok(Math.abs(Math.abs(area)-dressing.area)<.01,'L: room area must match the polygon');
    const rail=layout.furniture.find(o=>o.id==='l-dressing-rail'),shelves=layout.furniture.find(o=>o.id==='l-dressing-shelves');
    for(const item of [rail,shelves])for(const [x,y] of corners(item))
      assert.ok(insidePolygon(x+(5450-x)*1e-6,y+(3650-y)*1e-6,dressing.polygon),'L: storage outside revised dressing room');
    assert.ok(!layout.furniture.some(f=>f.id==='adult-dresser'),'L: keep bedroom side route free');
    const minY=item=>Math.min(...corners(item).map(p=>p[1]));
    const maxY=item=>Math.max(...corners(item).map(p=>p[1]));
    const adultCloset=layout.furniture.find(f=>f.id==='adult-wardrobe');
    const adultAisle=minY(bed)-(adultCloset.y+adultCloset.depth);
    const adultWindow=8300-maxY(bed);
    assert.ok(adultAisle>=850,`L: bedroom wardrobe access only ${adultAisle} mm`);
    assert.ok(adultWindow>=850,`L: bedroom window access only ${adultWindow} mm`);
    assert.equal(layout.clearances.find(c=>c.id==='adult-wardrobe-aisle').value,adultAisle);
    assert.equal(layout.clearances.find(c=>c.id==='adult-window').value,adultWindow);
    const childDesk=layout.furniture.find(f=>f.id==='alice-desk');
    const childBedToDesk=childDesk.y-maxY(child);
    assert.ok(childBedToDesk>=800,`L: chair route at child desk only ${childBedToDesk} mm`);
    // Unlike old tests, check the physical doorway, not just a waypoint already
    // on the safe side of a cabinet. East-wall door: x=6400, y=100..1100.
    const entry=geometry.entry,shoe=layout.furniture.find(f=>f.id==='hall-wardrobe');
    assert.equal(entry.axis,'y');
    assert.equal(entry.x,6400);
    assert.equal(shoe.type,'storage','L: no floor-to-ceiling closet immediately behind the front door');
    assert.ok(shoe.height<=1000&&shoe.width<=400&&shoe.y>=entry.y+entry.width+250,'L: low shoe cabinet must stay beyond the entry landing');
    const bathEast=layout.partitions.find(w=>w.id==='d-bath-east');
    const hallWidth=shoe.x-(bathEast.x+bathEast.width);
    assert.ok(hallWidth>=950,`L: entrance storage reduces corridor to ${hallWidth} mm`);
    assert.equal(layout.clearances.find(c=>c.id==='entry-aisle').value,hallWidth,'L: displayed entry aisle must match model geometry');
    const landing={id:'entry-landing',x:5700,y:200,width:700,depth:900,height:2100,elevation:0,rotation:0};
    const doorwayClashes=layout.furniture.filter(item=>overlap(item,landing));
    assert.deepEqual(doorwayClashes.map(f=>f.id),[],'L: entrance landing must be empty of all furniture');
    const physicalThreshold=[6150,600],actualObstacles=colliders(geometry,layout);
    assert.ok(canStand(...physicalThreshold,geometry,actualObstacles,250),'L: avatar cannot enter through the front doorway');
    for(const target of ['kitchen','storage','sofa','adult','alice','bathroom','dressing']){
      const route=findRoute(physicalThreshold,layout.routes[target],geometry,actualObstacles,{radius:250});
      assert.ok(route.ok&&route.endpointSnapMm.every(v=>v<=150),`L: front door → ${target} blocked, even though interior paths may work`);
    }
    for(const [id,room] of [['adult-bed','adult'],['adult-wardrobe','adult'],['alice-bed','alice'],['alice-desk','alice'],['l-dressing-rail','dressing'],['l-dressing-shelves','dressing']]){
      assert.ok(layout.furniture.some(item=>item.id===id&&item.room===room),`L: missing ${id} in ${room}`);
    }
  }
  if(layout.id==='M'){
    const adult=layout.rooms.find(r=>r.id==='adult');
    const dressing=layout.rooms.find(r=>r.id==='dressing');
    assert.equal(adult.area,13.97,'M: 3180 × 4400 photo bedroom expressed in current shell');
    assert.equal(adult.referenceArea,13.99,'M: visible 3.18 × 4.40 photo label');
    assert.equal(dressing.area,2.78,'M: wardrobe widened west of L');
    assert.ok(layout.partitions.find(w=>w.id==='l-dressing-west').x<layouts.find(v=>v.id==='L').partitions.find(w=>w.id==='l-dressing-west').x,'M: genuinely distinct closet geometry');
    assert.equal(layout.clearances.find(c=>c.id==='hall-neck').value,930);
    assert.equal(layout.doors.find(d=>d.id==='door-child').x,3370,'M: shifted doorway clear of enlarged dressing');
  }
  if(layout.id==='N'){
    const m=layouts.find(v=>v.id==='M');
    const adult=layout.rooms.find(r=>r.id==='adult'),dressing=layout.rooms.find(r=>r.id==='dressing');
    assert.equal(adult.area,13.34,'N: primary bedroom area must reflect shifted project partition');
    assert.equal(dressing.area,2.51,'N: dressing area tradeoff must be explicit');
    assert.equal(layout.rooms.find(r=>r.id==='alice').area,9.21,'N: keep independent windowed second bedroom');
    assert.equal(layout.partitions.find(w=>w.id==='d-adult-north').y-m.partitions.find(w=>w.id==='d-adult-north').y,200,'N: architectural revision must be genuine');
    const corridor=layout.partitions.find(w=>w.id==='l-dressing-west').x
      -(layout.partitions.find(w=>w.id==='d-adult-divider').x+layout.partitions.find(w=>w.id==='d-adult-divider').width);
    assert.equal(corridor,1125,'N: second bedroom approach must have 1125 mm gross corridor');
    assert.equal(layout.clearances.find(c=>c.id==='hall-to-child').value,corridor);
    const bath=layout.partitions.find(w=>w.id==='d-bath-south-left');
    const dNorth=layout.partitions.find(w=>w.id==='l-dressing-north-right');
    assert.equal(dNorth.y-(bath.y+bath.depth),930,'N: north-south hall minimum 930 mm');
    const rail=layout.furniture.find(o=>o.id==='l-dressing-rail');
    const shelves=layout.furniture.find(o=>o.id==='l-dressing-shelves');
    const shelvesEast=Math.max(...corners(shelves).map(([x])=>x));
    assert.equal(rail.x-shelvesEast,920,'N: wardrobe drawer/rail approach must be 920 mm');
    assert.equal(layout.clearances.find(c=>c.id==='dressing-aisle').value,920);
    const bed=layout.furniture.find(o=>o.id==='adult-bed'),wardrobe=layout.furniture.find(o=>o.id==='adult-wardrobe');
    const minY=o=>Math.min(...corners(o).map(p=>p[1]));
    const maxY=o=>Math.max(...corners(o).map(p=>p[1]));
    assert.equal(minY(bed)-(wardrobe.y+wardrobe.depth),855,'N: leave room to open wardrobe in bedroom');
    assert.equal(8300-maxY(bed),925,'N: preserve daylight and window access');
    assert.equal(layout.partitions.filter(p=>p.transomGlass).length,2,'N: glazed door tops in project partitions only');
    assert.ok(layout.partitions.filter(p=>p.transomGlass).every(p=>p.openingPart&&p.elevation>=2100),'N: transoms must stay above standing head clearance');
    assert.equal(layout.doors.find(d=>d.id==='door-child').width,850);
    assert.equal(layout.doors.find(d=>d.id==='door-dressing').width,850);
    assert.ok(!layout.furniture.some(o=>o.id==='adult-dresser'),'N: no dressing table pinching bedroom');
    for(const [id] of [['outer-west'],['outer-east-lower'],['pier'],['adult-window-sill'],['child-window-sill']])
      assert.ok(geometry.walls.some(w=>w.id===id),'N: structural shell or pier missing');
    const obstaclesN=colliders(geometry,layout);
    const entryPt=[6150,600];
    assert.ok(canStand(...entryPt,geometry,obstaclesN,250),'N: entrance must be unobstructed');
    for(const target of ['kitchen','sofa','adult','adultBed','adultWardrobe','alice','aliceBed','aliceDesk','dressing','dressingRail','dressingShelves','bathroom','storage']){
      const route=findRoute(entryPt,layout.routes[target],geometry,obstaclesN,{radius:250});
      assert.ok(route.ok&&route.endpointSnapMm.every(n=>n<=150),`N: inaccessible ${target} from the REAL doorway`);
    }
  }
  if(layout.id==='O'){
    const n=layouts.find(v=>v.id==='N');
    const d=layout.rooms.find(r=>r.id==='dressing');
    assert.equal(d.area,2.91,'O: actual 1950 × 1490 interior dressing floor');
    assert.equal(layout.rooms.find(r=>r.id==='alice').area,8.94,'O: bedroom reduction is disclosed, not hidden');
    assert.ok(d.area>n.rooms.find(r=>r.id==='dressing').area+.35,'O: larger walk-in than N');
    const west=layout.partitions.find(w=>w.id==='l-dressing-west'),south=layout.partitions.find(w=>w.id==='l-dressing-south');
    assert.equal(west.x,4330);assert.equal(west.y+west.depth,south.y);
    assert.equal(south.y,4470);
    const neck=layout.partitions.find(w=>w.id==='l-dressing-north-right').y
      -(layout.partitions.find(w=>w.id==='d-bath-south-left').y+layout.partitions.find(w=>w.id==='d-bath-south-left').depth);
    assert.equal(neck,930,'O: keep bathroom corridor clear');
    const westCorridor=west.x-(layout.partitions.find(w=>w.id==='d-adult-divider').x+layout.partitions.find(w=>w.id==='d-adult-divider').width);
    assert.equal(westCorridor,1035,'O: keep 1.035 m to the second bedroom');
    assert.equal(layout.clearances.find(c=>c.id==='hall-to-child').value,westCorridor);
    const rail=layout.furniture.find(o=>o.id==='l-dressing-rail');
    const shelves=layout.furniture.find(o=>o.id==='l-dressing-shelves');
    assert.equal(rail.width,600,'O: hanging clothes really have 600 mm depth');
    assert.equal(shelves.width,340,'O: shoes and folded garments use shallow shelves');
    const aisle=rail.x-(shelves.x+shelves.width);
    assert.equal(aisle,990,'O: directly measurable 990 mm closet aisle');
    assert.equal(layout.clearances.find(c=>c.id==='dressing-aisle').value,aisle);
    const top=layout.furniture.find(o=>o.id==='o-dressing-upper');
    assert.ok(top.elevation>=2000&&top.collidable===false,'O: seasonal luggage is overhead, not obstructing floor');
    for(const piece of [rail,shelves,top])
      for(const [x,y] of corners(piece))
        assert.ok(insidePolygon(x+(5350-x)*.0001,y+(3750-y)*.0001,d.polygon),'O: dressing section extends outside its room');
    const actualArea=Math.abs(d.polygon.reduce((sum,p,i)=>{
      const q=d.polygon[(i+1)%d.polygon.length];return sum+p[0]*q[1]-p[1]*q[0];
    },0))/2e6;
    assert.ok(Math.abs(actualArea-d.area)<.01,'O: geometry and displayed square metres disagree');
    const obstaclesO=colliders(geometry,layout),threshold=[6150,600];
    assert.ok(canStand(...threshold,geometry,obstaclesO,250));
    for(const target of ['dressing','dressingRail','dressingShelves','dressingBags','adult','alice','aliceDesk','bathroom','storage']){
      const route=findRoute(threshold,layout.routes[target],geometry,obstaclesO,{radius:250});
      assert.ok(route.ok&&route.endpointSnapMm.every(v=>v<=150),`O: entrance to ${target} is blocked`);
    }
  }
  if(layout.id==='W6'){
    const desk=layout.furniture.find(o=>o.id==='alice-desk');
    assert.equal(desk.x,3425);assert.equal(desk.x+desk.width,6400);assert.equal(desk.y+desk.depth,7440);
    assert.equal(desk.underDeskDresser,1000);
    assert.equal(layout.rooms.filter(r=>r.id==='dressing').length,1);
    assert.ok(!layout.furniture.some(o=>['hall-wardrobe','alice-wardrobe'].includes(o.id)));
    assert.equal(layout.doors.find(o=>o.id==='door-adult').mechanism,'pocket-sliding');
  }
  if(['I','J','K'].includes(layout.id)){
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
  if(sofa&&sofa.rotation!==0){const gap=sofa.y+sofa.depth/2-sofa.width/2-(bathSouth.y+bathSouth.depth);
  assert.equal(layout.clearances.find(c=>c.id==='kitchen-entry').value,gap);
  assert.ok(gap>=914,`${layout.id}: kitchen passage narrower than target`);}
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
fs.writeFileSync('variants-qa-results.json',JSON.stringify({scope:'Fourteen interactive options in one architectural shell, including layout L reconstructed from a client reference image; shifted partitions and doors, rotated solids, shell, 500 mm avatar routes, independent room access, swing and appliance leaves. Conceptual, subject to survey.',results},null,2));
console.log('Fourteen interactive layouts validated:',results.map(r=>`${r.id}: ${r.routeCount} routes`).join(', '));
