// L: preliminary reconstruction of the floor-plan reference shared by the client.
// It keeps the measured/assumed outer shell used by the project, while translating
// the reference's room program: 18.85 m² living/kitchen, 4.53 m² bath,
// 3.04 m² dressing room, 13.68 m² bedroom and 10.41 m² second room.
// Because the reference drawing and the current shell do not close to the same
// dimensions, labelled areas below preserve the reference values where useful.

export function createPhotoLayout(base){
 const l=structuredClone(base);
 const find=(a,id)=>a.find(o=>o.id===id);
 const move=(id,p)=>Object.assign(find(l.furniture,id),p);
 const part=(id,p)=>Object.assign(find(l.partitions,id),p);
 const door=(id,p)=>Object.assign(find(l.doors,id),p);

 Object.assign(l,{
  id:'L',
  name:'По референсу',
  subtitle:'Кухня-гостиная 18,85 · ванная 4,53 · гардеробная 3,04 · предварительно',
  recommended:false,
  revision:'2026-10-07',
  referenceDerived:true,
  pros:[
   'Две спальни собраны у окон, а кухня-гостиная остаётся единым помещением в верхней левой части квартиры.',
   'Отдельная гардеробная разгружает спальни от части шкафов и создаёт самостоятельную зону хранения.',
   'Санузел по референсу близок к 2500 × 1810 мм, поэтому его можно сопоставлять с текущей моделью без переноса кухни на другую сторону.'
  ],
  cons:[
   'Это реконструкция по изображению, а не по обмеру: подписи площадей и текущий условный контур квартиры расходятся.',
   'Узкий поперечный перешеек между ванной и гардеробной в модели около 530 мм; его обязательно перепроверить на реальных размерах.',
   'Правая спальня в текущем условном контуре получается меньше подписанных на референсе 10,41 м² из-за простенка и формы нижней стены.',
   'Перед строительством нужны точные размеры перегородок, дверей, стояков, вентиляции и допустимых границ мокрой зоны.'
  ]
 });

 // Bathroom: reference interior is approximately 2500 × 1810 mm.
 part('d-bath-west',{x:2320,y:0,width:120,depth:1810,rotation:0});
 part('d-bath-east',{x:4940,y:0,width:120,depth:1810,rotation:0});
 part('d-bath-south-left',{x:2320,y:1810,width:770,depth:120,rotation:0});
 part('d-bath-door-lintel',{x:3090,y:1810,width:850,depth:120,rotation:0});
 part('d-bath-south-right',{x:3940,y:1810,width:1120,depth:120,rotation:0});
 door('door-bath',{x:3090,y:1810,width:850,axis:'x',openX:3940,openY:1850,openWidth:850,openDepth:35,room:'bath',mechanism:'pocket-sliding'});
 for(const key of ['hinge','arcStart','arcEnd','swing'])delete find(l.doors,'door-bath')[key];

 // Left bedroom: almost exactly the 13.68 m² labelled on the reference.
 part('d-adult-north',{x:0,y:3880,width:2325,depth:120,rotation:0});
 part('d-adult-door-lintel',{x:2325,y:3880,width:850,depth:120,rotation:0});
 part('d-adult-divider',{x:3175,y:3880,width:120,depth:2970,rotation:0});
 door('door-adult',{x:2325,y:3880,width:850,axis:'x',openX:3135,openY:4000,openWidth:40,openDepth:850,room:'adult',mechanism:'hinged',swing:'inward',hinge:[3175,4000],arcStart:180,arcEnd:90});

 // Right bedroom: straight wall instead of the diagonal used by D.
 part('d-child-diagonal',{x:3295,y:4100,width:205,depth:120,rotation:0});
 part('d-child-door-lintel',{x:3500,y:4100,width:850,depth:120,rotation:0});
 part('d-child-north-right',{x:4350,y:4100,width:150,depth:120,rotation:0});
 door('door-child',{x:3500,y:4100,width:850,axis:'x',openX:4310,openY:4220,openWidth:40,openDepth:850,room:'alice',mechanism:'hinged',swing:'inward',hinge:[4350,4220],arcStart:180,arcEnd:90});

 // Dressing-room enclosure from the reference. The current shell only allows
 // about 2.85 m² geometrically while preserving a 500+ mm circulation neck;
 // the room keeps 3.04 m² as the source-plan label.
 l.partitions.push(
  {id:'l-dressing-west',type:'wall',room:'architecture',x:4380,y:2580,width:120,depth:1500,height:2700,rotation:0,visible:true,proposed:true},
  {id:'l-dressing-north-right',type:'wall',room:'architecture',x:5350,y:2460,width:1050,depth:120,height:2700,rotation:0,visible:true,proposed:true},
  {id:'l-dressing-door-lintel',type:'wall',room:'architecture',x:4500,y:2460,width:850,depth:120,height:600,elevation:2100,rotation:0,visible:true,proposed:true,openingPart:true},
  {id:'l-dressing-south',type:'wall',room:'architecture',x:4500,y:4080,width:1900,depth:120,height:2700,rotation:0,visible:true,proposed:true}
 );
 l.doors.push({id:'door-dressing',x:4500,y:2460,width:850,axis:'x',openX:5350,openY:2500,openWidth:850,openDepth:35,room:'dressing',mechanism:'pocket-sliding'});

 const adult=find(l.rooms,'adult');
 Object.assign(adult,{x:1650,y:6100,polygon:[[0,4000],[3175,4000],[3175,8300],[0,8300]],area:13.68});
 const child=find(l.rooms,'alice');
 Object.assign(child,{name:'Вторая спальня',x:5200,y:5700,polygon:[[3295,4220],[6400,4220],[6400,7440],[3425,7440],[3425,6850],[3295,6850]],area:10.41});
 const bath=find(l.rooms,'bath');
 Object.assign(bath,{x:3690,y:1100,polygon:[[2440,0],[4940,0],[4940,1810],[2440,1810]],area:4.53});
 const living=find(l.rooms,'living');
 Object.assign(living,{name:'Кухня-гостиная',x:1350,y:2850,area:18.85});
 const entry=find(l.rooms,'entry');
 Object.assign(entry,{x:5550,y:1450});
 l.rooms.push({id:'dressing',name:'Гардеробная',x:5450,y:3350,polygon:[[4500,2580],[6400,2580],[6400,4080],[4500,4080]],area:3.04});

 // Kitchen stays on the same plumbing wall as D; furniture is rearranged to
 // follow the reference while retaining the project's verified appliance blocks.
 move('bath-tub',{x:4160,y:55,width:750,depth:1700,rotation:0,front:'west',label:'Ванна 1700 × 750'});
 move('wc',{x:2580,y:1110,width:600,depth:500,rotation:0,front:'east'});
 move('washer',{x:3100,y:0,width:650,depth:650,rotation:0,front:'south'});
 move('basin',{x:2460,y:0,width:600,depth:400,rotation:0,front:'south'});

 move('sofa',{x:300,y:2850,width:2400,depth:850,rotation:0,front:'north',label:'Диван 2400 × 850 · по референсу'});
 l.furniture=l.furniture.filter(o=>!['media','tv','alice-wardrobe','adult-nightstand-2'].includes(o.id));

 move('adult-bed',{x:650,y:5000,width:1850,depth:2200,rotation:0,mattress:[1600,2000],front:'north',label:'Кровать · ориентир 1600 × 2000'});
 move('adult-wardrobe',{x:0,y:4060,width:2200,depth:550,height:2400,rotation:0,front:'south',label:'Шкаф / хранение 2200 × 550'});
 move('adult-dresser',{x:2670,y:5200,width:420,depth:900,height:760,rotation:0,front:'west',label:'Консоль / туалетный столик 900 × 420'});
 move('adult-nightstand',{x:2600,y:6800,width:450,depth:350,rotation:0,front:'west',label:'Прикроватная тумба 450'});

 move('alice-bed',{x:4800,y:4700,width:1300,depth:1900,rotation:0,mattress:[1200,1800],front:'north',label:'Кровать / диван-кровать · ориентир 1200 × 1800'});
 move('alice-desk',{x:3650,y:6880,width:2200,depth:500,height:740,rotation:0,front:'north',label:'Стол / консоль 2200 × 500 · у окна'});
 move('alice-chair',{x:3900,y:6250,width:500,depth:500,rotation:0,front:'south'});

 move('hall-wardrobe',{x:6020,y:200,width:380,depth:1900,height:2400,rotation:0,front:'west',label:'Прихожая · неглубокий встроенный шкаф'});
 move('mirror',{x:5200,y:250,width:25,depth:750,height:1800,rotation:0,front:'east'});

 l.furniture.push(
  {id:'l-dressing-rail',type:'dressing-rack',room:'dressing',x:5800,y:3000,width:600,depth:1000,height:2400,rotation:0,front:'west',visible:true,label:'Гардеробная · плечики 1000 × 600'},
  {id:'l-dressing-shelves',type:'dressing-shelves',room:'dressing',x:4520,y:3500,width:450,depth:450,height:1800,rotation:0,front:'east',visible:true,label:'Гардеробная · полки 450 × 450'}
 );

 l.routes={
  entry:[5500,800],
  storage:[5580,2050],
  kitchen:[1400,1100],
  bar:[1700,2350],
  adult:[2820,4450],
  alice:[3900,4550],
  adultBed:[2750,5850],
  adultWardrobe:[2600,4650],
  aliceBed:[4470,5400],
  aliceDesk:[5000,6400],
  bathroom:[3650,1350],
  fridge:[1940,1050],
  dishwasher:[950,1500],
  sofa:[3000,3300],
  bathBasin:[2780,720],
  bathToilet:[3500,1370],
  bathWasher:[3430,950],
  bathTub:[3900,1420],
  dressing:[5200,3050],
  dressingRail:[5450,3500]
 };
 l.routePairs=[
  ['entry','kitchen'],
  ['entry','adult'],
  ['entry','alice'],
  ['entry','bathroom'],
  ['entry','dressing']
 ];

 l.clearances=[
  {id:'entry-aisle',label:'Между ванной и шкафом прихожей',value:960,unit:'мм',status:'good',x:5540,y:1500,axis:'x',length:960},
  {id:'bath-door-clear',label:'Проём ванной до коробки',value:850,unit:'мм',status:'good',x:3515,y:1870,axis:'x',length:850},
  {id:'adult-door-clear',label:'Проём спальни до коробки',value:850,unit:'мм',status:'good',x:2750,y:3940,axis:'x',length:850},
  {id:'child-door-clear',label:'Проём второй спальни до коробки',value:850,unit:'мм',status:'good',x:3925,y:4160,axis:'x',length:850},
  {id:'dressing-door',label:'Проём гардеробной до коробки',value:850,unit:'мм',status:'good',x:4925,y:2520,axis:'x',length:850},
  {id:'hall-neck',label:'Перешеек между ванной и гардеробной · модель',value:530,unit:'мм',status:'compact',x:4700,y:2195,axis:'y',length:530},
  {id:'adult-foot',label:'Проход у изножья кровати',value:650,unit:'мм',status:'compact',x:325,y:6100,axis:'x',length:650},
  {id:'dressing-aisle',label:'Проход перед хранением',value:830,unit:'мм',status:'compact',x:5385,y:3500,axis:'x',length:830}
 ];

 l.walkViews={
  living:{walk:l.routes.sofa,look:[1200,1000]},
  kitchen:{walk:l.routes.kitchen,look:[600,700]},
  adult:{walk:l.routes.adult,look:[1500,6200]},
  alice:{walk:l.routes.alice,look:[5350,5600]},
  bath:{walk:l.routes.bathroom,look:[4300,900]},
  dressing:{walk:l.routes.dressing,look:[6100,3500]}
 };

 return l;
}
