import assert from 'node:assert/strict';
import * as THREE from 'three';
import geometry from '../src/data/geometry.json' with {type:'json'};
import {layouts} from '../src/data/layout-variations.js';
import {createStudio} from '../src/scene/studio.js';

// Build the exact room scenes in Node: tests source-level geometry, not fragile
// screen pixels. Browser smoke tests still exercise WebGL and lighting.
const dummy=new THREE.MeshStandardMaterial({color:0xd9d5cd});
const materials=new Proxy({wall:new THREE.MeshStandardMaterial({color:0xe5ddd0})},{
 get(target,key){return key in target?target[key]:dummy;}
});
materials.wall.userData.warmModern=true;
materials.wall.userData.organic=false;
const layout=id=>{const v=layouts.find(l=>l.id===id);assert.ok(v,id+' not present');return v;};
const L=layout('L');
const dressing=createStudio(geometry,L,materials,'dressing',{interior:true});
const names=['studio-dressing-west','studio-dressing-east','studio-dressing-south','studio-dressing-north','studio-dressing-door-lintel'];
for(const name of names)assert.ok(dressing.getObjectByName(name),'L dressing missing '+name);
const north=L.partitions.find(w=>w.id==='l-dressing-north-right'),wall=dressing.getObjectByName('studio-dressing-north');
assert.ok(Math.abs(wall.position.z-(north.y+north.depth/2)/1000)<1e-5,'L dressing rendered with stale north-wall position');
const east=dressing.getObjectByName('studio-dressing-east');
assert.ok(Math.abs(east.geometry.parameters.depth-1.35)<1e-5,'L dressing rendered with stale depth');
const adult=createStudio(geometry,L,materials,'adult',{interior:true});
const child=createStudio(geometry,L,materials,'alice',{interior:true});
for(const room of [adult,child]){
 assert.ok(room.getObjectByName('studio-window-glass'),'L bedroom lost actual window');
 const rug=room.getObjectByName('room-rug'),bounds=new THREE.Box3().setFromObject(rug);
 const poly=L.rooms.find(r=>r.id===(room===adult?'adult':'alice')).polygon;
 assert.ok(bounds.min.x>=Math.min(...poly.map(p=>p[0]))/1000-1e-5,'L rug extends west of room');
 assert.ok(bounds.max.x<=Math.max(...poly.map(p=>p[0]))/1000+1e-5,'L rug extends east of room');
 assert.ok(bounds.max.z<=Math.max(...poly.map(p=>p[1]))/1000+1e-5,'L rug extends south of room');
}
materials.wall.userData.warmModern=false;
const family=createStudio(geometry,layout('W6'),materials,'alice',{interior:true});
for(const key of ['alice-window-glass','alice-dresser-drawer'])assert.ok(family.getObjectByName(key),'W6 studio lost '+key);
assert.ok(!family.getObjectByName('desk-wall'),'W6 studio should not block long desk');
console.log('Studio geometry QA: W6 window + drawers, L dressing walls and bedroom rugs (passed)');
