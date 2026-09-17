// Schematic opening envelopes, separate from product-specific hinges.
function frontEnvelope(o,reach,height,elevation=0){
 const f=o.front||'south';
 if(f==='north')return{id:o.id+'-open',x:o.x,y:o.y-reach,width:o.width,depth:reach,height,elevation,kind:'appliance-door'};
 if(f==='east')return{id:o.id+'-open',x:o.x+o.width,y:o.y,width:reach,depth:o.depth,height,elevation,kind:'appliance-door'};
 if(f==='west')return{id:o.id+'-open',x:o.x-reach,y:o.y,width:reach,depth:o.depth,height,elevation,kind:'appliance-door'};
 return{id:o.id+'-open',x:o.x,y:o.y+o.depth,width:o.width,depth:reach,height,elevation,kind:'appliance-door'};
}
export function openingLeaf(o){
 if(o.type==='fridge')return frontEnvelope(o,650,2000,50);
 if(o.type==='dishwasher')return frontEnvelope(o,650,30,140);
 if(o.type==='hob'&&o.oven!==false)return frontEnvelope(o,650,30,400);
 if(o.type==='washer')return frontEnvelope(o,480,440,220);
 return null;
}
export function operatorPoint(o){
 const reach=o.type==='washer'?480:650,offset=reach+(o.type==='fridge'?375:325),f=o.front||'south';
 if(f==='north')return[o.x+o.width/2,o.y-offset];
 if(f==='east')return[o.x+o.width+offset,o.y+o.depth/2];
 if(f==='west')return[o.x-offset,o.y+o.depth/2];
 return[o.x+o.width/2,o.y+o.depth+offset];
}
