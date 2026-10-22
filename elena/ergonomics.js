// Clearances include a 40 mm allowance for cabinet fronts/handles and 10 mm for bed edges.
// These are model checks, not measured dimensions or building-code certification.
export const refinedIds=['2','6','7','8'];
export function ergonomicStudy(v){
 if(!refinedIds.includes(v.id))return null;
 const by=id=>v.furniture.find(f=>f.id===id),bed=by('bed'),kitchen=by('kitchen'),table=by('table');
 const north={2:4.43,6:4.55,7:4.375,8:4.3}[v.id];
 const south=7.51;
 const east=by('wardrobe')?by('wardrobe').x-.04:3.71;
 const z=(id,label,x,y,w,d,type='clearance',ignore=[])=>({id,label,x,y,w,d,type,ignore});
 const zones=[
 z('bed-north','Первый боковой подход',bed.x+.73,north,bed.w-.73,bed.y-.01-north),
 z('bed-south','Второй боковой подход',bed.x+.73,bed.y+bed.d+.01,bed.w-.73,south-(bed.y+bed.d+.01)),
 z('bed-foot','У изножья',bed.x+bed.w,bed.y,east-(bed.x+bed.w),bed.d),
 z('kitchen-aisle','Рабочий проход кухни',table.x+table.w,5.3,kitchen.x-.04-(table.x+table.w),2.2),
 z('dining-north','Отодвинуть северный стул',3.9,5.15,.5,.9,'use',['chair1']),
 z('dining-south','Отодвинуть южный стул',3.9,6.95,.5,.9,'use',['chair2']),
 z('dishwasher-open','Открытая посудомоечная машина',kitchen.x-.66,5.84,.62,.6,'open'),
 z('oven-open','Открытая духовка',kitchen.x-.66,6.65,.62,.6,'open'),
 z('fridge-open','Открытый холодильник',by('fridge').x-.66,7.8,.62,.6,'open'),
 z('washer-open','Открытая стиральная машина',1.89,.75,.6,.6,'open')
 ];
 if(by('wardrobe'))zones.push(z('wardrobe-use','Пользование шкафом-купе',by('wardrobe').x-.83,by('wardrobe').y,.79,by('wardrobe').d,'use'));
 if(by('dress'))zones.push(z('dressing-use','Проход в гардеробной',.71,2.75,.89,1.48,'use'));
 for(const id of ['baldesk','halldesk']){const f=by(id);if(f)zones.push(z(id+'-use','Зона рабочего кресла',f.x,id==='baldesk'?f.y-.95:f.y+f.d,f.w,.95,'use',[id==='baldesk'?'balchair':'hallchair']))}
 const cm=n=>Math.floor((n+1e-6)*100);
 const a=zones.find(z=>z.id==='bed-north'),b=zones.find(z=>z.id==='bed-south'),c=zones.find(z=>z.id==='bed-foot'),k=zones.find(z=>z.id==='kitchen-aisle');
 return {zones,metrics:[{label:'По бокам кровати',value:`${cm(a.d)} / ${cm(b.d)} см`,detail:'Два подхода; каркас и край изголовья учтены.'},{label:'У изножья',value:`${cm(c.w)} см`,detail:'До шкафа с учётом выступа фасада или до стены.'},{label:'Перед кухней',value:`${cm(k.w)} см`,detail:'При закрытой технике. Готовить удобнее по одному.'}],constraint:`При открытой дверце глубиной 62 см рядом со столом остаётся около ${cm(k.w-.62)} см. Это временная рабочая зона: сквозной проход на это время не рассчитан. Стол 50 × 90 см — компактный компромисс для двоих.`,notes:v.id==='7'?'Боковые подходы у широкой кровати близки к 60 см: запас небольшой, поэтому после обмера важен точный каркас.':'Шкафы предполагаются с раздвижными фасадами. Размеры проходов предварительные, по модели.'};
}
