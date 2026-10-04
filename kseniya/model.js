// Coordinates in metres. Separate project: no imports from Liza's model.
export const layoutMeta={
  full:{
    title:'Изолированные спальни.',
    copy:'Две отдельные спальни остаются за дверями, а кухня соединяется с общей зоной широким проёмом. Получается компактная евротрёшка без прохода через спальни.',
    noticeTitle:'Что делает этот вариант «трёшкой»',
    notice:'Две спальни имеют отдельные входы. Общая комната объединена с кухней и остаётся частью маршрута от входа, но больше не является проходом внутрь спальни. Новая перегородка попадает в зону большого окна — её нужно привязать к оконному импосту или менять оконный блок.',
    stats:['2','изолированные спальни','≈14,3','м² кухня-гостиная']
  },
  split:{
    title:'Свет — спальням.',
    copy:'Зал разделён поперёк: у окна — вторая спальня, ближе к входу — компактная гостиная. Это самый простой вариант, но гостиная остаётся проходной.',
    noticeTitle:'Компромисс схемы 01',
    notice:'Обе спальни с окнами, но в дальнюю спальню проходят через гостиную. Верх перегородки можно сделать светопрозрачным, чтобы общая зона не была совсем тёмной.',
    stats:['2','спальни с окнами','1','проходная гостиная']
  },
  original:{
    title:'Отправная точка.',
    copy:'Исходный контур: зал 16,90 м², отдельная комната 13,10 м², кухня 5,14 м², раздельные санузлы и коридор.',
    noticeTitle:'Исходная квартира',
    notice:'Мебель здесь показана только для масштаба. Никаких новых перегородок и расширенных проёмов в исходном варианте нет.',
    stats:null
  }
};

const fixedRooms=[
  {id:'bed1',name:'Спальня',area:'13,10',x:0,z:5.68,w:2.34,d:5.60,labelX:1.17,labelZ:7.05,color:'#d7c8b5',note:'Кровать 160 × 200 см, шкаф 180 × 60 см и рабочий стол у окна. Вход отдельный из общей зоны.'},
  {id:'bath',name:'Ванная',area:'≈2,03',x:4.12,z:2.16,w:1.56,d:1.30,labelX:4.90,labelZ:2.78,color:'#aec5ca',note:'Душ 80 × 100 см и компактная раковина. Мокрая зона остаётся на месте.'},
  {id:'wc',name:'Туалет',area:'1,25',x:4.12,z:3.58,w:1.56,d:.80,labelX:4.90,labelZ:4.02,color:'#aec5ca',note:'Отдельный туалет сохраняется. Стиральную машину удобнее встроить в кухонный блок или высокий хозяйственный шкаф.'}
];

export function roomsFor(layout='full'){
  if(layout==='full')return [
    fixedRooms[0],
    {id:'bed2',name:'Вторая спальня',area:'≈7,7',x:0,z:0,w:2.06,d:3.75,labelX:1.03,labelZ:1.85,color:'#b5c0ad',note:'Узкая, но отдельная спальня: кровать 90 × 200 см, шкаф 120 × 55 см и небольшой стол у окна. Дверь выходит в коридорную часть кухни-гостиной.'},
    {id:'living',name:'Кухня-гостиная',area:'≈14,3',x:0,z:0,w:5.68,d:5.56,labelX:4.48,labelZ:1.18,color:'#dfc6ac',note:'Общая зона складывается из бывшей части зала и кухни. Диван стоит вне основного маршрута, а широкий проём у кухни делает пространство связанным.'},
    fixedRooms[1],fixedRooms[2],
    {id:'hall',name:'Прихожая',area:'≈4,7',x:3.16,z:2.16,w:2.52,d:3.46,labelX:4.82,labelZ:5.03,color:'#ddd4c7',note:'Вход справа. Основной маршрут держим свободным; обувница неглубокая.'}
  ];
  if(layout==='split')return [
    fixedRooms[0],
    {id:'bed2',name:'Вторая спальня',area:'8,97',x:0,z:0,w:3.04,d:2.95,labelX:1.52,labelZ:1.55,color:'#b5c0ad',note:'Кровать 90 × 200 см, стол 120 × 55 см и шкаф 120 × 60 см. Новая перегородка со светопрозрачным верхом.'},
    {id:'living',name:'Гостиная',area:'7,57',x:0,z:3.07,w:3.04,d:2.49,labelX:1.52,labelZ:4.78,color:'#dfc6ac',note:'Диван 170 × 80 см, ТВ и компактный стол. Общая комната без собственного окна и остаётся проходной.'},
    {id:'kitchen',name:'Кухня',area:'5,14',x:3.16,z:0,w:2.52,d:2.04,labelX:4.42,labelZ:1.13,color:'#c7c7b1',note:'Линейный гарнитур, холодильник и откидной стол на двоих.'},
    fixedRooms[1],fixedRooms[2],
    {id:'hall',name:'Прихожая',area:'≈4,7',x:3.16,z:2.16,w:2.52,d:3.46,labelX:4.82,labelZ:5.03,color:'#ddd4c7',note:'Вход справа. Основной проход вдоль санузлов — около 86 см.'}
  ];
  return [
    fixedRooms[0],
    {id:'original',name:'Зал',area:'16,90',x:0,z:0,w:3.04,d:5.56,labelX:1.52,labelZ:2.78,color:'#d7c8b5',note:'Исходный зал без новой перегородки.'},
    {id:'kitchen',name:'Кухня',area:'5,14',x:3.16,z:0,w:2.52,d:2.04,labelX:4.42,labelZ:1.13,color:'#c7c7b1',note:'Исходная кухня 2,52 × 2,04 м.'},
    fixedRooms[1],fixedRooms[2],
    {id:'hall',name:'Прихожая',area:'≈4,7',x:3.16,z:2.16,w:2.52,d:3.46,labelX:4.82,labelZ:5.03,color:'#ddd4c7',note:'Исходный вход и коридор.'}
  ];
}

export function floorZones(layout='full'){
  const tail=[
    {id:'bed1',x:0,z:5.68,w:2.34,d:5.60,color:'#d7c8b5'},
    {id:'bath',x:4.12,z:2.16,w:1.56,d:1.30,color:'#aec5ca',finish:'tile'},
    {id:'wc',x:4.12,z:3.58,w:1.56,d:.80,color:'#aec5ca',finish:'tile'},
    {id:'hall-a',x:3.16,z:2.16,w:.86,d:2.34,color:'#ddd4c7'},
    {id:'hall-b',x:3.16,z:4.50,w:2.52,d:1.06,color:'#ddd4c7'}
  ];
  if(layout==='full')return [
    {id:'bed2',x:0,z:0,w:2.06,d:3.75,color:'#b5c0ad'},
    {id:'living-spine',x:2.06,z:0,w:.98,d:5.56,color:'#dfc6ac'},
    {id:'living-lower',x:0,z:3.75,w:2.06,d:1.81,color:'#dfc6ac'},
    {id:'kitchen-common',x:3.16,z:0,w:2.52,d:2.04,color:'#dfc6ac'},
    ...tail
  ];
  if(layout==='split')return [
    {id:'bed2',x:0,z:0,w:3.04,d:2.95,color:'#b5c0ad'},
    {id:'living',x:0,z:3.07,w:3.04,d:2.49,color:'#dfc6ac'},
    {id:'kitchen',x:3.16,z:0,w:2.52,d:2.04,color:'#c7c7b1'},
    ...tail
  ];
  return [
    {id:'original',x:0,z:0,w:3.04,d:5.56,color:'#d7c8b5'},
    {id:'kitchen',x:3.16,z:0,w:2.52,d:2.04,color:'#c7c7b1'},
    ...tail
  ];
}

export function wallData(layout='full'){
  const base=[
    [0,0,.25,0,'outer'],[2.65,0,3.04,0,'outer'],[3.04,0,3.55,0,'outer'],[5.22,0,5.68,0,'outer'],
    [0,0,0,11.28,'outer'],[0,11.28,.25,11.28,'outer'],[1.95,11.28,2.34,11.28,'outer'],[2.34,5.68,2.34,11.28,'outer'],
    [2.34,5.62,5.68,5.62,'outer'],[5.68,0,5.68,4.65,'outer'],[5.68,5.45,5.68,5.62,'outer'],
    [3.10,5.30,3.10,5.62,'existing'],
    [3.96,2.10,5.68,2.10,'existing'],[4.06,2.10,4.06,2.40,'existing'],[4.06,3.10,4.06,3.68,'existing'],[4.06,4.38,4.06,4.44,'existing'],
    [4.06,3.52,5.68,3.52,'existing'],[4.06,4.44,5.68,4.44,'existing'],
    [0,5.62,1.34,5.62,'existing'],[2.14,5.62,3.10,5.62,'existing']
  ];
  if(layout==='full')return [
    ...base,
    [3.10,0,3.10,.35,'existing'],[3.10,1.75,3.10,4.50,'existing'],
    [2.06,0,2.06,2.73,'proposed'],[2.06,3.53,2.06,3.75,'proposed'],
    [0,3.75,2.06,3.75,'proposed']
  ];
  if(layout==='split')return [
    ...base,
    [3.10,0,3.10,4.50,'existing'],
    [0,3.01,2.09,3.01,'glass'],[2.89,3.01,3.10,3.01,'glass']
  ];
  return [...base,[3.10,0,3.10,4.50,'existing']];
}

export const windows=[[.25,0,2.65,0],[3.55,0,5.22,0],[.25,11.28,1.95,11.28]];

export function openings(layout='full'){
  const common=[
    [1.34,5.62,2.14,5.62],[3.10,4.50,3.10,5.30],[3.16,2.10,3.96,2.10],
    [4.06,2.40,4.06,3.10],[4.06,3.68,4.06,4.38],[5.68,4.65,5.68,5.45]
  ];
  if(layout==='full')return [[2.06,2.73,2.06,3.53],[3.10,.35,3.10,1.75],...common];
  if(layout==='split')return [[2.09,3.01,2.89,3.01],...common];
  return common;
}

const bed1=[
 {type:'bed',name:'Кровать 160 × 200',x:.10,z:7.60,w:1.60,d:2.00,h:.50,color:'#eee6dc'},
 {type:'wardrobe',name:'Шкаф 180 × 60',x:.08,z:5.85,w:.60,d:1.80,h:2.25,color:'#ae9273'},
 {type:'desk',name:'Стол 120 × 55',x:.16,z:10.55,w:1.20,d:.55,h:.74,color:'#b9936f'},
 {type:'chair',name:'Стул',x:.58,z:10.00,w:.45,d:.45,h:.45,color:'#6d7f71'}
];
const wet=[
 {type:'shower',name:'Душ 80 × 100',x:4.84,z:2.24,w:.80,d:1.00,h:.12,color:'#f1f4ef'},
 {type:'basin',name:'Раковина',x:4.23,z:3.08,w:.46,d:.32,h:.82,color:'#f1f4ef'},
 {type:'toilet',name:'Унитаз',x:4.85,z:3.66,w:.67,d:.45,h:.44,color:'#f1f4ef'},
 {type:'cabinet',name:'Обувница',x:3.40,z:5.22,w:1.00,d:.28,h:1.05,color:'#b49a7c'}
];

export function furniture(layout='full'){
  if(layout==='full')return [
    ...bed1,
    {type:'bed',name:'Кровать 90 × 200',x:.10,z:.95,w:.90,d:2.00,h:.48,color:'#f0eade'},
    {type:'desk',name:'Стол 90 × 50',x:1.03,z:.12,w:.90,d:.50,h:.74,color:'#b9936f'},
    {type:'chair',name:'Стул',x:1.24,z:.72,w:.42,d:.42,h:.45,color:'#6d7f71'},
    {type:'wardrobe',name:'Шкаф 120 × 55',x:.10,z:3.02,w:1.20,d:.55,h:2.25,color:'#ae9273'},
    {type:'sofa',name:'Диван 145 × 78',x:.10,z:3.95,w:.78,d:1.45,h:.72,color:'#72846f'},
    {type:'tv',name:'ТВ',x:1.92,z:4.05,w:.08,d:1.00,h:1.25,color:'#343b37'},
    {type:'table',name:'Столик 45 × 60',x:1.05,z:4.22,w:.45,d:.60,h:.42,color:'#a58363'},
    {type:'kitchen',name:'Кухня',x:3.24,z:.10,w:1.70,d:.60,h:.90,color:'#c0c5b1'},
    {type:'fridge',name:'Холодильник',x:5.00,z:.10,w:.60,d:.60,h:1.90,color:'#dedbd3'},
    {type:'sink',name:'Мойка',x:4.22,z:.15,w:.48,d:.48,h:.94,color:'#93a5a4'},
    {type:'hob',name:'Плита',x:3.35,z:.17,w:.48,d:.45,h:.94,color:'#424a43'},
    {type:'desk',name:'Обеденный стол 95 × 55',x:4.25,z:1.28,w:.95,d:.55,h:.74,color:'#b9936f'},
    {type:'chair',name:'Стул',x:4.34,z:.78,w:.42,d:.42,h:.45,color:'#72846f'},
    {type:'chair',name:'Стул',x:4.88,z:.78,w:.42,d:.42,h:.45,color:'#72846f'},
    ...wet
  ];
  const shared=[
    ...bed1,
    {type:'kitchen',name:'Кухня',x:3.24,z:.10,w:1.70,d:.60,h:.90,color:'#c0c5b1'},
    {type:'fridge',name:'Холодильник',x:5.00,z:.10,w:.60,d:.60,h:1.90,color:'#dedbd3'},
    {type:'sink',name:'Мойка',x:4.22,z:.15,w:.48,d:.48,h:.94,color:'#93a5a4'},
    {type:'hob',name:'Плита',x:3.35,z:.17,w:.48,d:.45,h:.94,color:'#424a43'},
    {type:'desk',name:'Откидной стол',x:4.53,z:1.48,w:1.00,d:.45,h:.74,color:'#b9936f'},
    {type:'chair',name:'Стул',x:4.77,z:.90,w:.43,d:.43,h:.45,color:'#72846f'},
    ...wet
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
  return [
    ...shared,
    {type:'sofa',name:'Диван 180 × 80',x:.15,z:3.35,w:.80,d:1.80,h:.72,color:'#72846f'},
    {type:'tv',name:'ТВ',x:2.91,z:3.35,w:.08,d:1.05,h:1.30,color:'#343b37'}
  ];
}
