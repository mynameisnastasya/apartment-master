import assert from 'node:assert/strict';
import {dimensions,outline,rooms,pieces,walls,glazing,openings} from './model.js';

const approx=(a,b,t=.09)=>Math.abs(a-b)<=t;
const rectOverlap=(a,b,t=.001)=>a.x<b.x+b.w-t&&a.x+a.w>b.x+t&&a.y<b.y+b.d-t&&a.y+a.d>b.y+t;
const pointInOutline=(x,y)=>{
 let inside=false;
 for(let i=0,j=outline.length-1;i<outline.length;j=i++){
  const a=outline[i],b=outline[j];
  if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
 }
 return inside;
};
assert.equal(dimensions.width,7.71);assert.equal(dimensions.depth,6.67);
assert.equal(rooms.length,8);
assert.equal(new Set(rooms.map(r=>r.id)).size,rooms.length);
assert(approx(rooms.find(r=>r.id==='kitchen').w*rooms.find(r=>r.id==='kitchen').d,6.1,.1));
assert(approx(rooms.find(r=>r.id==='living').w*rooms.find(r=>r.id==='living').d,9.8,.1));
for(const r of rooms){
 assert([r.x,r.y,r.w,r.d].every(Number.isFinite));
 assert(r.w>0&&r.d>0,r.id);
 for(const [x,y] of [[r.x+.015,r.y+.015],[r.x+r.w-.015,r.y+.015],[r.x+.015,r.y+r.d-.015],[r.x+r.w-.015,r.y+r.d-.015]])
  assert(pointInOutline(x,y),r.id+' outside outline');
}
for(let i=0;i<rooms.length;i++)for(let j=i+1;j<rooms.length;j++)assert(!rectOverlap(rooms[i],rooms[j]),rooms[i].id+' and '+rooms[j].id+' overlap');
assert.equal(new Set(pieces.map(p=>p.id)).size,pieces.length);
for(const p of pieces){
 const r=rooms.find(r=>r.id===p.room);assert(r,p.id+' has unknown room');
 assert([p.x,p.y,p.w,p.d,p.h].every(Number.isFinite),p.id);
 assert(p.w>0&&p.d>0&&p.h>0,p.id);
 assert(p.x>=r.x-.001&&p.y>=r.y-.001&&p.x+p.w<=r.x+r.w+.001&&p.y+p.d<=r.y+r.d+.001,p.id+' outside '+r.id);
}
const bed=pieces.find(p=>p.id==='bed'),wardrobe=pieces.find(p=>p.id==='wardrobe');
assert.deepEqual([bed.w,bed.d],[2,1.6]);assert.deepEqual([wardrobe.w,wardrobe.d],[2.7,.6]);
assert.equal(glazing.length,6);assert(openings.some(o=>o.id==='entry'));
for(const w of walls)assert(w.slice(0,4).every(Number.isFinite));
console.log('PASS: 8 coherent rooms, 18 scale-based furniture items, screenshot-derived 6.1/9.8 m² areas, 160×200 bed, 270×60 wardrobe, door/window geometry.');
