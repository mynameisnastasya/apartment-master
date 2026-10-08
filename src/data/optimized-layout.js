// N / Architecture-first optimization of the second client sketch.
// Changes *only* the provisional project partitions in M. The structural
// perimeter, east entrance, window openings, and the 250 mm pier next to the
// south windows are inherited unchanged from geometry.json.
// Wet-core fixtures remain exactly as in M; do not imply engineering approval.
import {createSecondSketchLayout} from './second-sketch-layout.js';

const get=(a,id)=>{const item=a.find(o=>o.id===id);if(!item)throw Error('N missing '+id);return item;};
const put=(a,id,changes)=>Object.assign(get(a,id),changes);
const area=polygon=>Math.round(Math.abs(polygon.reduce((total,[x,y],i)=>{
 const [nx,ny]=polygon[(i+1)%polygon.length];return total+x*ny-y*nx;
},0))/20000)/100;

export function createOptimizedLayout(base){
 const l=createSecondSketchLayout(base);
 Object.assign(l,{
  id:'N',
  name:'Архитектурный баланс',
  subtitle:'Две спальни · единая гостиная · расширенный холл · хранение без загромождения',
  revision:'2026-10-08 · архитектурная оптимизация · концепция',
  recommended:false,
  referenceDerived:false,
  optimizationStudy:true,
  structuralPolicy:'Фасад, проём входа, оба окна и пилон у окон сохранены; проектные перегородки требуют конструктивного подтверждения.',
  pros:[
   'Сдвинута только проектная стена взрослой спальни на 200 мм — гостиная получила больше свободы для дивана и маршрута.',
   'Проход вдоль гардеробной расширен с 925 до 1125 мм, а между ванной и гардеробной оставлен 930 мм.',
   'Гардеробная компактнее, но расстановка двух секций обеспечивает 920 мм между фасадами.',
   'Кровать взрослых имеет 855 мм до шкафа и 925 мм до оконной стены, вторая спальня — отдельный вход и стол у окна.',
   'Входная дверь не перекрыта крупным шкафом; мокрые зоны, оба окна и несущеподобный пилон оставлены на месте.'
  ],
  cons:[
   'Концепция намеренно уступает часть гардеробной (2,51 м²) проходу; хранение нужно уточнить по вещам семьи.',
   'Несущие элементы, инженерные шахты и фактическая толщина стен не установлены по фотографии; перемещение каждой перегородки согласовать после обмера.',
   'В кухне-гостиной нет собственного фасадного окна: дополнительный дневной свет и вентиляцию нельзя обещать без инженерного и светотехнического расчёта.'
  ]
 });
 // Move just the PROPOSED adult north wall towards the south by 200 mm;
 // the structural pier starts at y=6850 and stays exactly where it was.
 put(l.partitions,'d-adult-north',{y:3980});
 put(l.partitions,'d-adult-door-lintel',{y:3980});
 put(l.partitions,'d-adult-divider',{y:3980,depth:2870});
 put(l.doors,'door-adult',{y:3980,openY:4100,hinge:[3175,4100]});
 const adult=get(l.rooms,'adult');
 adult.polygon=[[0,4100],[3175,4100],[3175,8300],[0,8300]];
 Object.assign(adult,{area:area(adult.polygon),x:1590,y:6100});
 delete adult.referenceArea;
 put(l.furniture,'adult-wardrobe',{y:4120});
 put(l.furniture,'adult-bed',{y:5350});

 // Move the dressing wall 200 mm to the east, gifting that dimension to
 // the entrance corridor of the SECOND bedroom instead of a narrow closet.
 put(l.partitions,'l-dressing-west',{x:4420});
 put(l.partitions,'l-dressing-north-right',{x:5390,width:1010});
 put(l.partitions,'l-dressing-door-lintel',{x:4540});
 put(l.partitions,'l-dressing-south',{x:4540,width:1860});
 put(l.doors,'door-dressing',{x:4540,openX:5390});
 // Independent 850 mm bedroom door, joined seamlessly to the dressing wall.
 put(l.partitions,'d-child-diagonal',{x:3295,width:255});
 put(l.partitions,'d-child-door-lintel',{x:3550,width:850});
 put(l.partitions,'d-child-north-right',{x:4400,width:140});
 put(l.doors,'door-child',{x:3550,openX:4360,hinge:[4400,4450]});
 const dressing=get(l.rooms,'dressing');
 dressing.polygon=[[4540,2980],[6400,2980],[6400,4330],[4540,4330]];
 Object.assign(dressing,{area:area(dressing.polygon),x:5470,y:3560});
 delete dressing.referenceArea;
 const child=get(l.rooms,'alice');
 delete child.referenceArea;
 // Narrow shelves give a full 920 mm between cupboard and hanging fronts.
 put(l.furniture,'l-dressing-shelves',{x:4560,y:3540,width:320,depth:400,height:1800,front:'east',label:'Узкие полки · 320 × 400 · проход 920 мм'});
 put(l.furniture,'sofa',{x:160,y:3050,width:2100,depth:760,label:'Компактный диван 2100 × 760 · свободная ось движения'});
 Object.assign(l.routes,{
  adult:[2820,4470],
  adultWardrobe:[2600,4700],
  adultBed:[525,6350],
  alice:[3910,4570],
  dressing:[5140,3240],
  dressingRail:[5450,3370],
  dressingShelves:[5330,3770],
  sofa:[2780,3440]
 });
 l.clearances=l.clearances.map(c=>({
  ...c,
  ...(c.id==='adult-door-clear'?{y:4040}:{}),
  ...(c.id==='child-door-clear'?{x:3975}:{}),
  ...(c.id==='dressing-door'?{x:4965}:{}),
  ...(c.id==='adult-wardrobe-aisle'?{value:855,length:855,y:5097.5}:{}),
  ...(c.id==='adult-window'?{value:925,length:925,y:7837.5}:{}),
  ...(c.id==='dressing-aisle'?{value:920,length:920,x:5340,y:3730,status:'good',label:'Рабочий проход между секциями хранения'}:{})
 }));
 l.walkViews={
  ...l.walkViews,
  living:{walk:l.routes.sofa,look:[1100,1100]},
  adult:{walk:l.routes.adult,look:[2200,6300]},
  alice:{walk:l.routes.alice,look:[5380,5600]},
  dressing:{walk:l.routes.dressing,look:[6020,3550]}
 };
 // Plan-derived living room size is NOT a measured area: do not inherit
 // numeric labels from the FIRST supplied photo.
 const living=get(l.rooms,'living');
 living.area=null;delete living.referenceArea;living.areaBasis='unmeasured';
 return l;
}
