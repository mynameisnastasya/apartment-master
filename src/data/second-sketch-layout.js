// M · Second hand-drawn photo from the client (2026-10-08).
// Measurements read with reasonable confidence from the photo:
// left bedroom 3.18 x 4.40 m, right bedroom about 2.98 x 3.0 m.
// The upper size chain, closet width and wall junctions cannot be verified
// from the photograph. This is a DESIGN STUDY inside the provisional shell,
// not a surveyed building or verified plumbing/structural proposal.
import {createPhotoLayout} from './photo-layout.js';

const byId=(a,id)=>{const o=a.find(item=>item.id===id);if(!o)throw new Error('M missing '+id);return o;};
const change=(a,id,p)=>Object.assign(byId(a,id),p);
const area=polygon=>Math.round(Math.abs(polygon.reduce((s,[x,y],i)=>{
 const [nx,ny]=polygon[(i+1)%polygon.length];
 return s+x*ny-y*nx;
},0))/20000)/100;

export function createSecondSketchLayout(base){
 const l=createPhotoLayout(base);
 Object.assign(l,{
  id:'M',
  name:'По второму эскизу',
  subtitle:'Новый рисунок · спальня 3,18 × 4,40 · вторая ≈ 2,98 × 3,0 м · требуется обмер',
  revision:'2026-10-08 · второй рукописный вариант',
  referenceDerived:true,
  referenceSource:'IMG_7789.jpeg',
  recommended:false,
  pros:[
   'Взрослая спальня удлинена до 4,40 м в условном контуре, как подписано на новом рисунке.',
   'Две спальни сохраняют отдельные входы, а окна остаются на нижнем фасаде.',
   'Гардеробная расширена в сторону перехода к спальням; дверь открывается с верхнего коридора.',
   'Основной проход между ванной и гардеробной оставлен 930 мм, вместо прежних узких 680 мм.'
  ],
  cons:[
   'Второй эскиз снят под углом, и часть верхних чисел читается неоднозначно: это альтернативная интерпретация, не точная копия размеров.',
   'Площадь второй спальни и габариты хранения пока не подтверждены обмером; размер 2,98 × 3,0 м — приблизительная подпись на фото.',
   'Перенос перегородок, дверные коробки и инженерные подключения должны быть проверены до строительных работ.'
  ]
 });
 // The left bedroom line is 4400 mm from the existing south/window wall:
 // internal north boundary y=3900, wall itself is 120 mm thick.
 change(l.partitions,'d-adult-north',{y:3780});
 change(l.partitions,'d-adult-door-lintel',{y:3780});
 change(l.partitions,'d-adult-divider',{y:3780,depth:3070});
 change(l.doors,'door-adult',{y:3780,openY:3900,hinge:[3175,3900]});
 const adult=byId(l.rooms,'adult');
 adult.polygon=[[0,3900],[3175,3900],[3175,8300],[0,8300]];
 Object.assign(adult,{area:area(adult.polygon),referenceArea:13.99,x:1590,y:6090});
 // An independent second-bedroom door placed between the central corridor
 // and the west side of the wardrobe front, as in the hand sketch.
 change(l.partitions,'d-child-diagonal',{width:185});
 change(l.partitions,'d-child-door-lintel',{x:3480,width:850});
 change(l.partitions,'d-child-north-right',{x:4330,width:170});
 change(l.doors,'door-child',{x:3480,width:850,openX:4290,hinge:[4330,4450]});
 const child=byId(l.rooms,'alice');
 child.referenceArea=8.94; // 2.98 x 3.00 is shown approximately on the photo.
 // Expand dressing slightly to the west, without narrowing the 930 mm
 // corridor between the bathroom south wall and the dressing north wall.
 change(l.partitions,'l-dressing-west',{x:4220});
 change(l.partitions,'l-dressing-north-right',{x:5190,width:1210});
 change(l.partitions,'l-dressing-door-lintel',{x:4340});
 change(l.partitions,'l-dressing-south',{x:4340,width:2060});
 change(l.doors,'door-dressing',{x:4340,openX:5190});
 const dressing=byId(l.rooms,'dressing');
 dressing.polygon=[[4340,2980],[6400,2980],[6400,4330],[4340,4330]];
 dressing.area=area(dressing.polygon);
 dressing.referenceArea=undefined; // no reliably readable area label on this photo
 dressing.x=5450;dressing.y=3520;
 change(l.furniture,'l-dressing-shelves',{x:4360,y:3490});
 // Keep route targets just outside furniture faces and away from door leaves.
 Object.assign(l.routes,{adult:[2830,4380],alice:[3830,4560],dressing:[5160,3240],dressingShelves:[5120,3850],dressingRail:[5480,3500]});
 l.clearances=l.clearances.map(c=>({
   ...c,
   ...(c.id==='adult-door-clear'?{y:3840}:{}),
   ...(c.id==='child-door-clear'?{x:3905}:{}),
   ...(c.id==='dressing-door'?{x:4765}:{}),
   ...(c.id==='dressing-aisle'?{value:670,length:670,status:'compact',label:'Локальный подход к хранению · требует проверки'}:{})
 }));
 l.walkViews={...l.walkViews,adult:{walk:l.routes.adult,look:[2150,6400]},alice:{walk:l.routes.alice,look:[5350,5500]},dressing:{walk:l.routes.dressing,look:[6100,3700]}};
 return l;
}
