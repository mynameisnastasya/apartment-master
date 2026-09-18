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
min('adult-door-clear',c['adult-door-clear'],813);
min('child-door-clear',c['child-door-clear'],813);
min('bath-door-clear',c['bath-door-clear'],813);
min('bath-toilet-front',c['bath-toilet-front'],762);
min('bath-basin-front',c['bath-basin-front'],762);
min('wc-side',c['wc-side'],457);
min('adult-window',c['adult-window'],600);
min('dining-chair-back',c['dining-chair-back'],762);

const bathDoor=d.doors.find(x=>x.id==='door-bath');
assert.equal(bathDoor.mechanism,'pocket-sliding');
checks.push({id:'bath-door-mechanism',value:bathDoor.mechanism,ok:true});

const obstacles=colliders(g,d);
for(const [a,b] of d.routePairs){
  const r=findRoute(d.routes[a],d.routes[b],g,obstacles,{radius:250});
  assert.ok(r.ok,`route ${a} → ${b}: ${r.reason||'blocked'}`);
}
checks.push({id:'all-reference-routes',value:d.routePairs.length,ok:true});

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
