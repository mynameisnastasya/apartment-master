import fs from 'node:fs';
import assert from 'node:assert/strict';
import {colliders,canStand,findRoute} from '../src/interaction/collision.js';
import {openingLeaf,operatorPoint} from '../src/interaction/appliances.js';

const g=JSON.parse(fs.readFileSync('src/data/geometry.json'));
const d=JSON.parse(fs.readFileSync('src/data/layout-reference.json'));
const c=Object.fromEntries(d.clearances.map(x=>[x.id,x.value]));
const checks=[];
const min=(id,value,limit)=>{assert.ok(value>=limit,`${id}: ${value} < ${limit}`);checks.push({id,value,min:limit,ok:true});};

min('entry-aisle',c['entry-aisle'],914);
min('kitchen-entry',c['kitchen-entry'],914);
// These are rough openings. Door frames reduce the finished clear width.
for(const id of ['adult-door-clear','child-door-clear','bath-door-clear'])
  min(id,c[id],850);
min('bath-toilet-front',c['bath-toilet-front'],762);
min('bath-basin-front',c['bath-basin-front'],762);
min('wc-side',c['wc-side'],457);
min('adult-window',c['adult-window'],600);
min('dining-chair-back',c['dining-chair-back'],762);

const sofa=d.furniture.find(x=>x.id==='sofa');
const bathSouth=d.partitions.find(x=>x.id==='d-bath-south-left');
const sofaNorth=sofa.y+sofa.depth/2-sofa.width/2; // 270° rotation
assert.equal(sofa.rotation,270);
assert.equal(c['kitchen-entry'],sofaNorth-(bathSouth.y+bathSouth.depth));
checks.push({id:'kitchen-entry-derived-from-geometry',value:c['kitchen-entry'],ok:true});

const fixture=id=>d.furniture.find(x=>x.id===id);
const basin=fixture('basin'),wc=fixture('wc'),tub=fixture('bath-tub');
assert.equal(basin.front,'south');assert.equal(wc.front,'east');
assert.equal(c['bath-basin-front'],wc.y-(basin.y+basin.depth));
assert.equal(c['bath-toilet-front'],tub.x-(wc.x+wc.width));
assert.equal(c['wc-side'],1920-(wc.y+wc.depth/2));
checks.push({id:'bath-fixture-clearances-derived',value:{basin:c['bath-basin-front'],toilet:c['bath-toilet-front'],side:c['wc-side']},ok:true});

const bathDoor=d.doors.find(x=>x.id==='door-bath');
assert.equal(bathDoor.mechanism,'pocket-sliding');
checks.push({id:'bath-door-mechanism',value:bathDoor.mechanism,ok:true});

const obstacles=colliders(g,d);
for(const [a,b] of d.routePairs){
  const r=findRoute(d.routes[a],d.routes[b],g,obstacles,{radius:250});
  assert.ok(r.ok,`route ${a} → ${b}: ${r.reason||'blocked'}`);
}
checks.push({id:'all-reference-routes',value:d.routePairs.length,ok:true});
for(const id of ['bathBasin','bathToilet','bathWasher','bathTub']){
 const r=findRoute(d.routes.entry,d.routes[id],g,obstacles,{radius:250});
 assert.ok(r.ok&&r.endpointSnapMm.every(mm=>mm<=150),`bath access ${id} blocked or snapped too far`);
 checks.push({id:'bath-access-'+id,value:r.lengthMm,ok:true});
}

const appliances=[];
for(const o of d.furniture){
  const leaf=openingLeaf(o);
  if(!leaf) continue;
  const obs=[...obstacles,leaf];
  const p=operatorPoint(o);
  const standing=canStand(...p,g,obs);
  const route=findRoute(d.routes.entry,p,g,obs,{radius:250});
  appliances.push({id:o.id,operatorPoint:p,standing,reachable:route.ok});
  assert.ok(standing,`${o.id}: operator point blocked with appliance open`);
  assert.ok(route.ok,`${o.id}: operator point unreachable with appliance open`);
}

const result={layout:d.id,scope:'Ergonomic design checks for the reference layout; recommendations, not local-code certification.',checks,appliances};
fs.writeFileSync('ergonomic-qa-results.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
