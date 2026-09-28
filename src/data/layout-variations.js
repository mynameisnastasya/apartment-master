import reference from './layout-reference.json' with {type:'json'};

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

const options=[
 {id:'E',name:'Просторная общая зона',subtitle:'Гостиная больше, комнаты компактнее',
  pros:['Границы обеих комнат сдвинуты к окнам: в общей зоне появляется больше места для дивана 1650 мм и встреч.','Раздвижная дверь спальни освобождает место у прикроватной тумбы.'],
  cons:['Площади обеих комнат меньше базовой версии; неглубокий шкаф 450 мм требует торцевого хранения одежды.','Кассету двери и крупный диван нужно проверить после обмера стены и входа.'],
  replan:{adultY:4850,childY:3800},furniture:{'adult-wardrobe':{y:4980,depth:450,label:'Неглубокий шкаф спальни 1800 × 450'},'alice-wardrobe':{y:4000},sofa:{y:3600,width:1650}},routes:{sofa:[2700,3750]}},
 {id:'F',name:'Большая спальня',subtitle:'Плюс площадь взрослой комнате',
  pros:['Перегородка спальни отодвинута к гостиной на 340 мм: больше свободного пола у входа и шкафа.','Кухня, ванная и вторая комната сохраняют прежние места.'],
  cons:['Ради увеличения спальни диван становится компактнее — 1200 мм.','Место дополнительного рабочего стола подтвердить после проверки окон и отопления.'],
  replan:{adultY:4300},furniture:{'adult-wardrobe':{y:4500},sofa:{y:3200,width:1200}},routes:{sofa:[2670,3380]}},
 {id:'G',name:'Свободная вторая комната',subtitle:'Новый вход и ниша хранения у перегородки',
  pros:['Северная перегородка второй комнаты сдвинута к входу; диагональ перестроена и появилась ниша под книжный шкаф.','Перемычка в разделяющей спальни стене даёт второй комнате больше места, сохраняя существующий пилон у окна.'],
  cons:['Спальня немного уже на участке у входа; мебель требует индивидуальной привязки.','Перестройку диагонали и примыкание к пилону проверить на обмере и с конструктором.'],
  replan:{childY:3300,dividerX:3025,jogY:6250},furniture:{'adult-bed':{x:1100},'adult-nightstand':{x:2550},'alice-wardrobe':{y:3550},'alice-bed':{y:4300}},add:[{id:'child-shelf',type:'shelf',room:'alice',x:3360,y:6100,width:280,depth:500,height:1500,front:'east',rotation:0,visible:true,label:'Неглубокий книжный шкаф 280 × 500'}],routes:{adultBed:[650,6200],childShelf:[3900,6300],aliceBed:[3875,5250]},routePairs:[['entry','childShelf']]},
 {id:'H',name:'Ванная с запасом',subtitle:'Ванная просторнее, прихожая компактнее',
  pros:['Ванная расширена в сторону прихожей и гостиной: перед раковиной и унитазом больше свободного места.','Дверь ванной остаётся кассетной, а доступ к каждому прибору — отдельным.'],
  cons:['В прихожей шкаф становится неглубоким, для верхней одежды потребуется продумать хранение в комнатах.','Ванна сдвигается на 140 мм; инженерные подключения и законность мокрой зоны проверить после обмера.','Диван в гостиной уменьшен до 1200 мм.'],
  replan:{bathY:2250,bathEast:4860},furniture:{'bath-tub':{x:4110},wc:{y:1300},'hall-wardrobe':{x:5920,width:480,label:'Неглубокий шкаф прихожей 480 × 2000'},mirror:{x:5000},sofa:{y:3490,width:1200},media:{y:3400},tv:{y:3450}},routes:{bathroom:[3500,1750],bathToilet:[3440,1550],bathTub:[3770,1550],sofa:[2700,3600]}}
];
export const layouts=[reference,...options.map(option=>{
 const layout=structuredClone(reference);layout.id=option.id;layout.name=option.name;layout.subtitle=option.subtitle;layout.recommended=false;layout.pros=option.pros;layout.cons=option.cons;
 replanRooms(layout,option.replan);
 if(option.id==='E'){
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
