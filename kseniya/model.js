// Coordinates in metres. Separate project: no imports from Liza's model.
export const rooms = [
 {id:'bed1',name:'Спальня',area:'13,10',x:0,z:5.68,w:2.34,d:5.6,color:'#d7c8b5',note:'Кровать 160 × 200 см, шкаф 180 × 60 см и стол у окна. Вход через гостиную.'},
 {id:'bed2',name:'Вторая спальня',area:'8,97',x:0,z:0,w:3.04,d:2.95,color:'#b5c0ad',note:'Кровать 90 × 200 см, стол 120 × 55 см и шкаф 120 × 60 см. Новая перегородка со светопрозрачным верхом.'},
 {id:'living',name:'Гостиная',area:'7,57',x:0,z:3.07,w:3.04,d:2.49,color:'#dfc6ac',note:'Диван 170 × 80 см, ТВ и компактный стол. Проходная общая комната без собственного окна; свет поступает через перегородку.'},
 {id:'kitchen',name:'Кухня',area:'5,14',x:3.16,z:0,w:2.52,d:2.04,color:'#c7c7b1',note:'Кухня остаётся у своего окна: линейный гарнитур, холодильник и откидной стол на двоих.'},
 {id:'bath',name:'Ванная',area:'≈2,03',x:4.12,z:2.16,w:1.56,d:1.3,color:'#aec5ca',note:'Душ 80 × 100 см и компактная раковина. Положение мокрой зоны сохранено; ширину уточнить обмером.'},
 {id:'wc',name:'Туалет',area:'1,25',x:4.12,z:3.58,w:1.56,d:.8,color:'#aec5ca',note:'Отдельный туалет сохраняется. Стиральная машина встроена под столешницу кухни.'},
 {id:'hall',name:'Прихожая',area:'≈4,68',x:3.16,z:4.5,w:2.52,d:1.06,color:'#ddd4c7',note:'Вход справа. Неглубокая обувница; основной проход вдоль санузлов — 86 см.'}
];
// Wall intervals explicitly leave openings; no doors hidden behind furniture.
export function wallData(original=false){return [
 [0,0,.25,0,'outer'],[2.65,0,3.04,0,'outer'],[3.04,0,3.55,0,'outer'],[5.22,0,5.68,0,'outer'],
 [0,0,0,11.28,'outer'],[0,11.28,.25,11.28,'outer'],[1.95,11.28,2.34,11.28,'outer'],[2.34,5.68,2.34,11.28,'outer'],
 [2.34,5.62,5.68,5.62,'outer'],[5.68,0,5.68,4.65,'outer'],[5.68,5.45,5.68,5.62,'outer'],
 [3.10,0,3.10,4.50,'existing'],[3.10,5.30,3.10,5.62,'existing'],
 [3.96,2.10,5.68,2.10,'existing'],[4.06,2.1,4.06,2.4,'existing'],[4.06,3.1,4.06,3.68,'existing'],[4.06,4.38,4.06,4.44,'existing'],
 [4.06,3.52,5.68,3.52,'existing'],[4.06,4.44,5.68,4.44,'existing'],
 [0,5.62,1.34,5.62,'existing'],[2.14,5.62,3.10,5.62,'existing'],
 ...(!original?[[0,3.01,2.09,3.01,'glass'],[2.89,3.01,3.1,3.01,'glass']]:[])
];}
export const windows=[[.25,0,2.65,0],[3.55,0,5.22,0],[.25,11.28,1.95,11.28]];
export function furniture(original=false){return [
 {type:'bed',name:'Кровать 160 × 200',x:.10,z:7.6,w:1.6,d:2,h:.5,color:'#eee6dc'},
 {type:'wardrobe',name:'Шкаф 180 × 60',x:.08,z:5.85,w:.6,d:1.8,h:2.25,color:'#ae9273'},
 {type:'desk',name:'Стол 120 × 55',x:.16,z:10.55,w:1.2,d:.55,h:.74,color:'#b9936f'},
 {type:'chair',name:'Стул',x:.58,z:10.0,w:.45,d:.45,h:.45,color:'#6d7f71'},
 {type:'bed',name:'Кровать 90 × 200',x:.12,z:.35,w:.9,d:2,h:.48,color:'#f0eade'},
 {type:'desk',name:'Стол 120 × 55',x:1.35,z:.15,w:1.2,d:.55,h:.74,color:'#b9936f'},
 {type:'chair',name:'Стул',x:1.78,z:.83,w:.45,d:.45,h:.45,color:'#6d7f71'},
 {type:'wardrobe',name:'Шкаф 120 × 60',x:1.0,z:2.27,w:1.2,d:.6,h:2.25,color:'#ae9273'},
 {type:'sofa',name:'Диван 170 × 80',x:.1,z:3.35,w:.8,d:1.7,h:.72,color:'#72846f'},
 {type:'tv',name:'ТВ',x:2.91,z:3.35,w:.08,d:1.05,h:1.3,color:'#343b37'},
 {type:'table',name:'Стол 70 × 50',x:1.3,z:3.82,w:.5,d:.7,h:.42,color:'#a58363'},
 {type:'kitchen',name:'Кухня',x:3.24,z:.1,w:1.7,d:.6,h:.9,color:'#c0c5b1'},
 {type:'fridge',name:'Холодильник',x:5.0,z:.1,w:.6,d:.6,h:1.9,color:'#dedbd3'},
 {type:'sink',name:'Мойка',x:4.22,z:.15,w:.48,d:.48,h:.94,color:'#93a5a4'},
 {type:'hob',name:'Плита',x:3.35,z:.17,w:.48,d:.45,h:.94,color:'#424a43'},
 {type:'desk',name:'Откидной стол',x:4.53,z:1.48,w:1,d:.45,h:.74,color:'#b9936f'},
 {type:'chair',name:'Стул',x:4.77,z:.9,w:.43,d:.43,h:.45,color:'#72846f'},
 {type:'shower',name:'Душ 80 × 100',x:4.84,z:2.24,w:.8,d:1,h:.12,color:'#f1f4ef'},
 {type:'basin',name:'Раковина',x:4.23,z:3.08,w:.46,d:.32,h:.82,color:'#f1f4ef'},
 {type:'toilet',name:'Унитаз',x:4.85,z:3.66,w:.67,d:.45,h:.44,color:'#f1f4ef'},
 {type:'cabinet',name:'Обувница',x:3.4,z:5.22,w:1.0,d:.28,h:1.05,color:'#b49a7c'}
].filter(f=>!original || !['Кровать 90 × 200','Шкаф 120 × 60'].includes(f.name));}
