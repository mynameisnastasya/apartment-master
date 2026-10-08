// O / Wardrobe-first, design-led alternative to N.
// The perimeter, both window apertures, the entrance and the 250-mm
// window-side pier are inherited unchanged from geometry.json.
// Bathroom, kitchen and service equipment are likewise NOT moved.
// All moved walls in O are PROJECT ASSUMPTIONS, never certified non-bearing.
import {createOptimizedLayout} from './optimized-layout.js';

const requireId=(arr,id)=>{const x=arr.find(item=>item.id===id);if(!x)throw Error('O missing '+id);return x;};
const edit=(arr,id,patch)=>Object.assign(requireId(arr,id),patch);
const polygonArea=p=>Math.round(Math.abs(p.reduce((sum,a,i)=>{
 const b=p[(i+1)%p.length];return sum+a[0]*b[1]-a[1]*b[0];
},0))/20000)/100;

export function createWardrobeFirstLayout(base){
 const l=createOptimizedLayout(base);
 Object.assign(l,{
  id:'O',
  name:'Гардеробная Boutique',
  subtitle:'Полноценная гардеробная · две спальни · свободный холл · Soft Modern',
  recommended:false,
  referenceDerived:false,
  optimizationStudy:true,
  wardrobeFirst:true,
  revision:'2026-10-08 · гардеробная Boutique · концепция, нужен обмер',
  structuralPolicy:'Вход, оба окна, наружный контур и оконный пилон сохранены; любые проектные перегородки менять только после проверки конструкции.',
  pros:[
   'Гардеробная увеличена с 2,51 до 2,91 м² в условной оболочке, а перед фасадами оставлен реальный проход 990 мм.',
   'Полноразмерные плечики глубиной 600 мм расположены вдоль восточной стены; напротив — полки глубиной 340 мм и хранение чемоданов наверху.',
   'Подход ко второй спальне 1035 мм, между ванной и гардеробной 930 мм; вход квартиры свободен.',
   'Две изолированные спальни сохраняют свои окна, стол возле окна и приватные входы.',
   'Тёплый Soft Modern, подсветка одежды и зеркало в гардеробной — вместо дополнительной массивной мебели в коридоре.'
  ],
  cons:[
   'Гардеробная увеличена за счёт 140 мм глубины второй спальни: она уменьшается приблизительно с 9,21 до 8,93 м² в условной модели.',
   '990 мм — хороший проход для одного человека, но гардеробная не предназначена для одновременного переодевания двух человек.',
   'Полки для обуви и сумок неглубокие; остров и второй полноценный ряд плечиков сюда не помещаются.',
   'Несущие стены и стояки нельзя надёжно определить с фотографии; эскиз нельзя использовать для ремонта без обмерного и конструктивного проекта.'
  ]
 });

 // Push ONE proposed dressing-room wall 90 mm west and the south wall
 // 140 mm south. This borrows 0.40 m² from the corridor / second bedroom
 // while retaining generous and directly measurable clearances.
 edit(l.partitions,'l-dressing-west',{x:4330,y:2980,width:120,depth:1490});
 edit(l.partitions,'l-dressing-north-right',{x:5300,width:1100});
 edit(l.partitions,'l-dressing-door-lintel',{x:4450,width:850});
 edit(l.partitions,'l-dressing-south',{x:4450,y:4470,width:1950,depth:120});
 edit(l.doors,'door-dressing',{x:4450,y:2860,width:850,openX:5300,openY:2900});

 // Shift child's project doorway away from the extended west wall;
 // the door stays a real 850-mm inward hinge, not a fake pocket with no
 // 850-mm wall pocket. Hinged leaf parks along the WEST side of the doorway.
 edit(l.partitions,'d-child-diagonal',{x:3295,width:165});
 edit(l.partitions,'d-child-door-lintel',{x:3460,width:850});
 edit(l.partitions,'d-child-north-right',{x:4310,width:140});
 edit(l.doors,'door-child',{
  x:3460,width:850,openX:4270,openY:4450,openWidth:40,openDepth:850,
  hinge:[4310,4450],mechanism:'hinged',swing:'inward'
 });

 const dress=requireId(l.rooms,'dressing');
 dress.polygon=[[4450,2980],[6400,2980],[6400,4470],[4450,4470]];
 Object.assign(dress,{area:polygonArea(dress.polygon),x:5400,y:3710});
 delete dress.referenceArea;
 const child=requireId(l.rooms,'alice');
 // This L-shaped outline removes the new dressing alcove from child's area.
 child.polygon=[[3295,4450],[4450,4450],[4450,4590],[6400,4590],
                [6400,7440],[3425,7440],[3425,6850],[3295,6850]];
 child.area=polygonArea(child.polygon);
 delete child.referenceArea;
 // Existing bed and desk stay where they fit; the 200-mm strip between the
 // new south partition and the bed is NOT advertised as a walkway.

 edit(l.furniture,'l-dressing-rail',{
  x:5800,y:3020,width:600,depth:1280,height:2400,rotation:0,front:'west',
  label:'Одежда на плечиках · глубина 600 · длина 1280'
 });
 edit(l.furniture,'l-dressing-shelves',{
  x:4470,y:3350,width:340,depth:920,height:1950,rotation:0,front:'east',
  label:'Обувь / сумки / ящики · глубина 340 · 920 по стене'
 });
 l.furniture.push({
  id:'o-dressing-upper',type:'upper',room:'dressing',
  x:5120,y:4200,width:570,depth:250,height:430,elevation:2010,
  rotation:0,front:'north',visible:true,collidable:false,
  label:'Сезонное хранение сверху · над проходом, без препятствия у пола'
 });
 // A real access corridor 990 mm between the (unrotated) storage faces:
 // 5800 - (4470 + 340) = 990.
 Object.assign(l.routes,{
  alice:[3850,4600],
  dressing:[5030,3240],
  dressingRail:[5440,3630],
  dressingShelves:[5250,3820],
  dressingBags:[5330,3980]
 });
 l.routePairs.push(['dressing','dressingBags']);
 l.clearances=l.clearances.map(c=>({
  ...c,
  ...(c.id==='hall-to-child'?{value:1035,length:1035,x:3812.5}:{}),
  ...(c.id==='child-door-clear'?{x:3885}:{}),
  ...(c.id==='dressing-door'?{x:4875}:{}),
  ...(c.id==='dressing-aisle'?{value:990,length:990,x:5305,y:3780,status:'good',
    label:'Чистый проход между плечиками и обувными полками'}:{})
 }));
 l.clearances.push({
  id:'o-wardrobe-hanging-depth',label:'Глубина хранения на плечиках',
  value:600,length:600,unit:'мм',status:'good',x:6100,y:3600,axis:'x'
 });
 l.walkViews={...l.walkViews,
  alice:{walk:l.routes.alice,look:[5370,5500]},
  dressing:{walk:l.routes.dressing,look:[6030,3790]}
 };
 return l;
}
