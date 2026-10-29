// Metres; principal room dimensions are transcribed from the user's photograph.
// Wet rooms, wall thicknesses, openings and balcony depth remain survey assumptions.
export const outline=[[0,0],[7.95,0],[7.95,6.85],[4.85,6.85],[4.85,5.6],[-.14,5.6],[-.14,2.93],[0,2.93]];
export const rooms=[
 {id:'kitchen',name:'Кухня',area:'6,1 м² на фото',poly:[[0,0],[2.17,0],[2.17,2.81],[0,2.81]],color:'#e0d6c4'},
 {id:'living',name:'Гостиная',area:'9,8 м² на фото',poly:[[2.29,0],[4.73,0],[4.73,4.18],[2.29,4.18]],color:'#d6c5a9'},
 {id:'hall',name:'Прихожая',area:'5,6 м² на фото',poly:[[1.43,2.93],[2.17,2.93],[2.17,4.18],[4.73,4.18],[4.73,5.6],[1.43,5.6]],color:'#e5dfd2'},
 {id:'wc',name:'Туалет',area:'размеры уточнить',poly:[[-.14,2.93],[1.31,2.93],[1.31,3.83],[-.14,3.83]],color:'#d5dfd8'},
 {id:'bath',name:'Душевая и стирка',area:'размеры уточнить',poly:[[-.14,3.95],[1.31,3.95],[1.31,5.6],[-.14,5.6]],color:'#cdd9d4'},
 {id:'bedroom',name:'Спальня',area:'в комнате 17,4 м²',poly:[[4.85,1.25],[7.95,1.25],[7.95,5.15],[4.85,5.15]],color:'#d6c5a9'},
 {id:'wardrobe',name:'Гардеробная',area:'≈ 5 м² в модели',poly:[[4.85,5.25],[7.95,5.25],[7.95,6.85],[4.85,6.85]],color:'#d6c5a9'},
 {id:'balcony',name:'Балкон',area:'глубину уточнить',poly:[[4.85,0],[7.95,0],[7.95,1.13],[4.85,1.13]],color:'#e5dfd2'}
];
const wall=(id,a,b,t=.12,kind='existing')=>({id,a,b,t,kind});
export const walls=[
 wall('north-k1',[-.1,-.1],[.45,-.1],.2,'fixed'),wall('north-k2',[1.72,-.1],[2.8,-.1],.2,'fixed'),wall('north-l',[4.12,-.1],[4.85,-.1],.2,'fixed'),
 wall('bal-n1',[4.85,-.1],[5.06,-.1],.2,'fixed'),wall('bal-n2',[7.74,-.1],[8.05,-.1],.2,'fixed'),
 wall('west-upper',[-.1,-.1],[-.1,2.87],.2,'fixed'),wall('west-lower',[-.24,2.87],[-.24,5.7],.2,'fixed'),
 wall('east',[8.05,-.1],[8.05,6.95],.2,'fixed'),wall('bed-south',[4.75,6.95],[8.05,6.95],.2,'fixed'),wall('bed-west-lower',[4.79,5.15],[4.79,6.95],.12),
 wall('hall-south-left',[-.24,5.7],[2.5,5.7],.2,'fixed'),wall('hall-south-right',[3.4,5.7],[4.79,5.7],.2,'fixed'),
 wall('k-living',[2.23,0],[2.23,4.18]),wall('living-bedroom',[4.79,0],[4.79,4.35]),
 wall('k-south',[0,2.87],[1.31,2.87]),wall('k-south-end',[2.11,2.87],[2.23,2.87]),
 wall('wet-middle',[-.14,3.89],[1.37,3.89]),wall('wc-east-top',[1.37,2.87],[1.37,3.0]),wall('wc-east-bottom',[1.37,3.78],[1.37,3.95]),wall('bath-east-bottom',[1.37,4.75],[1.37,5.6]),
 wall('bal-south-left',[4.85,1.19],[5.08,1.19]),wall('bal-south-right',[5.88,1.19],[6.03,1.19]),wall('bal-south-end',[7.65,1.19],[7.95,1.19]),
 wall('dress-front-left',[4.85,5.20],[6.05,5.20],.1,'new'),wall('dress-front-right',[6.85,5.20],[7.95,5.20],.1,'new')
];
export const removedWalls=[wall('remove-entry',[2.29,4.24],[4.73,4.24],.12,'removed')];
export const excludedAreas=[];
export const openings=[
 {id:'kwindow',name:'Окно кухни',a:[.45,-.1],b:[1.72,-.1],type:'window'},
 {id:'lwindow',name:'Окно гостиной',a:[2.8,-.1],b:[4.12,-.1],type:'window'},
 {id:'bwindow',name:'Окно спальни',a:[6.03,1.19],b:[7.65,1.19],type:'window'},
 {id:'balglazing',name:'Остекление балкона',a:[5.06,-.1],b:[7.74,-.1],type:'window'},
 {id:'baldoor',name:'Балкон',a:[5.08,1.19],b:[5.88,1.19],type:'door',glass:true,hinge:[5.08,1.19],radius:.8,start:0,end:Math.PI/2},
 {id:'entry',name:'Вход',a:[2.5,5.7],b:[3.4,5.7],type:'door',hinge:[2.5,5.7],radius:.9,start:0,end:-Math.PI/2},
 {id:'kdoor',name:'Кухня',a:[1.31,2.87],b:[2.11,2.87],type:'passage'},
 {id:'wcdoor',name:'Туалет',a:[1.37,3.0],b:[1.37,3.78],type:'door',hinge:[1.37,3.78],radius:.78,start:-Math.PI/2,end:0},
 {id:'bathdoor',name:'Душевая',a:[1.37,3.95],b:[1.37,4.75],type:'door',hinge:[1.37,3.95],radius:.77,start:Math.PI/2,end:0},
 {id:'beddoor',name:'Спальня',a:[4.79,4.35],b:[4.79,5.15],type:'door',hinge:[4.79,4.35],radius:.8,start:Math.PI/2,end:0},
 {id:'dressdoor',name:'Гардеробная',a:[6.05,5.20],b:[6.85,5.20],type:'passage',sliding:true,panelY:5.10}
];
export const wallsFor=()=>walls,openingsFor=()=>openings;
export const slidingPanels=()=>[{id:'door-dress',x:5.25,y:5.085,w:.8,d:.03,h:2.1}];
const item=(id,type,name,x,y,w,d,h,purpose,extra={})=>({id,type,name,x,y,w,d,h,purpose,front:'south',...extra});
export const furniture=[
 item('sofa','sofa','Диван · 180 × 80',2.34,1.50,.8,1.8,.82,'Отдых и гости. Поднос на подлокотнике заменяет столик в узком проходе.',{armTray:true}),
 item('tv','tvconsole','ТВ и неглубокая полка',4.51,1.95,.16,1.1,.45,'Экран напротив дивана. Полка для пульта глубиной 16 см; проход остаётся свободным.',{front:'west'}),
 item('baldesk','desk','Рабочий стол · 120 × 55',3.35,.04,1.2,.55,.75,'Работа у окна гостиной. Монитор, ноутбук и место для ног. Штора нужна для контроля бликов.',{yaw:Math.PI}),
 item('deskchair','chair','Рабочее кресло',3.69,.87,.52,.52,.95,'Кресло обращено к столу; место для отодвигания отделено от дивана.',{target:'baldesk'}),
 item('existing3','utility','Хозяйственный блок № 3',2.31,3.65,.50,.48,2.36,'Небольшой элемент № 3 с исходного плана сохранён. Предварительно — хозяйственное хранение; назначение и конструкцию подтвердить на месте.',{front:'east',doors:'sliding'}),
 item('entrycoat','coatniche','Куртки, обувь и сиденье',1.48,4.95,.60,.58,1.8,'Одно место для переобувания, повседневная обувь внизу и крючки для курток. Основная одежда — в гардеробной.',{yaw:Math.PI,front:'north'}),
 item('kitchen','kitchen','Кухня · 245 см',.02,.10,.60,2.45,.9,'Отступ 20 → плита 60 → подготовка 60 → мойка 60 → ПММ 45. Вода остаётся рядом с санузлом; вытяжку и тип плиты уточнить.',{front:'east',yaw:Math.PI,modules:[{id:'dishwasher',offset:0,width:.45},{id:'sink',offset:.45,width:.6},{id:'prep',offset:1.05,width:.6},{id:'hob',offset:1.65,width:.6},{id:'landing',offset:2.25,width:.2}],upper:{offset:0,width:1.05,depth:.34,bottom:1.55,height:.72}}),
 item('fridge','fridge','Холодильник · 66 × 60',1.49,.04,.66,.6,2,'Стоит в правом углу у окна. Фасад направлен к проходу; нужны вентиляционные зазоры по выбранной модели.',{front:'west'}),
 item('breakfast','table','Компактный стол · 60 × 70',1.51,.80,.60,.70,.75,'Ежедневный стол для хозяйки. Откидная столешница может освободить кухню, но показан её полный рабочий размер.'),
 item('diningchair','chair','Обеденный стул',1.62,1.62,.46,.46,.82,'Посадка со стороны кухни; отодвигание проверяется отдельно от открывания холодильника.',{target:'breakfast'}),
 item('bed','bed','Кровать · 160 × 200',5.8,2.7,2.10,1.68,1.08,'Постоянная кровать с подъёмным основанием. Изголовье у правой стены; доступны обе стороны и изножье.',{mattress:{w:1.6,d:2},yaw:-Math.PI/2,storage:'lift'}),
 item('bedside1','shelf','Прикроватный столик',7.57,2.25,.32,.32,.55,'Телефон, вода и зарядка со стороны окна.',{mount:'floor'}),
 item('bedside2','shelf','Прикроватный столик',7.57,4.51,.32,.32,.55,'Вторая прикроватная поверхность; не занимает проход к гардеробной.',{mount:'floor'}),
 item('dressing','wardrobe','Гардеробная система · 270 × 60',5.05,6.20,2.7,.6,2.36,'Одежда на плечиках, полки и бельё в одном помещении. Открытые секции за отдельной дверью; без дополнительных высоких шкафов в спальне.',{doors:'open',front:'north',yaw:Math.PI/2,modelW:.6,modelD:2.7}),
 item('mirror','mirror','Зеркало в полный рост',4.91,5.5,.025,.6,1.9,'Настенное зеркало в гардеробной; свободный пол перед ним.',{front:'east'}),
 item('wc','toilet','Компактный унитаз',-.10,3.17,.62,.42,1.12,'Чаша с резервом на инсталляцию внутри туалета. Канализацию и фактическую ширину помещения проверить.',{yaw:Math.PI/2,front:'east',modelW:.42,modelD:.62,installation:.14,bowlDepth:.48}),
 item('shower','shower','Душ · 80 × 80',-.12,3.97,.8,.8,2.1,'Угловой душ с раздвижной створкой со стороны прохода. Поддон, слив и гидроизоляция — по обмеру.',{front:'east'}),
 item('laundry','laundryvanity','Раковина над стиральной машиной',.69,4.98,.6,.6,.88,'Компактная машина 51 × 70 × 47,5 см под специальной раковиной 60 × 60. Независимое крепление чаши; 10 см сзади под подключения. Это предварительный подбор для маленькой душевой.',{yaw:Math.PI,front:'north',washer:{w:.51,d:.475,bodyDepth:.43,h:.70},sink:{w:.6,d:.6,h:.08,bottom:.8},rearGap:.1})
];
export const variant={id:'solo',color:'#89917b',furniture};
const z=(id,label,x,y,w,d,ignore=[],type='use')=>({id,label,x,y,w,d,ignore,type});
export const zones=[
 z('sofa-use','Посадка на диван',3.18,1.65,.6,1.45),z('tv-use','Доступ к ТВ-полке',3.88,2.15,.6,.65),
 z('desk-use','Кресло и отодвигание',3.35,.62,1.2,.85,['deskchair']),
 z('utility-use','Доступ к блоку № 3',2.85,3.6,.6,.6),z('entry-use','Переобувание',1.47,4.32,.65,.6),
 z('cook-use','Готовка и мойка',.65,.10,.6,2.45),z('dining-use','Посадка за стол',1.48,1.55,.67,.90,['diningchair']),
 z('fridge-open','Дверца холодильника',.87,.04,.60,.60,[],'open'),z('fridge-use','Загрузка холодильника сбоку',.66,.70,.6,.6),
 z('dish-open','Открытая ПММ',.65,2.10,.60,.45,[],'open'),z('oven-open','Открытая духовка',.65,.30,.60,.6,[],'open'),
 z('bed-north','Подход к кровати со стороны окна',5.95,2.08,1.55,.60),z('bed-south','Подход к кровати к гардеробной',5.95,4.43,1.55,.62),z('bed-foot','Проход у изножья',4.94,2.85,.80,1.42),
 z('dress-use','Проход перед одеждой',5.05,5.30,2.7,.85),z('mirror-use','Перед зеркалом',4.95,5.45,.6,.65),
 z('wc-use','Перед унитазом',.57,3.20,.6,.6),
 z('shower-use','Вход в душ',.69,4.08,.60,.60),z('basin-use','Перед раковиной',.69,4.36,.60,.60),
 z('washer-open','Открытый люк машины',.73,4.63,.52,.35,[],'open'),z('washer-load','Загрузка при открытом люке',.69,4.02,.60,.60)
];
export const cameras={
 overview:{position:[11.8,15,-10],target:[3.9,0,3.1]},
 living:{position:[4.35,1.55,4.05],target:[2.95,1.05,1.65]},
 bedroom:{position:[5.30,1.60,1.90],target:[7.0,1.0,3.7]},
 storage:{position:[5.18,1.55,5.52],target:[7.05,1.05,6.38]},
 kitchen:{position:[1.70,1.55,2.65],target:[.40,1.15,1.20]},
 bathroom:{position:[1.08,1.55,4.2],target:[.76,.8,5.28]},
 hall:{position:[3.6,1.6,5.23],target:[3.15,1.1,2.5]}
};
