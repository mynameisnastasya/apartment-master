import reference from './layout-reference.json' with {type:'json'};
import {dressingLayout} from './dressing-layout.js';

const move=(layout,id,changes)=>Object.assign(layout.furniture.find(o=>o.id===id),changes);
const wall=(layout,id,changes)=>Object.assign(layout.partitions.find(o=>o.id===id),changes);
const door=(layout,id,changes)=>Object.assign(layout.doors.find(o=>o.id===id),changes);
const clearance=(layout,id,changes)=>Object.assign(layout.clearances.find(o=>o.id===id),changes);
const area=polygon=>Math.abs(polygon.reduce((sum,a,i)=>{const b=polygon[(i+1)%polygon.length];return sum+a[0]*b[1]-a[1]*b[0]},0))/2e6;

function replanRooms(layout,{adultY=4640,childY=3520,dividerX=3175,jogY=null,bathY=1920,bathEast=4720}={}){
 const adultDoorX=dividerX-850,childDoorX=4060,bathDoorX=3090;
 wall(layout,'d-adult-north',{y:adultY,width:adultDoorX});
 wall(layout,'d-adult-divider',{x:dividerX,y:adultY,depth:(jogY||6850)-adultY});
 if(jogY){layout.partitions.push({id:'divider-jog',type:'wall',room:'architecture',x:dividerX,y:jogY,width:3175-dividerX+120,depth:120,height:2700,rotation:0,visible:true,proposed:true});layout.partitions.push({id:'divider-lower',type:'wall',room:'architecture',x:3175,y:jogY+120,width:120,depth:6850-jogY-120,height:2700,rotation:0,visible:true,proposed:true});}
 wall(layout,'d-adult-door-lintel',{x:adultDoorX,y:adultY});
 door(layout,'door-adult',{x:adultDoorX,y:adultY,openX:dividerX-40,openY:adultY+120,hinge:[dividerX,adultY+120]});
 wall(layout,'d-child-north-right',{y:childY});wall(layout,'d-child-door-lintel',{x:childDoorX,y:childY});
 door(layout,'door-child',{y:childY,openY:childY+40});
 const start=[dividerX+60,adultY],end=[childDoorX,childY+60],length=Math.hypot(end[0]-start[0],end[1]-start[1]);
 wall(layout,'d-child-diagonal',{x:(start[0]+end[0]-length)/2,y:(start[1]+end[1]-120)/2,width:length,rotation:Math.atan2(end[1]-start[1],end[0]-start[0])*180/Math.PI});
 wall(layout,'d-bath-east',{x:bathEast,depth:bathY});wall(layout,'d-bath-west',{depth:bathY});
 wall(layout,'d-bath-south-left',{y:bathY});wall(layout,'d-bath-south-right',{x:3940,y:bathY,width:bathEast+120-3940});
 wall(layout,'d-bath-door-lintel',{y:bathY});door(layout,'door-bath',{y:bathY,openY:bathY+40});
 const adult=layout.rooms.find(r=>r.id==='adult');
 adult.polygon=jogY?[[0,adultY+120],[dividerX,adultY+120],[dividerX,jogY],[3175,jogY],[3175,8300],[0,8300]]:[[0,adultY+120],[3175,adultY+120],[3175,8300],[0,8300]];
 adult.area=+area(adult.polygon).toFixed(2);adult.y=adultY+950;
 const child=layout.rooms.find(r=>r.id==='alice');
 child.polygon=[[dividerX+120,adultY+20],[childDoorX+30,childY+120],[6400,childY+120],[6400,7440],[3425,7440],[3425,6850],[3295,6850],...(jogY?[[3295,jogY+120],[dividerX+120,jogY+120]]:[])];
 child.area=+area(child.polygon).toFixed(2);child.y=childY+2800;
 const bath=layout.rooms.find(r=>r.id==='bath');bath.polygon=[[2440,0],[bathEast,0],[bathEast,bathY],[2440,bathY]];bath.area=+area(bath.polygon).toFixed(2);bath.x=(2440+bathEast)/2;bath.y=Math.min(1650,bathY-250);
 layout.routes.adult=[Math.min(2750,dividerX-350),adultY+560];layout.routes.alice=[4450,childY+530];layout.routes.bathroom=[3500,Math.min(1450,bathY-400)];
}
function updateClearances(layout){
 const sofa=layout.furniture.find(o=>o.id==='sofa'),bathY=layout.partitions.find(o=>o.id==='d-bath-south-left').y;
 const gap=sofa.y+sofa.depth/2-sofa.width/2-(bathY+120);
 clearance(layout,'kitchen-entry',{value:gap,length:gap,y:bathY+120+gap/2,status:gap>=914?'good':'compact'});
 const bed=layout.furniture.find(o=>o.id==='adult-bed'),left=bed.x+(bed.width-bed.depth)/2,windowGap=8300-(bed.y+bed.depth/2+bed.width/2);
 clearance(layout,'adult-foot',{value:left,length:left,x:left/2});clearance(layout,'adult-window',{value:windowGap,length:windowGap,y:8300-windowGap/2});
 const chairs=layout.furniture.filter(o=>o.type==='chair'&&o.room==='kitchen'),chairGap=2320-Math.max(...chairs.map(o=>o.x+o.width));
 clearance(layout,'dining-chair-back',{value:chairGap,length:chairGap,status:chairGap>=762?'good':'compact'});
 const wardrobe=layout.furniture.find(o=>o.id==='hall-wardrobe'),bathEast=layout.partitions.find(o=>o.id==='d-bath-east').x;
 const entryGap=wardrobe.x-(bathEast+120);
 clearance(layout,'entry-aisle',{value:entryGap,length:entryGap,x:bathEast+120+entryGap/2});
 const wc=layout.furniture.find(o=>o.id==='wc'),tub=layout.furniture.find(o=>o.id==='bath-tub'),basin=layout.furniture.find(o=>o.id==='basin');
 const wcFront=tub.x-(wc.x+wc.width),basinFront=wc.y-(basin.y+basin.depth),wcSide=bathY-(wc.y+wc.depth/2);
 clearance(layout,'bath-toilet-front',{value:wcFront,length:wcFront,x:wc.x+wc.width+wcFront/2});
 clearance(layout,'bath-basin-front',{value:basinFront,length:basinFront,y:basin.y+basin.depth+basinFront/2});
 clearance(layout,'wc-side',{value:wcSide,length:wcSide,y:wc.y+wc.depth/2+wcSide/2});
}

// Four spatial strategies around a deliberately compact living area.
// D retains its partition geometry; these are distinct alternatives for comparison.
const options=[
 {id:'E',name:'Спальня-люкс',subtitle:'Больше места взрослой спальне и туалетному столику',
  pros:['Северная стена спальни сдвинута на 340 мм к центру: у кровати и столика больше воздуха.','Гостиная остаётся компактной; два независимых входа и дневной свет у обеих комнат.'],
  cons:['Общая зона становится камерной: диван на два места.','Перенос перегородки и дверь проверить после точного обмера.'],
  replan:{adultY:4300,childY:3600},furniture:{'adult-wardrobe':{y:4420},'alice-wardrobe':{y:3720},sofa:{y:3200,width:1200}},routes:{sofa:[2670,3310]}},
 {id:'F',name:'Детская для игры',subtitle:'Большая детская, кровать и свободная игровая зона',
  pros:['Детская начинается на 500 мм раньше: появляется место для игры, чтения и хранения игрушек.','Спальня взрослых сохраняет кровать 1600 × 2000, шкаф и туалетный столик.'],
  cons:['Взрослая спальня компактнее — мебель важно заказать в точных габаритах.','Общая зона рассчитана на редких гостей и диван на два места.'],
  replan:{adultY:4700,childY:3020},furniture:{'adult-wardrobe':{y:4820},'alice-wardrobe':{y:3140},'hall-wardrobe':{depth:1600,label:'Прихожая · шкаф 1600 × 600'},sofa:{y:3330,width:1200}},routes:{sofa:[2670,3460],alice:[4500,3560]}},
 {id:'G',name:'Две приватные зоны',subtitle:'Ступенчатая перегородка и ниша детской',
  pros:['Перегородка смещена на 335 мм в пользу детской и ступенью обходит капитальный выступ.','Шкафы стоят по стенам; игровая ниша отделена от зоны сна без нового коридора.'],
  cons:['Кровать взрослых сдвинута к западной стене; подходы нуждаются в контрольном обмере.','Ступень перегородки требует аккуратного мебельного узла.'],
  replan:{adultY:4500,childY:3440,dividerX:2840,jogY:6220},furniture:{'adult-bed':{x:850},'adult-nightstand':{x:2390},'adult-nightstand-2':{x:2725},'adult-wardrobe':{y:4620},'alice-wardrobe':{y:3560},sofa:{y:3370,width:1250}},routes:{adultBed:[350,6450],sofa:[2670,3450]}},
 {id:'H',name:'Ванная и хранение',subtitle:'Больше санузел, спокойная общая зона',
  pros:['Санузел расширен на 230 мм к общей зоне и на 140 мм к прихожей, без перегородки перед раковиной.','Прихожая получает компактный встроенный шкаф; спальни остаются близкими к D.'],
  cons:['Шкаф прихожей уменьшается по глубине; верхнюю одежду надо примерить к выбранной системе.','Границы мокрой зоны и подключение ванны — только после инженерной проверки.'],
  replan:{bathY:2150,bathEast:4860},furniture:{'bath-tub':{x:4110},wc:{y:1260},'hall-wardrobe':{x:5900,width:500,label:'Встроенный шкаф 2000 × 500'},mirror:{x:5010},sofa:{y:3560,width:1200},media:{y:3400},tv:{y:3450}},routes:{bathroom:[3500,1720],bathToilet:[3460,1580],bathTub:[3800,1580],sofa:[2690,3650]}}
];
const base=structuredClone(reference);
// D geometry stays put; fitting the millwork to its walls makes the scheme buildable.
move(base,'adult-wardrobe',{x:0,y:4760});
move(base,'alice-wardrobe',{x:5010,y:3640});
move(base,'adult-dresser',{type:'vanity',x:0,y:6810,width:420,depth:900,height:760,front:'east',label:'Встроенная консоль / туалетный столик'});
base.furniture.push({id:'alice-toys',type:'toy-storage',room:'alice',x:6080,y:6320,width:320,depth:740,height:780,rotation:0,visible:true,front:'west',label:'Встроенный открытый стеллаж · книги и объекты'});
export const layouts=[base,...options.map(option=>{
 const layout=structuredClone(base);layout.id=option.id;layout.name=option.name;layout.subtitle=option.subtitle;layout.recommended=false;layout.pros=option.pros;layout.cons=option.cons;
 replanRooms(layout,option.replan);
 if(['E','F'].includes(option.id)){
  const sliding=layout.doors.find(d=>d.id==='door-adult');
  delete sliding.hinge;delete sliding.arcStart;delete sliding.arcEnd;delete sliding.swing;
  Object.assign(sliding,{mechanism:'pocket-sliding',openX:sliding.x-850,openY:sliding.y+40,openWidth:850,openDepth:35});
 }
 for(const [id,changes] of Object.entries(option.furniture))move(layout,id,changes);
 if(option.add)layout.furniture.push(...option.add);
 Object.assign(layout.routes,option.routes);
 if(option.routePairs)layout.routePairs.push(...option.routePairs);
 updateClearances(layout);
 return layout;
})];
layouts.push(dressingLayout(base));
