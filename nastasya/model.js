// Conceptual metric model reconstructed from the supplied screenshots.
// These coordinates describe a presentation, NOT a measured survey or construction drawing.
export const dimensions={width:7.71,depth:6.67,height:2.65};
export const outline=[[0,0],[7.71,0],[7.71,6.67],[4.61,6.67],[4.61,5.36],[0,5.36]];
export const rooms=[
 {id:'kitchen',name:'Кухня',area:'≈ 6,1 м²',x:0,y:0,w:2.17,d:2.85,fill:'#e8e5dc',detail:'Отдельная кухня: рабочая линия, варочная панель, мойка и высокое хранение.'},
 {id:'wc',name:'Туалет',area:'по эскизу',x:0,y:2.85,w:1.43,d:.95,fill:'#dce7e4',detail:'Компактная зона туалета. Положение сантехники проверяется обмером.'},
 {id:'bath',name:'Душевая',area:'по эскизу',x:0,y:3.8,w:1.43,d:1.56,fill:'#dae5e3',detail:'Душевая зона 80 × 80 см по схеме; сантехнические подключения пока условные.'},
 {id:'living',name:'Гостиная',area:'≈ 9,8 м²',x:2.17,y:0,w:2.44,d:4.03,fill:'#e9dfce',detail:'Диван, столик, ТВ-панель и место для повседневной жизни.'},
 {id:'hall',name:'Прихожая',area:'по эскизу',x:1.43,y:4.03,w:3.18,d:1.33,fill:'#eeeae1',detail:'Главный маршрут от входной двери к общей зоне и спальне.'},
 {id:'bedroom',name:'Спальня',area:'по эскизу',x:4.61,y:1.25,w:3.1,d:3.75,fill:'#e8d7c2',detail:'Изолированная зона с кроватью 160 × 200 и выходом к балкону.'},
 {id:'dressing',name:'Гардеробная',area:'по эскизу',x:4.61,y:5,w:3.1,d:1.67,fill:'#ded0b9',detail:'Встроенный шкаф 270 × 60 см из исходной схемы. Ширину прохода нужно проверить.'},
 {id:'balcony',name:'Балкон',area:'по эскизу',x:4.61,y:0,w:3.1,d:1.25,fill:'#ebe9e1',detail:'Балкон с остеклением; конструкция и тепловой режим не подтверждены.'}
];
export const walls=[
 [0,0,0,5.36,'outer'],[0,0,.43,0,'outer'],[1.68,0,2.17,0,'outer'],
 [2.17,0,2.68,0,'outer'],[3.08,0,3.51,0,'outer'],[4.05,0,4.61,0,'outer'],
 [4.61,0,4.88,0,'outer'],[7.47,0,7.71,0,'outer'],
 [7.71,0,7.71,6.67,'outer'],[4.61,6.67,7.71,6.67,'outer'],
 [4.61,5.36,4.61,6.67,'outer'],[0,5.36,2.52,5.36,'outer'],[3.37,5.36,4.61,5.36,'outer'],
 [2.17,0,2.17,4.03,'partition'],[0,2.85,1.43,2.85,'partition'],
 [0,3.8,1.43,3.8,'partition'],[1.43,2.85,1.43,3.52,'partition'],
 [1.43,3.8,1.43,4.47,'partition'],
 [4.61,0,4.61,1.25,'partition'],[4.61,1.25,4.61,4.04,'partition'],
 [4.61,5,5.78,5,'partition'],[6.53,5,7.71,5,'partition'],
 [4.61,1.25,4.88,1.25,'partition'],[5.85,1.25,6.53,1.25,'glass'],[7.43,1.25,7.71,1.25,'partition']
];
export const glazing=[
 [.43,0,1.68,0],[2.68,0,3.08,0],[3.51,0,4.05,0],[4.88,0,7.47,0],
 [4.88,1.25,5.85,1.25],[6.53,1.25,7.43,1.25]
];
export const openings=[
 {id:'entry',name:'Вход',x:2.52,y:5.36,w:.85,orientation:'horizontal'},
 {id:'bedroom-door',name:'Вход в спальню',x:4.61,y:4.04,w:.96,orientation:'vertical'},
 {id:'dressing-door',name:'Гардеробная',x:5.78,y:5,w:.75,orientation:'horizontal'},
 {id:'balcony-door',name:'Балкон',x:4.88,y:1.25,w:.97,orientation:'horizontal'}
];
export const pieces=[
 {id:'hob',room:'kitchen',name:'Варочная поверхность',x:.17,y:.34,w:.53,d:.62,h:.90,type:'hob'},
 {id:'sink-kitchen',room:'kitchen',name:'Кухонная мойка',x:.17,y:1.46,w:.53,d:.53,h:.90,type:'sink'},
 {id:'lower-kitchen',room:'kitchen',name:'Нижние шкафы',x:.17,y:.98,w:.53,d:.43,h:.90,type:'cabinet'},
 {id:'fridge',room:'kitchen',name:'Холодильник',x:1.55,y:.22,w:.49,d:.56,h:2.15,type:'fridge'},
 {id:'kitchen-tall',room:'kitchen',name:'Хранение и техника',x:1.55,y:1.17,w:.49,d:1.08,h:.92,type:'cabinet'},
 {id:'sofa',room:'living',name:'Диван',x:2.27,y:1.36,w:.77,d:1.66,h:.75,type:'sofa'},
 {id:'coffee',room:'living',name:'Журнальный стол',x:3.35,y:2.22,w:.53,d:.53,h:.38,type:'coffee'},
 {id:'tv',room:'living',name:'ТВ-панель',x:4.40,y:1.72,w:.08,d:1.23,h:1.05,type:'tv'},
 {id:'console',room:'living',name:'Низкая консоль',x:3.30,y:.26,w:.95,d:.37,h:.43,type:'cabinet'},
 {id:'bed',room:'bedroom',name:'Кровать 160 × 200',x:5.31,y:2.55,w:2,d:1.60,h:.58,type:'bed'},
 {id:'bedside-a',room:'bedroom',name:'Прикроватная тумба',x:7.36,y:2.02,w:.28,d:.28,h:.48,type:'cabinet'},
 {id:'bedside-b',room:'bedroom',name:'Прикроватная тумба',x:7.36,y:4.30,w:.28,d:.28,h:.48,type:'cabinet'},
 {id:'wardrobe',room:'dressing',name:'Шкаф 270 × 60',x:4.81,y:5.96,w:2.70,d:.60,h:2.34,type:'wardrobe'},
 {id:'wc',room:'wc',name:'Унитаз',x:.22,y:3.04,w:.54,d:.50,h:.58,type:'toilet'},
 {id:'shower',room:'bath',name:'Душ 80 × 80',x:.18,y:3.96,w:.80,d:.80,h:.08,type:'shower'},
 {id:'vanity',room:'bath',name:'Раковина',x:.82,y:4.77,w:.43,d:.42,h:.85,type:'sink'},
 {id:'washer',room:'hall',name:'Стиральная машина',x:1.62,y:4.50,w:.55,d:.55,h:.86,type:'washer'},
 {id:'shoes',room:'hall',name:'Обувница',x:2.02,y:4.53,w:.58,d:.42,h:.52,type:'cabinet'}
];
export const roomById=id=>rooms.find(r=>r.id===id);
export const numberLabel=(n)=>n.toLocaleString('ru-RU',{maximumFractionDigits:2});
