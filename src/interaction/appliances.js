// Schematic opening envelopes, separate from product-specific hinges.
export function openingLeaf(o){
 if(o.type==='fridge')return{id:o.id+'-open',x:o.x,y:o.y+o.depth,width:30,depth:650,height:2000,elevation:50,kind:'appliance-door'};
 if(o.type==='dishwasher'||(o.type==='hob'&&o.oven!==false))return{id:o.id+'-open',x:o.x,y:o.y+o.depth,width:o.width,depth:650,height:30,elevation:o.type==='hob'?400:140,kind:'appliance-door'};
 if(o.type==='washer')return{id:o.id+'-open',x:o.x-480,y:o.y+o.depth-45,width:480,depth:35,height:440,elevation:220,kind:'appliance-door'};
 return null;
}
export function operatorPoint(o){if(o.type==='washer')return[o.x-375,o.y+225];if(o.type==='fridge')return[o.x+375,o.y+o.depth+375];return[o.x+o.width/2,o.y+o.depth+975];}
