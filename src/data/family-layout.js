// W6: shared entry dressing room and a full-window-wall desk.
export function familyLayouts(base,linear){
 const clone=o=>structuredClone(o),area=p=>Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-a[1]*b[0]},0))/2e6;
 const move=(l,id,p)=>Object.assign(l.furniture.find(o=>o.id===id),p);
 const part=(l,id,p)=>Object.assign(l.partitions.find(o=>o.id===id),p);
 const room=(l,id,p,x,y)=>Object.assign(l.rooms.find(o=>o.id===id),{polygon:p,area:+area(p).toFixed(2),x,y});
 function childShell(l,top){
  part(l,'d-child-diagonal',{x:3295,y:top,width:205,depth:120,rotation:0});
  part(l,'d-child-north-right',{x:4350,y:top,width:190});
  part(l,'d-child-door-lintel',{x:3500,y:top});
  Object.assign(l.doors.find(o=>o.id==='door-child'),{x:3500,y:top,openX:4315,openY:top+120,openWidth:35,openDepth:850,mechanism:'hinged',hinge:[4350,top+120],arcStart:180,arcEnd:90});
  part(l,'d-adult-divider',{y:top,depth:6850-top});
  room(l,'alice',[[3295,top+120],[4540,top+120],[4540,4740],[6400,4740],[6400,7440],[3425,7440],[3425,6850],[3295,6850]],5050,6150);
 }
 const l=clone(linear);
 Object.assign(l,{id:'W6',name:'Семейный баланс',recommended:true,subtitle:'Гардеробная у входа · стол Алисы во всю стену · предварительно',
  pros:['Одна независимая семейная гардеробная у холла; спальня не становится проходом к вещам.','Диван 2200 × 900 мм обращён к кухне; барная стойка 1600 × 500 мм рассчитана на два места с шагом 700 мм.','Общее хранение у входа: гардеробная 2,61 м². В спальне — шкаф 2325 мм, у Алисы — комод под столешницей; вход освобождён от отдельного шкафа.','У Алисы непрерывный стол 2975 × 600 мм вдоль всей стены с окном и встроенный комод 1000 мм.'],
  cons:['Последнего обмера изменённой ванной здесь нет: размеры взяты из текущей модели. Проход у входа по вашим словам около 900 мм; требуется сверка. Высоту подоконника, открывание окна и радиатор проверить до изготовления стола.','Гардеробная меньше W4: 2,61 м² вместо 4,76 м². Личные вещи взрослых хранятся в шкафу спальни, вещи Алисы — в комоде.','В детской остаётся одна свободная длинная сторона кровати; это ниша для односпальной кровати, не симметричная спальня.','Барные места не заменяют большой семейный обеденный стол. Дневной свет общей зоны, радиаторы, вентиляцию и чистовые размеры необходимо уточнить по обмеру.'],
  revision:'2026-10-04',familyDesign:true});
 childShell(l,3520);
 l.furniture=l.furniture.filter(o=>!['tv','media','hall-wardrobe','alice-wardrobe'].includes(o.id));
 move(l,'adult-wardrobe',{width:2325,height:2600,label:'Встроенный шкаф 2325 × 600 · до линии двери'});
 move(l,'adult-nightstand',{x:2925,y:5770,width:250,depth:200,label:'Компактная прикроватная полка 250 × 200'});
 move(l,'sofa',{x:40,y:3720,width:2200,depth:900,rotation:0,front:'north',label:'Диван 2200 × 900 · лицом к кухне'});
 move(l,'dining',{x:0,y:1800,width:500,depth:1600,height:940,wallMounted:true,front:'east',kneeDepth:450,seats:2,label:'Пристенная барная стойка 1600 × 500 · два места',seatingMode:'два места с шагом 700 мм'});
 const seats=l.furniture.filter(o=>o.type==='chair'&&o.room==='kitchen');
 seats.forEach((o,i)=>Object.assign(o,{x:650,y:2100+i*700,width:450,depth:450,height:960,type:'stool',front:'west',label:'Полубарное место '+(i+1)+' · шаг 700'}));
 move(l,'alice-desk',{x:3425,y:6840,width:2975,depth:600,height:740,front:'north',windowWall:true,underDeskDresser:1000,label:'Стол во всю стену 2975 × 600 · комод 1000'});
 move(l,'alice-chair',{x:4950,y:6290,width:500,depth:500,front:'south'});
 const adultDoor=l.doors.find(o=>o.id==='door-adult');
 Object.assign(adultDoor,{mechanism:'pocket-sliding',openX:1475,openY:4680,openWidth:850,openDepth:35});
 for(const key of ['hinge','arcStart','arcEnd','swing'])delete adultDoor[key];
 l.routes={entry:[5400,700],kitchen:[1400,1100],bathroom:[3500,1450],adult:[2750,5200],adultBed:[750,6200],adultWardrobe:[1400,5680],alice:[3925,4090],aliceBed:[4800,6075],aliceDesk:[5200,6030],dressing:[5230,3730],dressingFar:[5475,4350],sofa:[1700,3350],bar:[1425,2375],barSecond:[1425,3075]};
 l.routePairs=Object.keys(l.routes).filter(k=>k!=='entry').map(k=>['entry',k]);
 l.clearances=[{id:'entry-aisle',label:'Поперечный проход перед гардеробной · модель',value:960,x:4000,y:2520,axis:'y',length:960},...base.clearances.filter(c=>['adult-foot','adult-window'].includes(c.id)),
  {id:'lounge-side',label:'Основной проход у дивана',value:935,x:2707.5,y:4140,axis:'x',length:935},
  {id:'bar-pitch',label:'Шаг барных мест',value:700,x:1300,y:2675,axis:'y',length:700},
  {id:'dressing-aisle',label:'Перед рядом гардеробной',value:1140,x:5230,y:3900,axis:'x',length:1140},
  {id:'child-desk-width',label:'Стол от стены до стены',value:2975,x:4912.5,y:7140,axis:'x',length:2975},
  {id:'adult-wardrobe-front',label:'Между шкафом и кроватью',value:640,x:1800,y:5680,axis:'y',length:640}];
 l.rooms.find(r=>r.id==='living').name='Кухня-гостиная';
 l.studioPolygons={living:[[0,0],[2320,0],[2320,2040],[3175,2040],[3175,4640],[0,4640]],kitchen:[[0,0],[2320,0],[2320,2040],[3175,2040],[3175,4640],[0,4640]]};
 l.studioViews={living:{pos:[2.90,1.6,3.20],target:[.85,1.05,3.80]},kitchen:{pos:[2.90,1.6,3.20],target:[.65,1.10,1.55]},alice:{pos:[3.80,1.6,5.72],target:[5.22,1.05,7.05]}};
 l.walkViews={living:{walk:l.routes.sofa,look:[1000,900]},alice:{walk:l.routes.alice,look:[5000,5800]},adult:{walk:l.routes.adult,look:[2100,6500]},kitchen:{walk:l.routes.kitchen,look:[600,700]},dressing:{walk:l.routes.dressing,look:[6100,3930]},bath:{walk:l.routes.bathroom,look:[3500,200]}};

 return [l];
}
