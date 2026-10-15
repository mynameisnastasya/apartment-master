import geometry from '../data/geometry.json' with {type:'json'};
export {geometry};
// Reconstruction uses the repository's provisional shell and latest room program.
// This is deliberately independent of the approved D and of prior alternatives.
export const rooms=[
 {id:'living',name:'Кухня-гостиная',labelArea:19.24,center:[1.65,2.4]},
 {id:'adult',name:'Спальня',labelArea:13.10,center:[1.58,6.4]},
 {id:'child',name:'Вторая комната',labelArea:8.84,center:[4.9,5.95]},
 {id:'bath',name:'Санузел',labelArea:4.53,center:[3.69,.905]},
 {id:'dressing',name:'Гардеробная',labelArea:2.85,center:[5.45,3.699]},
 {id:'entry',name:'Прихожая',center:[5.6,1.8]}
];
// Rectangles: x, plan-y, width, depth in m. Door gaps are 0.85 m.
export const partitions=[
 [2.32,0,.12,1.81],[4.94,0,.12,1.81],
 [2.32,1.81,.77,.12],[3.94,1.81,1.12,.12],
 [0,4.054,2.325,.12],[3.175,4.054,.12,2.796],
 [3.295,4.449,.205,.12],[4.35,4.449,2.05,.12],
 [4.38,2.949,.12,1.5],[5.35,2.829,1.05,.12]
];
// Placements use product dimensions without scaling. yaw in degrees, center in m.
export const placements=[
 {id:'living-sofa',product:'sofa',room:'living',center:[1.25,3.35],yaw:180},
 {id:'adult-bed',product:'bed',room:'adult',center:[1.23,6.25],yaw:90},
 {id:'child-bed',product:'bed',room:'child',center:[5.245,5.62],yaw:-90},
 {id:'dining-table',product:'table',room:'living',center:[1.25,1.85],yaw:0},
 {id:'dining-chair-1',product:'chair',room:'living',center:[.48,1.85],yaw:90},
 {id:'dining-chair-2',product:'chair',room:'living',center:[2.02,1.85],yaw:-90},
 {id:'child-desk',product:'desk',room:'child',center:[3.95,7.11],yaw:180},
 {id:'child-chair',product:'chair',room:'child',center:[3.9,6.63],yaw:180},
 {id:'dressing-rack',product:'rack',room:'dressing',center:[6.115,3.7],yaw:-90},
 {id:'entry-shoe',product:'shoe',room:'entry',center:[6.23,1.70],yaw:-90},
 {id:'entry-mirror',product:'mirror',room:'entry',center:[5.075,.68],yaw:90,elevation:.3},
 {id:'kitchen-set',product:'kitchen',room:'living',center:[.77,.273],yaw:0},
 {id:'bath-vanity',product:'vanity',room:'bath',center:[2.76,.235],yaw:0,elevation:.274}
];
export const pending=[
 {id:'fridge',name:'Холодильник',room:'living',center:[1.91,.34],size:[.6,.65,2],type:'fridge'},
 {id:'washer',name:'Стиральная машина',room:'bath',center:[3.475,.325],size:[.6,.6,.85],type:'washer'},
 {id:'tub',name:'Ванна',room:'bath',center:[4.535,.905],size:[.75,1.7,.56],type:'tub'},
 {id:'wc',name:'Унитаз и инсталляция',room:'bath',center:[2.8,1.39],size:[.6,.5,.85],type:'wc'}
];
export const unresolved=['Матрасы 160 × 200 см (2 шт.)','Варочная панель, духовка, вытяжка и ПММ с совместимыми кухонными модулями','Кухонная мойка, смесители и подключение сантехники','Освещение, шторы, двери и фурнитура','Дополнительное хранение и консоль во всю стену второй комнаты','Подложка, клеи, грунты и гидроизоляция под фактическое основание'];
export function footprint(p,product){const [w,d]=product.dimensions;const yaw=Math.abs(p.yaw%180);const swap=yaw===90;return{x:p.center[0]-(swap?d:w)/2000,y:p.center[1]-(swap?w:d)/2000,w:(swap?d:w)/1000,d:(swap?w:d)/1000};}
