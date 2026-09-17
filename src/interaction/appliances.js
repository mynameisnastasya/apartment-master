// Schematic open leaves in the actual facade direction; dimensions are not hinge specifications.
export function openingLeaf(o){
 if(!['fridge','dishwasher','hob','washer'].includes(o.type)||(o.type==='hob'&&o.oven===false))return null;
 const f=o.front||(o.type==='washer'?'west':'south'),eastWest=['east','west'].includes(f);
 const reach=o.type==='washer'?480:650,span=['fridge','washer'].includes(o.type)?35:eastWest?o.depth:o.width;
 const leaf={id:o.id+'-open',x:o.x,y:o.y,width:eastWest?reach:span,depth:eastWest?span:reach,height:o.type==='fridge'?2000:o.type==='washer'?440:30,elevation:o.type==='fridge'?50:o.type==='washer'?220:o.type==='hob'?400:140,kind:'appliance-door'};
 if(f==='east')leaf.x+=o.width;if(f==='west')leaf.x-=reach;if(f==='south')leaf.y+=o.depth;if(f==='north')leaf.y-=reach;
 if(o.type==='washer'&&eastWest)leaf.y=o.y+o.depth-45;
 return leaf;
}
export function operatorPoint(o){if(o.type==='washer'&&(o.front||'west')==='west')return[o.x-375,o.y+225];const f=o.front||(o.type==='washer'?'west':'south'),reach=['dishwasher','hob'].includes(o.type)?975:375;return f==='east'?[o.x+o.width+reach,o.y+o.depth/2]:f==='west'?[o.x-reach,o.y+o.depth/2]:f==='north'?[o.x+o.width/2,o.y-reach]:[o.x+o.width/2,o.y+o.depth+reach];}
