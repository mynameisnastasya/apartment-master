// Separate proposal: D remains the approved layout. Coordinates are model millimetres.
export function dressingLayout(base){
 const l=structuredClone(base),move=(id,p)=>Object.assign(l.furniture.find(o=>o.id===id),p);
 const part=(id,p)=>Object.assign(l.partitions.find(o=>o.id===id),p);
 const wall=(id,x,y,width,depth,extra={})=>({id,type:'wall',room:'architecture',x,y,width,depth,height:2700,rotation:0,visible:true,proposed:true,...extra});
 const area=p=>Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-a[1]*b[0]},0))/2e6;
 Object.assign(l,{id:'I',name:'Отдельная гардеробная',subtitle:'2,61 м² · отдельный вход · спальня и кухня как в D',recommended:false,
  pros:['Гардеробная 1740 × 1500 мм с отдельным входом из холла. Кухня, ванная и взрослая спальня сохраняют геометрию D.',
   'Восточный ряд глубиной 600 мм для плечиков; торцевые полки 500 × 350 мм. Основной проход 1140 мм, локальный подход у торца 640 мм: глухого угла нет.',
   'Кассетная дверь с проектным проёмом 850 мм не перекрывает проход. Между ванной и гардеробной остаётся 960 мм.',
   'Вторая комната сохраняет односпальную кровать, стол 1000 × 600 боком к окну и отдельный шкаф. Её вход перенесён западнее.'],
  cons:['Вторая комната уменьшается и получает нишу у входа. Это осознанный обмен её площади на отдельную гардеробную; не замена утверждённому D.',
   'Шкаф прихожей сокращён с 2000 до 1600 мм; шкаф второй комнаты — с 1390 до 1200 мм, стол — с 1400 до 1000 мм. Гардеробная добавляется к шкафу спальни, а не выдаётся за огромный прирост хранения.',
   'Гардеробная рассчитана на одного человека: остров, пуф и встречный ряд шкафов здесь мешали бы пользоваться хранением.',
   'Чистые проходы, кассета двери, вентиляционный переток и подсветка уточняются по обмеру и выбранным системам. Гардеробная без окна.'],
  revision:'2026-10-03'});
 move('hall-wardrobe',{depth:1600,label:'Прихожая · шкаф 1600 × 600'});
 // A west-facing 1200 mm wardrobe uses the end wall without blocking the window.
 move('alice-wardrobe',{x:5500,y:6540,width:1200,depth:600,rotation:90,front:'south',label:'Вторая комната · шкаф 1200 × 600 · купе'});
 move('alice-bed',{y:4200});
 move('alice-desk',{x:3425,y:6300,width:600,depth:1000,front:'east',label:'Стол 1000 × 600 · боком к окну'});
 move('alice-chair',{x:4150,y:6575,front:'west'});
 l.furniture=l.furniture.filter(o=>o.id!=='alice-toys');
 const childDoor=l.doors.find(d=>d.id==='door-child');
 Object.assign(childDoor,{x:3500,openX:3500,openY:3600,openWidth:35,openDepth:850,mechanism:'hinged',swing:'inward',hinge:[3500,3640],arcStart:0,arcEnd:90});
 part('d-child-north-right',{x:4350,width:190});part('d-child-door-lintel',{x:3500});
 const start=[3235,4640],end=[3500,3580],length=Math.hypot(end[0]-start[0],end[1]-start[1]);
 part('d-child-diagonal',{x:(start[0]+end[0]-length)/2,y:(start[1]+end[1]-120)/2,width:length,rotation:Math.atan2(end[1]-start[1],end[0]-start[0])*180/Math.PI});
 l.partitions.push(wall('i-dressing-west',4540,3000,120,1740),wall('i-dressing-south',4660,4620,1740,120),wall('i-dressing-north',5510,3000,890,120),wall('i-dressing-lintel',4660,3000,850,120,{height:600,elevation:2100,openingPart:true}));
 l.doors.push({id:'door-dressing',x:4660,y:3000,width:850,axis:'x',openX:5510,openY:3040,openWidth:850,openDepth:35,room:'dressing',mechanism:'pocket-sliding'});
 const child=l.rooms.find(r=>r.id==='alice');
 child.polygon=[[3295,4660],[3547,3640],[4540,3640],[4540,4740],[6400,4740],[6400,7440],[3425,7440],[3425,6850],[3295,6850]];
 child.area=+area(child.polygon).toFixed(2);child.x=5200;child.y=6150;
 l.rooms.push({id:'dressing',name:'Гардеробная',x:5320,y:4070,polygon:[[4660,3120],[6400,3120],[6400,4620],[4660,4620]],area:2.61});
 l.furniture.push({id:'dressing-rail',type:'dressing-rack',room:'dressing',x:5800,y:3120,width:600,depth:1500,height:2400,rotation:0,front:'west',visible:true,label:'Открытое хранение · 1500 × 600 · длинное + двойное подвешивание'},
  {id:'dressing-shoes',type:'dressing-shelves',room:'dressing',x:4660,y:4270,width:500,depth:350,height:1200,rotation:0,front:'north',visible:true,label:'Обувь и сумки · полки 500 × 350'},
  {id:'dressing-mirror',type:'mirror',room:'dressing',x:4665,y:3240,width:25,depth:780,height:1800,elevation:250,rotation:0,front:'east',visible:true,collidable:false,label:'Зеркало в полный рост · боковая подсветка'});
 Object.assign(l.routes,{alice:[4050,4050],aliceDesk:[4350,6150],dressing:[5230,3730],dressingRail:[5450,3950],dressingShoes:[4930,3950],dressingFar:[5475,4350],childWardrobe:[5440,6900]});
 l.routePairs.push(['entry','dressing'],['adult','dressing'],['dressing','dressingRail'],['dressing','dressingShoes'],['dressing','dressingFar'],['alice','childWardrobe']);
 l.clearances.push({id:'dressing-aisle',label:'В гардеробной перед плечиками',value:1140,unit:'мм',status:'good',x:5230,y:3770,axis:'x',length:1140},
  {id:'dressing-door',label:'Проём гардеробной до коробки',value:850,unit:'мм',status:'good',x:5085,y:3060,axis:'x',length:850},
  {id:'dressing-hall',label:'Между ванной и гардеробной',value:960,unit:'мм',status:'good',x:5300,y:2520,axis:'y',length:960},
  {id:'dressing-end',label:'Локальный подход у торцевых полок',value:640,unit:'мм',status:'compact',x:5480,y:4440,axis:'x',length:640});
 const c=l.clearances.find(c=>c.id==='child-door-clear');c.x=3925;
 l.design.notes+=' В I гардеробная оформлена как деревянная ниша: открытые секции, бронзовые штанги, вертикальный свет и зеркало. Без декоративного острова.';
 return l;
}


export function dressingLayouts(base){
 const balanced=dressingLayout(base);
 Object.assign(balanced,{
  name:'Гардеробная · Г-образная',
  subtitle:'2,61 м² · баланс хранения и прохода · отдельный вход',
  revision:'2026-10-04'
 });
 balanced.pros=[
  'Глубокий ряд 1500 × 600 мм и торцевые полки 500 × 350 мм дают два типа хранения без встречного глубокого ряда.',
  'Основной проход перед плечиками — 1140 мм; отдельный вход из холла, спальня, кухня и санузел сохраняют геометрию D.',
  'Зеркало остаётся на западной стене, кассетная дверь не занимает полезный пол.'
 ];
 balanced.cons=[
  'У торцевых полок локальный подход сужается до 640 мм — это зона одного человека.',
  'Вторая комната уменьшается до 9,55 м²; стол, шкаф и прихожее хранение становятся компактнее.',
  'Размеры кассеты, вентиляционный переток и столярку уточнить после чистового обмера.'
 ];

 const linear=structuredClone(balanced);
 Object.assign(linear,{
  id:'J',
  name:'Гардеробная · линейная',
  subtitle:'2,61 м² · самый свободный проход · хранение по одной стене',
  revision:'2026-10-04',
  pros:[
   'Один глубокий ряд 1500 × 600 мм оставляет 1140 мм свободной ширины по всей длине комнаты.',
   'Нет торцевого шкафа и глухого угла: проще переодеваться, убирать чемодан и пользоваться зеркалом.',
   'Обувь и сложенные вещи можно собрать в нижних выдвижных секциях основного ряда.'
  ],
  cons:[
   'Меньше отдельной полочной площади, чем в Г-образной и двухрядной версиях.',
   'Вторая комната и прихожее хранение уменьшаются так же, как в I: это одна архитектурная оболочка.',
   'Наполнение глубокого ряда нужно разбить по фактическому составу одежды после обмера.'
  ]
 });
 linear.furniture=linear.furniture.filter(o=>o.id!=='dressing-shoes');
 delete linear.routes.dressingShoes;
 linear.routePairs=linear.routePairs.filter(([a,b])=>a!=='dressingShoes'&&b!=='dressingShoes');
 const linearEnd=linear.clearances.find(c=>c.id==='dressing-end');
 Object.assign(linearEnd,{label:'Свободный проход у дальнего торца',value:1140,status:'good',x:5230,y:4440,length:1140});
 linear.design.notes+=' В J торцевые полки убраны: хранение линейное, а проход 1140 мм сохраняется по всей длине.';

 const parallel=structuredClone(balanced);
 Object.assign(parallel,{
  id:'K',
  name:'Гардеробная · двухрядная',
  subtitle:'2,61 м² · больше полок · компактный проход 840 мм',
  revision:'2026-10-04',
  pros:[
   'Глубокий ряд 1500 × 600 мм дополнен неглубоким рядом 770 × 300 мм для обуви, сумок и сложенных вещей.',
   'У входа сохраняется свободная зона; неглубокий ряд начинается только в дальней половине комнаты.',
   'Вместимость выше линейной версии без второго ряда для плечиков.'
  ],
  cons:[
   'Между рядами в дальней зоне остаётся 840 мм: пользоваться комфортнее одному человеку.',
   'Полноценный второй ряд глубиной 600 мм сюда не помещается без неприемлемого прохода.',
   'Зеркало на западной стене уступает место полкам; его нужно перенести на дверь или соседнюю плоскость после выбора системы.'
  ]
 });
 const shallow=parallel.furniture.find(o=>o.id==='dressing-shoes');
 Object.assign(shallow,{x:4660,y:3850,width:300,depth:770,height:1200,front:'east',label:'Неглубокий ряд · 770 × 300 · обувь, сумки, сложенные вещи'});
 parallel.furniture=parallel.furniture.filter(o=>o.id!=='dressing-mirror');
 Object.assign(parallel.routes,{dressingShoes:[5250,4235],dressingRail:[5450,3950],dressingFar:[5475,4380]});
 const parallelAisle=parallel.clearances.find(c=>c.id==='dressing-aisle');
 Object.assign(parallelAisle,{label:'Между глубоким и неглубоким рядами',value:840,status:'compact',x:5380,y:4235,length:840});
 const parallelEnd=parallel.clearances.find(c=>c.id==='dressing-end');
 Object.assign(parallelEnd,{label:'Свободная зона у входа',value:1140,status:'good',x:5230,y:3500,length:1140});
 parallel.design.notes+=' В K в дальней половине добавлен неглубокий ряд 300 мм; рабочий проход там 840 мм.';
 return [balanced,linear,parallel];
}
