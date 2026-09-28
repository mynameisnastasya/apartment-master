import reference from './layout-reference.json' with {type:'json'};

// All five options share D's measured hypothesis, partitions, wet zone and kitchen
// connections. Only movable furniture changes. Overrides are kept here so every
// plan, 3D view, download and route check uses the same coordinates.
const options = [
  {
    id: 'E', name: 'Приём гостей', subtitle: 'Стол ближе к гостиной, две свободные посадки',
    pros: ['Обеденная группа сдвинута к гостиной: стол остаётся полноценным на двоих, а кухня работает отдельно.', 'Диван смещён к центру общей зоны; ванная и обе спальни доступны по прежним дверям.'],
    cons: ['Расстояние до ТВ и посадку за столом проверить с выбранными изделиями.', 'Стол и стулья не должны перекрывать выдвижение кухонных ящиков.'],
    furniture: {dining:{x:150,y:2150},'dining-chair-east':{x:1300,y:2110},'dining-chair-south':{x:1300,y:2530},sofa:{x:1150,y:3400}},
    routes: {bar:[2000,2250]}
  },
  {
    id: 'F', name: 'Работа у окна', subtitle: 'Рабочее место вдоль боковой стены',
    pros: ['Стол во второй комнате поставлен вдоль боковой стены; центральная часть комнаты свободнее для игры и занятий.', 'Кухонно-гостиная остаётся компактной, но диван отодвинут от перехода.'],
    cons: ['Стол у окна и шторы привязать после замера подоконника, радиатора и открывания створки.', 'Стол и кресло требуют проверки на реальных изделиях.'],
    furniture: {'alice-desk':{x:4800,y:6300,width:1200,rotation:90,front:'west'},'alice-chair':{x:4550,y:6350,front:'east'},sofa:{x:1150,y:3320},dining:{x:0,y:1930}},
    routes: {aliceDesk:[4650,7130]}
  },
  {
    id: 'G', name: 'Хранение и порядок', subtitle: 'Книжный шкаф в детской, спокойная спальня',
    pros: ['У боковой стены второй комнаты добавлен неглубокий книжный шкаф; доступ к столу и кровати остаётся отдельным.', 'Кровать в спальне и диван немного переставлены: мебель не упирается в дверные проёмы.'],
    cons: ['Проход у книжного шкафа компактный; глубину и крепление шкафа уточнить.', 'При выборе более широкой кровати понадобится новый расчёт проходов.'],
    furniture: {'adult-bed':{x:1100,y:5750},'adult-nightstand':{x:2650,y:5500},sofa:{x:1050,y:3480}},
    add: [{id:'child-shelf',type:'shelf',room:'alice',x:3360,y:6100,width:280,depth:500,height:1500,front:'east',rotation:0,visible:true,label:'Неглубокий книжный шкаф 280 × 500'}],
    routes: {adultBed:[650,6200],childShelf:[3900,6300]},
    routePairs: [['entry','childShelf']]
  },
  {
    id: 'H', name: 'Стол поперёк', subtitle: 'Иное направление стола, свободный центр кухни',
    pros: ['Обеденный стол развёрнут; два стула стоят со стороны стены, сохраняя свободное место перед гостиной.', 'Зоны сна, кухня и санузел остаются на исходных местах.'],
    cons: ['Посадка со стороны стены компактная; проверить отодвигание стульев в натуральную величину.', 'Проход у обеденной группы зависит от фактического размера стола.'],
    furniture: {sofa:{x:1150,y:3360},dining:{x:400,y:2050,rotation:90,front:'west'},'dining-chair-east':{x:150,y:1900,front:'east'},'dining-chair-south':{x:150,y:2400,front:'east'}},
    routes: {bar:[1580,2500]}
  }
];

export const layouts = [reference, ...options.map(option => {
  const variant = structuredClone(reference);
  variant.id = option.id;
  variant.name = option.name;
  variant.subtitle = option.subtitle;
  variant.recommended = false;
  variant.pros = option.pros;
  variant.cons = option.cons;
  for (const [id, values] of Object.entries(option.furniture))
    Object.assign(variant.furniture.find(object => object.id === id), values);
  if (option.add) variant.furniture.push(...option.add);
  Object.assign(variant.routes, option.routes);
  if (option.routePairs) variant.routePairs.push(...option.routePairs);
  const clearance=id=>variant.clearances.find(c=>c.id===id);
  const sofa=variant.furniture.find(o=>o.id==='sofa');
  const kitchenGap=sofa.y+sofa.depth/2-sofa.width/2-2040;
  Object.assign(clearance('kitchen-entry'),{value:kitchenGap,length:kitchenGap,y:2040+kitchenGap/2,status:kitchenGap>=914?'good':'compact'});
  const bed=variant.furniture.find(o=>o.id==='adult-bed');
  const bedLeft=bed.x+(bed.width-bed.depth)/2;
  Object.assign(clearance('adult-foot'),{value:bedLeft,length:bedLeft,x:bedLeft/2});
  const bedWindow=8300-(bed.y+bed.depth/2+bed.width/2);
  Object.assign(clearance('adult-window'),{value:bedWindow,length:bedWindow,y:8300-bedWindow/2});
  if(option.id==='H')variant.clearances=variant.clearances.filter(c=>c.id!=='dining-chair-back');
  else {
    const chairs=variant.furniture.filter(o=>o.type==='chair'&&o.room==='kitchen');
    const chairGap=2320-Math.max(...chairs.map(o=>o.x+o.width));
    Object.assign(clearance('dining-chair-back'),{value:chairGap,length:chairGap,status:chairGap>=762?'good':'compact'});
  }
  return variant;
})];
