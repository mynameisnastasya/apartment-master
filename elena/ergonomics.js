// Values come from furniture geometry, not marketing copy. All dimensions are preliminary.
export const refinedIds=['1','2','3','4','5'];
export function ergonomicStudy(v){
 const by=id=>v.furniture.find(f=>f.id===id),bed=by('bed'),kitchen=by('kitchen'),table=by('table');
 const z=(id,label,x,y,w,d,type='clearance',ignore=[])=>({id,label,x,y,w,d,type,ignore});
 const zones=v.id==='5'?[
 z('bed-left','Левый подход',.06,3.1,bed.x-.07,1.5),z('bed-right','Правый подход',bed.x+bed.w+.01,3.1,3.27-bed.x-bed.w-.02,1.5),z('bed-foot','У изножья',bed.x,bed.y+bed.d+.01,bed.w,5.52-bed.y-bed.d-.01)
 ]:[
 z('bed-north','Первый боковой подход',bed.x+.73,v.north,bed.w-.73,bed.y-.01-v.north),
 z('bed-south','Второй боковой подход',bed.x+.73,bed.y+bed.d+.01,bed.w-.73,7.51-bed.y-bed.d-.01),
 z('bed-foot','У изножья',bed.x+bed.w,bed.y,(by('wardrobe')?by('wardrobe').x-.04:3.71)-bed.x-bed.w,bed.d)
 ];
 if(v.id==='5')zones.push(z('kitchen-aisle','Проход перед кухней',3.84,5.3,1.64,2.2),z('dining-west','Западный стул',1.10,6.25,1.08,.9,'use',['chair1']),z('dining-east','Восточный стул',2.78,6.25,.94,.9,'use',['chair2']),z('new-passage','Свободный путь через новый проём',2.65,5.60,1.8,.65));else zones.push(z('kitchen-aisle','Проход перед кухней',table.x+table.w,5.3,kitchen.x-.04-table.x-table.w,2.2),z('dining-north','Отодвинутый стул',table.x,table.y-.9,table.w,.9,'use',['chair1']),z('dining-south','Отодвинутый стул',table.x,table.y+table.d,table.w,.9,'use',['chair2']));
 zones.push(z('dishwasher-open','Открытая посудомоечная машина',kitchen.x-.66,kitchen.y+kitchen.modules.find(m=>m.id==='dishwasher').offset,.62,.6,'open'),z('oven-open','Открытая духовка',kitchen.x-.66,kitchen.y+kitchen.modules.find(m=>m.id==='hob').offset,.62,.6,'open'),z('fridge-open','Открытый холодильник',by('fridge').x-.66,7.8,.62,.6,'open'),z('washer-open','Открытая стиральная машина',1.89,.75,.6,.6,'open'));
 zones.push(z('dishwasher-load','Место сбоку для загрузки ПММ',4.10,4.83,.70,.60,'use'),z('entryward-use','Перед шкафом верхней одежды',5.53,3.05,.60,.70,'use'));
 if(by('hallward'))zones.push(z('hallward-use','Перед встроенным шкафом',2.72,.76,1.5,.8,'use'));
 if(by('wardrobe')){const f=by('wardrobe');zones.push(z('wardrobe-use','Зона шкафа-купе',f.x-.83,f.y,.79,f.d,'use'))}
 if(by('dress'))zones.push(z('dressing-use','Проход в гардеробной',.71,2.75,.89,1.48,'use'));
 for(const id of ['baldesk','halldesk']){const f=by(id);if(f)zones.push(z(id+'-use','Рабочее кресло и отодвигание',f.x,id==='baldesk'?f.y-.95:f.y+f.d,f.w,.95,'use',[id==='baldesk'?'balchair':'hallchair']))}
 const cm=n=>Math.floor((n+1e-6)*100),a=zones[0],b=zones[1],c=zones[2],k=zones.find(z=>z.id==='kitchen-aisle');
 return{zones,metrics:[{label:'По бокам кровати',value:`${cm(v.id==='5'?a.w:a.d)} / ${cm(v.id==='5'?b.w:b.d)} см`,detail:'С учётом каркаса; два независимых подхода.'},{label:'У изножья',value:`${cm(v.id==='5'?c.d:c.w)} см`,detail:'Свободное место до ближайшего препятствия.'},{label:'Перед кухней',value:`${cm(k.w)} см`,detail:v.id==='5'?'Стол вынесен в гостиную.':'Компактный проход при закрытой технике.'}],notes:'Размеры рассчитаны по эскизной модели, до обмера. Стол 60 × 90 см рассчитан на двоих. Основные шкафы — с раздвижными фасадами. Ниша у входа закрыта шторой, чтобы створка не пересекалась с входной дверью. У каждого спального места есть полка для телефона и зарядки. Дверь санузла предложена раздвижной вдоль внутренней стены; точный монтаж нужно проверить обмером.',constraint:v.id==='5'?'Стол стоит в гостиной: перед кухней 164 см, при открытой дверце глубиной 62 см остаётся около 102 см. Верхняя часть проёма свободна от мебели. Когда западный обеденный стул сильно отодвинут, обход к балкону временно сужается; зоны показывают отдельные действия.':`Посудомойка стоит у начала линии, рядом с мойкой; сбоку выделено 70 × 60 см для загрузки. Духовка остаётся под плитой: при её открытой дверце глубиной 62 см напротив стола остаётся ${cm(k.w-.62)} см: пройти за человеком, загружающим технику, нельзя. Цветные зоны показывают отдельные действия, а не их одновременное выполнение. Рабочая поверхность между мойкой и плитой — 60 см. Для более свободной кухни стол можно сделать откидным.`};
}
