import assert from 'node:assert/strict';
import {variants,seatPose} from './data.js';
let count=0;
for(const v of variants)for(const f of v.furniture.filter(f=>f.type==='chair')){
 const p=seatPose(f,v.furniture);assert(p,`${v.id}/${f.id}: missing purpose`);
 const t=p.target,dx=t.x+t.w/2-f.x-f.w/2,dz=t.y+t.d/2-f.y-f.d/2;
 assert(['desk','table'].includes(t.type));assert(Math.sin(p.yaw)*dx+Math.cos(p.yaw)*dz>0);
 if(p.kind!=='lounge'){assert(Math.abs(dx)<.001);const gap=f.seating.side==='north'?t.y-f.y-f.d:f.y-t.y-t.d;assert(gap>=.06&&gap<=.09);assert(t.h-.48>=.23&&t.h-.48<=.3)}
 else assert(Math.hypot(dx,dz)<1,`${v.id}/${f.id}: side table too far away`);
 count++;
}
console.log('PASS: '+count+' seats paired with their tables, facing checked, table distance and height verified.');
