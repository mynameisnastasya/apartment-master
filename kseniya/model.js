// Coordinates in metres. Separate project: no imports from Liza's model.
const C={master:'#d7c8b5',bed2:'#b5c0ad',living:'#dfc6ac',kitchen:'#c7c7b1',wet:'#aec5ca',hall:'#ddd4c7'};

export const layoutMeta={
  balanced:{
    title:'Баланс без мёртвых метров.',
    copy:'Большая спальня становится компактнее, а освободившаяся полоса превращается в настоящую диванную часть. Вторая спальня отдельная, кухня раскрыта в общую зону.',
    noticeTitle:'Почему это мой фаворит',
    notice:'Приватные комнаты остаются полноценными, но лишние метры большой спальни работают на общую жизнь. Критические проверки: можно ли расширять проём кухни и куда точно попадает новая перегородка относительно оконного импоста.',
    stats:['≈11,2','м² большая спальня','≈16,4','м² общая зона'],
    annotations:[['passage',2.55,2.15,'проход ≈ 98 см'],['opening',3.28,.98,'портал ≈ 160 см']]
  },
  bedroomplus:{
    title:'Комфортнее вторая спальня.',
    copy:'Второй комнате отдаём чуть больше ширины и глубины: здесь уже помещается кровать 120 × 200. Большую спальню уменьшаем мягче, а кухня-гостиная остаётся связной.',
    noticeTitle:'Цена более взрослой второй спальни',
    notice:'Проход вдоль второй спальни становится около 88 см, а общая зона немного меньше, чем в варианте 03. Зато вторая комната заметно универсальнее: подросток, взрослый, гость или постоянный кабинет-спальня.',
    stats:['≈8,4','м² вторая спальня','120','см ширина кровати'],
    annotations:[['passage',2.60,2.25,'проход ≈ 88 см'],['opening',3.28,1.02,'портал ≈ 150 см']]
  },
  gentle:{
    title:'Бережная перепланировка.',
    copy:'Спальни остаются изолированными, большую спальню сокращаем ради гостиной, но кухонную стену не раскрываем широким порталом. Кухня остаётся отдельной.',
    noticeTitle:'Меньше конструктивного риска',
    notice:'Это вариант для случая, если стену кухни нельзя или не хочется сильно трогать. Гостиная получается больше нынешней, но кухня и общая комната не складываются в единый объём — ощущение евротрёшки слабее.',
    stats:['≈11,3','м² гостиная','5,14','м² отдельная кухня'],
    annotations:[['passage',2.55,2.15,'проход ≈ 98 см'],['opening',4.42,1.18,'кухня отдельно']]
  },
  full:{
    title:'Изолированные спальни.',
    copy:'Две отдельные спальни остаются за дверями, а кухня соединяется с общей зоной широким проёмом. Получается компактная евротрёшка без прохода через спальни.',
    noticeTitle:'Что делает этот вариант «трёшкой»',
    notice:'Две спальни имеют отдельные входы. Общая комната объединена с кухней и остаётся частью маршрута от входа. Большая спальня при этом сохраняет все 13,1 м² — поэтому диванная часть довольно компактная.',
    stats:['2','изолированные спальни','≈14,3','м² кухня-гостиная'],
    annotations:[['passage',2.55,2.15,'проход ≈ 98 см'],['opening',3.28,.98,'широкий проём']]
  },
  walkthrough:{
    title:'Проходная — но продуманная.',
    copy:'Маршрут в спальню проходит по правому краю гостиной, а не через её центр. Вторая спальня чуть компактнее, зато гостиная глубже и работает как настоящая комната.',
    noticeTitle:'Что исправлено в проходной схеме',
    notice:'Проём в спальню — 90 см и предполагается кассетной раздвижной дверью. Диван и ТВ стоят вне транзитной полосы. Перегородка глухая до 2,15 м, выше — световая фрамуга около 55 см: приватность сохраняется, а гостиная получает заимствованный свет.',
    stats:['≈8,6','м² вторая спальня','≈8,0','м² гостиная'],
    annotations:[['door',2.50,2.67,'кассета 90 см'],['route',2.63,4.55,'чистый транзит →']]
  },
  split:{
    title:'Свет — спальням.',
    copy:'Зал разделён поперёк: у окна — вторая спальня, ближе к входу — компактная гостиная. Это самый простой вариант, но гостиная остаётся проходной.',
    noticeTitle:'Компромисс схемы 01',
    notice:'Обе спальни с окнами, но в дальнюю спальню проходят через гостиную. Верх перегородки можно сделать светопрозрачным, чтобы общая зона не была совсем тёмной.',
    stats:['2','спальни с окнами','1','проходная гостиная'],
    annotations:[]
  },
  original:{
    title:'Отправная точка.',
    copy:'Исходный контур: зал 16,90 м², отдельная комната 13,10 м², кухня 5,14 м², раздельные санузлы и коридор.',
    noticeTitle:'Исходная квартира',
    notice:'Мебель здесь показана только для масштаба. Никаких новых перегородок и расширенных проёмов в исходном варианте нет.',
    stats:null,
    annotations:[]
  }
};

function masterSpec(layout){
  if(layout==='balanced'||layout==='gentle')return {wall:6.42,z:6.48,d:4.80,area:'≈11,2'};
  if(layout==='bedroomplus')return {wall:6.22,z:6.28,d:5.00,area:'≈11,7'};
  return {wall:5.62,z:5.68,d:5.60,area:'13,10'};
}
function masterRoom(layout){
  const m=masterSpec(layout);
  return {id:'bed1',name:'Спальня',area:m.area,x:0,z:m.z,w:2.34,d:m.d,labelX:1.17,labelZ:m.z+1.32,color:C.master,note:(m.wall>5.62?'Компактнее исходной, но всё ещё полноценная спальня: ':'')+'кровать 160 × 200 см, шкаф до потолка и небольшой стол у окна. Вход отдельный.'};
}
const wetRooms=[
  {id:'bath',name:'Ванная',area:'≈2,03',x:4.12,z:2.16,w:1.56,d:1.30,labelX:4.90,labelZ:2.78,color:C.wet,note:'Душ 80 × 100 см и компактная раковина. Мокрая зона остаётся на месте.'},
  {id:'wc',name:'Туалет',area:'1,25',x:4.12,z:3.58,w:1.56,d:.80,labelX:4.90,labelZ:4.02,color:C.wet,note:'Отдельный туалет сохраняется. Стиральную машину удобнее встроить в кухонный блок или высокий хозяйственный шкаф.'}
];
const hallRoom={id:'hall',name:'Прихожая',area:'≈4,7',x:3.16,z:2.16,w:2.52,d:3.46,labelX:4.82,labelZ:5.03,color:C.hall,note:'Вход справа. Неглубокая обувница; основной маршрут держим свободным.'};

export function roomsFor(layout='balanced'){
  const master=masterRoom(layout);
  if(layout==='balanced')return [
    master,
    {id:'bed2',name:'Вторая спальня',area:'≈7,5',x:0,z:0,w:2.06,d:3.65,labelX:1.03,labelZ:1.78,color:C.bed2,note:'Кровать 120 × 200 см, шкаф 120 × 55 см и компактный стол у окна. Отдельная кассетная дверь из общей зоны.'},
    {id:'living',name:'Кухня-гостиная',area:'≈16,4',x:0,z:0,w:5.68,d:6.36,labelX:1.15,labelZ:5.30,color:C.living,note:'Самая цельная общая зона: нормальный диван, ТВ-панель, круглый стол и открытая связь с кухней. Полоса, забранная у большой спальни, работает именно на гостиную.'},
    ...wetRooms,hallRoom
  ];
  if(layout==='bedroomplus')return [
    master,
    {id:'bed2',name:'Вторая спальня',area:'≈8,4',x:0,z:0,w:2.16,d:3.90,labelX:1.08,labelZ:1.90,color:C.bed2,note:'Самая комфортная вторая спальня: кровать 120 × 200, шкаф 120 × 55 и рабочее место. Проход снаружи уже, зато комната универсальнее.'},
    {id:'living',name:'Кухня-гостиная',area:'≈15,0',x:0,z:0,w:5.68,d:6.16,labelX:1.16,labelZ:5.20,color:C.living,note:'Чуть компактнее варианта 03, но всё ещё нормальная общая зона с диваном 170–180 см, столом и открытой кухней.'},
    ...wetRooms,hallRoom
  ];
  if(layout==='gentle')return [
    master,
    {id:'bed2',name:'Вторая спальня',area:'≈7,5',x:0,z:0,w:2.06,d:3.65,labelX:1.03,labelZ:1.78,color:C.bed2,note:'Отдельная спальня у окна с кроватью 120 × 200, шкафом и компактным столом.'},
    {id:'living',name:'Гостиная',area:'≈11,3',x:0,z:3.65,w:2.34,d:2.71,labelX:1.16,labelZ:5.15,color:C.living,note:'Гостиная увеличена за счёт большой спальни. Кухня остаётся отдельной — это проще конструктивно, но менее цельно пространственно.'},
    {id:'kitchen',name:'Кухня',area:'5,14',x:3.16,z:0,w:2.52,d:2.04,labelX:4.42,labelZ:1.13,color:C.kitchen,note:'Исходная кухня без широкого нового портала.'},
    ...wetRooms,hallRoom
  ];
  if(layout==='full')return [
    master,
    {id:'bed2',name:'Вторая спальня',area:'≈7,7',x:0,z:0,w:2.06,d:3.75,labelX:1.03,labelZ:1.85,color:C.bed2,note:'Узкая отдельная спальня: кровать 90 × 200 см, шкаф 120 × 55 см и небольшой стол у окна.'},
    {id:'living',name:'Кухня-гостиная',area:'≈14,3',x:0,z:0,w:5.68,d:5.56,labelX:4.48,labelZ:1.18,color:C.living,note:'Общая зона складывается из бывшей части зала и кухни. Большая спальня сохраняет исходные 13,1 м².'},
    ...wetRooms,hallRoom
  ];
  if(layout==='walkthrough')return [
    master,
    {id:'bed2',name:'Вторая спальня',area:'≈8,6',x:0,z:0,w:3.04,d:2.82,labelX:1.38,labelZ:1.48,color:C.bed2,note:'Кровать 120 × 200 см, рабочий стол и высокий шкаф. Вход через кассетную дверь 90 см у правого края, поэтому мебель не конфликтует с открыванием.'},
    {id:'living',name:'Проходная гостиная',area:'≈8,0',x:0,z:2.94,w:3.04,d:2.62,labelX:1.35,labelZ:4.72,color:C.living,note:'Диван 180 см и ТВ вынесены в левую часть. Справа сохраняется прямой транзит к спальне: маршрут не пересекает журнальный стол и ТВ-зону.'},
    {id:'kitchen',name:'Кухня',area:'5,14',x:3.16,z:0,w:2.52,d:2.04,labelX:4.42,labelZ:1.13,color:C.kitchen,note:'Кухня остаётся отдельной; для еды — компактный круглый стол на двоих, чтобы не зажимать проход.'},
    ...wetRooms,hallRoom
  ];
  if(layout==='split')return [
    master,
    {id:'bed2',name:'Вторая спальня',area:'8,97',x:0,z:0,w:3.04,d:2.95,labelX:1.52,labelZ:1.55,color:C.bed2,note:'Кровать 90 × 200 см, стол 120 × 55 см и шкаф 120 × 60 см. Новая перегородка со светопрозрачным верхом.'},
    {id:'living',name:'Гостиная',area:'7,57',x:0,z:3.07,w:3.04,d:2.49,labelX:1.52,labelZ:4.78,color:C.living,note:'Диван 170 × 80 см и ТВ. Общая комната без собственного окна и остаётся проходной.'},
    {id:'kitchen',name:'Кухня',area:'5,14',x:3.16,z:0,w:2.52,d:2.04,labelX:4.42,labelZ:1.13,color:C.kitchen,note:'Линейный гарнитур, холодильник и откидной стол.'},
    ...wetRooms,hallRoom
  ];
  return [
    master,
    {id:'original',name:'Зал',area:'16,90',x:0,z:0,w:3.04,d:5.56,labelX:1.52,labelZ:2.78,color:C.master,note:'Исходный зал без новой перегородки.'},
    {id:'kitchen',name:'Кухня',area:'5,14',x:3.16,z:0,w:2.52,d:2.04,labelX:4.42,labelZ:1.13,color:C.kitchen,note:'Исходная кухня 2,52 × 2,04 м.'},
    ...wetRooms,hallRoom
  ];
}

function tailFloors(layout){
  const m=masterSpec(layout);
  return [
    {id:'bed1',x:0,z:m.z,w:2.34,d:m.d,color:C.master},
    {id:'bath',x:4.12,z:2.16,w:1.56,d:1.30,color:C.wet,finish:'tile'},
    {id:'wc',x:4.12,z:3.58,w:1.56,d:.80,color:C.wet,finish:'tile'},
    {id:'hall-a',x:3.16,z:2.16,w:.86,d:2.34,color:C.hall},
    {id:'hall-b',x:3.16,z:4.50,w:2.52,d:1.06,color:C.hall}
  ];
}
export function floorZones(layout='balanced'){
  const tail=tailFloors(layout);
  if(layout==='balanced')return [
    {id:'bed2',x:0,z:0,w:2.06,d:3.65,color:C.bed2},
    {id:'living-spine',x:2.06,z:0,w:.98,d:5.56,color:C.living},
    {id:'living-lower',x:0,z:3.65,w:2.06,d:2.71,color:C.living},
    {id:'living-tail',x:2.06,z:5.62,w:.28,d:.80,color:C.living},
    {id:'kitchen-common',x:3.16,z:0,w:2.52,d:2.04,color:C.living},
    ...tail
  ];
  if(layout==='bedroomplus')return [
    {id:'bed2',x:0,z:0,w:2.16,d:3.90,color:C.bed2},
    {id:'living-spine',x:2.16,z:0,w:.88,d:5.56,color:C.living},
    {id:'living-lower',x:0,z:3.90,w:2.16,d:2.26,color:C.living},
    {id:'living-tail',x:2.16,z:5.62,w:.18,d:.60,color:C.living},
    {id:'kitchen-common',x:3.16,z:0,w:2.52,d:2.04,color:C.living},
    ...tail
  ];
  if(layout==='gentle')return [
    {id:'bed2',x:0,z:0,w:2.06,d:3.65,color:C.bed2},
    {id:'living-spine',x:2.06,z:0,w:.98,d:5.56,color:C.living},
    {id:'living-lower',x:0,z:3.65,w:2.06,d:2.71,color:C.living},
    {id:'living-tail',x:2.06,z:5.62,w:.28,d:.80,color:C.living},
    {id:'kitchen',x:3.16,z:0,w:2.52,d:2.04,color:C.kitchen},
    ...tail
  ];
  if(layout==='full')return [
    {id:'bed2',x:0,z:0,w:2.06,d:3.75,color:C.bed2},
    {id:'living-spine',x:2.06,z:0,w:.98,d:5.56,color:C.living},
    {id:'living-lower',x:0,z:3.75,w:2.06,d:1.81,color:C.living},
    {id:'kitchen-common',x:3.16,z:0,w:2.52,d:2.04,color:C.living},
    ...tail
  ];
  if(layout==='walkthrough')return [
    {id:'bed2',x:0,z:0,w:3.04,d:2.82,color:C.bed2},
    {id:'living',x:0,z:2.94,w:3.04,d:2.62,color:C.living},
    {id:'kitchen',x:3.16,z:0,w:2.52,d:2.04,color:C.kitchen},
    ...tail
  ];
  if(layout==='split')return [
    {id:'bed2',x:0,z:0,w:3.04,d:2.95,color:C.bed2},
    {id:'living',x:0,z:3.07,w:3.04,d:2.49,color:C.living},
    {id:'kitchen',x:3.16,z:0,w:2.52,d:2.04,color:C.kitchen},
    ...tail
  ];
  return [
    {id:'original',x:0,z:0,w:3.04,d:5.56,color:C.master},
    {id:'kitchen',x:3.16,z:0,w:2.52,d:2.04,color:C.kitchen},
    ...tail
  ];
}

function shellAndFixed(layout){
  const m=masterSpec(layout);
  return [
    [0,0,.25,0,'outer'],[2.65,0,3.04,0,'outer'],[3.04,0,3.55,0,'outer'],[5.22,0,5.68,0,'outer'],
    [0,0,0,11.28,'outer'],[0,11.28,.25,11.28,'outer'],[1.95,11.28,2.34,11.28,'outer'],[2.34,5.68,2.34,11.28,'outer'],
    [2.34,5.62,5.68,5.62,'outer'],[5.68,0,5.68,4.65,'outer'],[5.68,5.45,5.68,5.62,'outer'],
    [3.10,5.30,3.10,5.62,'existing'],
    [3.96,2.10,5.68,2.10,'existing'],[4.06,2.10,4.06,2.40,'existing'],[4.06,3.10,4.06,3.68,'existing'],[4.06,4.38,4.06,4.44,'existing'],
    [4.06,3.52,5.68,3.52,'existing'],[4.06,4.44,5.68,4.44,'existing'],
    [0,m.wall,1.34,m.wall,m.wall>5.62?'proposed':'existing'],[2.14,m.wall,2.34,m.wall,m.wall>5.62?'proposed':'existing']
  ];
}
function kitchenWall(layout){
  if(layout==='balanced')return [[3.10,0,3.10,.25,'existing'],[3.10,1.85,3.10,4.50,'existing']];
  if(layout==='bedroomplus')return [[3.10,0,3.10,.30,'existing'],[3.10,1.80,3.10,4.50,'existing']];
  if(layout==='full')return [[3.10,0,3.10,.35,'existing'],[3.10,1.75,3.10,4.50,'existing']];
  return [[3.10,0,3.10,4.50,'existing']];
}
export function wallData(layout='balanced'){
  const base=[...shellAndFixed(layout),...kitchenWall(layout)];
  if(layout==='balanced')return [
    ...base,[2.06,0,2.06,2.65,'proposed'],[2.06,3.45,2.06,3.65,'proposed'],[0,3.65,2.06,3.65,'proposed']
  ];
  if(layout==='bedroomplus')return [
    ...base,[2.16,0,2.16,2.85,'proposed'],[2.16,3.65,2.16,3.90,'proposed'],[0,3.90,2.16,3.90,'proposed']
  ];
  if(layout==='gentle')return [
    ...base,[2.06,0,2.06,2.65,'proposed'],[2.06,3.45,2.06,3.65,'proposed'],[0,3.65,2.06,3.65,'proposed']
  ];
  if(layout==='full')return [
    ...base,[2.06,0,2.06,2.73,'proposed'],[2.06,3.53,2.06,3.75,'proposed'],[0,3.75,2.06,3.75,'proposed']
  ];
  if(layout==='walkthrough')return [...base,[0,2.82,2.04,2.82,'transom'],[2.94,2.82,3.10,2.82,'transom']];
  if(layout==='split')return [...base,[0,3.01,2.09,3.01,'glass'],[2.89,3.01,3.10,3.01,'glass']];
  return base;
}

export const windows=[[.25,0,2.65,0],[3.55,0,5.22,0],[.25,11.28,1.95,11.28]];
export function openings(layout='balanced'){
  const m=masterSpec(layout);
  const common=[
    [1.34,m.wall,2.14,m.wall],[3.10,4.50,3.10,5.30],[3.16,2.10,3.96,2.10],
    [4.06,2.40,4.06,3.10],[4.06,3.68,4.06,4.38],[5.68,4.65,5.68,5.45]
  ];
  if(layout==='balanced'||layout==='gentle')return [[2.06,2.65,2.06,3.45],...common];
  if(layout==='bedroomplus')return [[2.16,2.85,2.16,3.65],...common];
  if(layout==='full')return [[2.06,2.73,2.06,3.53],...common];
  if(layout==='walkthrough')return [[2.04,2.82,2.94,2.82],...common];
  if(layout==='split')return [[2.09,3.01,2.89,3.01],...common];
  return common;
}

function masterFurniture(layout){
  const m=masterSpec(layout);
  if(m.wall===5.62)return [
    {type:'bed',name:'Кровать 160 × 200',x:.10,z:7.60,w:1.60,d:2.00,h:.50,color:'#eee6dc'},
    {type:'wardrobe',name:'Шкаф 180 × 60',x:.08,z:5.85,w:.60,d:1.80,h:2.25,color:'#ae9273'},
    {type:'desk',name:'Стол 120 × 55',x:.16,z:10.55,w:1.20,d:.55,h:.74,color:'#b9936f'},
    {type:'chair',name:'Стул',x:.58,z:10.00,w:.45,d:.45,h:.45,color:'#6d7f71'}
  ];
  const bedZ=m.wall===6.42?8.58:8.38;
  return [
    {type:'wardrobe',name:'Шкаф 165 × 60',x:.08,z:m.wall+.20,w:.60,d:1.65,h:2.25,color:'#ae9273'},
    {type:'bed',name:'Кровать 160 × 200',x:.37,z:bedZ,w:1.60,d:2.00,h:.50,color:'#eee6dc'},
    {type:'desk',name:'Консоль 100 × 45',x:.08,z:10.70,w:1.00,d:.45,h:.74,color:'#b9936f'}
  ];
}
const wet=[
 {type:'shower',name:'Душ 80 × 100',x:4.84,z:2.24,w:.80,d:1.00,h:.12,color:'#f1f4ef'},
 {type:'basin',name:'Раковина',x:4.23,z:3.08,w:.46,d:.32,h:.82,color:'#f1f4ef'},
 {type:'toilet',name:'Унитаз',x:4.85,z:3.66,w:.67,d:.45,h:.44,color:'#f1f4ef'},
 {type:'cabinet',name:'Обувница',x:3.40,z:5.22,w:1.00,d:.28,h:1.05,color:'#b49a7c'}
];
const kitchen=[
 {type:'kitchen',name:'Кухня',x:3.24,z:.10,w:1.70,d:.60,h:.90,color:'#c0c5b1'},
 {type:'fridge',name:'Холодильник',x:5.00,z:.10,w:.60,d:.60,h:1.90,color:'#dedbd3'},
 {type:'sink',name:'Мойка',x:4.22,z:.15,w:.48,d:.48,h:.94,color:'#93a5a4'},
 {type:'hob',name:'Плита',x:3.35,z:.17,w:.48,d:.45,h:.94,color:'#424a43'}
];
function bed2Furniture(layout){
  if(layout==='bedroomplus')return [
    {type:'bed',name:'Кровать 120 × 200',x:.10,z:.92,w:1.20,d:2.00,h:.48,color:'#f0eade'},
    {type:'desk',name:'Стол 90 × 50',x:1.08,z:.12,w:.90,d:.50,h:.74,color:'#b9936f'},
    {type:'wardrobe',name:'Шкаф 120 × 55',x:.10,z:3.23,w:1.20,d:.55,h:2.25,color:'#ae9273'}
  ];
  if(layout==='balanced'||layout==='gentle')return [
    {type:'bed',name:'Кровать 120 × 200',x:.10,z:.88,w:1.20,d:2.00,h:.48,color:'#f0eade'},
    {type:'desk',name:'Стол 80 × 45',x:1.12,z:.12,w:.80,d:.45,h:.74,color:'#b9936f'},
    {type:'wardrobe',name:'Шкаф 120 × 55',x:.10,z:3.00,w:1.20,d:.55,h:2.25,color:'#ae9273'}
  ];
  if(layout==='full')return [
    {type:'bed',name:'Кровать 90 × 200',x:.10,z:.95,w:.90,d:2.00,h:.48,color:'#f0eade'},
    {type:'desk',name:'Стол 90 × 50',x:1.03,z:.12,w:.90,d:.50,h:.74,color:'#b9936f'},
    {type:'wardrobe',name:'Шкаф 120 × 55',x:.10,z:3.02,w:1.20,d:.55,h:2.25,color:'#ae9273'}
  ];
  return [];
}
export function furniture(layout='balanced'){
  if(layout==='balanced')return [
    ...masterFurniture(layout),...bed2Furniture(layout),
    {type:'sofa',name:'Диван 180 × 80',x:.12,z:4.12,w:.80,d:1.80,h:.72,color:'#72846f'},
    {type:'tv',name:'ТВ-панель',x:2.20,z:4.20,w:.08,d:1.15,h:1.25,color:'#343b37'},
    {type:'roundtable',name:'Круглый стол Ø90',x:4.23,z:1.06,w:.90,d:.90,h:.74,color:'#b9936f'},
    {type:'chair',name:'Стул',x:4.16,z:.68,w:.42,d:.42,h:.45,color:'#72846f'},
    {type:'chair',name:'Стул',x:5.12,z:1.18,w:.42,d:.42,h:.45,color:'#72846f'},
    ...kitchen,...wet
  ];
  if(layout==='bedroomplus')return [
    ...masterFurniture(layout),...bed2Furniture(layout),
    {type:'sofa',name:'Диван 170 × 80',x:.12,z:4.18,w:.80,d:1.70,h:.72,color:'#72846f'},
    {type:'tv',name:'ТВ-панель',x:2.20,z:4.18,w:.08,d:1.10,h:1.25,color:'#343b37'},
    {type:'roundtable',name:'Круглый стол Ø80',x:4.30,z:1.12,w:.80,d:.80,h:.74,color:'#b9936f'},
    ...kitchen,...wet
  ];
  if(layout==='gentle')return [
    ...masterFurniture(layout),...bed2Furniture(layout),
    {type:'sofa',name:'Диван 180 × 80',x:.12,z:4.12,w:.80,d:1.80,h:.72,color:'#72846f'},
    {type:'tv',name:'ТВ-панель',x:2.20,z:4.20,w:.08,d:1.15,h:1.25,color:'#343b37'},
    {type:'desk',name:'Стол на двоих',x:4.42,z:1.32,w:1.00,d:.50,h:.74,color:'#b9936f'},
    ...kitchen,...wet
  ];
  if(layout==='full')return [
    ...masterFurniture(layout),...bed2Furniture(layout),
    {type:'sofa',name:'Диван 145 × 78',x:.10,z:3.95,w:.78,d:1.45,h:.72,color:'#72846f'},
    {type:'tv',name:'ТВ',x:1.92,z:4.05,w:.08,d:1.00,h:1.25,color:'#343b37'},
    {type:'table',name:'Столик 45 × 60',x:1.05,z:4.22,w:.45,d:.60,h:.42,color:'#a58363'},
    {type:'desk',name:'Обеденный стол 95 × 55',x:4.25,z:1.28,w:.95,d:.55,h:.74,color:'#b9936f'},
    ...kitchen,...wet
  ];
  const shared=[...masterFurniture(layout),...kitchen,...wet];
  if(layout==='walkthrough')return [
    ...shared,
    {type:'bed',name:'Кровать 120 × 200',x:.10,z:.52,w:1.20,d:2.00,h:.48,color:'#f0eade'},
    {type:'desk',name:'Стол 110 × 50',x:1.43,z:.12,w:1.10,d:.50,h:.74,color:'#b9936f'},
    {type:'chair',name:'Стул',x:1.72,z:.70,w:.43,d:.43,h:.45,color:'#6d7f71'},
    {type:'wardrobe',name:'Шкаф 120 × 55',x:2.36,z:.90,w:.55,d:1.20,h:2.25,color:'#ae9273'},
    {type:'sofa',name:'Диван 180 × 80',x:.12,z:3.18,w:.80,d:1.80,h:.72,color:'#72846f'},
    {type:'tv',name:'ТВ-панель',x:1.84,z:3.30,w:.08,d:1.10,h:1.25,color:'#343b37'},
    {type:'table',name:'Приставной стол 42 × 42',x:1.10,z:4.12,w:.42,d:.42,h:.48,color:'#a58363'},
    {type:'roundtable',name:'Круглый стол Ø75',x:4.38,z:1.12,w:.75,d:.75,h:.74,color:'#b9936f'},
    {type:'chair',name:'Стул',x:4.24,z:.72,w:.42,d:.42,h:.45,color:'#72846f'},
    {type:'chair',name:'Стул',x:5.10,z:1.18,w:.42,d:.42,h:.45,color:'#72846f'}
  ];
  if(layout==='split')return [
    ...shared,
    {type:'bed',name:'Кровать 90 × 200',x:.12,z:.35,w:.90,d:2.00,h:.48,color:'#f0eade'},
    {type:'desk',name:'Стол 120 × 55',x:1.35,z:.15,w:1.20,d:.55,h:.74,color:'#b9936f'},
    {type:'chair',name:'Стул',x:1.78,z:.83,w:.45,d:.45,h:.45,color:'#6d7f71'},
    {type:'wardrobe',name:'Шкаф 120 × 60',x:1.00,z:2.27,w:1.20,d:.60,h:2.25,color:'#ae9273'},
    {type:'sofa',name:'Диван 170 × 80',x:.10,z:3.35,w:.80,d:1.70,h:.72,color:'#72846f'},
    {type:'tv',name:'ТВ',x:2.91,z:3.35,w:.08,d:1.05,h:1.30,color:'#343b37'},
    {type:'table',name:'Столик 70 × 50',x:1.30,z:3.82,w:.50,d:.70,h:.42,color:'#a58363'}
  ];
  return [...shared,{type:'sofa',name:'Диван 180 × 80',x:.15,z:3.35,w:.80,d:1.80,h:.72,color:'#72846f'},{type:'tv',name:'ТВ',x:2.91,z:3.35,w:.08,d:1.05,h:1.30,color:'#343b37'}];
}
