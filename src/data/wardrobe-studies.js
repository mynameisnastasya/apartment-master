// Study plans are deliberately separate from the approved and furnished 3D scenes.
export function createWardrobeStudies(base,existing){
const clone=o=>structuredClone(o);
const area=p=>Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-a[1]*b[0]},0))/2e6;
const move=(l,id,v)=>Object.assign(l.furniture.find(o=>o.id===id),v);
const part=(l,id,v)=>Object.assign(l.partitions.find(o=>o.id===id),v);
const room=(l,id,p,x,y)=>Object.assign(l.rooms.find(r=>r.id===id),{polygon:p,area:+area(p).toFixed(2),x,y});
const wall=(id,x,y,width,depth)=>({id,type:'wall',x,y,width,depth,height:2700,rotation:0});
function metadata(l,id,title,idea,gain,cost,aisle,row,access){
 Object.assign(l,{id,name:title,study:{idea,gain,cost,aisle,row,access}});
 // Routes are rebuilt for each study, so no stale D endpoints imply a successful test.
 l.routes={entry:[5400,700],kitchen:[1400,1100],bath:[3500,1450]};l.routePairs=[];return l;
}
function endpoints(l,points){Object.assign(l.routes,points);l.routePairs=Object.keys(l.routes).filter(k=>k!=='entry').map(k=>['entry',k]);}
const I=metadata(clone(existing),'W1','Общий гардероб у холла','Непроходная комната для вещей с доступом из общей зоны.','Сохраняет спальню, диван, кухню и санузел D.','Вторая комната 9,55 м²; стол 1000 мм. Локальный подход у полок — 640 мм.',1140,1500,'Из холла');
endpoints(I,{adult:[2750,5200],adultBed:[750,6200],child:[4050,4050],desk:[4350,6150],childStorage:[5440,6900],dressing:[5230,3730],farRail:[5475,4350],shoes:[4930,3950],sofa:[2700,3500]});

const J=metadata(clone(existing),'W2','Личный гардероб при спальне','Меняем спальни местами: взрослая справа, вторая комната слева. В гардеробную заходят только из спальни.','Вторая комната 11,24 м² и стол 1400 мм; гардеробная приватная, кухня и санузел сохранены.','Меньше ряд плечиков; у двуспальной кровати более компактные боковые подходы. Перенос мебели между спальнями.',1140,1200,'Из взрослой спальни');
part(J,'i-dressing-west',{depth:1440});part(J,'i-dressing-south',{x:5510,y:4320,width:890});part(J,'i-dressing-north',{x:4660,width:1740});part(J,'i-dressing-lintel',{y:4320});
Object.assign(J.doors.find(d=>d.id==='door-dressing'),{y:4320,openY:4360});
J.doors.find(d=>d.id==='door-child').room='adult';J.doors.find(d=>d.id==='door-adult').room='alice';
room(J,'dressing',[[4660,3120],[6400,3120],[6400,4320],[4660,4320]],5200,3700);
room(J,'adult',[[3295,4660],[3547,3640],[4540,3640],[4540,4440],[6400,4440],[6400,7440],[3425,7440],[3425,6850],[3295,6850]],5100,7100);
room(J,'alice',base.rooms.find(r=>r.id==='adult').polygon,1700,5300);
J.furniture=J.furniture.filter(o=>!['adult-wardrobe','adult-dresser','dressing-shoes'].includes(o.id));
move(J,'adult-bed',{x:4500,y:4850});move(J,'adult-nightstand',{x:6050,y:4750,width:350,depth:260});move(J,'adult-nightstand-2',{x:6050,y:6900,width:350,depth:350});
move(J,'alice-bed',{x:0,y:5560,rotation:0});move(J,'alice-wardrobe',{x:2575,y:5900,width:600,depth:1200,rotation:0,front:'west'});
move(J,'alice-desk',{x:1550,y:7450,width:1400,depth:600,front:'north'});move(J,'alice-chair',{x:2000,y:6900,width:500,depth:500});move(J,'dressing-rail',{depth:1200});move(J,'dressing-mirror',{depth:700});
endpoints(J,{adult:[4050,4050],adultBed:[3875,5900],child:[2750,5200],childBed:[1400,6500],desk:[1675,7100],childStorage:[2250,6250],dressing:[5150,3825],sofa:[2700,3500]});

function suite(id,wide){
 const l=metadata(clone(base),id,wide?'Большая гардеробная-галерея':'Спальня через гардеробную',wide?'Полноширинная гардеробная становится входной зоной взрослой спальни.':'Компактный проходной гардероб образует приватный вход в спальню.',wide?'Гардеробная 4,76 м², диван 2000 мм лицом к кухне и пристенная барная стойка.':'Вторая комната полностью сохранена; остаётся отдельная небольшая зона с диваном.',wide?'Вместо обеденного стола — стойка 1050 × 450 мм: одно свободное или два компактных места. Спальня 9,14 м².':'Диван сокращён до 1200 мм; спальня 9,14 м². Вход в спальню всегда через гардеробную.',wide?900:955,wide?2280:1800,'Проходная, перед спальней');
 const top=wide?3680:3380,left=wide?0:1500;
 part(l,'d-adult-north',{y:5300});part(l,'d-adult-door-lintel',{y:5300});part(l,'d-adult-divider',{y:top,depth:6850-top});
 const door=l.doors.find(d=>d.id==='door-adult');for(const k of ['hinge','arcStart','arcEnd','swing'])delete door[k];
 Object.assign(door,{y:5300,openX:1475,openY:5340,openWidth:850,openDepth:35,mechanism:'pocket-sliding'});
 l.partitions.push(wall('suite-north',left,top,2325-left,120),{...wall('suite-lintel',2325,top,850,120),elevation:2100,height:600});
 if(!wide)l.partitions.push(wall('suite-west',1500,top,120,5300-top));
 l.doors.push({id:'door-dressing',x:2325,y:top,width:850,axis:'x',room:'dressing',mechanism:'hinged',hinge:[2325,top+120],arcStart:0,arcEnd:90,openX:2325,openY:top+120,openWidth:40,openDepth:850});
 room(l,'adult',[[0,5420],[3175,5420],[3175,8300],[0,8300]],1600,5750);
 const x=wide?0:1620,y=top+120,p=[[x,y],[3175,y],[3175,5300],[x,5300]];
 l.rooms.push({id:'dressing',name:'Гардеробная',x:wide?1500:2700,y:wide?4850:4400,polygon:p,area:+area(p).toFixed(2)});
 l.furniture=l.furniture.filter(o=>!['adult-wardrobe','tv','media'].includes(o.id));
 move(l,'adult-nightstand',{x:0,y:5650});
 l.furniture.push({id:'dressing-rail',type:'dressing-rack',room:'dressing',x:wide?840:1620,y:wide?2960:3500,width:600,depth:wide?2280:1800,height:2400,rotation:wide?270:180,label:'Открытые секции · глубина 600'});
 if(wide){
  move(l,'sofa',{x:80,y:2880,width:2000,depth:780,rotation:0,front:'north',label:'Диван 2000 × 780 · лицом к кухне'});
  move(l,'dining',{x:0,y:1800,width:450,depth:1050,height:940,wallMounted:true,front:'east',label:'Пристенная барная стойка 1050 × 450 · 1–2 места',kneeDepth:400,seats:2,seatingMode:'одно свободное или два компактных места; стулья выдвигаются в общую зону'});
  const chairs=l.furniture.filter(o=>o.type==='chair'&&o.room==='kitchen');
  for(const [i,chair] of chairs.entries())Object.assign(chair,{x:550,y:1850+i*550,width:400,depth:400,height:960,type:'stool',front:'west',label:'Полубарный стул · место '+(i+1)});
  part(l,'d-child-diagonal',{x:3295,y:3680,width:765,depth:120,rotation:0});
  part(l,'d-child-north-right',{y:3680});part(l,'d-child-door-lintel',{y:3680});
  Object.assign(l.doors.find(d=>d.id==='door-child'),{y:3680,openY:3720});
  move(l,'alice-wardrobe',{y:3800});
  room(l,'alice',[[3295,3800],[6400,3800],[6400,7440],[3425,7440],[3425,6850],[3295,6850]],4900,6350);
 }
 else move(l,'sofa',{x:-200,y:3100,width:1200,depth:800,rotation:270});
 endpoints(l,{adult:[2750,5700],adultBed:[750,6200],child:wide?[4450,4250]:[4450,4050],desk:[3820,6280],dressing:wide?[2750,4775]:[2700,4200],farRail:wide?[375,4775]:[2700,4925],dining:wide?[1250,2075]:[1700,2250],sofa:wide?[1700,2580]:[1125,3150]});return l;
}
const K=suite('W3',false),L=suite('W4',true);
const M=metadata(clone(existing),'W5','Гардероб при второй комнате','Та же компактная зона хранения, но вход из второй комнаты: независимая приватная система для ребёнка или гостя.','Взрослая спальня 11,24 м², диван и санузел D сохранены. Шкаф прихожей удлиняется на 100 мм.','Гардеробная не доступна напрямую из взрослой спальни. Вторая комната 9,55 м²; семья делит хранение по комнатам.',1140,1500,'Из второй комнаты');
part(M,'i-dressing-west',{depth:720});
M.partitions.push(wall('m-closet-west-lower',4540,4570,120,170));
part(M,'i-dressing-north',{x:4660,width:1740});part(M,'i-dressing-lintel',{x:4540,y:3720,width:120,depth:850,rotation:0});
Object.assign(M.doors.find(d=>d.id==='door-dressing'),{x:4540,y:3720,axis:'y',openX:4660,openY:3720,openWidth:850,openDepth:35,mechanism:'hinged',hinge:[4660,3720],arcStart:90,arcEnd:0});
move(M,'hall-wardrobe',{depth:1700});move(M,'dressing-mirror',{x:5210,y:4590,width:550,depth:25,front:'north'});
M.furniture=M.furniture.filter(o=>o.id!=='dressing-shoes');
endpoints(M,{adult:[2750,5200],adultBed:[750,6200],child:[4050,4050],childBed:[3875,5350],desk:[4350,6150],childStorage:[5440,6900],dressing:[5230,4125],farRail:[5475,4350],sofa:[2700,3500]});
return [I,J,K,L,M];
}
